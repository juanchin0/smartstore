export function StoreCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="h-40 shimmer" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-3/4 shimmer rounded-lg" />
        <div className="h-3.5 w-full shimmer rounded-lg" />
        <div className="h-3.5 w-5/6 shimmer rounded-lg" />
        <div className="flex gap-1.5 pt-1">
          <div className="h-5 w-16 shimmer rounded-full" />
          <div className="h-5 w-20 shimmer rounded-full" />
        </div>
        <div className="h-9 w-full shimmer rounded-lg mt-4" />
      </div>
    </div>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="aspect-square shimmer" />
      <div className="p-4 space-y-2.5">
        <div className="h-4 w-full shimmer rounded-lg" />
        <div className="h-4 w-4/5 shimmer rounded-lg" />
        <div className="flex gap-0.5 pt-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-3.5 w-3.5 shimmer rounded" />
          ))}
        </div>
        <div className="h-6 w-24 shimmer rounded-lg pt-1" />
        <div className="flex gap-2 pt-1">
          <div className="flex-1 h-8 shimmer rounded-lg" />
          <div className="h-8 w-16 shimmer rounded-lg" />
        </div>
      </div>
    </div>
  )
}
