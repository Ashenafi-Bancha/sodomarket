import { SearchX } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
        <SearchX className="h-8 w-8" />
      </span>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-ink-900">Page not found</h1>
      <p className="mt-2 max-w-md text-[15px] text-ink-500">
        This listing may have been sold, rented or removed. Try searching for something similar.
      </p>
      <div className="mt-8 flex gap-3">
        <ButtonLink href="/search">Search listings</ButtonLink>
        <ButtonLink href="/" variant="outline">
          Go home
        </ButtonLink>
      </div>
    </div>
  );
}
