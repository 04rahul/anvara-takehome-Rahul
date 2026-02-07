import type { Placement } from '@/lib/types';
import { Alert } from '@/app/components/ui/alert';
import { Button } from '@/app/components/ui/button';
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
          className="rounded-lg border border-[--color-border] bg-[--color-background] p-4 shadow-sm"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="text-sm text-[--color-muted]">Campaign</div>
              <div className="truncate font-semibold text-[--color-foreground]">
                {p.campaign?.name || p.campaignId}
              </div>

              <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <div className="text-[--color-muted]">Ad slot</div>
                  <div className="truncate text-[--color-foreground]">{p.adSlot?.name || p.adSlotId}</div>
                </div>
                <div>
                  <div className="text-[--color-muted]">Creative</div>
                  <div className="truncate text-[--color-foreground]">{p.creative?.name || p.creativeId || '—'}</div>
                </div>
                <div>
                  <div className="text-[--color-muted]">Dates</div>
                  <div className="text-[--color-foreground]">{formatDateRange(p.startDate, p.endDate)}</div>
                </div>
                <div>
                  <div className="text-[--color-muted]">Price</div>
                  <div className="text-[--color-foreground]">
                    {p.agreedPrice !== undefined ? (
                      <div className="flex flex-col">
                        <span className="font-semibold text-[--color-foreground]">
                          Total: ${Number(p.agreedPrice).toLocaleString()}
                        </span>
                        {p.adSlot?.basePrice !== undefined && Number(p.agreedPrice) > Number(p.adSlot.basePrice) && (
                          <span className="text-xs text-[--color-muted]">
                            ${Number(p.adSlot.basePrice).toLocaleString()} (Base) +{' '}
                            ${(Number(p.agreedPrice) - Number(p.adSlot.basePrice)).toLocaleString()} (
                            {p.pricingModel})
                          </span>
                        )}
                        {p.pricingModel && (!p.adSlot?.basePrice || Number(p.agreedPrice) <= Number(p.adSlot.basePrice)) && (
                          <span className="text-xs text-[--color-muted]">({p.pricingModel})</span>
                        )}
                      </div>
                    ) : (
                      '—'
                    )}
                  </div>
                </div>
              </div>

              {p.message && (
                <div className="mt-4 border-t border-[--color-border] pt-3">
                  <div className="text-xs font-medium text-[--color-muted] uppercase tracking-wider mb-1">
                    Message from Sponsor
                  </div>
                  <div className="text-sm text-[--color-foreground] whitespace-pre-wrap">{p.message}</div>
                </div>
              )}
            </div>

            <div className="flex shrink-0 flex-col gap-2 sm:w-[220px]">
              <form action={approvePlacementAction}>
                <input type="hidden" name="placementId" value={p.id} />
                <Button type="submit" className="w-full">
                  Approve
                </Button>
              </form>
              <form action={rejectPlacementAction}>
                <input type="hidden" name="placementId" value={p.id} />
                <Button type="submit" variant="secondary" className="w-full">
                  Reject
                </Button>
              </form>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

