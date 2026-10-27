import type { Metadata } from 'next';
import { BrowseView } from '@/components/listing/BrowseView';
import { getT } from '@/lib/i18n-server';

export const metadata: Metadata = {
  title: 'Cars, Trucks & Motorcycles for Sale in Wolaita Sodo',
  description: 'Inspected cars, SUVs, pickups, trucks and motorcycles from owners and dealers in Wolaita Sodo.',
};

export default async function VehiclesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [{ t }, params] = await Promise.all([getT(), searchParams]);
  return (
    <BrowseView
      searchParams={params}
      lockAssetType="VEHICLE"
      basePath="/vehicles"
      title={t.browse.vehiclesTitle}
      subtitle={t.browse.vehiclesSubtitle}
    />
  );
}
