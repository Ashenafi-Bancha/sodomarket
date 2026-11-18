import 'server-only';
import type { Prisma } from '@prisma/client';
import { prisma } from './db';
import { listingInclude, mapListing, mapUser, userInclude } from './mappers';
import { isConnectionError, isDatabaseReady, markDatabaseDown } from './availability';
import * as demo from '@/lib/demo';
import {
  FILTER_FEATURES,
  FUEL_TYPES,
  PROPERTY_GROUP_KEYS,
  PROPERTY_GROUPS,
  PROPERTY_TYPES,
  TRANSMISSIONS,
  VEHICLE_TYPES,
  ZONE_NAMES,
} from '@/lib/constants';
import type {
  AssetType,
  FuelType,
  ListingItem,
  ListingSearchParams,
  ListingSearchResult,
  MarketStats,
  PropertyType,
  SortOption,
  TransactionType,
  TransmissionType,
  User,
  VehicleType,
} from '@/lib/types';

const DEFAULT_PAGE_SIZE = 12;

type RawParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;
const toInt = (v: string | undefined) => {
  if (!v) return undefined;
  const n = Number(v.replace(/[, ]/g, ''));
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : undefined;
};
const oneOf = <T extends string>(v: string | undefined, allowed: readonly T[]) =>
  v && (allowed as readonly string[]).includes(v) ? (v as T) : undefined;

/** "TITLE_DEED,WATER_TANK" → known filter features for the asset type. */
function parseFeatures(value: string | undefined, assetType: AssetType | undefined) {
  if (!value || !assetType) return undefined;
  const allowed: readonly string[] = FILTER_FEATURES[assetType];
  const list = [...new Set(value.split(','))].filter((f) => allowed.includes(f));
  return list.length ? list : undefined;
}

/** Turns URL search params into a validated search query. */
export function parseSearchParams(raw: RawParams, lockAssetType?: AssetType): ListingSearchParams {
  const assetType = lockAssetType ?? oneOf<AssetType>(first(raw.assetType), ['REAL_ESTATE', 'VEHICLE']);
  // A category is one type (HOUSE) or a whole property group (LAND).
  const propertyCategories: string[] = [...PROPERTY_GROUP_KEYS, ...PROPERTY_TYPES];
  const allowedCategories: string[] =
    assetType === 'VEHICLE'
      ? VEHICLE_TYPES
      : assetType === 'REAL_ESTATE'
        ? propertyCategories
        : [...propertyCategories, ...VEHICLE_TYPES];
  const zone = first(raw.zone);
  return {
    assetType,
    category: oneOf(first(raw.category), allowedCategories),
    zone: zone && ZONE_NAMES.includes(zone) ? zone : undefined,
    q: first(raw.q)?.slice(0, 100),
    transactionType: oneOf<TransactionType>(first(raw.transactionType), ['FOR_SALE', 'FOR_RENT']),
    minPrice: toInt(first(raw.minPrice)),
    maxPrice: toInt(first(raw.maxPrice)),
    bedrooms: toInt(first(raw.bedrooms)),
    transmission: oneOf<TransmissionType>(first(raw.transmission), TRANSMISSIONS),
    fuelType: oneOf<FuelType>(first(raw.fuelType), FUEL_TYPES),
    minYear: toInt(first(raw.minYear)),
    features: parseFeatures(first(raw.features), assetType),
    sort: oneOf<SortOption>(first(raw.sort), ['newest', 'price_asc', 'price_desc', 'popular']) ?? 'newest',
    page: Math.max(1, toInt(first(raw.page)) ?? 1),
  };
}

