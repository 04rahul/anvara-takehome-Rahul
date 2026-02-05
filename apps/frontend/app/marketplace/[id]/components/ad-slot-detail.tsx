'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAdSlot } from '@/lib/api';
import { logger } from '@/lib/utils';
import { useSession } from '@/lib/session-context';
import type { AdSlot } from '@/lib/types';
import type { RoleData } from '@/lib/auth-helpers';
import { useDetailPageLayoutTest } from '@/hooks/use-ab-test';

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
    return <div className="py-12 text-center text-[--color-muted]">Loading...</div>;
  }

  if (error || !adSlot) {
    return (
      <div className="space-y-4">
        <Link href="/marketplace" className="text-[--color-primary] hover:underline">
          ← Back to Marketplace
        </Link>
        <div className="rounded border border-red-200 bg-red-50 p-4 text-red-600">
          {error || 'Ad slot not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/marketplace" className="text-[--color-primary] hover:underline">
        ← Back to Marketplace
      </Link>

      <div className="rounded-lg border border-[--color-border] p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{adSlot.name}</h1>
            {adSlot.publisher && (
              <div className="mt-2 space-y-1">
                <p className="text-[--color-muted]">
                  by {adSlot.publisher.name}
                  {adSlot.publisher.website && (
                    <>
                      {' '}
                      ·{' '}
                      <a
                        href={adSlot.publisher.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[--color-primary] hover:underline"
                      >
                        {adSlot.publisher.website}
                      </a>
                    </>
                  )}
                </p>
                
                {/* Publisher Stats */}
                <div className="flex items-center gap-4 text-sm text-[--color-muted]">
                  {adSlot.publisher.category && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-blue-700 font-medium">
                      <span>●</span>
                      {adSlot.publisher.category}
                    </span>
                  )}
                  {adSlot.publisher.monthlyViews && (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="text-base">📊</span>
                      <strong>{formatViews(adSlot.publisher.monthlyViews)}</strong> monthly views
                    </span>
                  )}
                  {adSlot._count && adSlot._count.placements > 0 && (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="text-base">✓</span>
                      {adSlot._count.placements} {adSlot._count.placements === 1 ? 'booking' : 'bookings'}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
          <span className={`rounded px-3 py-1 text-sm ${typeColors[adSlot.type] || 'bg-gray-100'}`}>
            {adSlot.type}
          </span>
        </div>

        {adSlot.description && <p className="mb-6 text-[--color-muted]">{adSlot.description}</p>}

        <div className="flex items-center justify-between border-t border-[--color-border] pt-4">
          <div>
            <span
              className={`text-sm font-medium ${adSlot.isAvailable ? 'text-green-600' : 'text-[--color-muted]'}`}
            >
              {adSlot.isAvailable ? '● Available' : '○ Currently Booked'}
            </span>
            {!adSlot.isAvailable && !bookingSuccess && (
              <button
                onClick={handleUnbook}
                className="ml-3 text-sm text-[--color-primary] underline hover:opacity-80"
              >
                Reset listing
              </button>
            )}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[--color-primary]">
              ${Number(adSlot.basePrice).toLocaleString()}
            </p>
            <p className="text-sm text-[--color-muted]">per month</p>
          </div>
        </div>

        {/* A/B Test: Traditional vs Modern Booking Layout */}
        {adSlot.isAvailable && !bookingSuccess && (
          <div className="mt-6 border-t border-[--color-border] pt-6">
            <h2 className="mb-4 text-lg font-semibold">Request This Placement</h2>

            {roleInfo?.role === 'sponsor' && roleInfo?.sponsorId ? (
              layoutVariant === 'modern' ? (
                // Modern Variant: Compact horizontal layout
                <div className="space-y-4">
                  <div className="rounded-lg bg-blue-50 px-4 py-3 border border-blue-200">
                    <p className="text-sm font-medium text-blue-900">
                      Booking as: <span className="font-bold">{roleInfo.name || user?.name}</span>
                    </p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Add a message (optional)..."
                        className="w-full rounded-lg border border-[--color-border] bg-[--color-background] px-3 py-3 text-[--color-foreground] placeholder:text-[--color-muted] focus:border-[--color-primary] focus:outline-none focus:ring-1 focus:ring-[--color-primary]"
                      />
                    </div>
                    <button
                      onClick={handleBooking}
                      disabled={booking}
                      className="rounded-lg bg-[--color-primary] px-6 py-3 font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-50 whitespace-nowrap"
                    >
                      {booking ? 'Booking...' : 'Book Now'}
                    </button>
                  </div>
                  {bookingError && <p className="text-sm text-red-600">{bookingError}</p>}
                </div>
              ) : (
                // Traditional Variant: Vertical layout (original)
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[--color-muted]">
                      Your Company
                    </label>
                    <p className="text-[--color-foreground]">{roleInfo.name || user?.name}</p>
                  </div>
                  <div>
                    <label
                      htmlFor="message"
                      className="mb-1 block text-sm font-medium text-[--color-muted]"
                    >
                      Message to Publisher (optional)
                    </label>
                    <textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell the publisher about your campaign goals..."
                      className="w-full rounded-lg border border-[--color-border] bg-[--color-background] px-3 py-2 text-[--color-foreground] placeholder:text-[--color-muted] focus:border-[--color-primary] focus:outline-none focus:ring-1 focus:ring-[--color-primary]"
                      rows={3}
                    />
                  </div>
                  {bookingError && <p className="text-sm text-red-600">{bookingError}</p>}
                  <button
                    onClick={handleBooking}
                    disabled={booking}
                    className="w-full rounded-lg bg-[--color-primary] px-4 py-3 font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-50"
                  >
                    {booking ? 'Booking...' : 'Book This Placement'}
                  </button>
                </div>
              )
            ) : (
              <div>
                <button
                  disabled
                  className="w-full cursor-not-allowed rounded-lg bg-gray-300 px-4 py-3 font-semibold text-gray-500"
                >
                  Request This Placement
                </button>
                <p className="mt-2 text-center text-sm text-[--color-muted]">
                  {user
                    ? 'Only sponsors can request placements'
                    : 'Log in as a sponsor to request this placement'}
                </p>
              </div>
            )}
          </div>
        )}

        {bookingSuccess && (
          <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
            <h3 className="font-semibold text-green-800">Placement Booked!</h3>
            <p className="mt-1 text-sm text-green-700">
              Your request has been submitted. The publisher will be in touch soon.
            </p>
            <button
              onClick={handleUnbook}
              className="mt-3 text-sm text-green-700 underline hover:text-green-800"
            >
              Remove Booking (reset for testing)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
