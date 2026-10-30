import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ApiError, handle, ok, rateLimit, requireUser } from '@/lib/server/api';
import { put } from '@vercel/blob';
import { MIME_BY_EXT, sniffImageType, uploadDir } from '@/lib/server/uploads';
import { MAX_UPLOAD_BYTES } from '@/lib/constants';

/** Accepts one photo (multipart field "file") and returns its public URL. */
export const POST = handle(async (request: Request) => {
  const user = await requireUser();
  rateLimit(`upload:${user.id}`, 60, 10 * 60 * 1000);

  const form = await request.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) throw new ApiError(400, 'No photo was received.');
  if (file.size > MAX_UPLOAD_BYTES) throw new ApiError(413, 'Photo is too large. The limit is 6 MB.');

  const bytes = new Uint8Array(await file.arrayBuffer());
  const ext = sniffImageType(bytes);
  if (!ext) throw new ApiError(415, 'Only JPG, PNG or WebP photos are allowed.');

  const name = `${randomUUID()}.${ext}`;

  // On Vercel (or anywhere BLOB_READ_WRITE_TOKEN is set) photos go to Vercel Blob,
  // because serverless functions can't keep files on disk.
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`listings/${name}`, Buffer.from(bytes), {
      access: 'public',
      contentType: MIME_BY_EXT[ext],
      addRandomSuffix: false,
      cacheControlMaxAge: 31536000,
    });
    return ok({ url: blob.url }, { status: 201 });
  }

  const dir = uploadDir();
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(/*turbopackIgnore: true*/ dir, name), bytes);

  return ok({ url: `/api/v1/uploads/${name}` }, { status: 201 });
});
