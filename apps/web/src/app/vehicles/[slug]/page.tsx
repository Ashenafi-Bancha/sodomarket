import { ListingDetail, listingMetadata } from '@/components/listing/ListingDetail';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  return listingMetadata((await params).slug);
}

export default async function VehicleDetailPage({ params }: Props) {
  const { slug } = await params;
  return <ListingDetail slug={slug} expected="VEHICLE" />;
}
