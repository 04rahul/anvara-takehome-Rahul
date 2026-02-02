import { getAdSlots } from '@/lib/api';
import { AdSlotGrid } from './components/ad-slot-grid';
import type { AdSlot } from '@/lib/types';

// FIXME: This page fetches all ad slots client-side. Consider:
// 1. Server-side pagination with searchParams
// 2. Filtering by category, price range, slot type
// 3. Search functionality

export default async function MarketplacePage() {
  let adSlots: AdSlot[] = [];
  let error: string | null = null;

  try {
    adSlots = await getAdSlots(); // No publisherId = get all ad slots
  } catch (err) {
    error = 'Failed to load ad slots. Please try again later.';
    console.error('Failed to load ad slots:', err);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Marketplace</h1>
        <p className="text-[--color-muted]">Browse available ad slots from our publishers</p>
        {/* TODO: Add search input and filter controls */}
      </div>

      <AdSlotGrid adSlots={adSlots} error={error} />
    </div>
  );
}
