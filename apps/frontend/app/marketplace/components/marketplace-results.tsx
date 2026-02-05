'use client';

import type { AdSlot } from '@/lib/types';
import { useMarketplaceFilterLayoutTest } from '@/hooks/use-ab-test';
import { FilterControls } from './filter-controls';
import { AdSlotGrid } from './ad-slot-grid';
import { ServerPagination } from './server-pagination';

interface MarketplaceResultsProps {
  currentParams: {
    type?: string;
    sortBy?: string;
    minPrice?: string;
    maxPrice?: string;
    search?: string;
    category?: string;
  };
  adSlots: AdSlot[];
  error?: string | null;
  totalResults: number;
  pagination?: {
    currentPage: number;
    totalPages: number;
    resultsPerPage: number;
  } | null;
}

export function MarketplaceResults({
  currentParams,
  adSlots,
  error,
  totalResults,
  pagination,
}: MarketplaceResultsProps) {
  const variant = useMarketplaceFilterLayoutTest();
  const layout = variant ?? 'top';

  // #region agent log H3
  try {
    const key = 'dbg_marketplace_results_layout_v1';
    if (!sessionStorage.getItem(key)) {
      fetch('http://127.0.0.1:7242/ingest/3f0b1e04-39fc-4b7e-98fa-50c590796815', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'debug-session',
          runId: 'pre-fix',
          hypothesisId: 'H3',
          location: 'app/marketplace/components/marketplace-results.tsx:MarketplaceResults',
          message: 'MarketplaceResults computed filter layout from AB test variant',
          data: {
            pathname: typeof window !== 'undefined' ? window.location.pathname : 'server',
            variant,
            layout,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      sessionStorage.setItem(key, 'true');
    }
  } catch {
    // ignore instrumentation errors
  }
  // #endregion agent log H3

  const filter = (
    <FilterControls
      layout={layout === 'sidebar' ? 'sidebar' : 'top'}
      currentParams={currentParams}
      totalResults={totalResults}
    />
  );

  const results = (
    <div className="space-y-6">
      <AdSlotGrid adSlots={adSlots} error={error} />
      {!error && pagination && (
        <ServerPagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalResults={totalResults}
          resultsPerPage={pagination.resultsPerPage}
        />
      )}
    </div>
  );

  if (layout === 'sidebar') {
    return (
      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
        <aside className="lg:sticky lg:top-4">{filter}</aside>
        <section>{results}</section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {filter}
      {results}
    </div>
  );
}

