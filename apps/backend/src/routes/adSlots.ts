import { Router, type Request, type Response, type IRouter } from 'express';
import { prisma } from '../db.js';
import { AdSlotType, PricingModel } from '../generated/prisma/client.js';
import { getParam, validateString, validateInteger, validateDecimal, ValidationError } from '../utils/helpers.js';
import { requireAuth, roleMiddleware, type AuthRequest } from '../auth.js';

const router: IRouter = Router();

// GET /api/ad-slots - List ad slots.
// Public marketplace should only show available slots; publisher-scoped queries may include unavailable.
router.get('/', async (req: Request, res: Response) => {
  try {
    const { type, available, publisherId, minPrice, maxPrice, sortBy, search, category } = req.query;

    // Pagination params
    const requestedPage = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;

    const resolvedPublisherId = publisherId ? getParam(publisherId) : '';
    const isPublicMarketplaceQuery = !resolvedPublisherId;

    const whereClause: any = {
      ...(type && {
        type: type as string as AdSlotType,
      }),
      // Public marketplace always shows available slots only
      ...(isPublicMarketplaceQuery ? { isAvailable: true } : (available === 'true' ? { isAvailable: true } : {})),
      // If publisherId query param is provided, filter by it
      ...(resolvedPublisherId && { publisherId: resolvedPublisherId }),
    };

    // Category filter - filter by publisher category
    if (category && typeof category === 'string') {
      whereClause.publisher = {
        ...whereClause.publisher,
        category: {
          equals: category,
          mode: 'insensitive',
        },
      };
    }

    // Search across name, description, and publisher name
    if (search && typeof search === 'string' && search.trim()) {
      const searchTerm = search.trim();
      whereClause.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { publisher: { name: { contains: searchTerm, mode: 'insensitive' } } },
      ];
    }

    // Price range filtering
    if (minPrice || maxPrice) {
      whereClause.basePrice = {};
      if (minPrice) {
        whereClause.basePrice.gte = parseFloat(minPrice as string);
      }
      if (maxPrice) {
        whereClause.basePrice.lte = parseFloat(maxPrice as string);
      }
    }

    // Dynamic sorting
    let orderBy: any = { basePrice: 'desc' }; // default
    if (sortBy === 'price-asc') orderBy = { basePrice: 'asc' };
    if (sortBy === 'price-desc') orderBy = { basePrice: 'desc' };
    if (sortBy === 'name-asc') orderBy = { name: 'asc' };
    if (sortBy === 'name-desc') orderBy = { name: 'desc' };

    // Get total count first to validate page number
    const total = await prisma.adSlot.count({ where: whereClause });
    const totalPages = Math.ceil(total / limit) || 1;

    // Validate and correct page number (handle invalid pages)
    let actualPage = requestedPage;
    if (requestedPage < 1) {
      actualPage = 1; // Negative or zero page → page 1
    } else if (requestedPage > totalPages && total > 0) {
      actualPage = totalPages; // Beyond last page → last page
    } else if (total === 0) {
      actualPage = 1; // No results → page 1
    }

    const skip = (actualPage - 1) * limit;

    // Fetch data with corrected page
    const adSlots = await prisma.adSlot.findMany({
      where: whereClause,
      skip,
      take: limit,
      include: {
        publisher: { select: { id: true, name: true, category: true, monthlyViews: true } },
        _count: { select: { placements: true } },
      },
      orderBy,
    });

    // Return paginated response with actual page used
    res.json({
      data: adSlots,
      pagination: {
        page: actualPage,        // Actual page returned
        requestedPage,            // What user asked for (for debugging)
        limit,
        total,
        totalPages,
        hasMore: actualPage < totalPages,
      }
    });
  } catch (error) {
    console.error('Error fetching ad slots:', error);
    res.status(500).json({ error: 'Failed to fetch ad slots' });
  }
});

// GET /api/ad-slots/:id - Get single ad slot with details (public for marketplace)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = getParam(req.params.id);
    const adSlot = await prisma.adSlot.findUnique({
      where: { id },
      include: {
        publisher: true,
        placements: {
          include: {
            campaign: { select: { id: true, name: true, status: true } },
          },
        },
      },
    });

    if (!adSlot) {
      res.status(404).json({ error: 'Ad slot not found' });
      return;
    }

    // Return public ad slot details (accessible to all users)
    res.json(adSlot);
  } catch (error) {
    console.error('Error fetching ad slot:', error);
    res.status(500).json({ error: 'Failed to fetch ad slot' });
  }
});

