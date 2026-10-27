import { z } from 'zod';
import { prisma } from '@/lib/server/db';
import { ApiError, clientIp, handle, ok, parseBody, rateLimit, requireUser } from '@/lib/server/api';
import { getCurrentUser } from '@/lib/server/session';
import { mapReport, reportInclude } from '@/lib/server/mappers';

export const GET = handle(async () => {
  await requireUser(['ADMIN']);
  const rows = await prisma.report.findMany({ include: reportInclude, orderBy: { createdAt: 'desc' }, take: 200 });
  return ok(rows.map(mapReport));
});

const schema = z.object({
  listingId: z.string().min(1),
  reason: z.enum(['FRAUD', 'DUPLICATE_LISTING', 'INCORRECT_PRICE', 'UNAVAILABLE_ASSET', 'OFFENSIVE_CONTENT', 'OTHER']),
  details: z.string().trim().min(10, 'Please describe the problem (at least 10 characters)').max(2000),
  reporterEmail: z.union([z.email('Email address is not valid'), z.literal('')]).optional(),
  reporterPhone: z.string().trim().max(20).optional(),
});

/** Anyone can report a listing; the moderation team reviews it. */
export const POST = handle(async (request: Request) => {
  rateLimit(`report:${clientIp(request)}`, 10, 60 * 60 * 1000);
  const input = await parseBody(request, schema);
  const viewer = await getCurrentUser();
  const email = viewer?.email || input.reporterEmail || '';
  const phone = viewer?.phone || input.reporterPhone || undefined;
  if (!email && !phone) throw new ApiError(400, 'Please leave an email or phone so we can follow up.');

  const listing = await prisma.listing.findUnique({ where: { id: input.listingId }, select: { id: true } });
  if (!listing) throw new ApiError(404, 'Listing not found.');

  const report = await prisma.report.create({
    data: { listingId: input.listingId, reason: input.reason, details: input.details, reporterEmail: email, reporterPhone: phone },
    include: reportInclude,
  });
  return ok(mapReport(report), { status: 201 });
});
