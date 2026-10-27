import 'server-only';
import type { Prisma } from '@prisma/client';
import type {
  AppointmentItem,
  AuditLogItem,
  DealItem,
  LeadItem,
  ListingItem,
  ReportItem,
  User,
} from '@/lib/types';

export const userInclude = { profile: true } satisfies Prisma.UserInclude;
export type DbUser = Prisma.UserGetPayload<{ include: typeof userInclude }>;

export const listingInclude = {
  asset: { include: { location: true, propertyDetails: true, vehicleDetails: true } },
  author: { include: userInclude },
  agency: true,
  media: { orderBy: { order: 'asc' } },
  _count: { select: { favorites: true, leads: true } },
} satisfies Prisma.ListingInclude;
export type DbListing = Prisma.ListingGetPayload<{ include: typeof listingInclude }>;

const num = (v: Prisma.Decimal | number | null | undefined) => (v == null ? undefined : Number(v));
const iso = (d: Date | null | undefined) => (d ? d.toISOString() : undefined);
const opt = <T,>(v: T | null | undefined) => (v == null ? undefined : v);

export function mapUser(u: DbUser): User {
  return {
    id: u.id,
    email: u.email,
    phone: u.phone,
    role: u.role,
    fullName: u.profile?.fullName ?? u.email,
    businessName: opt(u.profile?.businessName),
    bio: opt(u.profile?.bio),
    licenseNumber: opt(u.profile?.licenseNumber),
    idVerified: u.profile?.idVerified ?? false,
    avatarUrl: opt(u.profile?.avatarUrl),
    preferredLocale: u.profile?.preferredLocale,
    isActive: u.isActive,
    createdAt: iso(u.createdAt),
  };
}

/** Public view of a seller: hides email for privacy. */
function mapPublicAuthor(u: DbUser): User {
  const user = mapUser(u);
  return { ...user, email: '' };
}

export function mapListing(l: DbListing): ListingItem {
  const loc = l.asset.location;
  const p = l.asset.propertyDetails;
  const v = l.asset.vehicleDetails;
  return {
    id: l.id,
    assetType: l.asset.assetType,
    title: l.title,
    slug: l.slug,
    description: l.description,
    price: Number(l.price),
    currency: l.currency,
    isNegotiable: l.isNegotiable,
    status: l.status,
    location: {
      id: loc.id,
      city: loc.city,
      zone: loc.zone,
      kebele: opt(loc.kebele),
      landmark: opt(loc.landmark),
    },
    propertyDetails: p
      ? {
          propertyType: p.propertyType,
          transactionType: p.transactionType,
          bedrooms: opt(p.bedrooms),
          bathrooms: opt(p.bathrooms),
          areaSqM: opt(p.areaSqM),
          compoundSizeSqM: opt(p.compoundSizeSqM),
          furnishing: p.furnishing,
          waterConnected: p.waterConnected,
          electricityConnected: p.electricityConnected,
          parkingSpaces: opt(p.parkingSpaces),
        }
      : undefined,
    vehicleDetails: v
      ? {
          vehicleType: v.vehicleType,
          make: v.make,
          model: v.model,
          year: v.year,
          mileageKm: opt(v.mileageKm),
          transmission: v.transmission,
          fuelType: v.fuelType,
          condition: v.condition,
          plateCode: opt(v.plateCode),
        }
      : undefined,
    media: l.media.map((m) => ({
      id: m.id,
      url: m.url,
      caption: opt(m.caption),
      isPrimary: m.isPrimary,
      order: m.order,
    })),
    author: mapPublicAuthor(l.author),
    agency: l.agency ? { id: l.agency.id, name: l.agency.name, isVerified: l.agency.isVerified } : undefined,
    ownerDeclaration: opt(l.asset.ownerDeclaration),
    rejectionReason: opt(l.rejectionReason),
    moderationNotes: opt(l.moderationNotes),
    isFeatured: l.isFeatured,
    viewCount: l.viewCount,
    favoriteCount: l._count.favorites,
    leadCount: l._count.leads,
    publishedAt: iso(l.publishedAt),
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
  };
}

