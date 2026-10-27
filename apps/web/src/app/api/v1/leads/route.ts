import { z } from 'zod';
import { prisma } from '@/lib/server/db';
import { ApiError, clientIp, handle, normalizePhone, ok, parseBody, rateLimit, requireUser } from '@/lib/server/api';
import { getCurrentUser } from '@/lib/server/session';
import { leadInclude, mapLead } from '@/lib/server/mappers';

/** Leads assigned to the signed-in seller/broker. */
export const GET = handle(async () => {
  const user = await requireUser();
  const leads = await prisma.lead.findMany({
    where: { assignedUserId: user.id },
    include: leadInclude,
    orderBy: { createdAt: 'desc' },
  });
  return ok(leads.map(mapLead));
});

const schema = z.object({
  listingId: z.string().min(1),
  type: z.enum(['INQUIRY', 'VIEWING']).default('INQUIRY'),
  customerName: z.string().trim().min(2, 'Please enter your name').max(80),
  customerPhone: z.string().trim().min(9, 'Please enter your phone number'),
  customerEmail: z.union([z.email('Email address is not valid'), z.literal('')]).optional(),
  budgetMax: z.coerce.number().positive().max(100_000_000_000).optional(),
  message: z.string().trim().min(5, 'Please write a short message').max(2000),
  preferredAt: z.iso.datetime({ offset: true }).optional(),
});

/**
 * Public inquiry or viewing request. No account needed; the lead goes straight
 * to the person who listed the asset.
 */
export const POST = handle(async (request: Request) => {
  rateLimit(`lead:${clientIp(request)}`, 15, 60 * 60 * 1000);
  const input = await parseBody(request, schema);
  const viewer = await getCurrentUser();

  const listing = await prisma.listing.findUnique({
    where: { id: input.listingId },
    select: { id: true, title: true, status: true, authorId: true },
  });
  if (!listing || listing.status !== 'PUBLISHED') throw new ApiError(404, 'This listing is no longer available.');
  if (viewer?.id === listing.authorId) throw new ApiError(400, 'This is your own listing.');

  const preferredAt = input.preferredAt ? new Date(input.preferredAt) : undefined;
  if (input.type === 'VIEWING') {
    if (!preferredAt) throw new ApiError(400, 'Please choose a date and time for the viewing.');
    if (preferredAt.getTime() < Date.now() - 60_000) throw new ApiError(400, 'Please choose a time in the future.');
  }

  const lead = await prisma.lead.create({
    data: {
      listingId: listing.id,
      assignedUserId: listing.authorId,
      buyerId: viewer?.id,
      customerName: input.customerName,
      customerPhone: normalizePhone(input.customerPhone),
      customerEmail: input.customerEmail || undefined,
      budgetMax: input.budgetMax,
      message: input.message,
      source: input.type === 'VIEWING' ? 'VIEWING_REQUEST' : 'DIRECT_INQUIRY',
      nextFollowUpAt: preferredAt,
    },
    include: leadInclude,
  });

  if (input.type === 'VIEWING' && preferredAt) {
    await prisma.appointment.create({
      data: {
        leadId: lead.id,
        listingId: listing.id,
        brokerId: listing.authorId,
        title: `Viewing request: ${input.customerName}`,
        scheduledAt: preferredAt,
        status: 'REQUESTED',
        locationNotes: input.message,
      },
    });
  }

  return ok(mapLead(lead), { status: 201 });
});