// POST /api/ad-slots - Create new ad slot (use user's publisherId)
router.post('/', requireAuth, roleMiddleware(['PUBLISHER']), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { name, description, type, width, height, position, basePrice } = req.body;

    try {
      // Validate and sanitize input fields
      const validatedData = {
        name: validateString(name, 'name', { required: true, minLength: 1, maxLength: 255, allowEmpty: false }),
        description: description !== undefined && description !== null
          ? validateString(description, 'description', { required: false, maxLength: 1000, allowEmpty: true })
          : null,
        type: (() => {
          const validTypes = Object.values(AdSlotType);
          if (!validTypes.includes(type as AdSlotType)) {
            throw new ValidationError(`Invalid type. Must be one of: ${validTypes.join(', ')}`);
          }
          return type as AdSlotType;
        })(),
        width: type === AdSlotType.PODCAST
          ? null
          : (width !== undefined
            ? validateInteger(width, 'width', { required: false, min: 1, max: 10000, allowNull: true })
            : undefined),
        height: type === AdSlotType.PODCAST
          ? null
          : (height !== undefined
            ? validateInteger(height, 'height', { required: false, min: 1, max: 10000, allowNull: true })
            : undefined),
        position: position !== undefined && position !== null
          ? validateString(position, 'position', { required: false, maxLength: 100, allowEmpty: true })
          : null,
        basePrice: validateDecimal(basePrice, 'basePrice', { required: true, min: 0, max: 999999.99 }),
      };

      const adSlot = await prisma.adSlot.create({
        data: {
          ...validatedData,
          publisherId: req.user.publisherId!,
        },
        include: {
          publisher: { select: { id: true, name: true } },
        },
      });

      res.status(201).json(adSlot);
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
        return;
      }
      console.error('Error creating ad slot:', error);
      res.status(500).json({ error: 'Failed to create ad slot' });
    }
  } catch (error) {
    console.error('Error creating ad slot:', error);
    res.status(500).json({ error: 'Failed to create ad slot' });
  }
});

