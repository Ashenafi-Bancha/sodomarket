import { handle, ok } from '@/lib/server/api';
import { getCurrentUser } from '@/lib/server/session';

export const GET = handle(async () => ok(await getCurrentUser()));
