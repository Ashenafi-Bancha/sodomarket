import type { Metadata } from 'next';
import { BrowseView } from '@/components/listing/BrowseView';
import { getT } from '@/lib/i18n-server';

export const metadata: Metadata = {
  title: 'Properties for Sale & Rent in Wolaita Sodo',
  description: 'Houses, apartments, land, shops, offices and warehouses for sale or rent in Wolaita Sodo.',
};

export default async function PropertiesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [{ t }, params] = await Promise.all([getT(), searchParams]);
  return (
    <BrowseView
      searchParams={params}
      lockAssetType="REAL_ESTATE"
      basePath="/properties"
      title={t.browse.propertiesTitle}
      subtitle={t.browse.propertiesSubtitle}
    />
  );
}
