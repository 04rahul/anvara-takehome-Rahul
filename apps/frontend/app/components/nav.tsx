'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from '@/lib/session-context';
import { LogoutButton } from './logout-button';
import { ButtonLink } from './ui/button-link';
import { ThemeToggle } from './theme-toggle';

export function Nav() {
  const sessionData = useSession();
  const { user, role } = sessionData;
  const pathname = usePathname();

  const homeHref =
    user && role === 'sponsor'
      ? '/dashboard/sponsor'
      : user && role === 'publisher'
        ? '/dashboard/publisher'
        : user
          ? '/marketplace'
          : '/';

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
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href={homeHref}
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

          <ThemeToggle />

          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-[--color-muted]">
                {user.name} {role && `(${role})`}
              </span>
              <LogoutButton />
            </div>
          ) : (
            <ButtonLink
              href="/login"
              variant="primary"
              size="sm"
              className={isActive('/login') ? 'bg-[--color-primary-hover]' : undefined}
            >
              Login
            </ButtonLink>
          )}
        </div>
      </nav>
    </header>
  );
}
