export default function Loading() {
  return (
    <div className="p-4">
      {/* Hero skeleton */}
      <div className="h-48 skeleton rounded-2xl mb-4" />
      {/* Filter bar skeleton */}
      <div className="h-20 skeleton rounded-xl mb-4" />
      {/* Masonry grid skeleton */}
      <div className="masonry">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="masonry-item">
            <div className="rounded-2xl overflow-hidden border border-white/5">
              <div className="skeleton" style={{ height: `${180 + (i % 3) * 60}px` }} />
              <div className="p-3 space-y-2">
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
