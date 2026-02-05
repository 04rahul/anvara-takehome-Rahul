'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition, useEffect } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Select } from '@/app/components/ui/select';

interface FilterControlsProps {
  layout?: 'top' | 'sidebar';
  currentParams: {
    type?: string;
    sortBy?: string;
    minPrice?: string;
    maxPrice?: string;
    search?: string;
    category?: string;
  };
  totalResults: number;
}

export function FilterControls({ layout = 'top', currentParams, totalResults }: FilterControlsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const sanitizeFiniteNumberParam = (value?: string) => {
    const trimmed = value?.trim();
    if (!trimmed) return '';
    const num = Number(trimmed);
    if (!Number.isFinite(num)) return '';
    return trimmed;
  };

  // Local state for immediate UI updates (to prevent losing focus)
  const [searchInput, setSearchInput] = useState(currentParams.search || '');
  const [minPriceInput, setMinPriceInput] = useState(sanitizeFiniteNumberParam(currentParams.minPrice));
  const [maxPriceInput, setMaxPriceInput] = useState(sanitizeFiniteNumberParam(currentParams.maxPrice));
  
  // Debounced values (wait 500ms after user stops typing)
  const debouncedSearch = useDebounce(searchInput, 500);
  const debouncedMinPrice = useDebounce(minPriceInput, 500);
  const debouncedMaxPrice = useDebounce(maxPriceInput, 500);

  const [filters, setFilters] = useState({
    search: currentParams.search || '',
    type: currentParams.type || '',
    sortBy: currentParams.sortBy || '',
    minPrice: sanitizeFiniteNumberParam(currentParams.minPrice),
    maxPrice: sanitizeFiniteNumberParam(currentParams.maxPrice),
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

  const resultsLabel = (
    <span className="text-sm text-[var(--color-muted)]">
      {isPending ? 'Updating...' : `${totalResults} results`}
    </span>
  );

  // Variant B: Left sidebar, compact single-column layout (avoid viewport-based multi-column grids)
  if (layout === 'sidebar') {
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-medium text-[var(--color-foreground)]">Filters</h3>
            {resultsLabel}
          </div>

          <div className="space-y-3">
            {/* Search */}
            <div className="relative">
              <label htmlFor="search" className="mb-1 block text-xs font-medium text-[var(--color-muted)]">
                Search
              </label>
              <Input
                id="search"
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Name, description, publisher..."
              />
              {isPending && searchInput && (
                <div className="absolute right-3 top-[34px]">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent"></div>
                </div>
              )}
            </div>

            {/* Type */}
            <div>
              <label htmlFor="type" className="mb-1 block text-xs font-medium text-[var(--color-muted)]">
                Ad Type
              </label>
              <Select
                id="type"
                value={filters.type}
                onChange={(e) => updateFilters({ type: e.target.value })}
                disabled={isPending}
              >
                <option value="">All Types</option>
                <option value="DISPLAY">Display</option>
                <option value="VIDEO">Video</option>
                <option value="NEWSLETTER">Newsletter</option>
                <option value="PODCAST">Podcast</option>
              </Select>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="mb-1 block text-xs font-medium text-[var(--color-muted)]">
                Category
              </label>
              <Select
                id="category"
                value={filters.category}
                onChange={(e) => updateFilters({ category: e.target.value })}
                disabled={isPending}
              >
                <option value="">All Categories</option>
                <option value="Technology">Technology</option>
                <option value="Business">Business</option>
                <option value="Podcast">Podcast</option>
                <option value="Newsletter">Newsletter</option>
                <option value="Video">Video</option>
              </Select>
            </div>

            {/* Sort */}
            <div>
              <label htmlFor="sortBy" className="mb-1 block text-xs font-medium text-[var(--color-muted)]">
                Sort By
              </label>
              <Select
                id="sortBy"
                value={filters.sortBy}
                onChange={(e) => updateFilters({ sortBy: e.target.value })}
                disabled={isPending}
              >
                <option value="">Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </Select>
            </div>

            {/* Min / Max */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="minPrice" className="mb-1 block text-xs font-medium text-[var(--color-muted)]">
                  Min ($)
                </label>
                <Input
                  type="number"
                  id="minPrice"
                  value={minPriceInput}
                  onChange={(e) => setMinPriceInput(e.target.value)}
                  placeholder="0"
                  min="0"
                  disabled={isPending}
                />
              </div>
              <div>
                <label htmlFor="maxPrice" className="mb-1 block text-xs font-medium text-[var(--color-muted)]">
                  Max ($)
                </label>
                <Input
                  type="number"
                  id="maxPrice"
                  value={maxPriceInput}
                  onChange={(e) => setMaxPriceInput(e.target.value)}
                  placeholder="Max"
                  min="0"
                  disabled={isPending}
                />
              </div>
            </div>

            {hasActiveFilters && (
              <Button onClick={clearFilters} disabled={isPending} variant="secondary" className="w-full">
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Active Filters Summary (compact) */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-1 text-xs">
                Search: <strong className="truncate max-w-[140px]">{filters.search}</strong>
                <button
                  onClick={() => {
                    setSearchInput('');
                    updateFilters({ search: '' });
                  }}
                  className="text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                >
                  ×
                </button>
              </span>
            )}
            {filters.type && (
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-1 text-xs">
                Type: <strong>{filters.type}</strong>
                <button
                  onClick={() => updateFilters({ type: '' })}
                  className="text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                >
                  ×
                </button>
              </span>
            )}
            {filters.category && (
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-1 text-xs">
                Category: <strong>{filters.category}</strong>
                <button
                  onClick={() => updateFilters({ category: '' })}
                  className="text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                >
                  ×
                </button>
              </span>
            )}
            {filters.minPrice && (
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-1 text-xs">
                Min: <strong>${filters.minPrice}</strong>
                <button
                  onClick={() => {
                    setMinPriceInput('');
                    updateFilters({ minPrice: '' });
                  }}
                  className="text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                >
                  ×
                </button>
              </span>
            )}
            {filters.maxPrice && (
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-1 text-xs">
                Max: <strong>${filters.maxPrice}</strong>
                <button
                  onClick={() => {
                    setMaxPriceInput('');
                    updateFilters({ maxPrice: '' });
                  }}
                  className="text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
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

  // Variant A: Top filter bar, compact (single-row on desktop)
  if (layout === 'top') {
    return (
      <div className="mx-auto w-full max-w-6xl space-y-3">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-medium text-[var(--color-foreground)]">Filters</h3>
            {resultsLabel}
          </div>

          <div className="space-y-3">
            {/* Search (top row) */}
            <div className="relative">
              <label htmlFor="search" className="sr-only">
                Search
              </label>
              <Input
                id="search"
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name, description, or publisher..."
              />
              {isPending && searchInput && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent"></div>
                </div>
              )}
            </div>

            {/* Filters (second row: one line on desktop) */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6 lg:items-end">
              {/* Type */}
              <div>
                <label htmlFor="type" className="sr-only">
                  Ad Type
                </label>
                <Select
                  id="type"
                  value={filters.type}
                  onChange={(e) => updateFilters({ type: e.target.value })}
                  disabled={isPending}
                >
                  <option value="">All Types</option>
                  <option value="DISPLAY">Display</option>
                  <option value="VIDEO">Video</option>
                  <option value="NEWSLETTER">Newsletter</option>
                  <option value="PODCAST">Podcast</option>
                </Select>
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="sr-only">
                  Category
                </label>
                <Select
                  id="category"
                  value={filters.category}
                  onChange={(e) => updateFilters({ category: e.target.value })}
                  disabled={isPending}
                >
                  <option value="">All Categories</option>
                  <option value="Technology">Technology</option>
                  <option value="Business">Business</option>
                  <option value="Podcast">Podcast</option>
                  <option value="Newsletter">Newsletter</option>
                  <option value="Video">Video</option>
                </Select>
              </div>

              {/* Sort */}
              <div>
                <label htmlFor="sortBy" className="sr-only">
                  Sort By
                </label>
                <Select
                  id="sortBy"
                  value={filters.sortBy}
                  onChange={(e) => updateFilters({ sortBy: e.target.value })}
                  disabled={isPending}
                >
                  <option value="">Default</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                </Select>
              </div>

              {/* Min */}
              <div>
                <label htmlFor="minPrice" className="sr-only">
                  Min Price
                </label>
                <Input
                  type="number"
                  id="minPrice"
                  value={minPriceInput}
                  onChange={(e) => setMinPriceInput(e.target.value)}
                  placeholder="Min"
                  min="0"
                  disabled={isPending}
                />
              </div>

              {/* Max */}
              <div>
                <label htmlFor="maxPrice" className="sr-only">
                  Max Price
                </label>
                <Input
                  type="number"
                  id="maxPrice"
                  value={maxPriceInput}
                  onChange={(e) => setMaxPriceInput(e.target.value)}
                placeholder="Max"
                  min="0"
                  disabled={isPending}
                />
              </div>

              {/* Clear */}
              <div className="lg:flex lg:justify-end">
                {hasActiveFilters && (
                  <Button onClick={clearFilters} disabled={isPending} variant="secondary" size="sm">
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-1 text-sm">
                Search: <strong>{filters.search}</strong>
                <button
                  onClick={() => {
                    setSearchInput('');
                    updateFilters({ search: '' });
                  }}
                  className="text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                >
                  ×
                </button>
              </span>
            )}
            {filters.type && (
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-1 text-sm">
                Type: <strong>{filters.type}</strong>
                <button
                  onClick={() => updateFilters({ type: '' })}
                  className="text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                >
                  ×
                </button>
              </span>
            )}
            {filters.minPrice && (
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-1 text-sm">
                Min: <strong>${filters.minPrice}</strong>
                <button
                  onClick={() => {
                    setMinPriceInput('');
                    updateFilters({ minPrice: '' });
                  }}
                  className="text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                >
                  ×
                </button>
              </span>
            )}
            {filters.maxPrice && (
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-1 text-sm">
                Max: <strong>${filters.maxPrice}</strong>
                <button
                  onClick={() => {
                    setMaxPriceInput('');
                    updateFilters({ maxPrice: '' });
                  }}
                  className="text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                >
                  ×
                </button>
              </span>
            )}
            {filters.category && (
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-1 text-sm">
                Category: <strong>{filters.category}</strong>
                <button
                  onClick={() => updateFilters({ category: '' })}
                  className="text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
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

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4">
      {/* Search Bar */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, description, or publisher..."
            />
            {isPending && searchInput && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent"></div>
              </div>
            )}
          </div>
          {hasActiveFilters && (
            <Button
              onClick={clearFilters}
              disabled={isPending}
              variant="secondary"
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-medium text-[var(--color-foreground)]">Filters & Sorting</h3>
          {resultsLabel}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Type Filter */}
          <div>
            <label htmlFor="type" className="mb-2 block text-sm font-medium text-[var(--color-foreground)]">
              Ad Type
            </label>
            <Select
              id="type"
              value={filters.type}
              onChange={(e) => updateFilters({ type: e.target.value })}
              disabled={isPending}
            >
              <option value="">All Types</option>
              <option value="DISPLAY">Display</option>
              <option value="VIDEO">Video</option>
              <option value="NEWSLETTER">Newsletter</option>
              <option value="PODCAST">Podcast</option>
            </Select>
          </div>

          {/* Category Filter */}
          <div>
            <label htmlFor="category" className="mb-2 block text-sm font-medium text-[var(--color-foreground)]">
              Category
            </label>
            <Select
              id="category"
              value={filters.category}
              onChange={(e) => updateFilters({ category: e.target.value })}
              disabled={isPending}
            >
              <option value="">All Categories</option>
              <option value="Technology">Technology</option>
              <option value="Business">Business</option>
              <option value="Podcast">Podcast</option>
              <option value="Newsletter">Newsletter</option>
              <option value="Video">Video</option>
            </Select>
          </div>

          {/* Sort By */}
          <div>
            <label htmlFor="sortBy" className="mb-2 block text-sm font-medium text-[var(--color-foreground)]">
              Sort By
            </label>
            <Select
              id="sortBy"
              value={filters.sortBy}
              onChange={(e) => updateFilters({ sortBy: e.target.value })}
              disabled={isPending}
            >
              <option value="">Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </Select>
          </div>

          {/* Min Price */}
          <div>
            <label htmlFor="minPrice" className="mb-2 block text-sm font-medium text-[var(--color-foreground)]">
              Min Price ($)
            </label>
            <Input
              type="number"
              id="minPrice"
              value={minPriceInput}
              onChange={(e) => setMinPriceInput(e.target.value)}
              placeholder="0"
              min="0"
              disabled={isPending}
            />
          </div>

          {/* Max Price */}
          <div className="sm:col-span-2 lg:col-span-1">
            <label htmlFor="maxPrice" className="mb-2 block text-sm font-medium text-[var(--color-foreground)]">
              Max Price ($)
            </label>
            <Input
              type="number"
              id="maxPrice"
              value={maxPriceInput}
              onChange={(e) => setMaxPriceInput(e.target.value)}
              placeholder="Max"
              min="0"
              disabled={isPending}
            />
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-1 text-sm">
              Search: <strong>{filters.search}</strong>
              <button
                onClick={() => {
                  setSearchInput('');
                  updateFilters({ search: '' });
                }}
                className="text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
              >
                ×
              </button>
            </span>
          )}
          {filters.type && (
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-1 text-sm">
              Type: <strong>{filters.type}</strong>
              <button
                onClick={() => updateFilters({ type: '' })}
                className="text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
              >
                ×
              </button>
            </span>
          )}
          {filters.minPrice && (
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-1 text-sm">
              Min: <strong>${filters.minPrice}</strong>
              <button
                onClick={() => {
                  setMinPriceInput('');
                  updateFilters({ minPrice: '' });
                }}
                className="text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
              >
                ×
              </button>
            </span>
          )}
          {filters.maxPrice && (
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-1 text-sm">
              Max: <strong>${filters.maxPrice}</strong>
              <button
                onClick={() => {
                  setMaxPriceInput('');
                  updateFilters({ maxPrice: '' });
                }}
                className="text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
              >
                ×
              </button>
            </span>
          )}
          {filters.category && (
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-1 text-sm">
              Category: <strong>{filters.category}</strong>
              <button
                onClick={() => updateFilters({ category: '' })}
                className="text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
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
