export interface PlatformConfig {
  brandName: string;
  subTitle: string;
  tagline: string;
  defaultLocale: 'wal' | 'am' | 'en';
  defaultCurrency: string;
  primaryLocation: string;
  supportPhone: string;
  supportEmail: string;
  socials: {
    telegram?: string;
    facebook?: string;
  };
  commissionGuidelines: {
    realEstateStandardPercent: number;
    vehicleStandardPercent: number;
  };
}

export const platformConfig: PlatformConfig = {
  brandName: process.env.NEXT_PUBLIC_PLATFORM_NAME || 'Zamana Market',
  subTitle: 'Wolaita Sodo',
  tagline: process.env.NEXT_PUBLIC_PLATFORM_TAGLINE || 'Discover, Advertise, and Connect for Properties & Vehicles in Wolaita',
  defaultLocale: (process.env.NEXT_PUBLIC_DEFAULT_LOCALE as 'wal' | 'am' | 'en') || 'wal',
  defaultCurrency: 'ETB',
  primaryLocation: 'Wolaita Sodo, Ethiopia',
  supportPhone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || '+251 90 000 0000',
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@zamanamarket.et',
  socials: {
    telegram: 'https://t.me/zamanamarket',
    facebook: 'https://facebook.com/zamanamarket',
  },
  commissionGuidelines: {
    realEstateStandardPercent: 2.0,
    vehicleStandardPercent: 2.0,
  },
};