// POST /api/ad-slots/:id/book - Book an ad slot (simplified booking flow)
// This creates a Placement request (status=PENDING). Inventory is locked only when publisher approves.
router.post('/:id/book', requireAuth, roleMiddleware(['SPONSOR']), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const id = getParam(req.params.id);
    const { campaignId, creativeId, agreedPrice, pricingModel, startDate, endDate, message } = req.body;
    const sponsorId = req.user.sponsorId!;

    // Check if slot exists and is available
    const adSlot = await prisma.adSlot.findUnique({
      where: { id },
      include: { publisher: true },
    });

    if (!adSlot) {
      res.status(404).json({ error: 'Ad slot not found' });
      return;
    }

    if (!adSlot.isAvailable) {
      res.status(400).json({ error: 'Ad slot is no longer available' });
      return;
    }

    if (!campaignId || !creativeId || agreedPrice === undefined || agreedPrice === null || !startDate || !endDate) {
      res.status(400).json({
        error: 'campaignId, creativeId, agreedPrice, startDate, and endDate are required',
      });
      return;
    }

    // Validate campaign ownership (must belong to authenticated sponsor)
    const campaign = await prisma.campaign.findUnique({
      where: { id: String(campaignId) },
      select: { id: true, sponsorId: true, name: true, startDate: true, endDate: true },
    });

    if (!campaign) {
      res.status(404).json({ error: 'Campaign not found' });
      return;
    }

    if (campaign.sponsorId !== sponsorId) {
      res.status(403).json({ error: 'Forbidden: You can only request placements for your own campaigns' });
      return;
    }

    // Validate creative belongs to campaign
    const creative = await prisma.creative.findUnique({
      where: { id: String(creativeId) },
      select: { id: true, campaignId: true, name: true, type: true },
    });

    if (!creative) {
      res.status(404).json({ error: 'Creative not found' });
      return;
    }

    if (creative.campaignId !== campaign.id) {
      res.status(400).json({ error: 'Creative does not belong to the selected campaign' });
      return;
    }

    // Validate dates
    const start = new Date(String(startDate));
    const end = new Date(String(endDate));
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res.status(400).json({ error: 'startDate and endDate must be valid dates' });
      return;
    }
    if (start >= end) {
      res.status(400).json({ error: 'endDate must be after startDate' });
      return;
    }

    // Validate dates are within campaign date range
    const campaignStart = new Date(campaign.startDate);
    const campaignEnd = new Date(campaign.endDate);
    if (start < campaignStart) {
      res.status(400).json({ error: `Start date must be on or after campaign start date: ${campaignStart.toISOString().split('T')[0]}` });
      return;
    }
    if (end > campaignEnd) {
      res.status(400).json({ error: `End date must be on or before campaign end date: ${campaignEnd.toISOString().split('T')[0]}` });
      return;
    }

    // Check for existing placement request for this campaign + ad slot
    const existingPlacement = await prisma.placement.findFirst({
      where: {
        campaignId: campaign.id,
        adSlotId: adSlot.id,
        status: {
          in: ['PENDING', 'APPROVED', 'ACTIVE']
        }
      },
      select: {
        id: true,
        status: true,
        createdAt: true
      }
    });

    if (existingPlacement) {
      const statusMessage = existingPlacement.status === 'PENDING'
        ? 'You already have a pending placement request for this ad slot.'
        : `This ad slot is already ${existingPlacement.status.toLowerCase()} for this campaign.`;

      res.status(409).json({
        error: statusMessage,
        errorCode: 'DUPLICATE_PLACEMENT_REQUEST',
        existingPlacementId: existingPlacement.id,
        existingPlacementStatus: existingPlacement.status
      });
      return;
    }

    // Validate pricing model
    let resolvedPricingModel: PricingModel = PricingModel.CPM;
    if (pricingModel !== undefined && pricingModel !== null && String(pricingModel).trim().length > 0) {
      const candidate = String(pricingModel) as PricingModel;
      if (!Object.values(PricingModel).includes(candidate)) {
        res.status(400).json({ error: `Invalid pricingModel. Must be one of: ${Object.values(PricingModel).join(', ')}` });
        return;
      }
      resolvedPricingModel = candidate;
    }

    // Validate agreedPrice
    let resolvedAgreedPrice: number;
    try {
      resolvedAgreedPrice = validateDecimal(agreedPrice, 'agreedPrice', { required: true, min: 0, max: 999999.99 });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
        return;
      }
      throw error;
    }

    const placement = await prisma.placement.create({
      data: {
        campaignId: campaign.id,
        creativeId: creative.id,
        adSlotId: adSlot.id,
        publisherId: adSlot.publisherId,
        agreedPrice: resolvedAgreedPrice,
        pricingModel: resolvedPricingModel,
        startDate: start,
        endDate: end,
        message,
        // status defaults to PENDING (requested)
      },
      include: {
        campaign: { select: { id: true, name: true } },
        creative: { select: { id: true, name: true, type: true } },
        adSlot: { select: { id: true, name: true, type: true } },
        publisher: { select: { id: true, name: true } },
      },
    });

    console.log(
      `Placement requested: sponsor=${sponsorId} campaign=${campaign.id} adSlot=${adSlot.id} creative=${creative.id}. Message: ${message || 'None'}`
    );

    res.status(201).json({
      success: true,
      message: 'Placement request submitted',
      placement,
    });
  } catch (error) {
    console.error('Error booking ad slot:', error);
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
      return;
    }
    // For Prisma errors, extract meaningful message
    if (error && typeof error === 'object' && 'message' in error) {
      const prismaError = error as { message: string; code?: string };
      if (prismaError.code === 'P2002') {
        res.status(409).json({ error: 'A placement request already exists for this combination' });
        return;
      }
      res.status(400).json({ error: prismaError.message });
      return;
    }
    res.status(500).json({ error: 'Failed to create placement request' });
  }
});
// TODO:RD Not sure what to do in testing, maybe just allow for demo accounts - add auth accordingly
// POST /api/ad-slots/:id/unbook - Reset ad slot to available (for testing)
router.post('/:id/unbook', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const id = getParam(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Missing id" });
    }

    // Check if user is a demo user
    const demoEmails = ['sponsor@example.com', 'publisher@example.com'];
    if (!req.user || !req.user.email || !demoEmails.includes(req.user.email)) {
      res.status(403).json({ error: 'Forbidden: This action is only available for demo users' });
      return;
    }

    // Use a transaction to ensure both operations succeed or fail together
    const updatedSlot = await prisma.$transaction(async (tx) => {
      // 1. Delete associated active/approved placements
      await tx.placement.deleteMany({
        where: {
          adSlotId: id,
          status: {
            in: ['APPROVED', 'ACTIVE'],
          },
        },
      });

      // 2. Set slot to available
      return await tx.adSlot.update({
        where: { id },
        data: { isAvailable: true },
        include: {
          publisher: { select: { id: true, name: true } },
        },
      });
    });

    res.json({
      success: true,
      message: 'Ad slot is now available again',
      adSlot: updatedSlot,
    });
  } catch (error) {
    console.error('Error unbooking ad slot:', error);
    res.status(500).json({ error: 'Failed to unbook ad slot' });
  }
});

