'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from '@/lib/session-context';
import type { AdSlot } from '@/lib/types';
import { useMarketplaceCtaTest } from '@/hooks/use-ab-test';
import { Button } from '@/app/components/ui/button';
import { BookingRequestModal } from '../[id]/components/booking-request-modal';
import { LoginPromptModal } from '../[id]/components/login-prompt-modal';
import { typeColors } from '@/app/components/icons';

function formatViews(views: number): string {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(0)}K`;
  return views.toString();
}

interface AdSlotCardProps {
  slot: AdSlot;
}

export function AdSlotCard({ slot }: AdSlotCardProps) {
  const session = useSession();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  // A/B Test: Button style variant
  const buttonVariant = useMarketplaceCtaTest();

  const isSponsor = Boolean(session.roleData?.sponsorId) || session.role === 'sponsor';
  const showBookButton = !session.user || isSponsor;
  const canBook = showBookButton && slot.isAvailable && !requestSubmitted;

  const handleBookNowClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Don't open modal if request already submitted
    if (requestSubmitted) {
      return;
    }

    if (!session.user) {
      // Guest users - show login modal
      setShowLoginModal(true);
      return;
    }

    if (isSponsor && session.roleData?.sponsorId) {
      setShowBookingModal(true);
    }
    // Non-sponsor logged-in users - modal won't show (button should be disabled for them)
  };

  return (
    <>
      <div className="relative flex h-full flex-col rounded-lg border border-[--color-border] bg-[--color-background] p-4 transition-all duration-200 will-change-transform hover:-translate-y-0.5 hover:border-[--color-primary] hover:shadow-lg focus-within:-translate-y-0.5 focus-within:border-[--color-primary] focus-within:shadow-lg focus-within:ring-2 focus-within:ring-[--color-primary] focus-within:ring-offset-2 focus-within:ring-offset-[--color-background]">
        <Link href={`/marketplace/${slot.id}`} className="block flex-1">
          <div className="mb-2 flex items-start justify-between">
            <h3 className="min-h-[2.75rem] font-semibold line-clamp-2">{slot.name}</h3>
            <span
              className={`rounded px-2 py-0.5 text-xs ${typeColors[slot.type] || 'bg-gray-100'}`}
            >
              {slot.type}
            </span>
          </div>

          {slot.publisher && (
            <div className="mb-3 space-y-1">
              <p className="text-sm text-[--color-muted]">by {slot.publisher.name}</p>
              <div className="flex items-center gap-3 text-xs text-[--color-muted]">
                {slot.publisher.category && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-blue-700 font-medium">
                    <span>●</span> {slot.publisher.category}
                  </span>
                )}
                {slot.publisher.monthlyViews && (
                  <span className="inline-flex items-center gap-1">
                    📊 {formatViews(slot.publisher.monthlyViews)} views/mo
                  </span>
                )}
              </div>
            </div>
          )}

          {slot.description && (
            <p className="mb-3 text-sm text-[--color-muted] line-clamp-2">{slot.description}</p>
          )}

          <div className="mb-3 flex items-center justify-center text-center">
            <span className="font-semibold text-[--color-primary]">
              ${Number(slot.basePrice).toLocaleString()}/mo
            </span>
          </div>
        </Link>

        {/* Book Now Button - outside Link to prevent navigation */}
        {/* Guest → login modal, Sponsor → booking modal */}
        {canBook && (
          <Button
            onClick={handleBookNowClick}
            variant={buttonVariant === 'outline' ? 'outline' : 'primary'}
            size="lg"
            className="mt-3 w-full"
          >
            Book Now
          </Button>
        )}

        {/* Request Sent State */}
        {requestSubmitted && slot.isAvailable && (
          <Button variant="secondary" size="lg" className="mt-3 w-full" disabled>
            Request Sent ✓
          </Button>
        )}

        {!slot.isAvailable && showBookButton ? (
          <Button variant="secondary" size="lg" className="mt-3 w-full" disabled>
            Booked
          </Button>
        ) : null}
      </div>

      {isSponsor && session.roleData?.sponsorId && (
        <BookingRequestModal
          adSlot={slot}
          open={showBookingModal}
          onOpenChange={setShowBookingModal}
          onSuccess={() => {
            setRequestSubmitted(true);
            setShowBookingModal(false);
          }}
          sponsorId={session.roleData.sponsorId}
        />
      )}

      <LoginPromptModal open={showLoginModal} onOpenChange={setShowLoginModal} />
    </>
  );
}
