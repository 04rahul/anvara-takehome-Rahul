import { type Request, type Response, type NextFunction } from 'express';
import { betterAuth } from 'better-auth';
import { Pool } from 'pg';
import { prisma } from './db.js';

// Set up Better Auth instance for backend
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

export const auth = betterAuth({
  database: new Pool({
    connectionString,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // How long a client can be idle before being removed
    connectionTimeoutMillis: 2000, // Timeout for acquiring a connection
  }),
  secret: process.env.BETTER_AUTH_SECRET || '',
  baseURL: process.env.BETTER_AUTH_URL || '',
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },
  plugins: [],
  advanced: {
    disableCSRFCheck: true,
  },
});

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'SPONSOR' | 'PUBLISHER' | null;
    sponsorId?: string;
    publisherId?: string;
    name?: string; // Cache the sponsor/publisher name
  };
}

// Authentication middleware that validates Better Auth sessions
export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const traceId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const startMs = Date.now();
  console.log(`[requireAuth:${traceId}] start`);

  try {
    // Extract cookies from request
    const cookieHeader = req.headers.cookie || '';

    // Create Headers object for Better Auth
    const requestHeaders = new Headers();

    // Set cookie header (required for session validation)
    if (cookieHeader) {
      requestHeaders.set('cookie', cookieHeader);
    }

    // Include host header (Better Auth might need this for validation)
    if (req.headers.host) {
      requestHeaders.set('host', req.headers.host);
    }

    // Include origin if available (for CORS/security)
    if (req.headers.origin) {
      requestHeaders.set('origin', req.headers.origin);
    }

    // Include user-agent if available
    if (req.headers['user-agent']) {
      requestHeaders.set('user-agent', req.headers['user-agent']);
    }

    // Include authorization header if present
    if (req.headers.authorization) {
      requestHeaders.set('authorization', req.headers.authorization);
    }

    // Validate session using Better Auth
    console.time(`[requireAuth:${traceId}] auth.api.getSession`);
    const session = await auth.api.getSession({
      headers: requestHeaders,
    });
    console.timeEnd(`[requireAuth:${traceId}] auth.api.getSession`);

    if (!session || !session.user) {
      console.log(`[requireAuth:${traceId}] unauthorized`, { dtMs: Date.now() - startMs });
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const userId = session.user.id;
    const email = session.user.email || '';

    // Look up user's role (Sponsor or Publisher) - do this ONCE here
    console.time(`[requireAuth:${traceId}] role lookup`);
    const sponsor = await prisma.sponsor.findUnique({
      where: { userId },
      select: { id: true, name: true },
    });

    const publisher = await prisma.publisher.findUnique({
      where: { userId },
      select: { id: true, name: true },
    });
    console.timeEnd(`[requireAuth:${traceId}] role lookup`);

    // Determine role
    let role: 'SPONSOR' | 'PUBLISHER' | null = null;
    if (sponsor) {
      role = 'SPONSOR';
    } else if (publisher) {
      role = 'PUBLISHER';
    }

    // Attach user info to request (including role data with name)
    req.user = {
      id: userId,
      email,
      role,
      ...(sponsor && { sponsorId: sponsor.id, name: sponsor.name }),
      ...(publisher && { publisherId: publisher.id, name: publisher.name }),
    };

    console.log(`[requireAuth:${traceId}] success`, {
      dtMs: Date.now() - startMs,
      userId,
      role,
    });
    next();
  } catch (error) {
    console.error(`[requireAuth:${traceId}] error:`, error);
    res.status(401).json({ error: 'Not authenticated' });
  }
}

export function roleMiddleware(allowedRoles: Array<'SPONSOR' | 'PUBLISHER'>) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !req.user.role || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    next();
  };
}
