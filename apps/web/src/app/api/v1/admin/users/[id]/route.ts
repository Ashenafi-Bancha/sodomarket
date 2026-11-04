import { randomInt } from 'node:crypto';
import bcrypt from 'bcryptjs';
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
  resetPassword: z.literal(true).optional(),
});

/** Easy-to-read temporary password, e.g. "Sodo-7K4M-29QX" (no 0/O/1/I). */
function temporaryPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const part = () => Array.from({ length: 4 }, () => chars[randomInt(chars.length)]).join('');
  return `Sodo-${part()}-${part()}`;
}

/** Verify, suspend, change the role of, or reset the password of a user. Admins only. */
export const PATCH = handle(async (request: Request, ctx: Ctx) => {
  const admin = await requireUser(['ADMIN']);
  const { id } = await ctx.params;
  const input = await parseBody(request, schema);
  if (id === admin.id && (input.isActive === false || (input.role && input.role !== 'ADMIN'))) {
    throw new ApiError(400, 'You cannot suspend or demote your own admin account.');
  }

  // Support has confirmed the person by phone; give them a one-time password to sign in with.
  const tempPassword = input.resetPassword ? temporaryPassword() : undefined;

  const user = await prisma.user.update({
    where: { id },
    data: {
      passwordHash: tempPassword ? await bcrypt.hash(tempPassword, 10) : undefined,
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
  if (tempPassword) changes.push('password reset');
  await audit(admin.id, input.idVerified ? 'USER_VERIFIED' : 'USER_UPDATED', 'User', id, {
    title: user.profile?.fullName,
    note: changes.join(', '),
  });
  return ok({ ...mapUser(user), temporaryPassword: tempPassword });
});
