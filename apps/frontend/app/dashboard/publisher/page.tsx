import { headers, cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getUserRole } from '@/lib/auth-helpers';
import { getAdSlots } from '@/lib/api';
import { AdSlotList } from './components/ad-slot-list';
import { CreateAdSlotButton } from './components/create-ad-slot-button';
import type { AdSlot } from '@/lib/types';

export default async function PublisherDashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/login');
  }

  // Get cookies for server-side API calls
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('better-auth.session_token');
  const cookieHeader = sessionCookie 
    ? `better-auth.session_token=${sessionCookie.value}` 
    : undefined;

  // Verify user has 'publisher' role
  const roleData = await getUserRole(session.user.id, cookieHeader);
  if (roleData.role !== 'publisher') {
    redirect('/');
  }

  let adSlots: AdSlot[] = [];
  let error: string | null = null;

  try {
    if (roleData.publisherId) {
      adSlots = await getAdSlots(roleData.publisherId, cookieHeader);
    }
  } catch (err) {
    error = 'Failed to load ad slots. Please try again later.';
    console.error('Failed to load ad slots:', err);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Ad Slots</h1>
        <CreateAdSlotButton />
      </div>

      <AdSlotList adSlots={adSlots} error={error} />
    </div>
  );
}
