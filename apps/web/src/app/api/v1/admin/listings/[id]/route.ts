import { z } from 'zod';
import { prisma } from '@/lib/server/db';
import { ApiError, handle, ok, parseBody, requireUser } from '@/lib/server/api';
import { listingInclude, mapListing } from '@/lib/server/mappers';
import { audit } from '@/lib/server/workspace';

type Ctx = { params: Promise<{ id: string }> };

const schema = z.object({
  action: z.enum(['approve', 'reject', 'request_changes', 'feature', 'unfeature', 'unpublish']),
  notes: z.string().trim().max(1000).optional(),
});

/** Moderation decisions on a listing. Admins only. */
export const POST = handle(async (request: Request, ctx: Ctx) => {
  const admin = await requireUser(['ADMIN']);
  const { id } = await ctx.params;
  const { action, notes } = await parseBody(request, schema);
  const listing = await prisma.listing.findUnique({ where: { id }, select: { title: true, publishedAt: true } });
  if (!listing) throw new ApiError(404, 'Listing not found.');

  if ((action === 'reject' || action === 'request_changes') && !notes) {
    throw new ApiError(400, 'Please tell the seller what needs to change.');
  }

  const data = {
    approve: { status: 'PUBLISHED' as const, moderationNotes: notes ?? null, rejectionReason: null, publishedAt: listing.publishedAt ?? new Date() },
    reject: { status: 'REJECTED' as const, rejectionReason: notes },
    request_changes: { status: 'CHANGES_REQUESTED' as const, moderationNotes: notes },
    feature: { isFeatured: true },
    unfeature: { isFeatured: false },
    unpublish: { status: 'UNAVAILABLE' as const, moderationNotes: notes ?? null },
  }[action];

  const updated = await prisma.listing.update({ where: { id }, data, include: listingInclude });
  const auditAction = {
    approve: 'LISTING_APPROVED',
    reject: 'LISTING_REJECTED',
    request_changes: 'LISTING_CHANGES_REQUESTED',
    feature: 'LISTING_FEATURED',
    unfeature: 'LISTING_UNFEATURED',
    unpublish: 'LISTING_UNPUBLISHED',
  }[action];
  await audit(admin.id, auditAction, 'Listing', id, { title: listing.title, note: notes });
  return ok(mapListing(updated));
});
