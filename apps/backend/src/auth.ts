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
  database: new Pool({ connectionString }),
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
  };
}

// Authentication middleware that validates Better Auth sessions
export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  
  
  try {
    // Extract cookies from request
    const cookieHeader = req.headers.cookie || '';
    
    
    
    // Create Headers object for Better Auth
    // Better Auth expects headers similar to what Next.js headers() provides
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
    
    const session = await auth.api.getSession({
      headers: requestHeaders,
    });
    
   
    if (!session || !session.user) {
      
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    
    

    const userId = session.user.id;
    const email = session.user.email || '';

    // Look up user's role (Sponsor or Publisher)
    const sponsor = await prisma.sponsor.findUnique({
      where: { userId },
      select: { id: true },
    });

    const publisher = await prisma.publisher.findUnique({
      where: { userId },
      select: { id: true },
    });

    // Determine role
    let role: 'SPONSOR' | 'PUBLISHER' | null = null;
    if (sponsor) {
      role = 'SPONSOR';
    } else if (publisher) {
      role = 'PUBLISHER';
    }

    // Attach user info to request
    req.user = {
      id: userId,
      email,
      role,
      ...(sponsor && { sponsorId: sponsor.id }),
      ...(publisher && { publisherId: publisher.id }),
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
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
