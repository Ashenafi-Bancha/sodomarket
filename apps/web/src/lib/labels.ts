import type { Dictionary } from '@/locales';
import type { ListingItem, Role } from './types';

/** Category label such as "House" or "Car / SUV". */
export function categoryLabel(listing: ListingItem, t: Dictionary) {
  if (listing.propertyDetails) return t.propertyType[listing.propertyDetails.propertyType];
  if (listing.vehicleDetails) return t.vehicleType[listing.vehicleDetails.vehicleType];
  return '';
}

/** "For Sale" / "For Rent" for properties; condition for vehicles. */
export function offerLabel(listing: ListingItem, t: Dictionary) {
  if (listing.propertyDetails) {
    return listing.propertyDetails.transactionType === 'FOR_RENT' ? t.filters.forRent : t.filters.forSale;
  }
  return t.filters.forSale;
}

export function sellerTypeLabel(role: Role | undefined, t: Dictionary) {
  if (role === 'BROKER') return t.common.broker;
  if (role === 'AGENCY_ADMIN') return t.common.dealer;
  return t.common.owner;
}

/** Sentence-case an ENUM_VALUE for places without a translation. */
export function humanize(value: string) {
  const s = value.replace(/_/g, ' ').toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}
