import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Noto_Sans_Ethiopic } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MobileTabBar } from '@/components/layout/MobileTabBar';
import { platformConfig } from '@/lib/config';
import { getLocale } from '@/lib/i18n-server';
import { getCurrentUser } from '@/lib/server/session';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

const ethiopic = Noto_Sans_Ethiopic({
  subsets: ['ethiopic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ethiopic',
  display: 'swap',
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: `${platformConfig.brandName} — Homes, Land & Vehicles in Wolaita Sodo`,
    template: `%s | ${platformConfig.brandName}`,
  },
  description:
    'The trusted marketplace for houses, apartments, land, shops, offices and vehicles in Wolaita Sodo, Ethiopia. Every listing reviewed. Connect directly with verified owners and licensed brokers.',
  keywords: [
    'Wolaita Sodo',
    'Sodo houses for sale',
    'Wolaita real estate',
    'house for rent Sodo',
    'cars for sale Wolaita',
    'Ethiopia property',
    'Sodo Market Hub',
  ],
  applicationName: platformConfig.brandName,
  openGraph: {
    title: `${platformConfig.brandName} — ${platformConfig.subTitle}`,
    description: 'Verified homes, land, commercial spaces and vehicles in Wolaita Sodo.',
    siteName: platformConfig.brandName,
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#10412e',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [locale, user] = await Promise.all([getLocale(), getCurrentUser()]);

  return (
    <html lang={locale} className={`${jakarta.variable} ${ethiopic.variable} h-full scroll-smooth antialiased`}>
      <body className="flex min-h-full flex-col">
        <Providers initialLocale={locale} initialUser={user}>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-lift"
          >
            Skip to content
          </a>
          <Navbar />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
          <MobileTabBar />
        </Providers>
      </body>
    </html>
  );
}
