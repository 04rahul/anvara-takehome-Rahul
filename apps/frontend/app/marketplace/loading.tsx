export default function Loading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header skeleton */}
      <div>
        <div className="h-8 w-48 skeleton rounded mb-2"></div>
        <div className="h-4 w-96 skeleton rounded"></div>
      </div>

      {/* Search bar skeleton */}
      <div className="rounded-lg border border-[--color-border] bg-[--color-background] p-4">
        <div className="h-11 skeleton rounded-lg"></div>
      </div>

      {/* Filters skeleton */}
      <div className="rounded-lg border border-[--color-border] bg-[--color-background] p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="h-5 w-32 skeleton rounded"></div>
          <div className="h-4 w-24 skeleton rounded"></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-20 skeleton rounded"></div>
              <div className="h-11 skeleton rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Ad slots grid skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(12)].map((_, i) => (
          <div 
            key={i} 
            className="rounded-lg border border-[--color-border] bg-[--color-background] p-4 space-y-3"
          >
            {/* Header with title and badge */}
            <div className="flex items-start justify-between mb-2">
              <div className="h-5 skeleton rounded w-32"></div>
              <div className="h-5 skeleton rounded w-16"></div>
            </div>
            
            {/* Publisher info */}
            <div className="space-y-2 mb-3">
              <div className="h-4 skeleton rounded w-24"></div>
              <div className="h-5 skeleton rounded w-full"></div>
            </div>
            
            {/* Description lines */}
            <div className="space-y-2 mb-3">
              <div className="h-3 skeleton rounded"></div>
              <div className="h-3 skeleton rounded w-5/6"></div>
            </div>
            
            {/* Footer with status and price */}
            <div className="flex items-center justify-between mb-3">
              <div className="h-4 skeleton rounded w-16"></div>
              <div className="h-4 skeleton rounded w-20"></div>
            </div>
            
            {/* Button skeleton */}
            <div className="h-10 skeleton rounded-lg"></div>
          </div>
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="flex flex-col items-center gap-4 mt-8">
        <div className="h-4 w-48 skeleton rounded"></div>
        <div className="flex items-center gap-2">
          <div className="h-10 w-24 skeleton rounded-lg"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 w-10 skeleton rounded-lg"></div>
          ))}
          <div className="h-10 w-24 skeleton rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}
