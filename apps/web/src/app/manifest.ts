import type { MetadataRoute } from 'next';
import { brand } from '@/lib/brand';
import { platformConfig } from '@/lib/config';

/** Lets phones "Add to home screen" with the Zamana icon and colours. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: platformConfig.brandName,
    short_name: 'Zamana',
    description: 'The new way to buy, sell and rent homes, land, shops and vehicles.',
    start_url: '/',
    display: 'standalone',
    background_color: brand.colors.white,
    theme_color: brand.colors.navy,
    icons: [
      { src: brand.icon192, sizes: '192x192', type: 'image/png' },
      { src: brand.icon512, sizes: '512x512', type: 'image/png' },
      { src: brand.iconMaskable512, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: brand.appIcon, sizes: 'any', type: 'image/svg+xml' },
    ],
  };
}
