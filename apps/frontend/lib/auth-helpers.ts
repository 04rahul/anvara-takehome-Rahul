import { cache } from 'react';
import { headers, cookies } from 'next/headers';
import { auth } from '@/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4291';

export type UserRole = 'sponsor' | 'publisher' | null;

export interface RoleData {
  role: UserRole;
  sponsorId?: string;
  publisherId?: string;
  name?: string;
}

export interface SessionData {
  user: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  role: UserRole;
  roleData: RoleData;
}

/**
 * Get server-side session with role information.
 * Uses React.cache() to deduplicate requests across components in the same request.
 */
export const getServerSession = cache(async (): Promise<SessionData> => {
  // Get headers and cookies
  const headersList = await headers();
  const cookieStore = await cookies();
  
  // Build cookie header string from all cookies
  const allCookies = cookieStore.getAll();
  const cookieString = allCookies.map(c => `${c.name}=${c.value}`).join('; ');
  
  // Create headers object with cookies explicitly set
  const requestHeaders = new Headers();
  headersList.forEach((value, key) => {
    requestHeaders.set(key, value);
  });
  // Ensure cookie header is set (better-auth needs this)
  if (cookieString) {
    requestHeaders.set('cookie', cookieString);
  }
  
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  const user = session?.user || null;
  let role: UserRole = null;
  let roleData: RoleData = { role: null };

  if (user?.id) {
    const sessionCookie = cookieStore.get('better-auth.session_token');
    const cookieHeader = sessionCookie 
      ? `better-auth.session_token=${sessionCookie.value}` 
      : undefined;
    
    roleData = await getUserRole(user.id, cookieHeader);
    role = roleData.role;
  }

  return {
    user,
    role,
    roleData,
  };
});

/**
 * Fetch user role from the backend based on userId.
 * Returns role info including sponsorId/publisherId if applicable.
 * Works in both client-side and server-side contexts.
 * 
 * For server-side usage, pass cookieHeader parameter.
 */
export async function getUserRole(
  userId: string,
  cookieHeader?: string
): Promise<RoleData> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }

    const res = await fetch(`${API_URL}/api/auth/role/${userId}`, {
      cache: 'no-store', // Always fetch fresh role data
      credentials: 'include', // For client-side requests
      headers,
    });
    
    if (!res.ok) {
      return { role: null };
    }
    return await res.json();
  } catch {
    return { role: null };
  }
}
