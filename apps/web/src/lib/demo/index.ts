/**
 * Preview data: the sample catalogue shaped like real database results, with the
 * same search, filter and sort rules. Used only while the database is not ready.
 */
import { PROPERTY_GROUPS, PROPERTY_TYPES } from '@/lib/constants';
import { platformConfig } from '@/lib/config';
import type { AssetType, ListingItem, ListingSearchParams, ListingSearchResult, MarketStats, User } from '@/lib/types';
import type { BrokerProfile, SellerProfile } from '@/lib/server/listings';
import { AGENCIES, FEATURES, LISTINGS, SELLERS, imageUrl, type SellerKey } from './catalogue';

const DAY = 86_400_000;
const LOADED_AT = Date.now();
const daysAgo = (n: number) => new Date(LOADED_AT - n * DAY).toISOString();

const SELLER_KEYS = Object.keys(SELLERS) as SellerKey[];
// Stable UUID-shaped ids, so links such as /sellers/:id keep working.
const sellerId = (key: SellerKey) => `00000000-0000-4000-8000-${String(SELLER_KEYS.indexOf(key) + 1).padStart(12, '0')}`;
const listingId = (i: number) => `00000000-0000-4000-9000-${String(i + 1).padStart(12, '0')}`;

// Sample sellers' numbers are not real, so calls and WhatsApp go to the platform's support line.
const supportPhone = platformConfig.supportPhone.replace(/\s+/g, '');

const USERS: Record<SellerKey, User> = Object.fromEntries(
  SELLER_KEYS.map((key) => {
    const s = SELLERS[key];
    const user: User = {
      id: sellerId(key),
      email: '',
      phone: supportPhone,
      role: s.role,
      fullName: s.fullName,
      businessName: s.businessName,
      bio: s.bio,
      licenseNumber: s.licenseNumber,
      idVerified: s.idVerified,
      preferredLocale: s.preferredLocale,
      isActive: true,
      createdAt: daysAgo(s.joinedDaysAgo),
    };
    return [key, user];
  })
) as Record<SellerKey, User>;

const ALL: ListingItem[] = LISTINGS.map((l, i) => {
  const id = listingId(i);
  const status = l.status ?? 'PUBLISHED';
  const published = status === 'PUBLISHED';
  const agency = l.agency ? AGENCIES[l.agency] : undefined;
  return {
    id,
    assetType: l.vehicle ? 'VEHICLE' : 'REAL_ESTATE',
    title: l.title,
    slug: l.slug,
    description: l.description,
    price: l.price,
    currency: 'ETB',
    isNegotiable: l.isNegotiable ?? true,
    status,
    location: { id: `${id}-loc`, city: 'Wolaita Sodo', zone: l.zone, kebele: l.kebele, landmark: l.landmark },
    propertyDetails: l.property
      ? {
          ...l.property,
          furnishing: l.property.furnishing ?? 'UNFURNISHED',
          waterConnected: l.property.waterConnected ?? true,
          electricityConnected: l.property.electricityConnected ?? true,
          parkingSpaces: l.property.parkingSpaces ?? 0,
          features: FEATURES[l.slug] ?? [],
        }
      : undefined,
    vehicleDetails: l.vehicle ? { ...l.vehicle, features: FEATURES[l.slug] ?? [] } : undefined,
    media: l.images.map((im, j) => ({ id: `${id}-m${j}`, url: imageUrl(im.id), caption: im.caption, isPrimary: j === 0, order: j })),
    author: USERS[l.author],
    agency: agency ? { id: `demo-agency-${l.agency}`, name: agency.name, isVerified: true } : undefined,
    ownerDeclaration: l.ownerDeclaration,
    isFeatured: l.isFeatured ?? false,
    viewCount: l.viewCount ?? 0,
    favoriteCount: 0,
    leadCount: 0,
    publishedAt: published ? daysAgo(l.publishedDaysAgo ?? 0) : undefined,
    createdAt: daysAgo((l.publishedDaysAgo ?? 0) + 1),
    updatedAt: daysAgo(l.publishedDaysAgo ?? 0),
  };
});

const PUBLISHED = ALL.filter((l) => l.status === 'PUBLISHED');
const newestFirst = (a: ListingItem, b: ListingItem) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? '');
const categoryOf = (l: ListingItem) => l.propertyDetails?.propertyType ?? l.vehicleDetails?.vehicleType;

