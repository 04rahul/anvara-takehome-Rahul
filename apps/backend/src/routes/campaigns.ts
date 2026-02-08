import { Router, type Response, type IRouter } from 'express';
import { prisma } from '../db.js';
import { CampaignStatus } from '../generated/prisma/client.js';
import { getParam, validateString, validateDecimal, ValidationError } from '../utils/helpers.js';
import { requireAuth, roleMiddleware, type AuthRequest } from '../auth.js';

const router: IRouter = Router();

// GET /api/campaigns - List all campaigns (filtered by user's sponsorId)
router.get(
  '/',
  requireAuth,
  roleMiddleware(['SPONSOR']),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { status } = req.query;

      const campaigns = await prisma.campaign.findMany({
        where: {
          sponsorId: req.user.sponsorId!, // Only return user's own campaigns
          ...(status && { status: status as string as CampaignStatus }),
        },
        include: {
          sponsor: { select: { id: true, name: true, logo: true } },
          _count: { select: { creatives: true, placements: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json(campaigns);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      res.status(500).json({ error: 'Failed to fetch campaigns' });
    }
  }
);

// GET /api/campaigns/:id - Get single campaign with details (verify ownership)
router.get(
  '/:id',
  requireAuth,
  roleMiddleware(['SPONSOR']),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const id = getParam(req.params.id);
      const campaign = await prisma.campaign.findUnique({
        where: { id },
        include: {
          sponsor: true,
          creatives: true,
          placements: {
            include: {
              adSlot: true,
              creative: { select: { id: true, name: true, type: true } },
              publisher: { select: { id: true, name: true, category: true } },
            },
          },
        },
      });

      if (!campaign) {
        res.status(404).json({ error: 'Campaign not found' });
        return;
      }

      // Verify ownership
      if (campaign.sponsorId !== req.user.sponsorId!) {
        res.status(403).json({ error: 'Forbidden: You do not have access to this campaign' });
        return;
      }

      res.json(campaign);
    } catch (error) {
      console.error('Error fetching campaign:', error);
      res.status(500).json({ error: 'Failed to fetch campaign' });
    }
  }
);

// POST /api/campaigns - Create new campaign (use user's sponsorId)
router.post(
  '/',
  requireAuth,
  roleMiddleware(['SPONSOR']),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const {
        name,
        description,
        budget,
        cpmRate,
        cpcRate,
        startDate,
        endDate,
        targetCategories,
        targetRegions,
      } = req.body;

      try {
        // Validate and sanitize input fields
        const validatedData = {
          name: validateString(name, 'name', {
            required: true,
            minLength: 1,
            maxLength: 255,
            allowEmpty: false,
          }),
          description:
            description !== undefined && description !== null
              ? validateString(description, 'description', {
                required: false,
                maxLength: 1000,
                allowEmpty: true,
              })
              : null,
          budget: validateDecimal(budget, 'budget', { required: true, min: 1, max: 10000 }),
          cpmRate:
            cpmRate !== undefined && cpmRate !== null
              ? validateDecimal(cpmRate, 'cpmRate', { required: false, min: 0, max: 999999.99 })
              : undefined,
          cpcRate:
            cpcRate !== undefined && cpcRate !== null
              ? validateDecimal(cpcRate, 'cpcRate', { required: false, min: 0, max: 999999.99 })
              : undefined,
          startDate: (() => {
            if (!startDate) {
              throw new ValidationError('startDate is required');
            }
            const date = new Date(startDate);
            if (isNaN(date.getTime())) {
              throw new ValidationError('startDate must be a valid date');
            }
            return date;
          })(),
          endDate: (() => {
            if (!endDate) {
              throw new ValidationError('endDate is required');
            }
            const date = new Date(endDate);
            if (isNaN(date.getTime())) {
              throw new ValidationError('endDate must be a valid date');
            }
            return date;
          })(),
          targetCategories: Array.isArray(targetCategories) ? targetCategories : [],
          targetRegions: Array.isArray(targetRegions) ? targetRegions : [],
        };

        // Validate date relationship
        if (validatedData.startDate >= validatedData.endDate) {
          throw new ValidationError('startDate must be before endDate');
        }

        // Calculate initial status based on start date
        // Use local date comparison consistent with validation
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const initialStatus = validatedData.startDate > today ? CampaignStatus.DRAFT : CampaignStatus.ACTIVE;

        const campaign = await prisma.campaign.create({
          data: {
            ...validatedData,
            status: initialStatus,
            sponsorId: req.user.sponsorId!,
          },
          include: {
            sponsor: { select: { id: true, name: true } },
          },
        });

        res.status(201).json(campaign);
      } catch (error) {
        if (error instanceof ValidationError) {
          res.status(400).json({ error: error.message });
          return;
        }
        console.error('Error creating campaign:', error);
        res.status(500).json({ error: 'Failed to create campaign' });
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      res.status(500).json({ error: 'Failed to create campaign' });
    }
  }
);

