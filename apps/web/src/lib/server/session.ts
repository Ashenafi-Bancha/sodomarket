import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { cache } from 'react';
import { prisma } from './db';
import { mapUser, userInclude } from './mappers';
import type { Role, User } from '@/lib/types';

const COOKIE_NAME = 'wm_session';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

interface SessionPayload {
  uid: string;
  exp: number;
}

function getSecret(): string {
  const secret = process.env.SESSION_SECRET || process.env.JWT_SECRET;
  if (secret && secret.length >= 16) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET must be set (at least 16 characters) in production.');
  }
  return 'wolaita-marketplace-dev-only-secret';
}

const b64url = (input: string | Buffer) => Buffer.from(input).toString('base64url');

function signature(body: string) {
  return createHmac('sha256', getSecret()).update(body).digest('base64url');
}

function encode(payload: SessionPayload) {
  const body = b64url(JSON.stringify(payload));
  return `${body}.${signature(body)}`;
}

function decode(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = Buffer.from(signature(body));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as SessionPayload;
    if (typeof payload.uid !== 'string' || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function createSession(userId: string) {
  const token = encode({ uid: userId, exp: Date.now() + MAX_AGE_SECONDS * 1000 });
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/** The signed-in user for this request, or null. Cached per request. */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const store = await cookies();
  const payload = decode(store.get(COOKIE_NAME)?.value);
  if (!payload) return null;
  const user = await prisma.user.findUnique({ where: { id: payload.uid }, include: userInclude });
  if (!user || !user.isActive) return null;
  return mapUser(user);
});

export const PRO_ROLES: Role[] = ['BROKER', 'AGENCY_ADMIN', 'ADMIN'];

export function isAdmin(user: User | null | undefined) {
  return user?.role === 'ADMIN';
}
