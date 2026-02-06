export default function Loading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Dashboard header */}
      <div className="flex items-center justify-between gap-4">
        <div className="h-8 w-44 skeleton rounded" />
        <div className="h-10 w-44 skeleton rounded-lg" />
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(9)].map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-[--color-border] bg-[--color-background] p-4 shadow-sm space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="h-5 w-40 skeleton rounded" />
              <div className="h-5 w-16 skeleton rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full skeleton rounded" />
              <div className="h-3 w-5/6 skeleton rounded" />
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-3 w-20 skeleton rounded" />
                <div className="h-3 w-40 skeleton rounded" />
              </div>
              <div className="h-1.5 w-full skeleton rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