// PUT /api/campaigns/:id - Update campaign details (verify ownership)
router.put(
  '/:id',
  requireAuth,
  roleMiddleware(['SPONSOR']),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const id = getParam(req.params.id);
      if (!id) {
        res.status(400).json({ error: 'Invalid campaign ID' });
        return;
      }

      const {
        name,
        description,
        budget,
        cpmRate,
        cpcRate,
        startDate,
        endDate,
        targetCategories,
        targetRegions,
        status,
      } = req.body;

      // Verify ownership - check campaign exists and user owns it
      const existingCampaign = await prisma.campaign.findFirst({
        where: {
          id,
          sponsor: { userId: req.user.id }, // Ownership check
        },
      });

      if (!existingCampaign) {
        // Returns 404 for both "not found" and "not owned"
        res.status(404).json({ error: 'Campaign not found' });
        return;
      }

      // Build update data object with only provided fields
      try {
        const updateData: any = {};

        if (name !== undefined) {
          updateData.name = validateString(name, 'name', {
            required: false,
            minLength: 1,
            maxLength: 255,
            allowEmpty: false,
          });
        }

        if (description !== undefined) {
          updateData.description =
            description === null || description === ''
              ? null
              : validateString(description, 'description', {
                required: false,
                maxLength: 1000,
                allowEmpty: true,
              });
        }

        if (budget !== undefined) {
          updateData.budget = validateDecimal(budget, 'budget', {
            required: true,
            min: 1,
            max: 10000,
          });
        }

        // Business rule: budget cannot be reduced below already spent amount
        if (updateData.budget !== undefined) {
          const spentRaw: any = (existingCampaign as any).spent;
          const spentAmount =
            typeof spentRaw === 'number'
              ? spentRaw
              : typeof spentRaw?.toNumber === 'function'
                ? spentRaw.toNumber()
                : Number(spentRaw);

          if (!Number.isFinite(spentAmount)) {
            console.error('Invalid spent value on campaign', { id, spentRaw });
            throw new ValidationError('Unable to validate budget against spent amount');
          }

          if (updateData.budget < spentAmount) {
            throw new ValidationError(`budget cannot be less than already spent (${spentAmount})`);
          }
        }

        if (cpmRate !== undefined) {
          updateData.cpmRate =
            cpmRate === null
              ? null
              : validateDecimal(cpmRate, 'cpmRate', { required: false, min: 0, max: 999999.99 });
        }

        if (cpcRate !== undefined) {
          updateData.cpcRate =
            cpcRate === null
              ? null
              : validateDecimal(cpcRate, 'cpcRate', { required: false, min: 0, max: 999999.99 });
        }

        if (targetCategories !== undefined) {
          updateData.targetCategories = Array.isArray(targetCategories) ? targetCategories : [];
        }

        if (targetRegions !== undefined) {
          updateData.targetRegions = Array.isArray(targetRegions) ? targetRegions : [];
        }

        if (status !== undefined) {
          // Only allow PAUSED or ACTIVE (to resume)
          // If resuming (ACTIVE), we must validate dates to ensure it shouldn't be DRAFT or COMPLETED
          if (status === CampaignStatus.PAUSED) {
            updateData.status = CampaignStatus.PAUSED;
          } else if (status === CampaignStatus.ACTIVE) {
            // Recalculate based on dates (using new dates if provided, else existing)
            const checkStartDate = startDate ? new Date(startDate) : new Date(existingCampaign.startDate);
            const checkEndDate = endDate ? new Date(endDate) : new Date(existingCampaign.endDate);
            const now = new Date();
            const today = new Date(now);
            today.setHours(0, 0, 0, 0);

            if (checkEndDate < today) {
              updateData.status = CampaignStatus.COMPLETED;
            } else if (checkStartDate > today) {
              updateData.status = CampaignStatus.DRAFT;
            } else {
              updateData.status = CampaignStatus.ACTIVE;
            }
          }
          // Use implicit ignore for other statuses or could throw error. Sticking to "ignore" for safety or return error if strict.
          // Given prompt "backend to only accept pause", likely means we shouldn't allow arbitrary transitions.
        }

        // Validate dates
        const now = new Date();
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        const existingStartDate = new Date(existingCampaign.startDate);

        // If startDate is being updated and existing startDate is in the past, don't allow it
        if (startDate !== undefined && existingStartDate < now) {
          throw new ValidationError(
            'Cannot edit startDate for campaigns that have already started'
          );
        }

        // Validate startDate if provided (must be in the future)
        if (startDate !== undefined) {
          const newStartDate = new Date(startDate);
          if (isNaN(newStartDate.getTime())) {
            throw new ValidationError('startDate must be a valid date');
          }
          if (newStartDate < today) {
            throw new ValidationError('startDate must be today or in the future');
          }
          updateData.startDate = newStartDate;
        }

        // Validate endDate if provided (must be in the future, but can be edited even if campaign started)
        if (endDate !== undefined) {
          const newEndDate = new Date(endDate);
          if (isNaN(newEndDate.getTime())) {
            throw new ValidationError('endDate must be a valid date');
          }
          if (newEndDate < today) {
            throw new ValidationError('endDate must be today or in the future');
          }
          updateData.endDate = newEndDate;
        }

        // Validate date relationship if both are provided
        if (updateData.startDate && updateData.endDate) {
          if (updateData.startDate >= updateData.endDate) {
            throw new ValidationError('startDate must be before endDate');
          }
        }

        // Also validate against existing dates if only one is being updated
        if (startDate !== undefined && endDate === undefined) {
          const newStartDate = new Date(startDate);
          if (newStartDate >= new Date(existingCampaign.endDate)) {
            throw new ValidationError('startDate must be before existing endDate');
          }
        }

        if (endDate !== undefined && startDate === undefined) {
          const newEndDate = new Date(endDate);
          if (newEndDate <= new Date(existingCampaign.startDate)) {
            throw new ValidationError('endDate must be after existing startDate');
          }
        }

        const updatedCampaign = await prisma.campaign.update({
          where: { id },
          data: updateData,
          include: {
            sponsor: { select: { id: true, name: true } },
            _count: { select: { creatives: true, placements: true } },
          },
        });

        res.status(200).json(updatedCampaign);
      } catch (error) {
        if (error instanceof ValidationError) {
          res.status(400).json({ error: error.message });
          return;
        }
        console.error('Error updating campaign:', error);
        res.status(500).json({ error: 'Failed to update campaign' });
      }
    } catch (error) {
      console.error('Error updating campaign:', error);
      res.status(500).json({ error: 'Failed to update campaign' });
    }
  }
);

// DELETE /api/campaigns/:id - Delete campaign (verify ownership)
router.delete(
  '/:id',
  requireAuth,
  roleMiddleware(['SPONSOR']),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const id = getParam(req.params.id);
      if (!id) {
        res.status(400).json({ error: 'Invalid campaign ID' });
        return;
      }

      // Verify ownership - check campaign exists and user owns it
      const campaign = await prisma.campaign.findFirst({
        where: {
          id,
          sponsor: { userId: req.user.id }, // Ownership check
        },
      });

      if (!campaign) {
        // Returns 404 for both "not found" and "not owned"
        res.status(404).json({ error: 'Campaign not found' });
        return;
      }

      await prisma.campaign.delete({
        where: { id },
      });

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      res.status(500).json({ error: 'Failed to delete campaign' });
    }
  }
);

export default router;
