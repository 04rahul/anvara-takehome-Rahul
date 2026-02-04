import type { AdSlot } from '@/lib/types';
import { AdSlotCard } from './ad-slot-card';

interface AdSlotGridProps {
  adSlots: AdSlot[];
  error?: string | null;
}

export function AdSlotGrid({ adSlots, error }: AdSlotGridProps) {
  if (error) {
    return (
      <div className="rounded border border-red-200 bg-red-50 p-4 text-red-600">
        {error}
      </div>
    );
  }

  if (adSlots.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[--color-border] p-12 text-center text-[--color-muted]">
        No ad slots available at the moment.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {adSlots.map((slot) => (
        <AdSlotCard key={slot.id} slot={slot} />
      ))}
    </div>
  );
}