function buildWhere(p: ListingSearchParams): Prisma.ListingWhereInput {
  const asset: Prisma.AssetWhereInput = {};
  if (p.assetType) asset.assetType = p.assetType;
  if (p.zone) asset.location = { zone: p.zone };

  const property: Prisma.PropertyDetailsWhereInput = {};
  const vehicle: Prisma.VehicleDetailsWhereInput = {};

  if (p.category) {
    const group = PROPERTY_GROUPS.find((g) => g.key === p.category);
    if (group) property.propertyType = { in: group.types };
    else if ((PROPERTY_TYPES as string[]).includes(p.category)) property.propertyType = p.category as PropertyType;
    else vehicle.vehicleType = p.category as VehicleType;
  }
  if (p.transactionType) property.transactionType = p.transactionType;
  if (p.bedrooms) property.bedrooms = { gte: p.bedrooms };
  if (p.transmission) vehicle.transmission = p.transmission;
  if (p.fuelType) vehicle.fuelType = p.fuelType;
  if (p.minYear) vehicle.year = { gte: p.minYear };
  if (p.features?.length) {
    if (p.assetType === 'VEHICLE') vehicle.features = { hasEvery: p.features };
    else property.features = { hasEvery: p.features };
  }

  if (Object.keys(property).length) asset.propertyDetails = property;
  if (Object.keys(vehicle).length) asset.vehicleDetails = vehicle;

  const where: Prisma.ListingWhereInput = { status: 'PUBLISHED', asset };

  if (p.minPrice || p.maxPrice) {
    where.price = { ...(p.minPrice ? { gte: p.minPrice } : {}), ...(p.maxPrice ? { lte: p.maxPrice } : {}) };
  }

  if (p.q) {
    const words = p.q.split(/\s+/).filter(Boolean).slice(0, 5);
    where.AND = words.map((word) => {
      const c = { contains: word, mode: 'insensitive' as const };
      return {
        OR: [
          { title: c },
          { description: c },
          { asset: { location: { zone: c } } },
          { asset: { location: { landmark: c } } },
          { asset: { vehicleDetails: { make: c } } },
          { asset: { vehicleDetails: { model: c } } },
        ],
      };
    });
  }
  return where;
}

function buildOrder(sort: SortOption = 'newest'): Prisma.ListingOrderByWithRelationInput[] {
  switch (sort) {
    case 'price_asc':
      return [{ price: 'asc' }];
    case 'price_desc':
      return [{ price: 'desc' }];
    case 'popular':
      return [{ viewCount: 'desc' }, { publishedAt: 'desc' }];
    default:
      return [{ publishedAt: 'desc' }, { createdAt: 'desc' }];
  }
}

async function searchListingsLive(params: ListingSearchParams): Promise<ListingSearchResult> {
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const where = buildWhere(params);
  const total = await prisma.listing.count({ where });
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(params.page ?? 1, pageCount);
  const rows = await prisma.listing.findMany({
    where,
    include: listingInclude,
    orderBy: buildOrder(params.sort),
    skip: (page - 1) * pageSize,
    take: pageSize,
  });
  return { items: rows.map(mapListing), total, page, pageCount };
}

async function getFeaturedListingsLive(limit = 6): Promise<ListingItem[]> {
  const featured = await prisma.listing.findMany({
    where: { status: 'PUBLISHED', isFeatured: true },
    include: listingInclude,
    orderBy: { publishedAt: 'desc' },
    take: limit,
  });
  return featured.map(mapListing);
}

async function getRecentListingsLive(limit = 8, assetType?: AssetType): Promise<ListingItem[]> {
  const rows = await prisma.listing.findMany({
    where: { status: 'PUBLISHED', ...(assetType ? { asset: { assetType } } : {}) },
    include: listingInclude,
    orderBy: { publishedAt: 'desc' },
    take: limit,
  });
  return rows.map(mapListing);
}

async function getListingBySlugLive(slug: string): Promise<ListingItem | null> {
  const row = await prisma.listing.findUnique({ where: { slug }, include: listingInclude });
  return row ? mapListing(row) : null;
}

export async function getListingById(id: string): Promise<ListingItem | null> {
  const row = await prisma.listing.findUnique({ where: { id }, include: listingInclude });
  return row ? mapListing(row) : null;
}

