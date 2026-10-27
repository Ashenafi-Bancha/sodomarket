import 'server-only';
import path from 'node:path';

/** Folder where uploaded photos are stored. Defaults to <repo>/uploads. */
export function uploadDir() {
  return path.resolve(process.cwd(), process.env.UPLOAD_DIR || '../../uploads');
}

export const UPLOAD_NAME_PATTERN = /^[a-f0-9-]{36}\.(jpg|png|webp)$/;

export const MIME_BY_EXT: Record<string, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

/** Detects the real image type from the file's first bytes (not the browser's claim). */
export function sniffImageType(bytes: Uint8Array): 'jpg' | 'png' | 'webp' | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpg';
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'png';
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    return 'webp';
  }
  return null;
}
