import { AdSlotCard } from './ad-slot-card';
import type { AdSlot } from '@/lib/types';
import { Alert } from '@/app/components/ui/alert';

interface AdSlotListProps {
  adSlots: AdSlot[];
  error?: string | null;
}

export function AdSlotList({ adSlots, error }: AdSlotListProps) {
  if (error) {
    return <Alert variant="error">{error}</Alert>;
  }

  if (adSlots.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[--color-border] p-8 text-center text-[--color-muted]">
        No ad slots yet. Create your first ad slot to start earning.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {adSlots.map((slot) => (
        <AdSlotCard key={slot.id} adSlot={slot} />
      ))}
    </div>
  );
}
