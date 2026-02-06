export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 animate-in fade-in duration-200">
      {/* Back link */}
      <div>
        <div className="h-5 w-40 skeleton rounded" />
      </div>

      {/* Header surface */}
      <div className="rounded-lg border border-[--color-border] bg-[--color-background] p-6 shadow-sm">
        <div className="space-y-3">
          <div className="h-8 w-3/4 skeleton rounded" />
          <div className="h-5 w-1/2 skeleton rounded" />
          <div className="flex flex-wrap gap-2 pt-2">
            <div className="h-6 w-28 skeleton rounded-full" />
            <div className="h-6 w-32 skeleton rounded-full" />
            <div className="h-6 w-28 skeleton rounded-full" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        {/* Booking card */}
        <aside className="order-1 lg:order-2 lg:sticky lg:top-4">
          <div className="rounded-lg border border-[--color-border] bg-[--color-background] p-6 shadow-sm">
            <div className="space-y-4">
              <div className="h-4 w-20 skeleton rounded" />
              <div className="h-10 w-40 skeleton rounded" />
              <div className="h-4 w-24 skeleton rounded" />
              <div className="pt-2">
                <div className="h-12 w-full skeleton rounded-lg" />
              </div>
              <div className="h-10 w-full skeleton rounded-lg" />
              <div className="h-10 w-full skeleton rounded-lg" />
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="order-2 lg:order-1 space-y-6">
          <section className="rounded-lg border border-[--color-border] bg-[--color-background] p-6 shadow-sm">
            <div className="space-y-3">
              <div className="h-5 w-40 skeleton rounded" />
              <div className="h-4 w-full skeleton rounded" />
              <div className="h-4 w-5/6 skeleton rounded" />
              <div className="h-4 w-2/3 skeleton rounded" />
            </div>
          </section>

          <section className="rounded-lg border border-[--color-border] bg-[--color-background] p-6 shadow-sm">
            <div className="space-y-3">
              <div className="h-5 w-44 skeleton rounded" />
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="h-12 w-full skeleton rounded" />
                <div className="h-12 w-full skeleton rounded" />
                <div className="h-12 w-full skeleton rounded" />
                <div className="h-12 w-full skeleton rounded" />
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

