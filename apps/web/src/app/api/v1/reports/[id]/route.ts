import { z } from 'zod';
import { prisma } from '@/lib/server/db';
import { handle, ok, parseBody, requireUser } from '@/lib/server/api';
import { mapReport, reportInclude } from '@/lib/server/mappers';
import { audit } from '@/lib/server/workspace';

type Ctx = { params: Promise<{ id: string }> };

const schema = z.object({
  status: z.enum(['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED']),
  adminNotes: z.string().trim().max(1000).optional(),
  unpublishListing: z.boolean().optional(),
});

export const PATCH = handle(async (request: Request, ctx: Ctx) => {
  const admin = await requireUser(['ADMIN']);
  const { id } = await ctx.params;
  const input = await parseBody(request, schema);
  const report = await prisma.report.update({
    where: { id },
    data: { status: input.status, adminNotes: input.adminNotes },
    include: reportInclude,
  });
  if (input.unpublishListing) {
    await prisma.listing.update({ where: { id: report.listingId }, data: { status: 'UNAVAILABLE' } });
  }
  await audit(admin.id, `REPORT_${input.status}`, 'Report', id, {
    title: report.listing.title,
    note: input.adminNotes || (input.unpublishListing ? 'Listing taken down' : undefined),
  });
  return ok(mapReport(report));
});
