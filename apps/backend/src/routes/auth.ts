import { Router, type Request, type Response, type IRouter } from 'express';
import { prisma } from '../db.js';
import { getParam } from '../utils/helpers.js';
import { requireAuth, type AuthRequest } from '../auth.js';

const router: IRouter = Router();

// NOTE: Authentication is handled by Better Auth on the frontend
// This route is kept for any backend-specific auth utilities

// POST /api/auth/login - Placeholder (Better Auth handles login via frontend)
router.post('/login', async (_req: Request, res: Response) => {
  res.status(400).json({
    error: 'Use the frontend login at /login instead',
    hint: 'Better Auth handles authentication via the Next.js frontend',
  });
});

// GET /api/auth/me - Get current user (for API clients)
router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  res.json(req.user);
});

// GET /api/auth/role/:userId - Get user role based on Sponsor/Publisher records
router.get('/role/:userId', requireAuth, async (req: AuthRequest, res: Response) => {
  const traceId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const startMs = Date.now();
  console.log(`[backend:role:${traceId}] start`, {
    paramUserId: req.params.userId,
    authedUserId: req.user?.id,
  });
  try {
    if (!req.user) {
      console.error('❌ No user attached to request');
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const userId = getParam(req.params.userId);
   

    // Security: Users can only query their own role
    if (userId !== req.user.id) {
      res.status(403).json({ error: 'Forbidden: You can only query your own role' });
      return;
    }

    // Check if user is a sponsor
    console.time(`[backend:role:${traceId}] prisma.sponsor.findUnique`);
    const sponsor = await prisma.sponsor.findUnique({
      where: { userId },
      select: { id: true, name: true },
    });
    console.timeEnd(`[backend:role:${traceId}] prisma.sponsor.findUnique`);

    if (sponsor) {
      console.log(`[backend:role:${traceId}] done`, {
        dtMs: Date.now() - startMs,
        role: 'sponsor',
      });
      res.json({ role: 'sponsor', sponsorId: sponsor.id, name: sponsor.name });
      return;
    }

    // Check if user is a publisher
    console.time(`[backend:role:${traceId}] prisma.publisher.findUnique`);
    const publisher = await prisma.publisher.findUnique({
      where: { userId },
      select: { id: true, name: true },
    });
    console.timeEnd(`[backend:role:${traceId}] prisma.publisher.findUnique`);

    if (publisher) {
      console.log(`[backend:role:${traceId}] done`, {
        dtMs: Date.now() - startMs,
        role: 'publisher',
      });
      res.json({ role: 'publisher', publisherId: publisher.id, name: publisher.name });
      return;
    }

    // User has no role assigned
    console.log(`[backend:role:${traceId}] done`, {
      dtMs: Date.now() - startMs,
      role: null,
    });
    res.json({ role: null });
  } catch (error) {
    console.error('Error fetching user role:', error);
    res.status(500).json({ error: 'Failed to fetch user role' });
  }
});

export default router;
