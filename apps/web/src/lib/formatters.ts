/** Display formatting for prices, dates and phone numbers. */
import type { Locale } from '@/locales';
import type { ListingItem } from './types';

const intlLocale = (locale?: Locale) => (locale === 'am' ? 'am-ET' : 'en-GB');

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatPrice(price: number, currency = 'ETB'): string {
  return `${currency} ${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(price)}`;
}

/** Short price such as "ETB 7.8M" or "ETB 950K" for tight spaces. */
export function formatPriceCompact(price: number, currency = 'ETB'): string {
  if (price >= 1_000_000) return `${currency} ${(price / 1_000_000).toFixed(price % 1_000_000 === 0 ? 0 : 1)}M`;
  if (price >= 10_000) return `${currency} ${Math.round(price / 1000)}K`;
  return formatPrice(price, currency);
}

export function isRental(listing: Pick<ListingItem, 'propertyDetails'>) {
  return listing.propertyDetails?.transactionType === 'FOR_RENT';
}

export function formatDate(value?: string | Date, locale?: Locale): string {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat(intlLocale(locale), { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
}

export function formatDateTime(value?: string | Date, locale?: Locale): string {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat(intlLocale(locale), {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Africa/Addis_Ababa',
  }).format(d);
}

/** "3 days ago", "in 2 hours" — in the visitor's language when supported. */
export function timeAgo(value?: string | Date, locale?: Locale): string {
  if (!value) return '';
  const d = typeof value === 'string' ? new Date(value) : value;
  const seconds = Math.round((d.getTime() - Date.now()) / 1000);
  const abs = Math.abs(seconds);
  const rtf = new Intl.RelativeTimeFormat(intlLocale(locale), { numeric: 'auto' });
  if (abs < 60) return rtf.format(Math.round(seconds), 'second');
  if (abs < 3600) return rtf.format(Math.round(seconds / 60), 'minute');
  if (abs < 86_400) return rtf.format(Math.round(seconds / 3600), 'hour');
  if (abs < 86_400 * 30) return rtf.format(Math.round(seconds / 86_400), 'day');
  if (abs < 86_400 * 365) return rtf.format(Math.round(seconds / (86_400 * 30)), 'month');
  return rtf.format(Math.round(seconds / (86_400 * 365)), 'year');
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\s+/g, '');
  if (cleaned.startsWith('+251') && cleaned.length === 13) {
    return `+251 ${cleaned.slice(4, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
}

export function whatsappLink(phone: string, text: string) {
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
}

export function listingPath(listing: Pick<ListingItem, 'assetType' | 'slug'>) {
  return listing.assetType === 'VEHICLE' ? `/vehicles/${listing.slug}` : `/properties/${listing.slug}`;
}

export function initials(name?: string) {
  if (!name) return '?';
  const parts = name.replace(/^(Ato|W\/ro|W\/rt|Dr\.?)\s+/i, '').split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] ?? '?') + (parts[1]?.[0] ?? '');
}
