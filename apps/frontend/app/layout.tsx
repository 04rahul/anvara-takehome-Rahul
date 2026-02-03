import type { Metadata } from 'next';
import type React from 'react';
import './globals.css';
import { Nav } from './components/nav';
import { getServerSession } from '@/lib/auth-helpers';

// TODO: Add ErrorBoundary wrapper for graceful error handling
// TODO: Consider adding a loading.tsx for Suspense boundaries
// TODO: Add Open Graph metadata for social media sharing
// TODO: Add Twitter Card metadata
// TODO: Consider adding favicon and app icons

export const metadata: Metadata = {
  title: 'Anvara Marketplace',
  description: 'Sponsorship marketplace connecting sponsors with publishers',
  // Missing: openGraph, twitter, icons, viewport, etc.
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Fetch session once at layout level - will be cached for Nav and other components
  const sessionData = await getServerSession();

  // HINT: If using React Query, you would wrap children with QueryClientProvider here
  // See: https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Nav sessionData={sessionData} />
        <main className="mx-auto max-w-6xl p-4">{children}</main>
      </body>
    </html>
  );
}
