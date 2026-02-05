import { CampaignCard } from './campaign-card';
import type { Campaign } from '@/lib/types';
import { Alert } from '@/app/components/ui/alert';

interface CampaignListProps {
  campaigns: Campaign[];
  error?: string | null;
};

export function CampaignList({ campaigns, error }: CampaignListProps) {
  // TODO: Add refetch on tab focus for better UX
  // TODO: Add optimistic updates when creating/editing campaigns

  if (error) {
    return <Alert variant="error">{error}</Alert>;
  }

  if (campaigns.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[--color-border] p-8 text-center text-[--color-muted]">
        No campaigns yet. Create your first campaign to get started.
      </div>
    );
  }

  // TODO: Add sorting options (by date, budget, status)
  // TODO: Add pagination if campaigns list gets large
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} />
      ))}
    </div>
  );
}
