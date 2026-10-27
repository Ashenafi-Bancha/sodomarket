import { handle, ok } from '@/lib/server/api';
import { destroySession } from '@/lib/server/session';

export const POST = handle(async () => {
  await destroySession();
  return ok(null);
});
