export function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex justify-between items-start pb-5 border-b border-gray-200">
        <div className="space-y-2">
          <div className="h-4 w-48 bg-gray-200 rounded-md" />
          <div className="h-3 w-72 bg-gray-100 rounded-md" />
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded-xl" />
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-3 w-20 bg-gray-200 rounded" />
              <div className="w-9 h-9 bg-gray-100 rounded-xl" />
            </div>
            <div className="h-7 w-24 bg-gray-200 rounded" />
            <div className="h-3 w-32 bg-gray-100 rounded" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="h-4 w-48 bg-gray-200 rounded" />
        </div>
        <div className="divide-y divide-gray-50">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4">
              <div className="w-8 h-8 bg-gray-100 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-40 bg-gray-200 rounded" />
                <div className="h-3 w-28 bg-gray-100 rounded" />
              </div>
              <div className="h-6 w-20 bg-gray-100 rounded-full" />
              <div className="h-8 w-16 bg-gray-100 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
