'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from '@/lib/session-context';
import { LogoutButton } from './logout-button';

export function Nav() {
  const sessionData = useSession();
  const { user, role } = sessionData;
  const pathname = usePathname();

  // Use startsWith for nested routes (e.g., /dashboard/sponsor/campaigns highlights "My Campaigns")
  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  const getLinkClassName = (path: string) => {
    if (isActive(path)) {
      return 'text-[--color-primary] font-medium border-b-2 border-[--color-primary] pb-1';
    }
    return 'text-[--color-muted] hover:text-[--color-foreground]';
  };

  return (
    <header className="border-b border-[--color-border]">
      <nav className="mx-auto flex max-w-6xl items-center justify-between p-4">
        <Link
          href="/"
          className={`text-xl font-bold ${
            isActive('/')
              ? 'text-[--color-primary]'
              : 'text-[--color-primary] hover:opacity-80'
          }`}
        >
          Anvara
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/marketplace" className={getLinkClassName('/marketplace')}>
            Marketplace
          </Link>

          {user && role === 'sponsor' && (
            <Link href="/dashboard/sponsor" className={getLinkClassName('/dashboard/sponsor')}>
              My Campaigns
            </Link>
          )}
          {user && role === 'publisher' && (
            <Link href="/dashboard/publisher" className={getLinkClassName('/dashboard/publisher')}>
              My Ad Slots
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-[--color-muted]">
                {user.name} {role && `(${role})`}
              </span>
              <LogoutButton />
            </div>
          ) : (
            <Link
              href="/login"
              className={`rounded px-4 py-2 text-sm text-white transition-colors ${
                isActive('/login')
                  ? 'bg-[--color-primary-hover]'
                  : 'bg-[--color-primary] hover:bg-[--color-primary-hover]'
              }`}
            >
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
