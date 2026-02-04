'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition, useEffect } from 'react';
import { useDebounce } from '@/hooks/use-debounce';

interface FilterControlsProps {
  currentParams: {
    type?: string;
    available?: string;
    sortBy?: string;
    minPrice?: string;
    maxPrice?: string;
    search?: string;
    category?: string;
  };
  totalResults: number;
}

export function FilterControls({ currentParams, totalResults }: FilterControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local state for immediate UI updates (to prevent losing focus)
  const [searchInput, setSearchInput] = useState(currentParams.search || '');
  const [minPriceInput, setMinPriceInput] = useState(currentParams.minPrice || '');
  const [maxPriceInput, setMaxPriceInput] = useState(currentParams.maxPrice || '');
  
  // Debounced values (wait 500ms after user stops typing)
  const debouncedSearch = useDebounce(searchInput, 500);
  const debouncedMinPrice = useDebounce(minPriceInput, 500);
  const debouncedMaxPrice = useDebounce(maxPriceInput, 500);

  const [filters, setFilters] = useState({
    search: currentParams.search || '',
    type: currentParams.type || '',
    available: currentParams.available || '',
    sortBy: currentParams.sortBy || '',
    minPrice: currentParams.minPrice || '',
    maxPrice: currentParams.maxPrice || '',
    category: currentParams.category || '',
  });

  // Update filters when debounced values change
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      updateFilters({ search: debouncedSearch });
    }
  }, [debouncedSearch]);

  useEffect(() => {
    if (debouncedMinPrice !== filters.minPrice) {
      updateFilters({ minPrice: debouncedMinPrice });
    }
  }, [debouncedMinPrice]);

  useEffect(() => {
    if (debouncedMaxPrice !== filters.maxPrice) {
      updateFilters({ maxPrice: debouncedMaxPrice });
    }
  }, [debouncedMaxPrice]);

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);

    // Build URL with filters (always reset to page 1 when filters change)
    const params = new URLSearchParams();
    Object.entries(updated).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    // Remove page parameter to reset to page 1
    params.delete('page');

    startTransition(() => {
      const queryString = params.toString();
      router.push(`/marketplace${queryString ? `?${queryString}` : ''}`, { scroll: false });
    });
  };

  const clearFilters = () => {
    setSearchInput('');
    setMinPriceInput('');
    setMaxPriceInput('');
    setFilters({
      search: '',
      type: '',
      available: '',
      sortBy: '',
      minPrice: '',
      maxPrice: '',
      category: '',
    });
    startTransition(() => {
      router.push('/marketplace');
    });
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== '');

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="rounded-lg border border-[--color-border] bg-[--color-background] p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, description, or publisher..."
              className="w-full rounded-lg border border-[--color-border] bg-[--color-background] px-4 py-2.5 text-[--color-foreground] placeholder:text-[--color-muted] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[--color-primary] focus:border-transparent"
            />
            {isPending && searchInput && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[--color-primary] border-t-transparent"></div>
              </div>
            )}
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              disabled={isPending}
              className="rounded-lg border border-[--color-border] px-6 py-2.5 font-medium text-[--color-foreground] transition-colors duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[--color-primary] disabled:opacity-50"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-[--color-border] bg-[--color-background] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-medium text-[--color-foreground]">Filters & Sorting</h3>
          <span className="text-sm text-[--color-muted]">
            {isPending ? 'Updating...' : `${totalResults} results`}
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {/* Type Filter */}
          <div>
            <label htmlFor="type" className="mb-2 block text-sm font-medium text-[--color-foreground]">
              Ad Type
            </label>
            <select
              id="type"
              value={filters.type}
              onChange={(e) => updateFilters({ type: e.target.value })}
              disabled={isPending}
              className="w-full rounded-lg border border-[--color-border] bg-[--color-background] px-4 py-2.5 text-[--color-foreground] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[--color-primary] focus:border-transparent disabled:opacity-50"
            >
              <option value="">All Types</option>
              <option value="DISPLAY">Display</option>
              <option value="VIDEO">Video</option>
              <option value="NEWSLETTER">Newsletter</option>
              <option value="PODCAST">Podcast</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label htmlFor="category" className="mb-2 block text-sm font-medium text-[--color-foreground]">
              Category
            </label>
            <select
              id="category"
              value={filters.category}
              onChange={(e) => updateFilters({ category: e.target.value })}
              disabled={isPending}
              className="w-full rounded-lg border border-[--color-border] bg-[--color-background] px-4 py-2.5 text-[--color-foreground] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[--color-primary] focus:border-transparent disabled:opacity-50"
            >
              <option value="">All Categories</option>
              <option value="Technology">Technology</option>
              <option value="Business">Business</option>
              <option value="Podcast">Podcast</option>
              <option value="Newsletter">Newsletter</option>
              <option value="Video">Video</option>
            </select>
          </div>

          {/* Availability Filter */}
          <div>
            <label htmlFor="available" className="mb-2 block text-sm font-medium text-[--color-foreground]">
              Availability
            </label>
            <select
              id="available"
              value={filters.available}
              onChange={(e) => updateFilters({ available: e.target.value })}
              disabled={isPending}
              className="w-full rounded-lg border border-[--color-border] bg-[--color-background] px-4 py-2.5 text-[--color-foreground] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[--color-primary] focus:border-transparent disabled:opacity-50"
            >
              <option value="">All Slots</option>
              <option value="true">Available Only</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label htmlFor="sortBy" className="mb-2 block text-sm font-medium text-[--color-foreground]">
              Sort By
            </label>
            <select
              id="sortBy"
              value={filters.sortBy}
              onChange={(e) => updateFilters({ sortBy: e.target.value })}
              disabled={isPending}
              className="w-full rounded-lg border border-[--color-border] bg-[--color-background] px-4 py-2.5 text-[--color-foreground] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[--color-primary] focus:border-transparent disabled:opacity-50"
            >
              <option value="">Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
          </div>

          {/* Min Price */}
          <div>
            <label htmlFor="minPrice" className="mb-2 block text-sm font-medium text-[--color-foreground]">
              Min Price ($)
            </label>
            <input
              type="number"
              id="minPrice"
              value={minPriceInput}
              onChange={(e) => setMinPriceInput(e.target.value)}
              placeholder="0"
              min="0"
              disabled={isPending}
              className="w-full rounded-lg border border-[--color-border] bg-[--color-background] px-4 py-2.5 text-[--color-foreground] placeholder:text-[--color-muted] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[--color-primary] focus:border-transparent disabled:opacity-50"
            />
          </div>
        </div>

        {/* Max Price */}
        <div>
          <label htmlFor="maxPrice" className="mb-2 block text-sm font-medium text-[--color-foreground]">
            Max Price ($)
          </label>
          <input
            type="number"
            id="maxPrice"
            value={maxPriceInput}
            onChange={(e) => setMaxPriceInput(e.target.value)}
            placeholder="No maximum"
            min="0"
            disabled={isPending}
            className="w-full rounded-lg border border-[--color-border] bg-[--color-background] px-4 py-2.5 text-[--color-foreground] placeholder:text-[--color-muted] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[--color-primary] focus:border-transparent disabled:opacity-50"
          />
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <span className="inline-flex items-center gap-2 rounded-full border border-[--color-border] bg-[--color-background] px-3 py-1 text-sm">
              Search: <strong>{filters.search}</strong>
              <button
                onClick={() => {
                  setSearchInput('');
                  updateFilters({ search: '' });
                }}
                className="text-[--color-muted] hover:text-[--color-foreground]"
              >
                ×
              </button>
            </span>
          )}
          {filters.type && (
            <span className="inline-flex items-center gap-2 rounded-full border border-[--color-border] bg-[--color-background] px-3 py-1 text-sm">
              Type: <strong>{filters.type}</strong>
              <button
                onClick={() => updateFilters({ type: '' })}
                className="text-[--color-muted] hover:text-[--color-foreground]"
              >
                ×
              </button>
            </span>
          )}
          {filters.available && (
            <span className="inline-flex items-center gap-2 rounded-full border border-[--color-border] bg-[--color-background] px-3 py-1 text-sm">
              Available Only
              <button
                onClick={() => updateFilters({ available: '' })}
                className="text-[--color-muted] hover:text-[--color-foreground]"
              >
                ×
              </button>
            </span>
          )}
          {filters.minPrice && (
            <span className="inline-flex items-center gap-2 rounded-full border border-[--color-border] bg-[--color-background] px-3 py-1 text-sm">
              Min: <strong>${filters.minPrice}</strong>
              <button
                onClick={() => {
                  setMinPriceInput('');
                  updateFilters({ minPrice: '' });
                }}
                className="text-[--color-muted] hover:text-[--color-foreground]"
              >
                ×
              </button>
            </span>
          )}
          {filters.maxPrice && (
            <span className="inline-flex items-center gap-2 rounded-full border border-[--color-border] bg-[--color-background] px-3 py-1 text-sm">
              Max: <strong>${filters.maxPrice}</strong>
              <button
                onClick={() => {
                  setMaxPriceInput('');
                  updateFilters({ maxPrice: '' });
                }}
                className="text-[--color-muted] hover:text-[--color-foreground]"
              >
                ×
              </button>
            </span>
          )}
          {filters.category && (
            <span className="inline-flex items-center gap-2 rounded-full border border-[--color-border] bg-[--color-background] px-3 py-1 text-sm">
              Category: <strong>{filters.category}</strong>
              <button
                onClick={() => updateFilters({ category: '' })}
                className="text-[--color-muted] hover:text-[--color-foreground]"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