const listingSummary = {
  select: {
    id: true,
    title: true,
    slug: true,
    asset: { select: { assetType: true } },
    media: { where: { isPrimary: true }, take: 1, select: { url: true } },
  },
} as const;

export const leadInclude = { listing: listingSummary } satisfies Prisma.LeadInclude;
export type DbLead = Prisma.LeadGetPayload<{ include: typeof leadInclude }>;

export function mapLead(l: DbLead): LeadItem {
  return {
    id: l.id,
    listingId: opt(l.listingId),
    listingTitle: l.listing?.title,
    listingSlug: l.listing?.slug,
    listingAssetType: l.listing?.asset.assetType,
    listingImage: l.listing?.media[0]?.url,
    customerName: l.customerName,
    customerPhone: l.customerPhone,
    customerEmail: opt(l.customerEmail),
    budgetMin: num(l.budgetMin),
    budgetMax: num(l.budgetMax),
    message: l.message,
    source: l.source,
    stage: l.stage,
    notes: opt(l.notes),
    nextFollowUpAt: iso(l.nextFollowUpAt),
    assignedBrokerId: opt(l.assignedUserId),
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
  };
}

export const appointmentInclude = { listing: listingSummary } satisfies Prisma.AppointmentInclude;
export type DbAppointment = Prisma.AppointmentGetPayload<{ include: typeof appointmentInclude }>;

export function mapAppointment(a: DbAppointment): AppointmentItem {
  return {
    id: a.id,
    leadId: opt(a.leadId),
    listingId: opt(a.listingId),
    listingTitle: a.listing?.title,
    listingSlug: a.listing?.slug,
    listingAssetType: a.listing?.asset.assetType,
    brokerId: a.brokerId,
    title: a.title,
    scheduledAt: a.scheduledAt.toISOString(),
    status: a.status,
    locationNotes: opt(a.locationNotes),
    outcomeNotes: opt(a.outcomeNotes),
    createdAt: a.createdAt.toISOString(),
  };
}

export const dealInclude = { listing: listingSummary } satisfies Prisma.DealInclude;
export type DbDeal = Prisma.DealGetPayload<{ include: typeof dealInclude }>;

export function mapDeal(d: DbDeal): DealItem {
  return {
    id: d.id,
    listingId: d.listingId,
    listingTitle: d.listing.title,
    leadId: opt(d.leadId),
    brokerId: d.brokerId,
    agreedPrice: Number(d.agreedPrice),
    currency: d.currency,
    commissionExpected: num(d.commissionExpected),
    commissionPaid: num(d.commissionPaid),
    status: d.status,
    notes: opt(d.notes),
    createdAt: d.createdAt.toISOString(),
  };
}

export const reportInclude = { listing: listingSummary } satisfies Prisma.ReportInclude;
export type DbReport = Prisma.ReportGetPayload<{ include: typeof reportInclude }>;

export function mapReport(r: DbReport): ReportItem {
  return {
    id: r.id,
    listingId: r.listingId,
    listingTitle: r.listing.title,
    listingSlug: r.listing.slug,
    listingAssetType: r.listing.asset.assetType,
    reporterEmail: r.reporterEmail,
    reporterPhone: opt(r.reporterPhone),
    reason: r.reason,
    details: r.details,
    status: r.status,
    adminNotes: opt(r.adminNotes),
    createdAt: r.createdAt.toISOString(),
  };
}

export const auditInclude = { actor: { include: userInclude } } satisfies Prisma.AuditLogInclude;
export type DbAudit = Prisma.AuditLogGetPayload<{ include: typeof auditInclude }>;

export function mapAudit(a: DbAudit): AuditLogItem {
  let metadata: string | undefined;
  if (a.metadataJson) {
    try {
      const parsed = JSON.parse(a.metadataJson) as Record<string, unknown>;
      metadata = [parsed.title, parsed.note, parsed.reason].filter(Boolean).join(' — ') || a.metadataJson;
    } catch {
      metadata = a.metadataJson;
    }
  }
  return {
    id: a.id,
    actorName: a.actor?.profile?.fullName ?? 'System',
    action: a.action,
    entityType: a.entityType,
    entityId: opt(a.entityId),
    metadata,
    createdAt: a.createdAt.toISOString(),
  };
}
