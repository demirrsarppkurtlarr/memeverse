export function MemeCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-white/5 bg-white/[0.02] animate-pulse">
      <div className="skeleton w-full" style={{ paddingBottom: "75%" }} />
      <div className="p-3 space-y-2.5">
        <div className="skeleton h-3.5 w-4/5 rounded-md" />
        <div className="skeleton h-3 w-3/5 rounded-md" />
        <div className="flex gap-1.5 pt-1">
          <div className="skeleton h-5 w-14 rounded-full" />
          <div className="skeleton h-5 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="glass rounded-2xl p-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="skeleton w-16 h-16 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-6 w-40 rounded-lg" />
          <div className="skeleton h-4 w-24 rounded-lg" />
          <div className="skeleton h-4 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
