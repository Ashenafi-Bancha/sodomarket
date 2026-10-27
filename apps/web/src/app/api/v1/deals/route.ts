import { z } from 'zod';
import { prisma } from '@/lib/server/db';
import { ApiError, handle, ok, parseBody, requireUser } from '@/lib/server/api';
import { dealInclude, mapDeal } from '@/lib/server/mappers';
import { audit } from '@/lib/server/workspace';

export const GET = handle(async () => {
  const user = await requireUser();
  const rows = await prisma.deal.findMany({ where: { brokerId: user.id }, include: dealInclude, orderBy: { createdAt: 'desc' } });
  return ok(rows.map(mapDeal));
});

const schema = z.object({
  listingId: z.string().min(1),
  leadId: z.string().optional(),
  agreedPrice: z.coerce.number().positive().max(100_000_000_000),
  commissionExpected: z.coerce.number().min(0).max(100_000_000_000).optional(),
  notes: z.string().trim().max(1000).optional(),
});

export const POST = handle(async (request: Request) => {
  const user = await requireUser();
  const input = await parseBody(request, schema);
  const listing = await prisma.listing.findUnique({ where: { id: input.listingId }, select: { authorId: true, title: true } });
  if (!listing || (listing.authorId !== user.id && user.role !== 'ADMIN')) {
    throw new ApiError(403, 'You can only record deals on your own listings.');
  }
  const deal = await prisma.deal.create({
    data: {
      listingId: input.listingId,
      leadId: input.leadId,
      brokerId: user.id,
      agreedPrice: input.agreedPrice,
      commissionExpected: input.commissionExpected,
      commissionPaid: 0,
      notes: input.notes,
    },
    include: dealInclude,
  });
  if (input.leadId) await prisma.lead.update({ where: { id: input.leadId }, data: { stage: 'WON' } }).catch(() => {});
  await audit(user.id, 'DEAL_RECORDED', 'Deal', deal.id, { title: listing.title });
  return ok(mapDeal(deal), { status: 201 });
});
