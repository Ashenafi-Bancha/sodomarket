import type { Metadata } from 'next';
import { BrowseView } from '@/components/listing/BrowseView';
import { getT } from '@/lib/i18n-server';

export const metadata: Metadata = {
  title: 'Search Listings',
  description: 'Search properties and vehicles.',
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [{ t }, params] = await Promise.all([getT(), searchParams]);
  return (
    <BrowseView searchParams={params} basePath="/search" title={t.browse.searchTitle} subtitle={t.browse.searchSubtitle} />
  );
}
