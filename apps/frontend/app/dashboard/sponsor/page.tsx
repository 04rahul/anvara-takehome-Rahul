import { headers, cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getUserRole } from '@/lib/auth-helpers';
import { CampaignList } from './components/campaign-list';
import { getCampaigns } from '@/lib/api';
import type { Campaign } from '@/lib/types';


export default async function SponsorDashboard() {
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

  // Verify user has 'sponsor' role
  const roleData = await getUserRole(session.user.id, cookieHeader);
  if (roleData.role !== 'sponsor') {
    redirect('/');
  }

  let campaigns: Campaign[] = [];
  let error: string | null = null;
  
  try {
    if (roleData.sponsorId) {
      campaigns = await getCampaigns(roleData.sponsorId, cookieHeader);
    }
  } catch (err) {
    // Set error message - page will still render
    error = 'Failed to load campaigns. Please try again later.';
    console.error('Failed to load campaigns:', err);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Campaigns</h1>
        {/* TODO: Add CreateCampaignButton here */}
      </div>

      <CampaignList campaigns={campaigns} error={error} />
    </div>
  );
}
