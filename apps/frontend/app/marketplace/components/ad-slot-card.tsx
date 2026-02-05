'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from '@/lib/session-context';
import type { AdSlot } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useMarketplaceCtaTest } from '@/hooks/use-ab-test';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import { toast } from '@/app/components/ui/toast';

const typeColors: Record<string, string> = {
  DISPLAY: 'bg-blue-100 text-blue-700',
  VIDEO: 'bg-red-100 text-red-700',
  NEWSLETTER: 'bg-purple-100 text-purple-700',
  PODCAST: 'bg-orange-100 text-orange-700',
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4291';

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
  const [isBooked, setIsBooked] = useState(!slot.isAvailable);

  // A/B Test: Button style variant
  const buttonVariant = useMarketplaceCtaTest();

  const isSponsor = Boolean(session.roleData?.sponsorId) || session.role === 'sponsor';
  const showBookButton = !session.user || isSponsor;
  const canBook = showBookButton && slot.isAvailable && !isBooked;

  const handleBookNowClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setMessage('');
    setIsBooking(false);
  };

  const handleLoginRedirect = () => {
    router.push('/login');
  };

  const handleConfirmBooking = async () => {
    if (!session.user) return;
    if (!isSponsor || !session.roleData?.sponsorId) {
      toast({
        title: 'Sponsor account required',
        description: 'Only sponsors can book ad slots.',
        variant: 'error',
      });
      return;
    }

    setIsBooking(true);
    try {
      const res = await fetch(`${API_URL}/api/ad-slots/${slot.id}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          sponsorId: session.roleData.sponsorId,
          message: message || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Failed to book placement' }));
        throw new Error(data.error || 'Failed to book placement');
      }

      toast({
        title: 'Booking requested',
        description: 'Your request was submitted. The publisher will be in touch soon.',
        variant: 'success',
      });

      setIsBooked(true);
      handleCloseModal();
      router.refresh(); // remove from list if marketplace only shows available
    } catch (err) {
      toast({
        title: 'Booking failed',
        description: err instanceof Error ? err.message : 'Failed to book placement',
        variant: 'error',
      });
      setIsBooking(false);
    }
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

        {(isBooked || !slot.isAvailable) && showBookButton ? (
          <Button variant="secondary" size="lg" className="mt-3 w-full" disabled>
            Booked
          </Button>
        ) : null}
      </div>
      <Dialog
        open={showModal}
        onOpenChange={(open) => {
          setShowModal(open);
          if (!open) {
            setMessage('');
            setIsBooking(false);
          }
        }}
      >
        <DialogContent className="max-w-md">
          {!session.user ? (
            <>
              <DialogHeader>
                <DialogTitle>Login Required</DialogTitle>
                <DialogDescription>
                  You need to be logged in to book ad slots. Please login or create an account to
                  continue.
                </DialogDescription>
              </DialogHeader>

              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleLoginRedirect}>
                  Login
                </Button>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Confirm Booking</DialogTitle>
                <DialogDescription>
                  You are about to request the following placement.
                </DialogDescription>
              </DialogHeader>

              <div className="mb-4 rounded-lg border border-[--color-border] bg-[--color-background] p-4">
                <h3 className="mb-1 font-semibold text-[--color-foreground]">{slot.name}</h3>
                <p className="mb-2 text-sm text-[--color-muted]">by {slot.publisher?.name}</p>
                <p className="font-semibold text-[--color-primary]">
                  ${Number(slot.basePrice).toLocaleString()}/mo
                </p>
              </div>

              <div className="mb-6">
                <label
                  htmlFor={`message-${slot.id}`}
                  className="mb-2 block text-sm font-medium text-[--color-foreground]"
                >
                  Message to Publisher <span className="text-[--color-muted]">(optional)</span>
                </label>
                <Textarea
                  id={`message-${slot.id}`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="Add a message for the publisher..."
                  className="resize-none"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={handleCloseModal}
                  disabled={isBooking}
                >
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleConfirmBooking} isLoading={isBooking}>
                  {isBooking ? 'Booking...' : 'Confirm'}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
