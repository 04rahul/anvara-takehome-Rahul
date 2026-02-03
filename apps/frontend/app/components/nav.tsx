import Link from 'next/link';
import type { SessionData } from '@/lib/auth-helpers';
import { LogoutButton } from './logout-button';

interface NavProps {
  sessionData: SessionData;
}

// TODO: Add active link styling using usePathname() from next/navigation
// The current page's link should be highlighted differently

export function Nav({ sessionData }: NavProps) {
  const { user, role } = sessionData;

  return (
    <header className="border-b border-[--color-border]">
      <nav className="mx-auto flex max-w-6xl items-center justify-between p-4">
        <Link href="/" className="text-xl font-bold text-[--color-primary]">
          Anvara
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/marketplace"
            className="text-[--color-muted] hover:text-[--color-foreground]"
          >
            Marketplace
          </Link>

          {user && role === 'sponsor' && (
            <Link
              href="/dashboard/sponsor"
              className="text-[--color-muted] hover:text-[--color-foreground]"
            >
              My Campaigns
            </Link>
          )}
          {user && role === 'publisher' && (
            <Link
              href="/dashboard/publisher"
              className="text-[--color-muted] hover:text-[--color-foreground]"
            >
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
              className="rounded bg-[--color-primary] px-4 py-2 text-sm text-white hover:bg-[--color-primary-hover]"
            >
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
