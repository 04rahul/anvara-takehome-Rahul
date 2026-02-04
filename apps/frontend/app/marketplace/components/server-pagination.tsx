'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface ServerPaginationProps {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  resultsPerPage: number;
}

export function ServerPagination({
  currentPage,
  totalPages,
  totalResults,
  resultsPerPage,
}: ServerPaginationProps) {
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const startResult = (currentPage - 1) * resultsPerPage + 1;
  const endResult = Math.min(currentPage * resultsPerPage, totalResults);

  // Build URL for a specific page
  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', String(page));
    }
    const query = params.toString();
    return `/marketplace${query ? `?${query}` : ''}`;
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex flex-col items-center gap-4 mt-8">
      {/* Results count */}
      <p className="text-sm text-[--color-muted]">
        Showing <span className="font-medium text-[--color-foreground]">{startResult}</span> to{' '}
        <span className="font-medium text-[--color-foreground]">{endResult}</span> of{' '}
        <span className="font-medium text-[--color-foreground]">{totalResults}</span> results
      </p>

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <Link
          href={currentPage > 1 ? buildPageUrl(currentPage - 1) : '#'}
          className={`flex items-center gap-1 rounded-lg border border-[--color-border] bg-[--color-background] px-4 py-2 text-sm font-medium text-[--color-foreground] transition-colors ${
            currentPage === 1
              ? 'cursor-not-allowed opacity-50'
              : 'hover:bg-gray-50'
          }`}
          aria-label="Previous page"
          aria-disabled={currentPage === 1}
          onClick={(e) => currentPage === 1 && e.preventDefault()}
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Previous</span>
        </Link>

        {/* Page numbers */}
        <div className="flex gap-1">
          {getPageNumbers().map((page, idx) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="flex h-10 w-10 items-center justify-center text-[--color-muted]"
                >
                  ...
                </span>
              );
            }

            const pageNum = page as number;
            const isCurrent = pageNum === currentPage;

            return (
              <Link
                key={pageNum}
                href={buildPageUrl(pageNum)}
                className={`flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-medium transition-all ${
                  isCurrent
                    ? 'border-[--color-primary] bg-[--color-primary] text-white cursor-default pointer-events-none shadow-md scale-110 font-bold'
                    : 'border-[--color-border] bg-[--color-background] text-[--color-foreground] hover:bg-gray-50 hover:border-[--color-primary]/30'
                }`}
                aria-label={`Page ${pageNum}`}
                aria-current={isCurrent ? 'page' : undefined}
              >
                {pageNum}
              </Link>
            );
          })}
        </div>

        {/* Next button */}
        <Link
          href={currentPage < totalPages ? buildPageUrl(currentPage + 1) : '#'}
          className={`flex items-center gap-1 rounded-lg border border-[--color-border] bg-[--color-background] px-4 py-2 text-sm font-medium text-[--color-foreground] transition-colors ${
            currentPage === totalPages
              ? 'cursor-not-allowed opacity-50'
              : 'hover:bg-gray-50'
          }`}
          aria-label="Next page"
          aria-disabled={currentPage === totalPages}
          onClick={(e) => currentPage === totalPages && e.preventDefault()}
        >
          <span className="hidden sm:inline">Next</span>
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
