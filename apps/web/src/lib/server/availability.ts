import 'server-only';
import { Prisma } from '@prisma/client';
import { prisma } from './db';

/**
 * Is the database connected and migrated? While it isn't (no DATABASE_URL yet, server
 * unreachable, or tables not created), the site runs in preview mode: pages show the
 * sample catalogue and sign-in / posting say "coming soon" instead of crashing.
 */
const RECHECK_MS = 30_000;
const CHECK_TIMEOUT_MS = 5_000;

let state: { ok: boolean; at: number } | null = null;
let inFlight: Promise<boolean> | null = null;

export async function isDatabaseReady(): Promise<boolean> {
  if (!process.env.DATABASE_URL) return false;
  if (state && Date.now() - state.at < RECHECK_MS) return state.ok;
  inFlight ??= check().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

async function check(): Promise<boolean> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let ok = false;
  try {
    await Promise.race([
      // Querying a real table also catches "connected but migrations not run".
      prisma.$queryRaw`SELECT 1 FROM "Listing" LIMIT 1`,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('timed out connecting to the database')), CHECK_TIMEOUT_MS);
      }),
    ]);
    ok = true;
  } catch (error) {
    console.warn('[db] Database not ready, showing preview data:', describe(error));
  } finally {
    clearTimeout(timer);
  }
  state = { ok, at: Date.now() };
  return ok;
}

/** True for errors that mean "the database is missing or unreachable", not a bug in a query. */
export function isConnectionError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientInitializationError) return true;
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Can't reach / timed out / closed connection, or table / column missing (migrations not run).
    return ['P1001', 'P1002', 'P1008', 'P1017', 'P2021', 'P2022'].includes(error.code);
  }
  return false;
}

/** Record a connection failure seen during a request, so the next requests go straight to preview mode. */
export function markDatabaseDown(error: unknown) {
  console.warn('[db] Lost the database, switching to preview data:', describe(error));
  state = { ok: false, at: Date.now() };
}

function describe(error: unknown) {
  return error instanceof Error ? error.message.split('\n').filter(Boolean).slice(-1)[0] : String(error);
}

export const PREVIEW_MESSAGE =
  'Accounts, posting and messages open soon — the marketplace is in preview. Call or WhatsApp us to list or buy.';
