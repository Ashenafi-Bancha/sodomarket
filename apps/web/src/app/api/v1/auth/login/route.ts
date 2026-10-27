import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/server/db';
import { ApiError, clientIp, handle, ok, parseBody, rateLimit } from '@/lib/server/api';
import { createSession } from '@/lib/server/session';
import { mapUser, userInclude } from '@/lib/server/mappers';

const schema = z.object({
  identifier: z.string().trim().min(3, 'Enter your email or phone number'),
  password: z.string().min(1, 'Enter your password'),
});

function phoneVariants(raw: string) {
  const digits = raw.replace(/\D/g, '');
  const local = digits.replace(/^251/, '').replace(/^0/, '');
  return local.length === 9 ? [`+251${local}`] : [];
}

export const POST = handle(async (request: Request) => {
  rateLimit(`login:${clientIp(request)}`, 20, 15 * 60 * 1000);
  const { identifier, password } = await parseBody(request, schema);

  const isEmail = identifier.includes('@');
  const user = await prisma.user.findFirst({
    where: isEmail
      ? { email: identifier.toLowerCase() }
      : { phone: { in: phoneVariants(identifier) } },
    include: userInclude,
  });

  const valid = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!user || !valid) throw new ApiError(401, 'Incorrect email/phone or password.');
  if (!user.isActive) throw new ApiError(403, 'This account has been suspended. Please contact support.');

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await createSession(user.id);
  return ok(mapUser(user));
});
