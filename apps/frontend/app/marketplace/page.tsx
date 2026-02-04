import { getAdSlots, type PaginatedResponse } from '@/lib/api';
import { FilterControls } from './components/filter-controls';
import { ServerPagination } from './components/server-pagination';
import { AdSlotGrid } from './components/ad-slot-grid';
import type { AdSlot } from '@/lib/types';

interface SearchParams {
  type?: string;
  available?: string;
  sortBy?: string;
  minPrice?: string;
  maxPrice?: string;
  search?: string;
  page?: string;
  category?: string;
}

interface Props {
  searchParams: Promise<SearchParams>;
}

export default async function MarketplacePage({ searchParams }: Props) {
  const params = await searchParams;
  const requestedPage = Number(params.page) || 1;
  const limit = 12;

  let response: PaginatedResponse<AdSlot> | null = null;
  let error: string | null = null;

  try {
    // Fetch paginated data from server (backend handles page validation)
    response = await getAdSlots({
      type: params.type,
      available: params.available,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      sortBy: params.sortBy,
      search: params.search,
      category: params.category,
      page: requestedPage,
      limit,
    });
    // Backend automatically corrects invalid page numbers!
  } catch (err) {
    error = 'Failed to load ad slots. Please try again later.';
    console.error('Failed to load ad slots:', err);
  }

  // Backend handles search, so we use the data directly
  const filteredSlots = response?.data || [];
  const currentPage = response?.pagination.page || 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Marketplace</h1>
        <p className="text-[--color-muted]">Browse available ad slots from our publishers</p>
      </div>

      <FilterControls 
        currentParams={params} 
        totalResults={response?.pagination.total || 0} 
      />

      <AdSlotGrid adSlots={filteredSlots} error={error} />

      {!error && response && (
        <ServerPagination
          currentPage={currentPage}
          totalPages={response.pagination.totalPages}
          totalResults={response.pagination.total}
          resultsPerPage={limit}
        />
      )}
    </div>
  );
}
