import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth-helpers.server';
import { getAdSlots, getPlacements } from '@/lib/api';
import { AdSlotList } from './components/ad-slot-list';
import { CreateAdSlotButton } from './components/create-ad-slot-button';
import { PlacementRequests } from './components/placement-requests';
import type { AdSlot, Placement } from '@/lib/types';

export default async function PublisherDashboard() {
  const session = await getServerSession();
  if (!session.user) {
    redirect('/login');
  }

  // Get cookies for server-side API calls
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('better-auth.session_token');
  const cookieHeader = sessionCookie
    ? `better-auth.session_token=${sessionCookie.value}`
    : undefined;

  // Verify user has 'publisher' role
  const roleData = session.roleData;
  if (session.role !== 'publisher') {
    redirect('/');
  }

  let adSlots: AdSlot[] = [];
  let error: string | null = null;
  let pendingPlacements: Placement[] = [];
  let placementsError: string | null = null;

  try {
    if (roleData.publisherId) {
      const response = await getAdSlots({ publisherId: roleData.publisherId }, cookieHeader);
      adSlots = response.data;
    }
  } catch (err) {
    error = 'Failed to load ad slots. Please try again later.';
    console.error('Failed to load ad slots:', err);
  }

  try {
    pendingPlacements = await getPlacements({ status: 'PENDING' }, cookieHeader);
  } catch (err) {
    placementsError = 'Failed to load placement requests. Please try again later.';
    console.error('Failed to load placements:', err);
  }

  return (
    <div className="space-y-6">
      {/* Create Ad Slot Button at Top */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Publisher Dashboard</h1>
        <CreateAdSlotButton />
      </div>

      {(pendingPlacements.length > 0 || placementsError) && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Placement requests</h2>
          <PlacementRequests placements={pendingPlacements} error={placementsError} />
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">My Ad Slots</h2>
        <AdSlotList adSlots={adSlots} error={error} />
      </section>
    </div>
  );
}
