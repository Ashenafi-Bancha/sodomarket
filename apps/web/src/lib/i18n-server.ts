import 'server-only';
import { cookies } from 'next/headers';
import { FALLBACK_LOCALE, getDictionary, isEnabledLocale, LOCALE_COOKIE, type Locale } from '@/locales';
import { platformConfig } from './config';

export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isEnabledLocale(value)) return value;
  return isEnabledLocale(platformConfig.defaultLocale) ? platformConfig.defaultLocale : FALLBACK_LOCALE;
}

/** Locale + dictionary for server components. */
export async function getT() {
  const locale = await getLocale();
  return { locale, t: getDictionary(locale) };
}
