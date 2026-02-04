import { Router, type Request, type Response, type IRouter } from 'express';
import { prisma } from '../db.js';
import { AdSlotType } from '../generated/prisma/client.js';
import { getParam, validateString, validateInteger, validateDecimal, ValidationError } from '../utils/helpers.js';
import { requireAuth, roleMiddleware, type AuthRequest } from '../auth.js';

const router: IRouter = Router();

// GET /api/ad-slots - List available ad slots (public marketplace, or filtered by publisherId)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { type, available, publisherId, minPrice, maxPrice, sortBy, search, category } = req.query;
    
    // Pagination params
    const requestedPage = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;

    const whereClause: any = {
      ...(type && {
        type: type as string as AdSlotType,
      }),
      ...(available === 'true' && { isAvailable: true }),
      // If publisherId query param is provided, filter by it
      ...(publisherId && { publisherId: getParam(publisherId) }),
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
        width: width !== undefined
          ? validateInteger(width, 'width', { required: false, min: 1, max: 10000, allowNull: true })
          : undefined,
        height: height !== undefined
          ? validateInteger(height, 'height', { required: false, min: 1, max: 10000, allowNull: true })
          : undefined,
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

    const { name, description, type, width, height, position, basePrice, isAvailable } = req.body;

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

      if (width !== undefined) {
        updateData.width = validateInteger(width, 'width', { required: false, min: 1, max: 10000, allowNull: true });
      }

      if (height !== undefined) {
        updateData.height = validateInteger(height, 'height', { required: false, min: 1, max: 10000, allowNull: true });
      }

      if (position !== undefined) {
        updateData.position = position === null || position === ''
          ? null
          : validateString(position, 'position', { required: false, maxLength: 100, allowEmpty: true });
      }

      if (basePrice !== undefined) {
        updateData.basePrice = validateDecimal(basePrice, 'basePrice', { required: true, min: 0, max: 999999.99 });
      }

      if (isAvailable !== undefined) {
        updateData.isAvailable = Boolean(isAvailable);
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