function matches(l: ListingItem, p: ListingSearchParams): boolean {
  const pd = l.propertyDetails;
  const vd = l.vehicleDetails;
  if (p.assetType && l.assetType !== p.assetType) return false;
  if (p.zone && l.location.zone !== p.zone) return false;
  if (p.category) {
    const group = PROPERTY_GROUPS.find((g) => g.key === p.category);
    if (group) {
      if (!pd || !group.types.includes(pd.propertyType)) return false;
    } else if ((PROPERTY_TYPES as string[]).includes(p.category)) {
      if (pd?.propertyType !== p.category) return false;
    } else if (vd?.vehicleType !== p.category) return false;
  }
  if (p.transactionType && pd?.transactionType !== p.transactionType) return false;
  if (p.bedrooms && (pd?.bedrooms ?? 0) < p.bedrooms) return false;
  if (p.transmission && vd?.transmission !== p.transmission) return false;
  if (p.fuelType && vd?.fuelType !== p.fuelType) return false;
  if (p.minYear && (vd?.year ?? 0) < p.minYear) return false;
  if (p.features?.length) {
    const have = (p.assetType === 'VEHICLE' ? vd?.features : pd?.features) ?? [];
    if (!p.features.every((f) => have.includes(f))) return false;
  }
  if (p.minPrice && l.price < p.minPrice) return false;
  if (p.maxPrice && l.price > p.maxPrice) return false;
  if (p.q) {
    const text = [l.title, l.description, l.location.zone, l.location.landmark, vd?.make, vd?.model].join(' ').toLowerCase();
    const words = p.q.toLowerCase().split(/\s+/).filter(Boolean).slice(0, 5);
    if (!words.every((w) => text.includes(w))) return false;
  }
  return true;
}

export function demoSearch(params: ListingSearchParams, defaultPageSize: number): ListingSearchResult {
  const pageSize = params.pageSize ?? defaultPageSize;
  const found = PUBLISHED.filter((l) => matches(l, params));
  switch (params.sort) {
    case 'price_asc':
      found.sort((a, b) => a.price - b.price);
      break;
    case 'price_desc':
      found.sort((a, b) => b.price - a.price);
      break;
    case 'popular':
      found.sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0) || newestFirst(a, b));
      break;
    default:
      found.sort(newestFirst);
  }
  const pageCount = Math.max(1, Math.ceil(found.length / pageSize));
  const page = Math.min(params.page ?? 1, pageCount);
  return { items: found.slice((page - 1) * pageSize, page * pageSize), total: found.length, page, pageCount };
}

export function demoFeatured(limit: number): ListingItem[] {
  return PUBLISHED.filter((l) => l.isFeatured).sort(newestFirst).slice(0, limit);
}

export function demoRecent(limit: number, assetType?: AssetType): ListingItem[] {
  return PUBLISHED.filter((l) => !assetType || l.assetType === assetType)
    .sort(newestFirst)
    .slice(0, limit);
}

/** Only published samples are shown; the review-queue examples stay hidden. */
export function demoBySlug(slug: string): ListingItem | null {
  return PUBLISHED.find((l) => l.slug === slug) ?? null;
}

export function demoSimilar(listing: ListingItem, limit: number): ListingItem[] {
  const others = PUBLISHED.filter((l) => l.id !== listing.id && l.assetType === listing.assetType);
  const same = others.filter((l) => categoryOf(l) === categoryOf(listing)).sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0));
  const rest = others.filter((l) => !same.includes(l)).sort(newestFirst);
  return [...same, ...rest].slice(0, limit);
}

export function demoStats(): MarketStats {
  const byCategory: Record<string, number> = {};
  const byZone: Record<string, number> = {};
  for (const l of PUBLISHED) {
    const c = categoryOf(l);
    if (c) byCategory[c] = (byCategory[c] ?? 0) + 1;
    byZone[l.location.zone] = (byZone[l.location.zone] ?? 0) + 1;
  }
  const propertyCount = PUBLISHED.filter((l) => l.assetType === 'REAL_ESTATE').length;
  const sellers = new Set(PUBLISHED.filter((l) => l.author.idVerified).map((l) => l.author.id));
  return {
    totalListings: PUBLISHED.length,
    propertyCount,
    vehicleCount: PUBLISHED.length - propertyCount,
    verifiedSellers: sellers.size,
    byCategory,
    byZone,
  };
}

const agencyOf = (key: SellerKey) => Object.values(AGENCIES).find((a) => a.owner === key);

export function demoBrokers(): BrokerProfile[] {
  return SELLER_KEYS.filter((key) => SELLERS[key].role === 'BROKER' || SELLERS[key].role === 'AGENCY_ADMIN').map((key) => {
    const mine = PUBLISHED.filter((l) => l.author.id === USERS[key].id);
    return {
      user: USERS[key],
      agencyName: agencyOf(key)?.name,
      agencyVerified: agencyOf(key) ? true : undefined,
      listingCount: mine.length,
      specialties: [...new Set(mine.map((l) => l.assetType))],
    };
  });
}

export function demoSeller(id: string): SellerProfile | null {
  const key = SELLER_KEYS.find((k) => USERS[k].id === id);
  if (!key) return null;
  return {
    user: USERS[key],
    agencyName: agencyOf(key)?.name,
    agencyVerified: agencyOf(key) ? true : undefined,
    listings: PUBLISHED.filter((l) => l.author.id === id).sort(newestFirst),
    completedCount: 0,
  };
}
