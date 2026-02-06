import 'server-only';

import { cache } from 'react';
import { cookies, headers } from 'next/headers';
import { auth } from '@/auth';
import { getUserRole, type RoleData, type SessionData, type UserRole } from '@/lib/auth-helpers';

/**
 * Get server-side session with role information.
 * Uses React.cache() to deduplicate requests across components in the same request.
 */
export const getServerSession = cache(async (): Promise<SessionData> => {
  const traceId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const startMs = Date.now();
  console.log(`[getServerSession:${traceId}] start`);

  // Get headers and cookies
  const headersList = await headers();
  const cookieStore = await cookies();

  // Build cookie header string from all cookies
  const allCookies = cookieStore.getAll();
  const cookieString = allCookies.map((c) => `${c.name}=${c.value}`).join('; ');

  // Create headers object with cookies explicitly set
  const requestHeaders = new Headers();
  headersList.forEach((value, key) => {
    requestHeaders.set(key, value);
  });
  // Ensure cookie header is set (better-auth needs this)
  if (cookieString) {
    requestHeaders.set('cookie', cookieString);
  }

  console.time(`[getServerSession:${traceId}] auth.api.getSession`);
  const session = await auth.api.getSession({ headers: requestHeaders });
  console.timeEnd(`[getServerSession:${traceId}] auth.api.getSession`);

  const user = session?.user || null;
  let role: UserRole = null;
  let roleData: RoleData = { role: null };

  if (user?.id) {
    const sessionCookie = cookieStore.get('better-auth.session_token');
    const cookieHeader = sessionCookie
      ? `better-auth.session_token=${sessionCookie.value}`
      : undefined;

    console.time(`[getServerSession:${traceId}] getUserRole`);
    roleData = await getUserRole(user.id, cookieHeader);
    console.timeEnd(`[getServerSession:${traceId}] getUserRole`);
    role = roleData.role;
  }

  console.log(`[getServerSession:${traceId}] done`, {
    dtMs: Date.now() - startMs,
    userId: user?.id ?? null,
    role,
  });
  return {
    user,
    role,
    roleData,
  };
});

