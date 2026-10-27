import { z } from 'zod';
import { prisma } from '@/lib/server/db';
import { ApiError, handle, ok, parseBody, requireUser } from '@/lib/server/api';
import { appointmentInclude, mapAppointment } from '@/lib/server/mappers';

export const GET = handle(async () => {
  const user = await requireUser();
  const rows = await prisma.appointment.findMany({
    where: { brokerId: user.id },
    include: appointmentInclude,
    orderBy: { scheduledAt: 'asc' },
  });
  return ok(rows.map(mapAppointment));
});

const schema = z.object({
  leadId: z.string().optional(),
  listingId: z.string().optional(),
  title: z.string().trim().min(3).max(140),
  scheduledAt: z.iso.datetime({ offset: true }),
  locationNotes: z.string().trim().max(500).optional(),
});

/** A seller/broker schedules a viewing (usually from a lead). */
export const POST = handle(async (request: Request) => {
  const user = await requireUser();
  const input = await parseBody(request, schema);

  let listingId = input.listingId;
  if (input.leadId) {
    const lead = await prisma.lead.findUnique({ where: { id: input.leadId } });
    if (!lead || (lead.assignedUserId !== user.id && user.role !== 'ADMIN')) throw new ApiError(404, 'Lead not found.');
    listingId = listingId ?? lead.listingId ?? undefined;
  }

  const appointment = await prisma.appointment.create({
    data: {
      leadId: input.leadId,
      listingId,
      brokerId: user.id,
      title: input.title,
      scheduledAt: new Date(input.scheduledAt),
      status: 'CONFIRMED',
      locationNotes: input.locationNotes,
    },
    include: appointmentInclude,
  });
  if (input.leadId) {
    await prisma.lead.update({ where: { id: input.leadId }, data: { stage: 'VIEWING_SCHEDULED', nextFollowUpAt: new Date(input.scheduledAt) } });
  }
  return ok(mapAppointment(appointment), { status: 201 });
});
