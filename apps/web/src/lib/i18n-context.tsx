'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDictionary, LOCALE_COOKIE, type Dictionary, type Locale } from '@/locales';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ initialLocale, children }: { initialLocale: Locale; children: React.ReactNode }) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback(
    (next: Locale) => {
      setLocaleState(next);
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
      document.documentElement.lang = next === 'wal' ? 'wal' : next;
      // Re-render server components in the new language.
      router.refresh();
    },
    [router]
  );

  const value = useMemo(() => ({ locale, setLocale, t: getDictionary(locale) }), [locale, setLocale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useTranslation must be used inside I18nProvider');
  return context;
}
