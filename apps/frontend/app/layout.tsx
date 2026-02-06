import type { Metadata, Viewport } from 'next';
import type React from 'react';
import './globals.css';
import { Nav } from './components/nav';
import { getServerSession } from '@/lib/auth-helpers.server';
import { SessionProvider } from '@/lib/session-context';
import { ABTestDebugger } from './components/ab-test-debugger';
import { UIProviders } from './components/ui/providers';

// TODO: Add ErrorBoundary wrapper for graceful error handling
// TODO: Consider adding a loading.tsx for Suspense boundaries

const siteUrl =
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
  process.env.BETTER_AUTH_URL ||
  'http://localhost:3847';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: 'Anvara',
  title: {
    default: 'Anvara Marketplace',
    template: '%s — Anvara',
  },
  description: 'Sponsorship marketplace connecting sponsors with publishers',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Anvara Marketplace',
    description: 'Sponsorship marketplace connecting sponsors with publishers',
    url: '/',
    siteName: 'Anvara',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Anvara Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Anvara Marketplace',
    description: 'Sponsorship marketplace connecting sponsors with publishers',
    images: ['/twitter-image'],
  },
  icons: {
    icon: [{ url: '/icon' }],
    apple: [{ url: '/apple-icon' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#6366f1' },
    { media: '(prefers-color-scheme: dark)', color: '#6366f1' },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Fetch session once at layout level - will be cached for Nav and other components
  const sessionData = await getServerSession();

  
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        {/* Prevent light/dark "flash" by applying theme before React hydrates */}
        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: `(() => {
  try {
    const key = 'anvara.theme';
    const stored = localStorage.getItem(key);
    const system = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const theme = stored === 'dark' || stored === 'light' ? stored : system;
    document.documentElement.dataset.theme = theme;
  } catch {}
})();`,
          }}
        />
        <SessionProvider sessionData={sessionData}>
          <UIProviders>
            <Nav />
            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
            {/* A/B Test Debugger - Development Only */}
            {process.env.NODE_ENV === 'development' && <ABTestDebugger />}
          </UIProviders>
        </SessionProvider>
      </body>
    </html>
  );
}
