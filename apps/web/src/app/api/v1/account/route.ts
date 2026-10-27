import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/server/db';
import { ApiError, handle, normalizePhone, ok, parseBody, requireUser } from '@/lib/server/api';
import { mapUser, userInclude } from '@/lib/server/mappers';

const schema = z.object({
  fullName: z.string().trim().min(2).max(80).optional(),
  phone: z.string().trim().optional(),
  bio: z.string().trim().max(600).optional(),
  businessName: z.string().trim().max(100).optional(),
  licenseNumber: z.string().trim().max(50).optional(),
  preferredLocale: z.enum(['wal', 'am', 'en']).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, 'New password must be at least 8 characters').max(100).optional(),
});

export const PATCH = handle(async (request: Request) => {
  const me = await requireUser();
  const input = await parseBody(request, schema);

  const data: { phone?: string; passwordHash?: string } = {};
  if (input.phone) {
    const phone = normalizePhone(input.phone);
    const taken = await prisma.user.findFirst({ where: { phone, id: { not: me.id } }, select: { id: true } });
    if (taken) throw new ApiError(409, 'That phone number is used by another account.');
    data.phone = phone;
  }
  if (input.newPassword) {
    const row = await prisma.user.findUniqueOrThrow({ where: { id: me.id }, select: { passwordHash: true } });
    if (!input.currentPassword || !(await bcrypt.compare(input.currentPassword, row.passwordHash))) {
      throw new ApiError(400, 'Your current password is incorrect.');
    }
    data.passwordHash = await bcrypt.hash(input.newPassword, 10);
  }

  const user = await prisma.user.update({
    where: { id: me.id },
    data: {
      ...data,
      profile: {
        update: {
          fullName: input.fullName,
          bio: input.bio,
          businessName: input.businessName,
          licenseNumber: input.licenseNumber,
          preferredLocale: input.preferredLocale,
        },
      },
    },
    include: userInclude,
  });
  return ok(mapUser(user));
});
