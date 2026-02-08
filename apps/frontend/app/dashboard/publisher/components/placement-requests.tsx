import type { Placement } from '@/lib/types';
import { Alert } from '@/app/components/ui/alert';
import { approvePlacementAction, rejectPlacementAction } from '../actions';

function formatDateRange(start?: string, end?: string): string {
  if (!start || !end) return '—';
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return '—';
  return `${s.toLocaleDateString()} → ${e.toLocaleDateString()}`;
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
          className="group relative flex items-center gap-6 rounded-xl border border-[--color-border] bg-[--color-background] p-4 shadow-sm transition-all duration-200 hover:shadow-md"
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
              <button
                type="submit"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-green-600 text-white transition-all duration-200 hover:bg-green-700 active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                title="Approve"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </form>
            <form action={rejectPlacementAction}>
              <input type="hidden" name="placementId" value={p.id} />
              <button
                type="submit"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[--color-border] bg-[--color-background] text-[--color-foreground] transition-all duration-200 hover:bg-red-50 hover:border-red-300 hover:text-red-700 active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                title="Reject"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </form>
          </div>

          {/* Message Row (if exists) */}
          {p.message && (
            <div className="absolute left-4 right-4 -bottom-2 opacity-0 group-hover:opacity-100 group-hover:bottom-2 transition-all duration-200 pointer-events-none">
              <div className="text-xs text-[--color-foreground] leading-relaxed line-clamp-2 bg-blue-50 rounded-lg p-2 border border-blue-200 shadow-sm">
                <span className="font-semibold">Message:</span> {p.message}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
