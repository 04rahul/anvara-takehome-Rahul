'use client';

import { useState } from 'react';
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

const adSlotTypeColors: Record<string, string> = {
  DISPLAY: 'bg-purple-100 text-purple-700',
  VIDEO: 'bg-red-100 text-red-700',
  BANNER: 'bg-blue-100 text-blue-700',
  NATIVE: 'bg-green-100 text-green-700',
  AUDIO: 'bg-orange-100 text-orange-700',
};

interface CampaignDetailProps {
  campaign: Campaign;
}

function formatCurrency(amount: number): string {
  return `$${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateString: string): string {
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function CampaignDetail({ campaign }: CampaignDetailProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  const progress = campaign.budget > 0 ? (Number(campaign.spent) / Number(campaign.budget)) * 100 : 0;
  const placements = campaign.placements || [];
  const creatives = campaign.creatives || [];

  // Get unique statuses from placements
  const availableStatuses = ['All', ...Array.from(new Set(placements.map(p => p.status)))];

  // Filter placements based on selected status
  const filteredPlacements = selectedStatus === 'All'
    ? placements
    : placements.filter(p => p.status === selectedStatus);

  // Sort placements: ACTIVE first, then APPROVED, then others
  const sortedPlacements = [...filteredPlacements].sort((a, b) => {
    const statusPriority: Record<string, number> = {
      'ACTIVE': 1,
      'APPROVED': 2,
    };

    const aPriority = statusPriority[a.status] || 999;
    const bPriority = statusPriority[b.status] || 999;

    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }

    // If same priority, maintain original order or sort alphabetically by status
    return a.status.localeCompare(b.status);
  });

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
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{campaign.name}</h1>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${statusColors[campaign.status] || 'bg-gray-100 text-gray-700'
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
              {campaign.cpmRate && (
                <div>
                  <span className="text-[--color-muted]">CPM:</span>{' '}
                  <span className="font-medium">{formatCurrency(campaign.cpmRate)}</span>
                </div>
              )}
              {campaign.cpcRate && (
                <div>
                  <span className="text-[--color-muted]">CPC:</span>{' '}
                  <span className="font-medium">{formatCurrency(campaign.cpcRate)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Budget Overview (Right Side) */}
          <div className="w-full sm:w-72 sm:border-l border-[--color-border] sm:pl-6">
            <h3 className="text-sm font-medium text-[--color-muted] mb-3">Budget Overview</h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-[--color-muted]">Budget</span>
                  <span className="font-semibold">{formatCurrency(campaign.budget)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[--color-muted]">Spent</span>
                  <span className="font-semibold">{formatCurrency(campaign.spent)}</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                    style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: 'var(--color-primary)' }}
                  />
                </div>
                <div className="flex justify-between text-xs text-[--color-muted]">
                  <span>{Math.min(progress, 100).toFixed(1)}% Used</span>
                  <span>{formatCurrency(campaign.budget - campaign.spent)} Left</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

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
                    className={`px-2 py-0.5 rounded ${creative.isApproved
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                      }`}
                  >
                    {creative.isApproved ? 'Approved' : 'Pending'}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded ${creative.isActive
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold">
            Placements ({filteredPlacements.length}{placements.length !== filteredPlacements.length ? ` of ${placements.length}` : ''})
          </h2>

          {/* Status Filter */}
          {placements.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {availableStatuses.map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${selectedStatus === status
                    ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-md hover:bg-blue-700 dark:hover:bg-blue-600'
                    : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600 border border-gray-300 dark:border-slate-600'
                    }`}
                >
                  {status} ({status === 'All' ? placements.length : placements.filter(p => p.status === status).length})
                </button>
              ))}
            </div>
          )}
        </div>
        {sortedPlacements.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[--color-border] p-8 text-center text-[--color-muted]">
            {selectedStatus === 'All'
              ? 'No placements yet. Request placements from the marketplace to get started.'
              : `No ${selectedStatus} placements found.`}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedPlacements.map((placement: Placement) => (
              <div
                key={placement.id}
                className="group rounded-lg border border-[--color-border] bg-[--color-background] p-5 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  {/* Left Column: Details */}
                  <div className="flex-1 space-y-4">
                    {/* Top Row: Name & Status */}
                    <div className="flex items-start justify-between gap-4 sm:justify-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold text-[--color-foreground]">
                            {placement.adSlot?.name || 'Unknown Ad Slot'}
                          </h3>
                          {placement.adSlot?.type && (
                            <span className={`rounded px-2 py-0.5 text-xs font-medium ${adSlotTypeColors[placement.adSlot.type] || 'bg-gray-100 text-gray-700'}`}>
                              {placement.adSlot.type}
                            </span>
                          )}
                        </div>
                        {placement.publisher && (
                          <p className="mt-1 text-sm text-[--color-muted]">
                            by <span className="font-medium text-[--color-foreground]">{placement.publisher.name}</span>
                          </p>
                        )}
                      </div>
                      <span
                        className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${placementStatusColors[placement.status] || 'bg-gray-100 text-gray-700'
                          }`}
                      >
                        {placement.status}
                      </span>
                    </div>

                    {/* Info Grid */}
                    <div className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
                      {placement.startDate && placement.endDate && (
                        <div className="flex flex-col">
                          <span className="text-xs text-[--color-muted]">Schedule</span>
                          <span className="font-medium">
                            {formatDate(placement.startDate)} - {formatDate(placement.endDate)}
                          </span>
                        </div>
                      )}

                      {(placement.agreedPrice !== undefined || placement.adSlot?.basePrice !== undefined) && (
                        <div className="flex flex-col">
                          <span className="text-xs text-[--color-muted]">Pricing</span>
                          <div className="flex items-center gap-2">
                            {placement.adSlot?.basePrice !== undefined ? (
                              <>
                                {placement.agreedPrice !== undefined && Number(placement.agreedPrice) > 0 ? (
                                  <>
                                    <span className="font-medium">
                                      {formatCurrency(placement.adSlot.basePrice)} + {formatCurrency(placement.agreedPrice)}
                                    </span>
                                    {placement.pricingModel && (
                                      <span className="text-[--color-muted]">(Base + {placement.pricingModel})</span>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    <span className="font-medium">{formatCurrency(placement.adSlot.basePrice)}</span>
                                    <span className="text-[--color-muted] font-normal">(Base only)</span>
                                  </>
                                )}
                              </>
                            ) : placement.agreedPrice !== undefined ? (
                              <>
                                <span className="font-medium">{formatCurrency(placement.agreedPrice)}</span>
                                {placement.pricingModel && (
                                  <span className="text-[--color-muted]">({placement.pricingModel})</span>
                                )}
                              </>
                            ) : null}
                          </div>
                        </div>
                      )}

                      {placement.creative && (
                        <div className="flex flex-col sm:col-span-2 mt-1">
                          <span className="text-xs text-[--color-muted]">Creative</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{placement.creative.name}</span>
                            <span className="text-xs text-[--color-muted]">({placement.creative.type})</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Performance Metrics */}
                  <div className="flex w-full shrink-0 flex-row items-center justify-between gap-6 rounded-lg bg-[--color-surface-hover] px-6 py-4 lg:w-auto lg:gap-12 lg:rounded-none lg:bg-transparent lg:px-0 lg:py-0 lg:border-l lg:border-[--color-border] lg:pl-8">
                    <div className="text-center w-full lg:w-auto">
                      <div className="text-2xl font-bold tracking-tight text-[--color-foreground]">
                        {placement.impressions.toLocaleString()}
                      </div>
                      <div className="text-xs font-medium text-[--color-muted] uppercase tracking-wider mt-1">Impressions</div>
                    </div>

                    <div className="text-center w-full lg:w-auto">
                      <div className="text-2xl font-bold tracking-tight text-[--color-foreground]">
                        {placement.clicks.toLocaleString()}
                      </div>
                      <div className="text-xs font-medium text-[--color-muted] uppercase tracking-wider mt-1">Clicks</div>
                    </div>

                    {placement.conversions !== undefined && (
                      <div className="text-center w-full lg:w-auto">
                        <div className="text-2xl font-bold tracking-tight text-[--color-foreground]">
                          {placement.conversions.toLocaleString()}
                        </div>
                        <div className="text-xs font-medium text-[--color-muted] uppercase tracking-wider mt-1">Conversions</div>
                      </div>
                    )}
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
