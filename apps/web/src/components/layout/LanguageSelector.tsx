'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Check, Globe } from 'lucide-react';
import { useTranslation } from '@/lib/i18n-context';
import { availableLocales } from '@/locales';
import { cn } from '@/lib/cn';

export function LanguageSelector({ variant = 'compact' }: { variant?: 'compact' | 'list' }) {
  const { locale, setLocale, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  if (variant === 'list') {
    return (
      <div className="grid grid-cols-3 gap-2">
        {availableLocales.map((l) => (
          <button
            key={l.code}
            onClick={() => l.enabled && setLocale(l.code)}
            disabled={!l.enabled}
            className={cn(
              'rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors',
              locale === l.code ? 'border-brand-600 bg-brand-50 text-brand-800' : 'border-ink-200 text-ink-700 hover:bg-ink-50',
              !l.enabled && 'cursor-not-allowed border-dashed text-ink-400 hover:bg-transparent'
            )}
          >
            {l.nativeLabel}
            {!l.enabled && <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-wide">{t.preview.comingSoonTitle}</span>}
          </button>
        ))}
      </div>
    );
  }

  const current = availableLocales.find((l) => l.code === locale);
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 items-center gap-1.5 rounded-xl px-2.5 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-100"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change language"
      >
        <Globe className="h-[18px] w-[18px] text-ink-500" />
        <span className="hidden sm:inline">{current?.nativeLabel}</span>
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute right-0 z-50 mt-2 w-64 animate-scale-in overflow-hidden rounded-2xl bg-white p-1.5 shadow-lift ring-1 ring-ink-100"
        >
          {availableLocales.map((l) => (
            <button
              key={l.code}
              role="option"
              aria-selected={locale === l.code}
              aria-disabled={!l.enabled}
              disabled={!l.enabled}
              onClick={() => {
                setLocale(l.code);
                setOpen(false);
              }}
              className={cn(
                'flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                locale === l.code ? 'bg-brand-50 font-semibold text-brand-800' : 'text-ink-700 hover:bg-ink-50',
                !l.enabled && 'cursor-not-allowed text-ink-400 hover:bg-transparent'
              )}
            >
              <span>
                {l.nativeLabel}
                <span className="ml-2 text-xs text-ink-400">{l.label}</span>
              </span>
              {locale === l.code && <Check className="h-4 w-4 text-brand-600" />}
              {!l.enabled && (
                <span className="whitespace-nowrap rounded-full bg-gold-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gold-700 ring-1 ring-gold-200">
                  {t.preview.comingSoonTitle}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
