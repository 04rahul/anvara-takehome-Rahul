export default function Loading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="h-8 w-40 skeleton rounded" />
        <div className="h-10 w-32 skeleton rounded-lg" />
      </div>

      {/* Primary surface */}
      <div className="rounded-lg border border-[--color-border] bg-[--color-background] p-6 shadow-sm space-y-4">
        <div className="h-6 w-56 skeleton rounded" />
        <div className="space-y-2">
          <div className="h-3 w-full skeleton rounded" />
          <div className="h-3 w-5/6 skeleton rounded" />
          <div className="h-3 w-2/3 skeleton rounded" />
        </div>
        <div className="flex gap-3">
          <div className="h-11 w-40 skeleton rounded-lg" />
          <div className="h-11 w-32 skeleton rounded-lg" />
        </div>
      </div>

      {/* Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-[--color-border] bg-[--color-background] p-4 shadow-sm space-y-3"
          >
            <div className="h-5 w-40 skeleton rounded" />
            <div className="space-y-2">
              <div className="h-3 w-full skeleton rounded" />
              <div className="h-3 w-5/6 skeleton rounded" />
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="h-4 w-20 skeleton rounded" />
              <div className="h-4 w-24 skeleton rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

