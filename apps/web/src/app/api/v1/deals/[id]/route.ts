import { z } from 'zod';
import { prisma } from '@/lib/server/db';
import { ApiError, handle, ok, parseBody, requireUser } from '@/lib/server/api';
import { dealInclude, mapDeal } from '@/lib/server/mappers';

type Ctx = { params: Promise<{ id: string }> };

const schema = z.object({
  status: z.enum(['IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  commissionPaid: z.coerce.number().min(0).max(100_000_000_000).optional(),
  notes: z.string().trim().max(1000).optional(),
});

export const PATCH = handle(async (request: Request, ctx: Ctx) => {
  const user = await requireUser();
  const { id } = await ctx.params;
  const deal = await prisma.deal.findUnique({ where: { id }, include: { listing: { include: { asset: { include: { propertyDetails: true } } } } } });
  if (!deal) throw new ApiError(404, 'Deal not found.');
  if (deal.brokerId !== user.id && user.role !== 'ADMIN') throw new ApiError(403, 'This deal is not yours.');

  const input = await parseBody(request, schema);
  const updated = await prisma.deal.update({ where: { id }, data: input, include: dealInclude });

  // Closing a deal takes the listing off the market.
  if (input.status === 'COMPLETED' && deal.listing.status === 'PUBLISHED') {
    const rented = deal.listing.asset.propertyDetails?.transactionType === 'FOR_RENT';
    await prisma.listing.update({ where: { id: deal.listingId }, data: { status: rented ? 'RENTED' : 'SOLD' } });
  }
  return ok(mapDeal(updated));
});
