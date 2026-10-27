import React from 'react';
import { ListingWizard } from '@/components/wizard/ListingWizard';

export const metadata = {
  title: 'Post a Listing in Wolaita Sodo',
  description: 'Submit your property or vehicle listing for free advertising on Wolaita Marketplace.',
};

export default function SellPage() {
  return <ListingWizard />;
}
