export function LoadingCards({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"
        >
          <div className="aspect-[4/5] animate-pulse bg-slate-100" />
          <div className="space-y-3 p-5">
            <div className="h-3 w-20 animate-pulse rounded-full bg-slate-100" />
            <div className="h-6 w-full animate-pulse rounded-full bg-slate-100" />
            <div className="h-6 w-3/4 animate-pulse rounded-full bg-slate-100" />
            <div className="h-4 w-2/3 animate-pulse rounded-full bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
