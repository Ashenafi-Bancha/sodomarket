import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  turbopack: {
    // The repo is an npm workspace; Prisma lives in the root node_modules.
    root: path.join(__dirname, '../..'),
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
  serverExternalPackages: ['@prisma/client', '.prisma/client', 'bcryptjs'],
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }],
  },
  poweredByHeader: false,
};

export default nextConfig;
