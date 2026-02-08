'use client';

import { useFormStatus } from 'react-dom';
import type { Placement } from '@/lib/types';
import { Alert } from '@/app/components/ui/alert';
import { Button } from '@/app/components/ui/button';
import { approvePlacementAction, rejectPlacementAction } from '../actions';
import { CheckIcon, XIcon } from '@/app/components/icons';
import { cn } from '@/lib/utils';

function formatDateRange(start?: string, end?: string): string {
  if (!start || !end) return '—';
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return '—';
  return `${s.toLocaleDateString()} → ${e.toLocaleDateString()}`;
}

const actionButtonClassName =
  'inline-flex h-9 w-9 items-center justify-center rounded-full border border-[--color-border] bg-[--color-background] text-[--color-foreground] transition-all duration-200 hover:bg-[--color-surface-hover] hover:border-[--color-primary-light] hover:shadow-[var(--shadow-sm)] active:bg-[--color-surface-pressed] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-primary] p-0';

function ApproveButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="ghost"
      size="sm"
      isLoading={pending}
      disabled={pending}
      className={cn(
        actionButtonClassName,
        "text-green-600 hover:text-green-700 hover:border-green-300 hover:bg-green-50 focus-visible:ring-green-500"
      )}
      title="Approve"
    >
      {!pending && <CheckIcon className="h-5 w-5" />}
    </Button>
  );
}

function RejectButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="ghost"
      size="sm"
      isLoading={pending}
      disabled={pending}
      className={cn(
        actionButtonClassName,
        "text-red-600 hover:text-red-700 hover:border-red-300 hover:bg-red-50 focus-visible:ring-red-500"
      )}
      title="Reject"
    >
      {!pending && <XIcon className="h-5 w-5" />}
    </Button>
  );
}


export function PlacementRequests({
  placements,
  error,
}: {
  placements: Placement[];
  error?: string | null;
}) {
  if (error) {
    return <Alert variant="error">{error}</Alert>;
  }

  if (!placements.length) {
    return (
      <div className="rounded-lg border border-dashed border-[--color-border] p-6 text-sm text-[--color-muted]">
        No pending placement requests right now.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {placements.map((p) => (
        <div
          key={p.id}
          className="group relative grid grid-cols-[auto_1fr_auto_auto] gap-6 rounded-xl border border-[--color-border] bg-[--color-background] p-4 shadow-sm transition-all duration-200 hover:shadow-md"
        >
          {/* Left Column: Campaign Info */}
          <div className="flex-shrink-0 w-56">
            <div className="text-xs font-medium text-[--color-muted] uppercase tracking-wider mb-1">
              Campaign
            </div>
            <div className="font-semibold text-base text-[--color-foreground] line-clamp-1 mb-2">
              {p.campaign?.name || p.campaignId}
            </div>
            {p.campaign?.sponsor && (
              <div className="flex items-center gap-1.5">
                {p.campaign.sponsor.logo && (
                  <img
                    src={p.campaign.sponsor.logo}
                    alt={p.campaign.sponsor.name}
                    className="w-4 h-4 rounded-full object-cover"
                  />
                )}
                <span className="text-xs text-[--color-muted]">
                  by <span className="font-medium text-[--color-foreground]">{p.campaign.sponsor.name}</span>
                </span>
              </div>
            )}
          </div>

          {/* Middle Columns: Details */}
          <div className="flex-1 grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-xs text-[--color-muted] mb-1">Ad Slot</div>
              <div className="line-clamp-1 text-[--color-foreground] font-medium">
                {p.adSlot?.name || p.adSlotId}
              </div>
            </div>

            <div>
              <div className="text-xs text-[--color-muted] mb-1">Creative</div>
              <div className="line-clamp-1 text-[--color-foreground] font-medium">
                {p.creative?.name || p.creativeId || '—'}
              </div>
            </div>

            <div>
              <div className="text-xs text-[--color-muted] mb-1">Dates</div>
              <div className="text-[--color-foreground] font-medium text-xs">
                {formatDateRange(p.startDate, p.endDate)}
              </div>
            </div>
          </div>

          {/* Price Column */}
          <div className="flex-shrink-0 w-40">
            <div className="text-xs text-[--color-muted] mb-1">Price</div>
            <div className="text-[--color-foreground]">
              {p.adSlot?.basePrice !== undefined ? (
                <>
                  {p.agreedPrice !== undefined && Number(p.agreedPrice) > 0 ? (
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">
                        ${Number(p.adSlot.basePrice).toLocaleString()} + ${Number(p.agreedPrice).toLocaleString()}
                      </span>
                      <span className="text-xs text-[--color-muted]">(Base + {p.pricingModel})</span>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">
                        ${Number(p.adSlot.basePrice).toLocaleString()}
                      </span>
                      <span className="text-xs text-[--color-muted]">(Base only)</span>
                    </div>
                  )}
                </>
              ) : p.agreedPrice !== undefined ? (
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">${Number(p.agreedPrice).toLocaleString()}</span>
                  <span className="text-xs text-[--color-muted]">({p.pricingModel})</span>
                </div>
              ) : (
                '—'
              )}
            </div>
          </div>

          {/* Right Column: Action Buttons */}
          <div className="flex-shrink-0 flex gap-2">
            <form action={approvePlacementAction}>
              <input type="hidden" name="placementId" value={p.id} />
              <ApproveButton />
            </form>
            <form action={rejectPlacementAction}>
              <input type="hidden" name="placementId" value={p.id} />
              <RejectButton />
            </form>
          </div>

          {/* Message Row (if exists) */}
          {p.message && (
            <div className="col-span-full mt-3 pt-3 border-t border-[--color-border]">
              <div className="text-xs text-[--color-foreground] leading-relaxed bg-[--color-surface-hover] rounded-lg p-3 border border-[--color-border]">
                <span className="font-semibold text-[--color-foreground]">Message:</span> {p.message}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
