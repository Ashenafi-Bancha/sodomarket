import 'server-only';
import { cookies } from 'next/headers';
import { getDictionary, isLocale, LOCALE_COOKIE, type Locale } from '@/locales';
import { platformConfig } from './config';

export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : platformConfig.defaultLocale;
}

/** Locale + dictionary for server components. */
export async function getT() {
  const locale = await getLocale();
  return { locale, t: getDictionary(locale) };
}
