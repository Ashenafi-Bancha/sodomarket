import Link from 'next/link';
import { ChevronLeft, ChevronRight, SearchX } from 'lucide-react';
import type { AssetType } from '@/lib/types';
import { getT } from '@/lib/i18n-server';
import { fmt } from '@/locales';
import { getCurrentUser } from '@/lib/server/session';
import { getFavoriteIds, parseSearchParams, searchListings } from '@/lib/server/listings';
import { ListingGrid } from './ListingCard';
import { FilterPanel } from './FilterPanel';
import { BrowseToolbar } from './BrowseToolbar';
import { EmptyState } from '@/components/ui/Misc';
import { ButtonLink } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

type RawParams = Record<string, string | string[] | undefined>;

export async function BrowseView({
  searchParams,
  lockAssetType,
  basePath,
  title,
  subtitle,
}: {
  searchParams: RawParams;
  lockAssetType?: AssetType;
  basePath: string;
  title: string;
  subtitle: string;
}) {
  const [{ t }, user] = await Promise.all([getT(), getCurrentUser()]);
  const params = parseSearchParams(searchParams, lockAssetType);
  const [result, savedIds] = await Promise.all([searchListings(params), getFavoriteIds(user?.id)]);

  const pageHref = (page: number) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      const value = Array.isArray(v) ? v[0] : v;
      if (value && k !== 'page') qs.set(k, value);
    }
    if (page > 1) qs.set('page', String(page));
    const s = qs.toString();
    return `${basePath}${s ? `?${s}` : ''}`;
  };

  return (
    <div className="container-page py-8 sm:py-12">
      <header className="mb-8">
        <nav className="mb-3 text-sm text-ink-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-ink-900">
            {t.common.home}
          </Link>
          <span className="mx-2 text-ink-300">/</span>
          <span className="text-ink-700">{title}</span>
        </nav>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
          {title}
          {params.q && (
            <span className="text-ink-400">
              {' '}
              {t.browse.resultsFor} “{params.q}”
            </span>
          )}
        </h1>
        <p className="mt-2 text-[15px] text-ink-500">{subtitle}</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-3xl bg-white p-5 ring-1 ring-ink-100">
            <FilterPanel lockAssetType={lockAssetType} />
          </div>
        </aside>

        <div className="min-w-0">
          <BrowseToolbar total={result.total} lockAssetType={lockAssetType} />

          {result.items.length === 0 ? (
            <EmptyState
              icon={<SearchX className="h-7 w-7" />}
              title={t.home.emptyListingsTitle}
              description={t.home.emptyListingsDesc}
              action={
                <div className="flex flex-wrap justify-center gap-3">
                  <ButtonLink href={basePath} variant="outline">
                    {t.filters.clearAll}
                  </ButtonLink>
                  <ButtonLink href="/sell" variant="primary">
                    {t.home.postListingCta}
                  </ButtonLink>
                </div>
              }
            />
          ) : (
            <ListingGrid listings={result.items} savedIds={savedIds} className="xl:grid-cols-3" />
          )}

          {result.pageCount > 1 && (
            <nav className="mt-10 flex items-center justify-between gap-4" aria-label="Pagination">
              <PageLink href={pageHref(result.page - 1)} disabled={result.page <= 1}>
                <ChevronLeft className="h-4 w-4" /> {t.browse.previous}
              </PageLink>
              <span className="text-sm text-ink-500">{fmt(t.browse.pageOf, { page: result.page, pages: result.pageCount })}</span>
              <PageLink href={pageHref(result.page + 1)} disabled={result.page >= result.pageCount}>
                {t.browse.next} <ChevronRight className="h-4 w-4" />
              </PageLink>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}

function PageLink({ href, disabled, children }: { href: string; disabled: boolean; children: React.ReactNode }) {
  const cls = 'inline-flex h-11 items-center gap-1.5 rounded-xl border px-4 text-sm font-semibold';
  if (disabled) return <span className={cn(cls, 'border-ink-100 text-ink-300')}>{children}</span>;
  return (
    <Link href={href} className={cn(cls, 'border-ink-200 bg-white text-ink-800 hover:bg-ink-50')}>
      {children}
    </Link>
  );
}
