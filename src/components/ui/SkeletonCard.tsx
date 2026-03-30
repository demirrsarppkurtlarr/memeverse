export function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden border border-white/5 bg-white/2">
      <div className="skeleton aspect-video w-full" />
      <div className="p-3 space-y-2">
        <div className="skeleton h-4 w-3/4 rounded-lg" />
        <div className="skeleton h-3 w-1/2 rounded-lg" />
        <div className="flex gap-2 mt-2">
          <div className="skeleton h-5 w-16 rounded-full" />
          <div className="skeleton h-5 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonText({ width = "100%" }: { width?: string }) {
  return (
    <div className="skeleton h-4 rounded-lg" style={{ width }} />
  );
}

export function SoundSkeleton() {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/2 p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="skeleton w-10 h-10 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-3/4 rounded-lg" />
          <div className="skeleton h-3 w-1/2 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
