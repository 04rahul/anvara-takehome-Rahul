import { Router, type Request, type Response, type IRouter } from 'express';
import { prisma } from '../db.js';
import { getParam } from '../utils/helpers.js';
import { requireAuth, roleMiddleware, type AuthRequest } from '../auth.js';

const router: IRouter = Router();

// GET /api/ad-slots - List available ad slots (public marketplace, or filtered by publisherId)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { type, available, publisherId } = req.query;

    const whereClause: any = {
      ...(type && {
        type: type as string as 'DISPLAY' | 'VIDEO' | 'NATIVE' | 'NEWSLETTER' | 'PODCAST',
      }),
      ...(available === 'true' && { isAvailable: true }),
      // If publisherId query param is provided, filter by it
      ...(publisherId && { publisherId: getParam(publisherId) }),
    };

    const adSlots = await prisma.adSlot.findMany({
      where: whereClause,
      include: {
        publisher: { select: { id: true, name: true, category: true, monthlyViews: true } },
        _count: { select: { placements: true } },
      },
      orderBy: { basePrice: 'desc' },
    });

    res.json(adSlots);
  } catch (error) {
    console.error('Error fetching ad slots:', error);
    res.status(500).json({ error: 'Failed to fetch ad slots' });
  }
});

// GET /api/ad-slots/:id - Get single ad slot with details (verify ownership)
router.get('/:id', requireAuth, roleMiddleware(['PUBLISHER']), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

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

    // Verify ownership
    if (adSlot.publisherId !== req.user.publisherId!) {
      res.status(403).json({ error: 'Forbidden: You do not have access to this ad slot' });
      return;
    }

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

    if (!name || !type || !basePrice) {
      res.status(400).json({
        error: 'Name, type, and basePrice are required',
      });
      return;
    }

    const adSlot = await prisma.adSlot.create({
      data: {
        name,
        description,
        type,
        width: width !== undefined && width !== null ? parseInt(String(width)) : undefined,
        height: height !== undefined && height !== null ? parseInt(String(height)) : undefined,
        position,
        basePrice,
        publisherId: req.user.publisherId!, // Use authenticated user's publisherId
      },
      include: {
        publisher: { select: { id: true, name: true } },
      },
    });

    res.status(201).json(adSlot);
  } catch (error) {
    console.error('Error creating ad slot:', error);
    res.status(500).json({ error: 'Failed to create ad slot' });
  }
});

// POST /api/ad-slots/:id/book - Book an ad slot (simplified booking flow)
// This marks the slot as unavailable and creates a simple booking record
router.post('/:id/book', requireAuth, roleMiddleware(['SPONSOR']), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const id = getParam(req.params.id);
    const { sponsorId, message } = req.body;

    // Verify the sponsorId in request matches authenticated user's sponsorId
    if (sponsorId && sponsorId !== req.user.sponsorId) {
      res.status(403).json({ error: 'Forbidden: You can only book ad slots for your own sponsor account' });
      return;
    }

    // Use authenticated user's sponsorId (don't trust the body)
    const bookingSponsorId = req.user.sponsorId!;

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

    // Mark slot as unavailable
    const updatedSlot = await prisma.adSlot.update({
      where: { id },
      data: { isAvailable: false },
      include: {
        publisher: { select: { id: true, name: true } },
      },
    });

    // In a real app, you'd create a Placement record here
    // For now, we just mark it as booked
    console.log(`Ad slot ${id} booked by sponsor ${bookingSponsorId}. Message: ${message || 'None'}`);

    res.json({
      success: true,
      message: 'Ad slot booked successfully!',
      adSlot: updatedSlot,
    });
  } catch (error) {
    console.error('Error booking ad slot:', error);
    res.status(500).json({ error: 'Failed to book ad slot' });
  }
});
// TODO:RD Not sure what to do in testing, maybe just allow for demo accounts - add auth accordingly
// POST /api/ad-slots/:id/unbook - Reset ad slot to available (for testing)
router.post('/:id/unbook', async (req: Request, res: Response) => {
  try {
    const id = getParam(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Missing id" });
    }

    const updatedSlot = await prisma.adSlot.update({
      where: { id },
      data: { isAvailable: true },
      include: {
        publisher: { select: { id: true, name: true } },
      },
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

// TODO: Add PUT /api/ad-slots/:id endpoint
// TODO: Add DELETE /api/ad-slots/:id endpoint

export default router;