// PUT /api/ad-slots/:id - Update ad slot
router.put('/:id', requireAuth, roleMiddleware(['PUBLISHER']), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const id = getParam(req.params.id);
    if (!id) {
      res.status(400).json({ error: 'Invalid ad slot ID' });
      return;
    }

    const { name, description, type, width, height, position, basePrice } = req.body;

    // Verify ownership - check ad slot exists and user owns it
    const existingAdSlot = await prisma.adSlot.findFirst({
      where: {
        id,
        publisher: { userId: req.user.id }, // Ownership check
      },
    });

    if (!existingAdSlot) {
      // Returns 404 for both "not found" and "not owned"
      res.status(404).json({ error: 'Ad slot not found' });
      return;
    }

    // If the slot is already booked (unavailable), it cannot be edited
    if (!existingAdSlot.isAvailable) {
      res.status(409).json({ error: 'Ad slot is booked and cannot be edited' });
      return;
    }

    // Build update data object with only provided fields
    try {
      const updateData: any = {};

      if (name !== undefined) {
        updateData.name = validateString(name, 'name', { required: false, minLength: 1, maxLength: 255, allowEmpty: false });
      }

      if (description !== undefined) {
        updateData.description = description === null || description === ''
          ? null
          : validateString(description, 'description', { required: false, maxLength: 1000, allowEmpty: true });
      }

      if (type !== undefined) {
        const validTypes = Object.values(AdSlotType);
        if (!validTypes.includes(type as AdSlotType)) {
          res.status(400).json({ error: `Invalid type. Must be one of: ${validTypes.join(', ')}` });
          return;
        }
        updateData.type = type as AdSlotType;
      }

      const resolvedType = type !== undefined ? (type as AdSlotType) : existingAdSlot.type;

      if (resolvedType === AdSlotType.PODCAST) {
        updateData.width = null;
        updateData.height = null;
      } else {
        if (width !== undefined) {
          updateData.width = validateInteger(width, 'width', { required: false, min: 1, max: 10000, allowNull: true });
        }

        if (height !== undefined) {
          updateData.height = validateInteger(height, 'height', { required: false, min: 1, max: 10000, allowNull: true });
        }
      }

      if (position !== undefined) {
        updateData.position = position === null || position === ''
          ? null
          : validateString(position, 'position', { required: false, maxLength: 100, allowEmpty: true });
      }

      if (basePrice !== undefined) {
        updateData.basePrice = validateDecimal(basePrice, 'basePrice', { required: true, min: 0, max: 999999.99 });
      }

      const updatedAdSlot = await prisma.adSlot.update({
        where: { id },
        data: updateData,
        include: {
          publisher: { select: { id: true, name: true } },
        },
      });

      res.status(200).json(updatedAdSlot);
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
        return;
      }
      console.error('Error updating ad slot:', error);
      res.status(500).json({ error: 'Failed to update ad slot' });
    }
  } catch (error) {
    console.error('Error updating ad slot:', error);
    res.status(500).json({ error: 'Failed to update ad slot' });
  }
});

// DELETE /api/ad-slots/:id - Delete ad slot
router.delete('/:id', requireAuth, roleMiddleware(['PUBLISHER']), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const id = getParam(req.params.id);
    if (!id) {
      res.status(400).json({ error: 'Invalid ad slot ID' });
      return;
    }

    // Verify ownership - check ad slot exists and user owns it
    const adSlot = await prisma.adSlot.findFirst({
      where: {
        id,
        publisher: { userId: req.user.id }, // Ownership check
      },
    });

    if (!adSlot) {
      // Returns 404 for both "not found" and "not owned"
      res.status(404).json({ error: 'Ad slot not found' });
      return;
    }

    // Prohibit deletion if the ad slot is booked
    if (!adSlot.isAvailable) {
      res.status(409).json({ error: 'Ad slot is booked and cannot be deleted' });
      return;
    }

    await prisma.adSlot.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting ad slot:', error);
    res.status(500).json({ error: 'Failed to delete ad slot' });
  }
});

export default router;
