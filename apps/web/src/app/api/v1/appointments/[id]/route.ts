import { z } from 'zod';
import { prisma } from '@/lib/server/db';
import { ApiError, handle, ok, parseBody, requireUser } from '@/lib/server/api';
import { appointmentInclude, mapAppointment } from '@/lib/server/mappers';

type Ctx = { params: Promise<{ id: string }> };

const schema = z.object({
  status: z.enum(['REQUESTED', 'CONFIRMED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED']).optional(),
  scheduledAt: z.iso.datetime({ offset: true }).optional(),
  outcomeNotes: z.string().trim().max(1000).optional(),
});

export const PATCH = handle(async (request: Request, ctx: Ctx) => {
  const user = await requireUser();
  const { id } = await ctx.params;
  const appt = await prisma.appointment.findUnique({ where: { id }, select: { brokerId: true } });
  if (!appt) throw new ApiError(404, 'Viewing not found.');
  if (appt.brokerId !== user.id && user.role !== 'ADMIN') throw new ApiError(403, 'This viewing is not yours.');

  const input = await parseBody(request, schema);
  const updated = await prisma.appointment.update({
    where: { id },
    data: {
      status: input.status ?? (input.scheduledAt ? 'RESCHEDULED' : undefined),
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
      outcomeNotes: input.outcomeNotes,
    },
    include: appointmentInclude,
  });
  return ok(mapAppointment(updated));
});
