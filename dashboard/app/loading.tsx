export default function Loading() {
  return (
    <div className="space-y-6 px-6 pt-20 lg:px-10 lg:pt-10">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200/70" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200/60" />)}
      </div>
      <div className="h-80 animate-pulse rounded-2xl bg-slate-200/60" />
    </div>
  );
}
