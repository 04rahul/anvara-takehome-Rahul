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
