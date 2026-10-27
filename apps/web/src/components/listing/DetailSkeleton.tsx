export function DetailSkeleton() {
  return (
    <div className="container-page pt-4 sm:pt-8" aria-busy="true">
      <div className="skeleton h-[min(62vh,520px)] rounded-3xl" />
      <div className="mt-8 grid gap-10 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <div className="skeleton h-6 w-40 rounded-full" />
          <div className="skeleton h-10 w-3/4 rounded-xl" />
          <div className="skeleton h-5 w-1/2 rounded-lg" />
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-[72px] rounded-2xl" />
            ))}
          </div>
        </div>
        <div className="skeleton h-96 rounded-3xl lg:col-span-4" />
      </div>
    </div>
  );
}
