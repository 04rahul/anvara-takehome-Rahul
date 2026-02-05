'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAdSlot } from '@/lib/api';
import { logger } from '@/lib/utils';
import { useSession } from '@/lib/session-context';
import type { AdSlot } from '@/lib/types';
import type { RoleData } from '@/lib/auth-helpers';
import { useDetailPageLayoutTest } from '@/hooks/use-ab-test';
import { Alert } from '@/app/components/ui/alert';
import { Button } from '@/app/components/ui/button';
import { ButtonLink } from '@/app/components/ui/button-link';
import { Input } from '@/app/components/ui/input';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Textarea } from '@/app/components/ui/textarea';

const typeColors: Record<string, string> = {
  DISPLAY: 'bg-blue-100 text-blue-700',
  VIDEO: 'bg-red-100 text-red-700',
  NEWSLETTER: 'bg-purple-100 text-purple-700',
  PODCAST: 'bg-orange-100 text-orange-700',
};

function formatViews(views: number): string {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(0)}K`;
  return views.toString();
}

interface Props {
  id: string;
}

function AdSlotDetailSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div>
        <Skeleton className="h-5 w-40" />
      </div>

      <div className="rounded-lg border border-[--color-border] bg-[--color-background] p-6 shadow-sm">
        <div className="space-y-3">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
          <div className="flex flex-wrap gap-2 pt-2">
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <aside className="order-1 lg:order-2 lg:sticky lg:top-4">
          <div className="rounded-lg border border-[--color-border] bg-[--color-background] p-6 shadow-sm">
            <div className="space-y-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-4 w-24" />
              <div className="pt-2">
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>
        </aside>

        <main className="order-2 lg:order-1 space-y-6">
          <section className="rounded-lg border border-[--color-border] bg-[--color-background] p-6 shadow-sm">
            <div className="space-y-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </section>
          <section className="rounded-lg border border-[--color-border] bg-[--color-background] p-6 shadow-sm">
            <div className="space-y-3">
              <Skeleton className="h-5 w-44" />
              <div className="grid gap-3 sm:grid-cols-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export function AdSlotDetail({ id }: Props) {
  // Get session data from context (server-fetched)
  const sessionData = useSession();
  const user = sessionData.user;
  const roleInfo: RoleData | null = sessionData.roleData;

  const [adSlot, setAdSlot] = useState<AdSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [booking, setBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  
  // A/B Test: Booking form layout variant
  const layoutVariant = useDetailPageLayoutTest();

  useEffect(() => {
    // Only fetch ad slot - session data comes from context
    getAdSlot(id)
      .then(setAdSlot)
      .catch(() => setError('Failed to load ad slot details'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBooking = async () => {
    if (!roleInfo?.sponsorId || !adSlot) return;

    setBooking(true);
    setBookingError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4291'}/api/ad-slots/${adSlot.id}/book`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // Include cookies for authentication
          body: JSON.stringify({
            sponsorId: roleInfo.sponsorId,
            message: message || undefined,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to book placement');
      }

      setBookingSuccess(true);
      setAdSlot({ ...adSlot, isAvailable: false });
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : 'Failed to book placement');
    } finally {
      setBooking(false);
    }
  };

  const handleUnbook = async () => {
    if (!adSlot) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4291'}/api/ad-slots/${adSlot.id}/unbook`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to reset booking');
      }

      setBookingSuccess(false);
      setAdSlot({ ...adSlot, isAvailable: true });
      setMessage('');
    } catch (err) {
      logger.error('Failed to unbook:', err);
    }
  };

  if (loading) {
    return <AdSlotDetailSkeleton />;
  }

  if (error || !adSlot) {
    return (
      <div className="mx-auto w-full max-w-6xl space-y-4">
        <div>
          <Link href="/marketplace" className="text-[--color-primary] hover:underline">
            ← Back to Marketplace
          </Link>
        </div>
        <Alert variant="error">{error || 'Ad slot not found'}</Alert>
      </div>
    );
  }

  const priceFormatted = `$${Number(adSlot.basePrice).toLocaleString()}`;
  const publisherName = adSlot.publisher?.name;
  const publisherWebsite = adSlot.publisher?.website;

  const availabilityLabel = adSlot.isAvailable ? 'Available' : 'Currently booked';

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div>
        <Link href="/marketplace" className="text-[--color-primary] hover:underline">
          ← Back to Marketplace
        </Link>
      </div>

      {/* Header surface */}
      <header className="rounded-lg border border-[--color-border] bg-[--color-background] p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{adSlot.name}</h1>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${typeColors[adSlot.type] || 'bg-gray-100 text-gray-700'}`}
              >
                {adSlot.type}
              </span>
            </div>

            {(publisherName || publisherWebsite) && (
              <p className="mt-2 text-sm text-[--color-muted]">
                {publisherName ? <>by <span className="font-medium text-[--color-foreground]">{publisherName}</span></> : null}
                {publisherWebsite ? (
                  <>
                    {publisherName ? ' · ' : null}
                    <a
                      href={publisherWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[--color-primary] hover:underline break-words"
                    >
                      {publisherWebsite}
                    </a>
                  </>
                ) : null}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {adSlot.publisher?.category ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-[--color-border] bg-[--color-background] px-3 py-1 text-xs">
                  <span className="text-[--color-muted]">Category</span>
                  <span className="font-semibold text-[--color-foreground]">{adSlot.publisher.category}</span>
                </span>
              ) : null}
              {adSlot.publisher?.monthlyViews ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-[--color-border] bg-[--color-background] px-3 py-1 text-xs">
                  <span className="text-[--color-muted]">Monthly views</span>
                  <span className="font-semibold text-[--color-foreground]">
                    {formatViews(adSlot.publisher.monthlyViews)}
                  </span>
                </span>
              ) : null}
              {adSlot._count?.placements ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-[--color-border] bg-[--color-background] px-3 py-1 text-xs">
                  <span className="text-[--color-muted]">Bookings</span>
                  <span className="font-semibold text-[--color-foreground]">{adSlot._count.placements}</span>
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        {/* Booking card - keep near top on mobile */}
        <aside className="order-1 lg:order-2 lg:sticky lg:top-4">
          <div className="rounded-lg border border-[--color-border] bg-[--color-background] p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-sm text-[--color-muted]">Price</div>
                <div className="mt-1 text-3xl font-bold text-[--color-primary]">{priceFormatted}</div>
                <div className="text-sm text-[--color-muted]">per month</div>
              </div>
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${
                  adSlot.isAvailable
                    ? 'border-green-200 bg-green-50 text-green-800'
                    : 'border-[--color-border] bg-[--color-background] text-[--color-muted]'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`h-2 w-2 rounded-full ${adSlot.isAvailable ? 'bg-green-500' : 'bg-[--color-border]'}`}
                />
                {availabilityLabel}
              </span>
            </div>

            <div className="mt-6 border-t border-[--color-border] pt-6">
              {bookingSuccess ? (
                <div className="space-y-3">
                  <Alert variant="success" title="Request sent">
                    Your request has been submitted. The publisher will be in touch soon.
                  </Alert>
                  <Button onClick={handleUnbook} variant="secondary" className="w-full">
                    Remove request (reset for testing)
                  </Button>
                </div>
              ) : !adSlot.isAvailable ? (
                <div className="space-y-3">
                  <Alert variant="info" title="This placement is booked">
                    Check back later, or browse other available slots.
                  </Alert>
                  <div className="flex items-center justify-between gap-3">
                    <ButtonLink variant="secondary" className="flex-1" href="/marketplace">
                      Browse marketplace
                    </ButtonLink>
                    <Button onClick={handleUnbook} variant="link" className="shrink-0">
                      Reset listing
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-base font-semibold">Request this placement</h2>
                    <p className="mt-1 text-sm text-[--color-muted]">
                      Send a request to the publisher. They’ll confirm next steps with you.
                    </p>
                  </div>

                  {roleInfo?.role === 'sponsor' && roleInfo?.sponsorId ? (
                    layoutVariant === 'modern' ? (
                      <div className="space-y-4">
                        <div className="rounded-lg border border-[--color-border] bg-[--color-background] px-4 py-3">
                          <p className="text-sm text-[--color-muted]">
                            Booking as{' '}
                            <span className="font-semibold text-[--color-foreground]">
                              {roleInfo.name || user?.name}
                            </span>
                          </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                          <div className="flex-1">
                            <label htmlFor="bookingMessage" className="sr-only">
                              Message (optional)
                            </label>
                            <Input
                              id="bookingMessage"
                              type="text"
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              placeholder="Add a message (optional)"
                            />
                          </div>
                          <Button onClick={handleBooking} isLoading={booking} className="sm:whitespace-nowrap">
                            {booking ? 'Booking…' : 'Send request'}
                          </Button>
                        </div>

                        {bookingError ? <Alert variant="error">{bookingError}</Alert> : null}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="mb-1 block text-sm font-medium text-[--color-muted]">
                            Your company
                          </label>
                          <p className="text-[--color-foreground]">{roleInfo.name || user?.name}</p>
                        </div>

                        <div>
                          <label
                            htmlFor="bookingMessage"
                            className="mb-1 block text-sm font-medium text-[--color-muted]"
                          >
                            Message to publisher <span className="font-normal">(optional)</span>
                          </label>
                          <Textarea
                            id="bookingMessage"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Tell the publisher about your campaign goals…"
                            rows={4}
                          />
                        </div>

                        {bookingError ? <Alert variant="error">{bookingError}</Alert> : null}

                        <Button onClick={handleBooking} isLoading={booking} className="w-full">
                          {booking ? 'Booking…' : 'Send request'}
                        </Button>
                      </div>
                    )
                  ) : (
                    <div className="space-y-3">
                      {user ? (
                        <Button disabled className="w-full">
                          Send request
                        </Button>
                      ) : (
                        <ButtonLink href="/login" className="w-full">
                          Log in to request
                        </ButtonLink>
                      )}
                      <p className="text-center text-sm text-[--color-muted]">
                        {user
                          ? 'Only sponsors can request placements.'
                          : 'Log in as a sponsor to request this placement.'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </aside>

        <main className="order-2 lg:order-1 space-y-6">
          <section className="rounded-lg border border-[--color-border] bg-[--color-background] p-6 shadow-sm">
            <h2 className="text-base font-semibold">Description</h2>
            <p className="mt-3 text-sm leading-6 text-[--color-muted]">
              {adSlot.description ? adSlot.description : 'No description was provided for this placement.'}
            </p>
          </section>

          <section className="rounded-lg border border-[--color-border] bg-[--color-background] p-6 shadow-sm">
            <h2 className="text-base font-semibold">Placement details</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-[--color-border] bg-[--color-background] p-4">
                <dt className="text-xs font-medium text-[--color-muted]">Publisher</dt>
                <dd className="mt-1 text-sm font-semibold text-[--color-foreground]">
                  {publisherName ? publisherName : '—'}
                </dd>
                {publisherWebsite ? (
                  <dd className="mt-1 text-sm">
                    <a
                      href={publisherWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[--color-primary] hover:underline"
                    >
                      Visit website
                    </a>
                  </dd>
                ) : null}
              </div>

              <div className="rounded-lg border border-[--color-border] bg-[--color-background] p-4">
                <dt className="text-xs font-medium text-[--color-muted]">Ad type</dt>
                <dd className="mt-1 text-sm font-semibold text-[--color-foreground]">{adSlot.type}</dd>
              </div>

              <div className="rounded-lg border border-[--color-border] bg-[--color-background] p-4">
                <dt className="text-xs font-medium text-[--color-muted]">Category</dt>
                <dd className="mt-1 text-sm font-semibold text-[--color-foreground]">
                  {adSlot.publisher?.category ? adSlot.publisher.category : '—'}
                </dd>
              </div>

              <div className="rounded-lg border border-[--color-border] bg-[--color-background] p-4">
                <dt className="text-xs font-medium text-[--color-muted]">Monthly views</dt>
                <dd className="mt-1 text-sm font-semibold text-[--color-foreground]">
                  {adSlot.publisher?.monthlyViews ? formatViews(adSlot.publisher.monthlyViews) : '—'}
                </dd>
              </div>
            </dl>
          </section>
        </main>
      </div>
    </div>
  );
}
