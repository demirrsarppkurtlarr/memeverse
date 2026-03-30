export default function CategoriesLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="skeleton h-12 w-48 rounded-lg mb-8" />
      <div className="grid sm:grid-cols-2 gap-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="skeleton rounded-2xl h-40" />
        ))}
      </div>
    </div>
  );
}
