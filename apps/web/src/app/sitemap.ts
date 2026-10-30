import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/server/db';

// Built on request so the build never needs the database.
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const staticPages = ['', '/properties', '/vehicles', '/search', '/brokers', '/how-it-works', '/safety', '/about'].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: 'daily' as const,
    priority: path === '' ? 1 : 0.7,
  }));
  const listings = await prisma.listing
    .findMany({ where: { status: 'PUBLISHED' }, select: { slug: true, updatedAt: true, asset: { select: { assetType: true } } } })
    .catch(() => []);
  return [
    ...staticPages,
    ...listings.map((l) => ({
      url: `${base}/${l.asset.assetType === 'VEHICLE' ? 'vehicles' : 'properties'}/${l.slug}`,
      lastModified: l.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
