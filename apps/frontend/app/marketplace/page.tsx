import { getAdSlots, type PaginatedResponse } from '@/lib/api';
import { MarketplaceResults } from './components/marketplace-results';
import type { AdSlot } from '@/lib/types';

interface SearchParams {
  type?: string;
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

  const sanitizeFiniteNumberParam = (value?: string) => {
    const trimmed = value?.trim();
    if (!trimmed) return undefined;
    const num = Number(trimmed);
    if (!Number.isFinite(num)) return undefined;
    return trimmed;
  };

  const sanitizedParams = {
    ...params,
    minPrice: sanitizeFiniteNumberParam(params.minPrice),
    maxPrice: sanitizeFiniteNumberParam(params.maxPrice),
  };

  try {
    // Fetch paginated data from server (backend handles page validation)
    response = await getAdSlots({
      type: sanitizedParams.type,
      minPrice: sanitizedParams.minPrice,
      maxPrice: sanitizedParams.maxPrice,
      sortBy: sanitizedParams.sortBy,
      search: sanitizedParams.search,
      category: sanitizedParams.category,
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

      <MarketplaceResults
        currentParams={{
          type: sanitizedParams.type,
          sortBy: sanitizedParams.sortBy,
          minPrice: sanitizedParams.minPrice,
          maxPrice: sanitizedParams.maxPrice,
          search: sanitizedParams.search,
          category: sanitizedParams.category,
        }}
        adSlots={filteredSlots}
        error={error}
        totalResults={response?.pagination.total || 0}
        pagination={
          !error && response
            ? {
                currentPage,
                totalPages: response.pagination.totalPages,
                resultsPerPage: limit,
              }
            : null
        }
      />
    </div>
  );
}
