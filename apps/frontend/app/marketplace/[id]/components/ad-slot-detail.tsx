'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Added useRouter
import Link from 'next/link';
import { getAdSlot, unbookAdSlot } from '@/lib/api'; // Added unbookAdSlot
import { useSession } from '@/lib/session-context';
import type { AdSlot } from '@/lib/types';
import type { RoleData } from '@/lib/auth-helpers';
import { Alert } from '@/app/components/ui/alert';
import { Button } from '@/app/components/ui/button';
import { ButtonLink } from '@/app/components/ui/button-link';
import { Skeleton } from '@/app/components/ui/skeleton';
import { BookingRequestModal } from './booking-request-modal';
import { LoginPromptModal } from './login-prompt-modal';
import { typeColors } from '@/app/components/icons';

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
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [unbooking, setUnbooking] = useState(false); // Added unbooking state
  const router = useRouter(); // Added router

  const isSponsor = roleInfo?.role === 'sponsor' && !!roleInfo?.sponsorId;

  useEffect(() => {
    // Only fetch ad slot - session data comes from context
    getAdSlot(id)
      .then(setAdSlot)
      .catch(() => setError('Failed to load ad slot details'))
      .finally(() => setLoading(false));
  }, [id]);

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

  // Demo user check
  const isDemoUser = user?.email === 'sponsor@example.com' || user?.email === 'publisher@example.com';

  const handleUnbook = async () => {
    if (!confirm('Are you sure you want to unbook this slot? This will remove the current placement.')) {
      return;
    }

    setUnbooking(true);
    try {
      await unbookAdSlot(id);
      // Refresh ad slot data
      const updatedSlot = await getAdSlot(id);
      setAdSlot(updatedSlot);
      router.refresh();
    } catch (err: any) {
      console.error('Failed to unbook:', err);
      alert('Failed to unbook: ' + (err.message || 'Unknown error'));
    } finally {
      setUnbooking(false);
    }
  };

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
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${adSlot.isAvailable
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
              {!adSlot.isAvailable ? (
                <div className="space-y-3">
                  <Alert variant="info" title="This placement is booked">
                    Check back later, or browse other available slots.
                  </Alert>

                  {/* Demo Unbook Button */}
                  {isDemoUser && (
                    <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
                      <p className="mb-2 text-xs font-medium text-blue-800">Demo Action</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleUnbook}
                        isLoading={unbooking}
                        disabled={unbooking}
                        className="w-full border-blue-300 text-blue-900 hover:bg-blue-100 hover:border-blue-400"
                      >
                        {unbooking ? 'Unbooking...' : 'Unbook Slot (Demo)'}
                      </Button>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3">
                    <ButtonLink variant="secondary" className="flex-1" href="/marketplace">
                      Browse marketplace
                    </ButtonLink>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-base font-semibold">Request this placement</h2>
                    <p className="mt-1 text-sm text-[--color-muted]">
                      Send a request to the publisher. This does not reserve the slot until it's approved.
                    </p>
                  </div>

                  {isSponsor && roleInfo?.sponsorId ? (
                    <Button onClick={() => setShowBookingModal(true)} className="w-full">
                      Request placement
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      {user ? (
                        <Button disabled className="w-full">
                          Send request
                        </Button>
                      ) : (
                        <Button
                          onClick={() => {
                            console.log('Login button clicked');
                            setShowLoginModal(true);
                          }}
                          className="w-full"
                        >
                          Log in to request
                        </Button>
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

      {isSponsor && roleInfo?.sponsorId && adSlot && (
        <BookingRequestModal
          adSlot={adSlot}
          open={showBookingModal}
          onOpenChange={setShowBookingModal}
          onSuccess={() => {
            // Refresh ad slot data after successful request to update availability status
            getAdSlot(id).then(setAdSlot).catch(() => setError('Failed to refresh ad slot details'));
            setShowBookingModal(false);
          }}
          sponsorId={roleInfo.sponsorId}
        />
      )}

      <LoginPromptModal open={showLoginModal} onOpenChange={setShowLoginModal} />
    </div>
  );
}
