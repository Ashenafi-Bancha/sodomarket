'use client';

import React from 'react';
import { I18nProvider } from '@/lib/i18n-context';
import { AuthProvider } from '@/lib/auth-context';
import { ToastProvider } from '@/components/ui/Toast';
import type { Locale } from '@/locales';
import type { User } from '@/lib/types';

export function Providers({
  children,
  initialLocale,
  initialUser,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
  initialUser: User | null;
}) {
  return (
    <I18nProvider initialLocale={initialLocale}>
      <AuthProvider initialUser={initialUser}>
        <ToastProvider>{children}</ToastProvider>
      </AuthProvider>
    </I18nProvider>
  );
}