async function recordViewLive(listingId: string) {
  await prisma.listing.update({ where: { id: listingId }, data: { viewCount: { increment: 1 } } }).catch(() => {});
}

async function getSimilarListingsLive(listing: ListingItem, limit = 4): Promise<ListingItem[]> {
  const category = listing.propertyDetails?.propertyType ?? listing.vehicleDetails?.vehicleType;
  const base: Prisma.ListingWhereInput = {
    status: 'PUBLISHED',
    id: { not: listing.id },
    asset: { assetType: listing.assetType },
  };
  const sameCategory: Prisma.ListingWhereInput =
    listing.assetType === 'REAL_ESTATE'
      ? { ...base, asset: { assetType: 'REAL_ESTATE', propertyDetails: { propertyType: category as PropertyType } } }
      : { ...base, asset: { assetType: 'VEHICLE', vehicleDetails: { vehicleType: category as VehicleType } } };

  const close = await prisma.listing.findMany({ where: sameCategory, include: listingInclude, take: limit, orderBy: { viewCount: 'desc' } });
  if (close.length >= limit) return close.map(mapListing);
  const more = await prisma.listing.findMany({
    where: { ...base, id: { notIn: [listing.id, ...close.map((c) => c.id)] } },
    include: listingInclude,
    take: limit - close.length,
    orderBy: { publishedAt: 'desc' },
  });
  return [...close, ...more].map(mapListing);
}

async function getMarketStatsLive(): Promise<MarketStats> {
  const published = { listings: { some: { status: 'PUBLISHED' as const } } };
  const propertyCount = await prisma.listing.count({ where: { status: 'PUBLISHED', asset: { assetType: 'REAL_ESTATE' } } });
  const vehicleCount = await prisma.listing.count({ where: { status: 'PUBLISHED', asset: { assetType: 'VEHICLE' } } });
  const propertyGroups = await prisma.propertyDetails.groupBy({ by: ['propertyType'], where: { asset: published }, _count: { _all: true } });
  const vehicleGroups = await prisma.vehicleDetails.groupBy({ by: ['vehicleType'], where: { asset: published }, _count: { _all: true } });
  const zoneGroups = await prisma.location.groupBy({ by: ['zone'], where: { assets: { some: published } }, _count: { _all: true } });
  const verifiedSellers = await prisma.user.count({ where: { isActive: true, profile: { idVerified: true }, listings: { some: { status: 'PUBLISHED' } } } });
  const byCategory: Record<string, number> = {};
  for (const g of propertyGroups) byCategory[g.propertyType] = g._count._all;
  for (const g of vehicleGroups) byCategory[g.vehicleType] = g._count._all;
  const byZone: Record<string, number> = {};
  for (const g of zoneGroups) byZone[g.zone] = g._count._all;
  return {
    totalListings: propertyCount + vehicleCount,
    propertyCount,
    vehicleCount,
    verifiedSellers,
    byCategory,
    byZone,
  };
}

async function getFavoriteIdsLive(userId: string | undefined): Promise<string[]> {
  if (!userId) return [];
  const rows = await prisma.favorite.findMany({ where: { userId }, select: { listingId: true } });
  return rows.map((r) => r.listingId);
}

export interface BrokerProfile {
  user: User;
  agencyName?: string;
  agencyVerified?: boolean;
  listingCount: number;
  specialties: AssetType[];
}

