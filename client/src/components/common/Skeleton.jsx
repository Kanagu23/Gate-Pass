export const Skeleton = ({ className = "" }) => (
  <div className={`animate-shimmer rounded bg-slate-200/70 ${className}`} />
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div aria-busy="true" aria-label="Loading" className="divide-y divide-line">
    {Array.from({ length: rows }, (_, i) => (
      <div key={i} className="flex items-center gap-4 px-4 py-3">
        <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-2.5 w-1/5" />
        </div>
        <Skeleton className="hidden h-3 w-24 sm:block" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    ))}
  </div>
);

export default Skeleton;
