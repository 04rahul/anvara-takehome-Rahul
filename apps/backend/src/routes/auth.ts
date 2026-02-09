import { Router, type Request, type Response, type IRouter } from 'express';
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
// FULLY OPTIMIZED: Uses role data cached by requireAuth middleware (ZERO DB queries!)
router.get('/role/:userId', requireAuth, async (req: AuthRequest, res: Response) => {
  const traceId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const startMs = Date.now();
  console.log(`[backend:role:${traceId}] start (from cache)`, {
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

    // ZERO DB QUERIES: All data is already cached in req.user from requireAuth!
    let roleData: Record<string, unknown> = { role: null };

    if (req.user.role === 'SPONSOR' && req.user.sponsorId) {
      roleData = {
        role: 'sponsor',
        sponsorId: req.user.sponsorId,
        name: req.user.name,
      };
    } else if (req.user.role === 'PUBLISHER' && req.user.publisherId) {
      roleData = {
        role: 'publisher',
        publisherId: req.user.publisherId,
        name: req.user.name,
      };
    }

    console.log(`[backend:role:${traceId}] done (0 DB queries, from cache)`, {
      dtMs: Date.now() - startMs,
      role: roleData.role,
    });

    res.json(roleData);
  } catch (error) {
    console.error('Error fetching user role:', error);
    res.status(500).json({ error: 'Failed to fetch user role' });
  }
});

export default router;