async function getBrokersLive(): Promise<BrokerProfile[]> {
  const rows = await prisma.user.findMany({
    where: { isActive: true, role: { in: ['BROKER', 'AGENCY_ADMIN'] } },
    include: {
      ...userInclude,
      agencyMembers: { include: { agency: true } },
      listings: { where: { status: 'PUBLISHED' }, select: { asset: { select: { assetType: true } } } },
    },
    orderBy: { createdAt: 'asc' },
  });
  return rows
    .map((r) => {
      const agency = r.agencyMembers[0]?.agency;
      const types = new Set(r.listings.map((l) => l.asset.assetType));
      return {
        user: { ...mapUser(r), email: '' },
        agencyName: agency?.name,
        agencyVerified: agency?.isVerified,
        listingCount: r.listings.length,
        specialties: [...types],
      };
    })
    .sort((a, b) => Number(b.user.idVerified) - Number(a.user.idVerified) || b.listingCount - a.listingCount);
}

export interface SellerProfile {
  user: User;
  agencyName?: string;
  agencyVerified?: boolean;
  listings: ListingItem[];
  completedCount: number;
}

async function getSellerProfileLive(id: string): Promise<SellerProfile | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const row = await prisma.user.findFirst({
    where: { id, isActive: true },
    include: { ...userInclude, agencyMembers: { include: { agency: true } } },
  });
  if (!row) return null;
  const [listings, completedCount] = await Promise.all([
    prisma.listing.findMany({
      where: { authorId: id, status: 'PUBLISHED' },
      include: listingInclude,
      orderBy: { publishedAt: 'desc' },
      take: 60,
    }),
    prisma.listing.count({ where: { authorId: id, status: { in: ['SOLD', 'RENTED'] } } }),
  ]);
  const agency = row.agencyMembers[0]?.agency;
  return {
    user: { ...mapUser(row), email: '' },
    agencyName: agency?.name,
    agencyVerified: agency?.isVerified,
    listings: listings.map(mapListing),
    completedCount,
  };
}

/** URL-safe, unique slug for a new listing. */
export async function uniqueSlug(title: string): Promise<string> {
  const base =
    title
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'listing';
  for (let i = 0; i < 5; i++) {
    const slug = `${base}-${Math.random().toString(36).slice(2, 7)}`;
    const exists = await prisma.listing.findUnique({ where: { slug }, select: { id: true } });
    if (!exists) return slug;
  }
  return `${base}-${Date.now().toString(36)}`;
}

// ─── Public API: live data, or the sample catalogue while the database isn't ready ───

async function withPreview<T>(live: () => Promise<T>, preview: () => T): Promise<T> {
  if (!(await isDatabaseReady())) return preview();
  try {
    return await live();
  } catch (error) {
    if (!isConnectionError(error)) throw error;
    markDatabaseDown(error);
    return preview();
  }
}

export const searchListings = (params: ListingSearchParams) =>
  withPreview(() => searchListingsLive(params), () => demo.demoSearch(params, DEFAULT_PAGE_SIZE));

export const getFeaturedListings = (limit = 6) =>
  withPreview(() => getFeaturedListingsLive(limit), () => demo.demoFeatured(limit));

export const getRecentListings = (limit = 8, assetType?: AssetType) =>
  withPreview(() => getRecentListingsLive(limit, assetType), () => demo.demoRecent(limit, assetType));

/** Returns a listing in any status; callers decide who may see unpublished ones. */
export const getListingBySlug = (slug: string) => withPreview(() => getListingBySlugLive(slug), () => demo.demoBySlug(slug));

export const recordView = (listingId: string) => withPreview(() => recordViewLive(listingId), () => undefined);

export const getSimilarListings = (listing: ListingItem, limit = 4) =>
  withPreview(() => getSimilarListingsLive(listing, limit), () => demo.demoSimilar(listing, limit));

export const getMarketStats = () => withPreview(() => getMarketStatsLive(), () => demo.demoStats());

export const getFavoriteIds = (userId: string | undefined) => withPreview(() => getFavoriteIdsLive(userId), () => [] as string[]);

export const getBrokers = () => withPreview(() => getBrokersLive(), () => demo.demoBrokers());

/** Public profile of a seller with their live ads (null if unknown or suspended). */
export const getSellerProfile = (id: string) => withPreview(() => getSellerProfileLive(id), () => demo.demoSeller(id));
