import { prisma } from '@/lib/server/db';
import { ApiError, handle, ok, requireUser } from '@/lib/server/api';

type Ctx = { params: Promise<{ id: string }> };

/** Toggles a listing in the user's saved list. */
export const POST = handle(async (_request: Request, ctx: Ctx) => {
  const user = await requireUser();
  const { id } = await ctx.params;
  const listing = await prisma.listing.findUnique({ where: { id }, select: { id: true } });
  if (!listing) throw new ApiError(404, 'Listing not found.');

  const key = { userId_listingId: { userId: user.id, listingId: id } };
  const existing = await prisma.favorite.findUnique({ where: key });
  if (existing) {
    await prisma.favorite.delete({ where: key });
    return ok({ saved: false });
  }
  await prisma.favorite.create({ data: { userId: user.id, listingId: id } });
  return ok({ saved: true });
});
