export default function MemeLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="skeleton h-6 w-24 rounded-lg mb-6" />
      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        <div>
          <div className="skeleton rounded-2xl aspect-video mb-6" />
          <div className="skeleton h-6 w-3/4 rounded-lg mb-2" />
          <div className="skeleton h-6 w-1/2 rounded-lg mb-6" />
          <div className="flex gap-3 mb-6">
            {[1,2,3,4].map(i => <div key={i} className="skeleton h-10 w-24 rounded-xl" />)}
          </div>
        </div>
        <div className="space-y-4">
          <div className="skeleton rounded-2xl h-48" />
          <div className="skeleton rounded-2xl h-64" />
        </div>
      </div>
    </div>
  );
}
