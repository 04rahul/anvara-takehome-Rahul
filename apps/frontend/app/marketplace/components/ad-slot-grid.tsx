import type { AdSlot } from '@/lib/types';
import { AdSlotCard } from './ad-slot-card';
import { Alert } from '@/app/components/ui/alert';

interface AdSlotGridProps {
  adSlots: AdSlot[];
  error?: string | null;
  hasActiveFilters?: boolean;
}

export function AdSlotGrid({ adSlots, error, hasActiveFilters = false }: AdSlotGridProps) {
  if (error) {
    return <Alert variant="error">{error}</Alert>;
  }

  if (adSlots.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[--color-border] p-12 text-center">
        <p className="text-[--color-muted] mb-3">
          No ad slots available at the moment.
        </p>
        {hasActiveFilters && (
          <a
            href="/marketplace"
            className="inline-block rounded-md bg-[--color-secondary] px-4 py-2 text-sm font-medium text-[--color-secondary-foreground] hover:bg-[--color-secondary]/80 transition-colors"
          >
            Clear all filters
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
      {adSlots.map((slot) => (
        <AdSlotCard key={slot.id} slot={slot} />
      ))}
    </div>
  );
}
