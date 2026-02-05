import type { AdSlot } from '@/lib/types';
import { AdSlotCard } from './ad-slot-card';
import { Alert } from '@/app/components/ui/alert';

interface AdSlotGridProps {
  adSlots: AdSlot[];
  error?: string | null;
}

export function AdSlotGrid({ adSlots, error }: AdSlotGridProps) {
  if (error) {
    return <Alert variant="error">{error}</Alert>;
  }

  if (adSlots.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[--color-border] p-12 text-center text-[--color-muted]">
        No ad slots available at the moment.
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
