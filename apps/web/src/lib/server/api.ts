import 'server-only';
import { NextResponse } from 'next/server';
import { ZodError, type ZodType } from 'zod';
import { getCurrentUser } from './session';
import type { Role, User } from '@/lib/types';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, data }, init);
}

/** Wraps a route handler so thrown errors become clean JSON responses. */
export function handle<Args extends unknown[]>(fn: (...args: Args) => Promise<Response>) {
  return async (...args: Args): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof ApiError) {
        return NextResponse.json({ success: false, error: error.message }, { status: error.status });
      }
      if (error instanceof ZodError) {
        const issue = error.issues[0];
        const field = issue?.path?.join('.');
        const message = issue ? (field ? `${field}: ${issue.message}` : issue.message) : 'Invalid input';
        return NextResponse.json({ success: false, error: message }, { status: 400 });
      }
      console.error('[api] unexpected error', error);
      return NextResponse.json({ success: false, error: 'Something went wrong. Please try again.' }, { status: 500 });
    }
  };
}

export async function parseBody<T>(request: Request, schema: ZodType<T>): Promise<T> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ApiError(400, 'Request body must be valid JSON.');
  }
  return schema.parse(body);
}

export async function requireUser(roles?: Role[]): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new ApiError(401, 'Please sign in to continue.');
  if (roles && !roles.includes(user.role)) throw new ApiError(403, 'You do not have permission to do this.');
  return user;
}

// ─── Simple in-memory rate limiting (per server instance) ──────────────
const buckets = new Map<string, { count: number; resetAt: number }>();

export function clientIp(request: Request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'local'
  );
}

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  bucket.count += 1;
  if (bucket.count > limit) {
    throw new ApiError(429, 'Too many requests. Please wait a moment and try again.');
  }
}

/** Normalises Ethiopian phone numbers to +2519XXXXXXXX / +2517XXXXXXXX. */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, '');
  let local = digits;
  if (local.startsWith('+251')) local = local.slice(4);
  else if (local.startsWith('251')) local = local.slice(3);
  else if (local.startsWith('0')) local = local.slice(1);
  if (!/^[79]\d{8}$/.test(local)) {
    throw new ApiError(400, 'Please enter a valid Ethiopian phone number, e.g. 0911 234 567.');
  }
  return `+251${local}`;
}
