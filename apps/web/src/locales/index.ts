import { en, type Dictionary } from './en';
import { wal } from './wal';
import { walExtra } from './wal-extra';
import { am } from './am';
import { amExtra } from './am-extra';

export type { Dictionary };
export type Locale = 'wal' | 'am' | 'en';

export const LOCALES: Locale[] = ['wal', 'am', 'en'];
export const LOCALE_COOKIE = 'wm_locale';

type Tree = { [key: string]: string | Tree };

function deepMerge(base: Tree, ...overrides: unknown[]): Tree {
  const out: Tree = { ...base };
  for (const override of overrides) {
    if (!override || typeof override !== 'object') continue;
    for (const [key, value] of Object.entries(override as Tree)) {
      const current = out[key];
      out[key] =
        value && typeof value === 'object' && current && typeof current === 'object'
          ? deepMerge(current, value)
          : value;
    }
  }
  return out;
}

// English is the base, so any key missing in a translation shows in English.
const dictionaries: Record<Locale, Dictionary> = {
  en,
  am: deepMerge(en as unknown as Tree, am, amExtra) as unknown as Dictionary,
  wal: deepMerge(en as unknown as Tree, wal, walExtra) as unknown as Dictionary,
};

export function isLocale(value: unknown): value is Locale {
  return value === 'wal' || value === 'am' || value === 'en';
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.en;
}

/** Fills {placeholders} in a translated string. */
export function fmt(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''));
}

/**
 * Languages in the selector. `enabled: false` shows the language as "coming soon" and
 * keeps everyone on an enabled one. To open Amharic or English, set `enabled: true`.
 */
export const availableLocales: { code: Locale; label: string; nativeLabel: string; enabled: boolean }[] = [
  { code: 'wal', label: 'Wolaytta', nativeLabel: 'Wolayttatto', enabled: true },
  { code: 'am', label: 'Amharic', nativeLabel: 'አማርኛ', enabled: false },
  { code: 'en', label: 'English', nativeLabel: 'English', enabled: false },
];

export function isEnabledLocale(value: unknown): value is Locale {
  return availableLocales.some((l) => l.code === value && l.enabled);
}

/** The language to use when the visitor's choice (or the configured default) isn't open yet. */
export const FALLBACK_LOCALE: Locale = availableLocales.find((l) => l.enabled)?.code ?? 'en';
