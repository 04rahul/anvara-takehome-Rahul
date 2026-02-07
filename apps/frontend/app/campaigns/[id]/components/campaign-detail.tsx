'use client';

import Link from 'next/link';
import type { Campaign, Placement } from '@/lib/types';
import { Alert } from '@/app/components/ui/alert';
import { ButtonLink } from '@/app/components/ui/button-link';

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  PENDING_REVIEW: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  ACTIVE: 'bg-green-100 text-green-700',
  PAUSED: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const placementStatusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  ACTIVE: 'bg-green-100 text-green-700',
  PAUSED: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  REJECTED: 'bg-red-100 text-red-700',
};

interface CampaignDetailProps {
  campaign: Campaign;
}

function formatCurrency(amount: number): string {
  return `$${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function CampaignDetail({ campaign }: CampaignDetailProps) {
  const progress = campaign.budget > 0 ? (Number(campaign.spent) / Number(campaign.budget)) * 100 : 0;
  const placements = campaign.placements || [];
  const creatives = campaign.creatives || [];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
      {/* Header */}
      <div>
        <Link href="/dashboard/sponsor" className="text-[--color-primary] hover:underline">
          ← Back to Campaigns
        </Link>
      </div>

      {/* Campaign Header */}
      <header className="rounded-lg border border-[--color-border] bg-[--color-background] p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{campaign.name}</h1>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                  statusColors[campaign.status] || 'bg-gray-100 text-gray-700'
                }`}
              >
                {campaign.status}
              </span>
            </div>

            {campaign.description && (
              <p className="mt-3 text-sm leading-6 text-[--color-muted]">{campaign.description}</p>
            )}

            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <div>
                <span className="text-[--color-muted]">Start Date:</span>{' '}
                <span className="font-medium">{formatDate(campaign.startDate)}</span>
              </div>
              <div>
                <span className="text-[--color-muted]">End Date:</span>{' '}
                <span className="font-medium">{formatDate(campaign.endDate)}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Budget Section */}
      <section className="rounded-lg border border-[--color-border] bg-[--color-background] p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Budget & Spending</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-[--color-muted]">Budget</span>
            <span className="text-lg font-semibold">{formatCurrency(campaign.budget)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-[--color-muted]">Spent</span>
            <span className="text-lg font-semibold">{formatCurrency(campaign.spent)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-[--color-muted]">Remaining</span>
            <span className="text-lg font-semibold">
              {formatCurrency(campaign.budget - campaign.spent)}
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-[--color-muted]">
              <span>Progress</span>
              <span>{Math.min(progress, 100).toFixed(1)}%</span>
            </div>
            <div className="h-3 rounded-full bg-gray-200">
              <div
                className="h-3 rounded-full bg-[--color-primary] transition-all"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
          {campaign.cpmRate && (
            <div className="pt-2 border-t border-[--color-border]">
              <span className="text-sm text-[--color-muted]">CPM Rate: </span>
              <span className="text-sm font-medium">{formatCurrency(campaign.cpmRate)}</span>
            </div>
          )}
          {campaign.cpcRate && (
            <div>
              <span className="text-sm text-[--color-muted]">CPC Rate: </span>
              <span className="text-sm font-medium">{formatCurrency(campaign.cpcRate)}</span>
            </div>
          )}
        </div>
      </section>

      {/* Creatives Section */}
      {creatives.length > 0 && (
        <section className="rounded-lg border border-[--color-border] bg-[--color-background] p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Creatives ({creatives.length})</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {creatives.map((creative) => (
              <div
                key={creative.id}
                className="rounded-lg border border-[--color-border] bg-[--color-background] p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-sm">{creative.name}</h3>
                  <span className="text-xs text-[--color-muted]">{creative.type}</span>
                </div>
                {creative.width && creative.height && (
                  <p className="text-xs text-[--color-muted] mb-2">
                    {creative.width} × {creative.height}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={`px-2 py-0.5 rounded ${
                      creative.isApproved
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {creative.isApproved ? 'Approved' : 'Pending'}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded ${
                      creative.isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {creative.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Placements Section */}
      <section className="rounded-lg border border-[--color-border] bg-[--color-background] p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">
          Placements ({placements.length})
        </h2>
        {placements.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[--color-border] p-8 text-center text-[--color-muted]">
            No placements yet. Request placements from the marketplace to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {placements.map((placement: Placement) => (
              <div
                key={placement.id}
                className="rounded-lg border border-[--color-border] bg-[--color-background] p-4"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h3 className="font-semibold text-[--color-foreground]">
                          {placement.adSlot?.name || 'Unknown Ad Slot'}
                        </h3>
                        {placement.adSlot?.type && (
                          <p className="text-sm text-[--color-muted] mt-1">
                            Type: {placement.adSlot.type}
                          </p>
                        )}
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold whitespace-nowrap ${
                          placementStatusColors[placement.status] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {placement.status}
                      </span>
                    </div>

                    {placement.publisher && (
                      <p className="text-sm text-[--color-muted] mb-2">
                        Publisher: <span className="font-medium text-[--color-foreground]">{placement.publisher.name}</span>
                        {placement.publisher.category && (
                          <span className="text-[--color-muted]"> · {placement.publisher.category}</span>
                        )}
                      </p>
                    )}

                    {placement.creative && (
                      <p className="text-sm text-[--color-muted] mb-2">
                        Creative: <span className="font-medium text-[--color-foreground]">{placement.creative.name}</span>
                        <span className="text-[--color-muted]"> ({placement.creative.type})</span>
                      </p>
                    )}

                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 mt-3 text-sm">
                      {placement.startDate && placement.endDate && (
                        <div>
                          <span className="text-[--color-muted]">Dates:</span>{' '}
                          <span className="font-medium">
                            {formatDate(placement.startDate)} - {formatDate(placement.endDate)}
                          </span>
                        </div>
                      )}
                      {placement.agreedPrice !== undefined && (
                        <div>
                          <span className="text-[--color-muted]">Price:</span>{' '}
                          <span className="font-medium">{formatCurrency(placement.agreedPrice)}</span>
                          {placement.pricingModel && (
                            <span className="text-[--color-muted]"> ({placement.pricingModel})</span>
                          )}
                        </div>
                      )}
                      {placement.adSlot?.basePrice !== undefined && (
                        <div>
                          <span className="text-[--color-muted]">Base Price:</span>{' '}
                          <span className="font-medium">{formatCurrency(placement.adSlot.basePrice)}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-[--color-muted]">Impressions:</span>{' '}
                        <span className="font-medium">{placement.impressions.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[--color-muted]">Clicks:</span>{' '}
                        <span className="font-medium">{placement.clicks.toLocaleString()}</span>
                      </div>
                      {placement.conversions !== undefined && (
                        <div>
                          <span className="text-[--color-muted]">Conversions:</span>{' '}
                          <span className="font-medium">{placement.conversions.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Actions */}
      <div className="flex gap-3">
        <ButtonLink href="/dashboard/sponsor" variant="secondary">
          Back to Campaigns
        </ButtonLink>
        <ButtonLink href="/marketplace">
          Browse Marketplace
        </ButtonLink>
      </div>
    </div>
  );
}
