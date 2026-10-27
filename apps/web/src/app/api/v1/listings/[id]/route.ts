import { z } from 'zod';
import { prisma } from '@/lib/server/db';
import { ApiError, handle, ok, parseBody, requireUser } from '@/lib/server/api';
import { getCurrentUser } from '@/lib/server/session';
import { assetDetailsData, listingInputSchema, mediaData } from '@/lib/server/listing-input';
import { listingInclude, mapListing } from '@/lib/server/mappers';
import { audit } from '@/lib/server/workspace';

type Ctx = { params: Promise<{ id: string }> };

async function loadOwned(id: string) {
  const user = await requireUser();
  const listing = await prisma.listing.findUnique({ where: { id }, include: listingInclude });
  if (!listing) throw new ApiError(404, 'Listing not found.');
  if (listing.authorId !== user.id && user.role !== 'ADMIN') {
    throw new ApiError(403, 'You can only manage your own listings.');
  }
  return { user, listing };
}

export const GET = handle(async (_request: Request, ctx: Ctx) => {
  const { id } = await ctx.params;
  const listing = await prisma.listing.findUnique({ where: { id }, include: listingInclude });
  if (!listing) throw new ApiError(404, 'Listing not found.');
  if (listing.status !== 'PUBLISHED') {
    const user = await getCurrentUser();
    if (!user || (user.id !== listing.authorId && user.role !== 'ADMIN')) throw new ApiError(404, 'Listing not found.');
  }
  return ok(mapListing(listing));
});

const statusSchema = z.object({ status: z.enum(['PUBLISHED', 'SOLD', 'RENTED', 'UNAVAILABLE']) });
const MARKET_STATUSES = ['PUBLISHED', 'SOLD', 'RENTED', 'UNAVAILABLE'];

/**
 * Owners can either change the availability status ({ status }) or edit the
 * whole listing. Edits go back into the moderation queue.
 */
export const PATCH = handle(async (request: Request, ctx: Ctx) => {
  const { id } = await ctx.params;
  const { user, listing } = await loadOwned(id);
  const body = (await request.clone().json().catch(() => ({}))) as Record<string, unknown>;

  if (Object.keys(body).length === 1 && 'status' in body) {
    const { status } = await parseBody(request, statusSchema);
    if (!listing.publishedAt || !MARKET_STATUSES.includes(listing.status)) {
      throw new ApiError(400, 'This listing has not been approved yet.');
    }
    const updated = await prisma.listing.update({ where: { id }, data: { status }, include: listingInclude });
    await audit(user.id, 'LISTING_STATUS_CHANGED', 'Listing', id, { title: listing.title, note: status });
    return ok(mapListing(updated));
  }

  const input = await parseBody(request, listingInputSchema);
  const { property, vehicle } = assetDetailsData(input);

  const updated = await prisma.$transaction(async (tx) => {
    await tx.listingMedia.deleteMany({ where: { listingId: id } });
    await tx.propertyDetails.deleteMany({ where: { assetId: listing.assetId } });
    await tx.vehicleDetails.deleteMany({ where: { assetId: listing.assetId } });
    await tx.asset.update({
      where: { id: listing.assetId },
      data: {
        assetType: input.assetType,
        ownerDeclaration: input.ownerDeclaration,
        location: { update: input.location },
        propertyDetails: property ? { create: property } : undefined,
        vehicleDetails: vehicle ? { create: vehicle } : undefined,
      },
    });
    return tx.listing.update({
      where: { id },
      data: {
        title: input.title,
        description: input.description,
        price: input.price,
        isNegotiable: input.isNegotiable,
        status: user.role === 'ADMIN' ? listing.status : 'PENDING_REVIEW',
        rejectionReason: null,
        media: { create: mediaData(input) },
      },
      include: listingInclude,
    });
  });
  await audit(user.id, 'LISTING_UPDATED', 'Listing', id, { title: updated.title });
  return ok(mapListing(updated));
});

export const DELETE = handle(async (_request: Request, ctx: Ctx) => {
  const { id } = await ctx.params;
  const { user, listing } = await loadOwned(id);
  const hasDeals = await prisma.deal.count({ where: { listingId: id } });
  if (hasDeals) {
    // Keep the record for deal history; just take it off the market.
    await prisma.listing.update({ where: { id }, data: { status: 'UNAVAILABLE' } });
  } else {
    await prisma.$transaction([
      prisma.appointment.updateMany({ where: { listingId: id }, data: { listingId: null } }),
      prisma.lead.updateMany({ where: { listingId: id }, data: { listingId: null } }),
      prisma.asset.delete({ where: { id: listing.assetId } }),
    ]);
  }
  await audit(user.id, 'LISTING_DELETED', 'Listing', id, { title: listing.title });
  return ok({ id });
});
