import { Router, type Response, type IRouter } from 'express';
import { prisma } from '../db.js';
import { getParam } from '../utils/helpers.js';
import { PlacementStatus } from '../generated/prisma/client.js';
import { requireAuth, roleMiddleware, type AuthRequest } from '../auth.js';

const router: IRouter = Router();

// GET /api/placements - List placements
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { campaignId, status } = req.query;

    // Role-scoped access: sponsors see placements for their campaigns; publishers see placements for their inventory.
    const whereClause: any = {};

    if (req.user.role === 'SPONSOR') {
      whereClause.campaign = { sponsorId: req.user.sponsorId! };
      if (campaignId) {
        whereClause.campaignId = getParam(campaignId);
      }
    } else if (req.user.role === 'PUBLISHER') {
      whereClause.publisherId = req.user.publisherId!;
    } else {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    if (status) {
      const candidate = String(status) as PlacementStatus;
      if (!Object.values(PlacementStatus).includes(candidate)) {
        res.status(400).json({ error: `Invalid status. Must be one of: ${Object.values(PlacementStatus).join(', ')}` });
        return;
      }
      whereClause.status = candidate;
    }

    const placements = await prisma.placement.findMany({
      where: whereClause,
      include: {
        campaign: { select: { id: true, name: true } },
        creative: { select: { id: true, name: true, type: true } },
        adSlot: { select: { id: true, name: true, type: true } },
        publisher: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(placements);
  } catch (error) {
    console.error('Error fetching placements:', error);
    res.status(500).json({ error: 'Failed to fetch placements' });
  }
});

// POST /api/placements - Create new placement (sponsor only; prefer using /api/ad-slots/:id/book)
router.post('/', requireAuth, roleMiddleware(['SPONSOR']), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const {
      campaignId,
      creativeId,
      adSlotId,
      agreedPrice,
      pricingModel,
      startDate,
      endDate,
      message,
    } = req.body;

    if (!campaignId || !creativeId || !adSlotId || !agreedPrice || !startDate || !endDate) {
      res.status(400).json({
        error: 'campaignId, creativeId, adSlotId, agreedPrice, startDate, and endDate are required',
      });
      return;
    }

    // Derive publisherId from adSlot (do not trust client input)
    const adSlot = await prisma.adSlot.findUnique({
      where: { id: String(adSlotId) },
      select: { id: true, publisherId: true, isAvailable: true },
    });

    if (!adSlot) {
      res.status(404).json({ error: 'Ad slot not found' });
      return;
    }

    const placement = await prisma.placement.create({
      data: {
        campaignId,
        creativeId,
        adSlotId,
        publisherId: adSlot.publisherId,
        agreedPrice,
        pricingModel: pricingModel || 'CPM',
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        message,
      },
      include: {
        campaign: { select: { name: true } },
        publisher: { select: { name: true } },
      },
    });

    res.status(201).json(placement);
  } catch (error) {
    console.error('Error creating placement:', error);
    res.status(500).json({ error: 'Failed to create placement' });
  }
});

// PATCH /api/placements/:id - Publisher approves or rejects a placement request
router.patch('/:id', requireAuth, roleMiddleware(['PUBLISHER']), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const id = getParam(req.params.id);
    if (!id) {
      res.status(400).json({ error: 'Invalid placement id' });
      return;
    }

    const { status } = req.body as { status?: unknown };
    const desiredStatus = String(status || '').toUpperCase();
    if (!['APPROVED', 'REJECTED'].includes(desiredStatus)) {
      res.status(400).json({ error: 'status must be APPROVED or REJECTED' });
      return;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const placement = await tx.placement.findUnique({
        where: { id },
        include: {
          adSlot: { select: { id: true, isAvailable: true, basePrice: true } },
          campaign: { select: { id: true, startDate: true, endDate: true } },
        },
      });

      if (!placement) {
        return null;
      }

      if (placement.publisherId !== req.user!.publisherId) {
        // Hide existence details from other publishers
        throw Object.assign(new Error('Not found'), { statusCode: 404 });
      }

      if (placement.status !== 'PENDING') {
        throw Object.assign(new Error('Only PENDING requests can be updated'), { statusCode: 409 });
      }

      if (desiredStatus === 'APPROVED') {
        if (!placement.adSlot.isAvailable) {
          throw Object.assign(new Error('Ad slot is already booked'), { statusCode: 409 });
        }

        // Calculate spent amount based on adSlot basePrice and duration
        // basePrice is per month, so calculate months between startDate and endDate
        const start = new Date(placement.startDate);
        const end = new Date(placement.endDate);
        const monthsDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30); // Average days per month
        const amountToAdd = Number(placement.adSlot.basePrice) * monthsDiff;

        // Lock inventory on approval and update campaign spent
        await tx.adSlot.update({
          where: { id: placement.adSlotId },
          data: { isAvailable: false },
        });

        // Update campaign spent
        await tx.campaign.update({
          where: { id: placement.campaignId },
          data: {
            spent: {
              increment: amountToAdd,
            },
          },
        });

        return tx.placement.update({
          where: { id },
          data: { status: 'APPROVED' },
          include: {
            campaign: { select: { id: true, name: true } },
            creative: { select: { id: true, name: true, type: true } },
            adSlot: { select: { id: true, name: true, type: true } },
            publisher: { select: { id: true, name: true } },
          },
        });
      }

      return tx.placement.update({
        where: { id },
        data: { status: 'REJECTED' },
        include: {
          campaign: { select: { id: true, name: true } },
          creative: { select: { id: true, name: true, type: true } },
          adSlot: { select: { id: true, name: true, type: true } },
          publisher: { select: { id: true, name: true } },
        },
      });
    });

    if (!updated) {
      res.status(404).json({ error: 'Placement not found' });
      return;
    }

    res.json(updated);
  } catch (error: any) {
    const statusCode = typeof error?.statusCode === 'number' ? error.statusCode : 500;
    if (statusCode !== 500) {
      res.status(statusCode).json({ error: error.message });
      return;
    }
    console.error('Error updating placement:', error);
    res.status(500).json({ error: 'Failed to update placement' });
  }
});

export default router;
