import { z } from 'zod';
import { prisma } from '@/lib/server/db';
import { ApiError, handle, ok, parseBody, requireUser } from '@/lib/server/api';
import { leadInclude, mapLead } from '@/lib/server/mappers';
import { LEAD_STAGES } from '@/lib/constants';
import type { LeadStage } from '@/lib/types';

type Ctx = { params: Promise<{ id: string }> };

const schema = z.object({
  stage: z.enum(LEAD_STAGES as [LeadStage, ...LeadStage[]]).optional(),
  notes: z.string().trim().max(2000).optional(),
  nextFollowUpAt: z.union([z.iso.datetime({ offset: true }), z.null()]).optional(),
});

export const PATCH = handle(async (request: Request, ctx: Ctx) => {
  const user = await requireUser();
  const { id } = await ctx.params;
  const lead = await prisma.lead.findUnique({ where: { id }, select: { assignedUserId: true } });
  if (!lead) throw new ApiError(404, 'Lead not found.');
  if (lead.assignedUserId !== user.id && user.role !== 'ADMIN') throw new ApiError(403, 'This lead is not assigned to you.');

  const input = await parseBody(request, schema);
  const updated = await prisma.lead.update({
    where: { id },
    data: {
      stage: input.stage,
      notes: input.notes,
      nextFollowUpAt:
        input.nextFollowUpAt === null ? null : input.nextFollowUpAt ? new Date(input.nextFollowUpAt) : undefined,
    },
    include: leadInclude,
  });
  return ok(mapLead(updated));
});
