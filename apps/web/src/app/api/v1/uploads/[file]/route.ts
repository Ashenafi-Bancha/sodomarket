import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { MIME_BY_EXT, UPLOAD_NAME_PATTERN, uploadDir } from '@/lib/server/uploads';

type Ctx = { params: Promise<{ file: string }> };

/** Serves an uploaded listing photo. */
export async function GET(_request: Request, ctx: Ctx) {
  const { file } = await ctx.params;
  if (!UPLOAD_NAME_PATTERN.test(file)) return new Response('Not found', { status: 404 });
  try {
    const data = await readFile(path.join(/*turbopackIgnore: true*/ uploadDir(), file));
    const ext = file.split('.').pop() as string;
    return new Response(data, {
      headers: {
        'Content-Type': MIME_BY_EXT[ext] ?? 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
