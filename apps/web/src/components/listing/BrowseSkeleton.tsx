import { ListingCardSkeleton } from './ListingCard';

export function BrowseSkeleton() {
  return (
    <div className="container-page py-8 sm:py-12" aria-busy="true">
      <div className="skeleton mb-3 h-4 w-32 rounded-lg" />
      <div className="skeleton h-10 w-2/3 max-w-md rounded-xl" />
      <div className="skeleton mt-3 h-4 w-1/2 max-w-sm rounded-lg" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
        <div className="skeleton hidden h-[560px] rounded-3xl lg:block" />
        <div>
          <div className="skeleton mb-6 h-10 w-full rounded-xl" />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ListingCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
