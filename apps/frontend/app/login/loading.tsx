export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[--color-background] animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-lg border border-[--color-border] p-6 shadow-sm space-y-6">
        <div>
          <div className="h-7 w-40 skeleton rounded mb-2" />
          <div className="h-4 w-64 skeleton rounded" />
        </div>

        <div className="space-y-3">
          <div className="h-4 w-28 skeleton rounded" />
          <div className="h-11 w-full skeleton rounded-lg" />
        </div>

        <div className="h-11 w-full skeleton rounded-lg" />
      </div>
    </div>
  );
}

