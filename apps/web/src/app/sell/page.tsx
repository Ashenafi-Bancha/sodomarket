import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/server/session';
import { getListingById } from '@/lib/server/listings';
import { ListingWizard } from '@/components/sell/ListingWizard';

export const metadata: Metadata = {
  title: 'List a Property or Vehicle',
  description: 'Advertise your property or vehicle for free on Wolaita Marketplace.',
};

export default async function SellPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const { edit } = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(edit ? `/sell?edit=${edit}` : '/sell')}`);

  let initial;
  if (edit) {
    initial = await getListingById(edit);
    if (!initial || (initial.author.id !== user.id && user.role !== 'ADMIN')) notFound();
  }

  return (
    <div className="container-page py-8 sm:py-12">
      <ListingWizard initial={initial ?? undefined} />
    </div>
  );
}
