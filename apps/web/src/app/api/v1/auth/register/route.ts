import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/server/db';
import { ApiError, clientIp, handle, normalizePhone, ok, parseBody, rateLimit } from '@/lib/server/api';
import { createSession } from '@/lib/server/session';
import { mapUser, userInclude } from '@/lib/server/mappers';
import { audit } from '@/lib/server/workspace';

const schema = z.object({
  fullName: z.string().trim().min(2, 'Please enter your full name').max(80),
  email: z.email('Please enter a valid email address').trim().toLowerCase(),
  phone: z.string().trim().min(9, 'Please enter your phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  accountType: z.enum(['BUYER', 'SELLER', 'BROKER']).default('BUYER'),
  businessName: z.string().trim().max(100).optional(),
  licenseNumber: z.string().trim().max(50).optional(),
  preferredLocale: z.enum(['wal', 'am', 'en']).optional(),
});

export const POST = handle(async (request: Request) => {
  rateLimit(`register:${clientIp(request)}`, 10, 60 * 60 * 1000);
  const input = await parseBody(request, schema);
  const phone = normalizePhone(input.phone);

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: input.email }, { phone }] },
    select: { email: true },
  });
  if (existing) {
    throw new ApiError(
      409,
      existing.email === input.email
        ? 'An account with this email already exists. Try signing in.'
        : 'An account with this phone number already exists. Try signing in.'
    );
  }

  const user = await prisma.user.create({
    data: {
      email: input.email,
      phone,
      passwordHash: await bcrypt.hash(input.password, 10),
      role: input.accountType,
      lastLoginAt: new Date(),
      profile: {
        create: {
          fullName: input.fullName,
          businessName: input.businessName || undefined,
          licenseNumber: input.accountType === 'BROKER' ? input.licenseNumber || undefined : undefined,
          preferredLocale: input.preferredLocale ?? 'wal',
        },
      },
    },
    include: userInclude,
  });

  await audit(user.id, 'USER_REGISTERED', 'User', user.id, { note: `${input.accountType} account created` });
  await createSession(user.id);
  return ok(mapUser(user), { status: 201 });
});
