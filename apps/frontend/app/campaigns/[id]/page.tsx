import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth-helpers.server';
import { getCampaign } from '@/lib/api';
import { CampaignDetail } from './components/campaign-detail';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CampaignDetailPage({ params }: PageProps) {
  const session = await getServerSession();
  if (!session.user) {
    redirect('/login');
  }

  // Verify user has 'sponsor' role
  if (session.role !== 'sponsor') {
    redirect('/');
  }

  const { id } = await params;

  // Get cookies for server-side API calls
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('better-auth.session_token');
  const cookieHeader = sessionCookie 
    ? `better-auth.session_token=${sessionCookie.value}` 
    : undefined;

  let campaign = null;
  let error: string | null = null;
  
  try {
    campaign = await getCampaign(id, cookieHeader);
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load campaign';
    console.error('Failed to load campaign:', err);
  }

  if (error || !campaign) {
    return (
      <div className="mx-auto w-full max-w-6xl space-y-4 p-6">
        <div>
          <a href="/dashboard/sponsor" className="text-[--color-primary] hover:underline">
            ← Back to Campaigns
          </a>
        </div>
        <div className="rounded-lg border border-[--color-border] bg-[--color-background] p-6">
          <h1 className="text-xl font-semibold text-[--color-error]">Campaign not found</h1>
          <p className="mt-2 text-sm text-[--color-muted]">{error || 'The campaign you are looking for does not exist.'}</p>
        </div>
      </div>
    );
  }

  return <CampaignDetail campaign={campaign} />;
}
