import { z } from 'zod';
import { prisma } from '@/lib/server/db';
import { ApiError, handle, ok, parseBody, requireUser } from '@/lib/server/api';
import { mapUser, userInclude } from '@/lib/server/mappers';
import { audit } from '@/lib/server/workspace';

type Ctx = { params: Promise<{ id: string }> };

const schema = z.object({
  idVerified: z.boolean().optional(),
  isActive: z.boolean().optional(),
  role: z.enum(['BUYER', 'SELLER', 'BROKER', 'AGENCY_ADMIN', 'ADMIN']).optional(),
});

/** Verify, suspend or change the role of a user. Admins only. */
export const PATCH = handle(async (request: Request, ctx: Ctx) => {
  const admin = await requireUser(['ADMIN']);
  const { id } = await ctx.params;
  const input = await parseBody(request, schema);
  if (id === admin.id && (input.isActive === false || (input.role && input.role !== 'ADMIN'))) {
    throw new ApiError(400, 'You cannot suspend or demote your own admin account.');
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      isActive: input.isActive,
      role: input.role,
      profile: input.idVerified === undefined ? undefined : { update: { idVerified: input.idVerified } },
    },
    include: userInclude,
  });

  const changes: string[] = [];
  if (input.idVerified !== undefined) changes.push(input.idVerified ? 'verified' : 'verification removed');
  if (input.isActive !== undefined) changes.push(input.isActive ? 'reactivated' : 'suspended');
  if (input.role) changes.push(`role set to ${input.role}`);
  await audit(admin.id, input.idVerified ? 'USER_VERIFIED' : 'USER_UPDATED', 'User', id, {
    title: user.profile?.fullName,
    note: changes.join(', '),
  });
  return ok(mapUser(user));
});
