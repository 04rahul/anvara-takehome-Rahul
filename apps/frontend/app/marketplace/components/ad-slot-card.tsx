'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from '@/lib/session-context';
import type { AdSlot } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useMarketplaceCtaTest } from '@/hooks/use-ab-test';

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

interface AdSlotCardProps {
  slot: AdSlot;
}

export function AdSlotCard({ slot }: AdSlotCardProps) {
  const session = useSession();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [message, setMessage] = useState('');
  
  // A/B Test: Button style variant
  const buttonVariant = useMarketplaceCtaTest();

  const handleBookNowClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setMessage('');
  };

  const handleConfirmBooking = async () => {
    setIsBooking(true);
    // TODO: Implement actual booking logic here
    // The message will be sent along with the booking: message
    console.log('Booking with message:', message);
    // For now, just close the modal after a brief delay
    setTimeout(() => {
      setIsBooking(false);
      handleCloseModal();
      // You can add success message or navigation here
    }, 1000);
  };

  const handleLoginRedirect = () => {
    router.push('/login');
  };

  // Show button if user is not logged in OR is logged in as a sponsor
  const showBookButton = !session.user || session.role === 'sponsor';

  return (
    <>
      <div className="relative rounded-lg border border-[--color-border] p-4 transition-shadow hover:shadow-md">
        <Link href={`/marketplace/${slot.id}`} className="block">
          <div className="mb-2 flex items-start justify-between">
            <h3 className="font-semibold">{slot.name}</h3>
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

          <div className="flex items-center justify-between mb-3">
            <span
              className={`text-sm ${slot.isAvailable ? 'text-green-600' : 'text-[--color-muted]'}`}
            >
              {slot.isAvailable ? 'Available' : 'Booked'}
            </span>
            <span className="font-semibold text-[--color-primary]">
              ${Number(slot.basePrice).toLocaleString()}/mo
            </span>
          </div>
        </Link>

        {/* Book Now Button - outside Link to prevent navigation */}
        {/* A/B Test: Solid vs Outline button style */}
        {showBookButton && slot.isAvailable && (
          <button
            onClick={handleBookNowClick}
            className={
              buttonVariant === 'outline'
                ? 'w-full rounded-lg border-2 border-[--color-primary] bg-transparent px-4 py-2 font-semibold text-[--color-primary] hover:bg-[--color-primary] hover:text-white transition-colors'
                : 'w-full rounded-lg bg-[--color-primary] px-4 py-2 font-semibold text-white hover:bg-[--color-primary-hover] transition-colors'
            }
          >
            Book Now
          </button>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={handleCloseModal}>
          <div className="relative w-full max-w-md rounded-lg border border-[--color-border] bg-[--color-background] p-6 text-[--color-foreground] shadow-lg" onClick={(e) => e.stopPropagation()}>
            {/* Close button */}
            <button
              type="button"
              onClick={handleCloseModal}
              aria-label="Close modal"
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[--color-border] text-[--color-foreground] transition-colors duration-200 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-primary]"
            >
              <span aria-hidden="true" className="text-lg leading-none">
                ×
              </span>
            </button>

            {!session.user ? (
              // Not logged in - show login prompt
              <>
                <h2 className="text-xl font-bold mb-4 text-[--color-foreground] pr-8">Login Required</h2>
                <p className="text-[--color-muted] mb-6">
                  You need to be logged in to book ad slots. Please login or create an account to continue.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleCloseModal}
                    className="flex-1 min-h-[44px] rounded-lg border border-[--color-border] bg-[--color-background] px-6 py-2.5 font-medium text-[--color-foreground] transition-colors duration-200 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-primary]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLoginRedirect}
                    className="flex-1 min-h-[44px] rounded-lg bg-[--color-primary] px-6 py-2.5 font-medium text-white shadow-sm transition-all duration-200 hover:bg-[--color-primary-hover] hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-primary]"
                  >
                    Login
                  </button>
                </div>
              </>
            ) : (
              // Logged in as sponsor - show booking confirmation
              <>
                <h2 className="text-xl font-bold mb-4 text-[--color-foreground] pr-8">Confirm Booking</h2>
                <div className="mb-4">
                  <p className="text-[--color-muted] mb-3">
                    You are about to book the following ad slot:
                  </p>
                  <div className="rounded-lg border border-[--color-border] bg-[--color-background] p-4">
                    <h3 className="font-semibold mb-1 text-[--color-foreground]">{slot.name}</h3>
                    <p className="text-sm text-[--color-muted] mb-2">
                      by {slot.publisher?.name}
                    </p>
                    <p className="font-semibold text-[--color-primary]">
                      ${Number(slot.basePrice).toLocaleString()}/mo
                    </p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="message" className="mb-2 block text-sm font-medium text-[--color-foreground]">
                    Message to Publisher <span className="text-[--color-muted]">(optional)</span>
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    placeholder="Add a message for the publisher..."
                    className="w-full rounded-lg border border-[--color-border] bg-[--color-background] px-4 py-2.5 text-[--color-foreground] placeholder:text-[--color-muted] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[--color-primary] focus:border-transparent resize-none"
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleCloseModal}
                    disabled={isBooking}
                    className="flex-1 min-h-[44px] rounded-lg border border-[--color-border] bg-[--color-background] px-6 py-2.5 font-medium text-[--color-foreground] transition-colors duration-200 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-primary] disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmBooking}
                    disabled={isBooking}
                    className="flex-1 min-h-[44px] rounded-lg bg-[--color-primary] px-6 py-2.5 font-medium text-white shadow-sm transition-all duration-200 hover:bg-[--color-primary-hover] hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-primary] disabled:opacity-50"
                  >
                    {isBooking ? 'Booking...' : 'Confirm'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
