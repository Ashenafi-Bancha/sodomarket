'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Briefcase, Home, Search } from 'lucide-react';
import type { User } from '@/lib/types';
import { useTranslation } from '@/lib/i18n-context';
import { useAuth } from '@/lib/auth-context';
import { api, errorMessage } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { FormAlert, Input, Label } from '@/components/ui/Input';
import { cn } from '@/lib/cn';

type AccountType = 'BUYER' | 'SELLER' | 'BROKER';

function safeNext(next?: string) {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : undefined;
}

export function RegisterForm({ next, initialType }: { next?: string; initialType?: AccountType }) {
  const { t, locale } = useTranslation();
  const { setUser } = useAuth();
  const router = useRouter();
  const [type, setType] = useState<AccountType>(initialType ?? 'BUYER');
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', businessName: '', licenseNumber: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const user = await api.post<User>('/auth/register', { ...form, accountType: type, preferredLocale: locale });
      setUser(user);
      router.push(safeNext(next) ?? (type === 'BUYER' ? '/' : '/sell'));
      router.refresh();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  const types: { id: AccountType; label: string; icon: React.ElementType }[] = [
    { id: 'BUYER', label: t.auth.buyer, icon: Search },
    { id: 'SELLER', label: t.auth.seller, icon: Home },
    { id: 'BROKER', label: t.auth.brokerType, icon: Briefcase },
  ];

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight text-ink-900">{t.auth.registerTitle}</h1>
      <p className="mt-2 text-[15px] text-ink-500">{t.auth.registerSubtitle}</p>

      <form onSubmit={submit} className="mt-8 space-y-5">
        <div>
          <Label>{t.auth.accountType}</Label>
          <div className="grid grid-cols-3 gap-2">
            {types.map((ty) => {
              const Icon = ty.icon;
              return (
                <button
                  key={ty.id}
                  type="button"
                  onClick={() => setType(ty.id)}
                  aria-pressed={type === ty.id}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-2xl px-2 py-3.5 text-center text-xs font-semibold ring-2 transition-all sm:text-sm',
                    type === ty.id ? 'bg-brand-50 text-brand-800 ring-brand-600' : 'bg-white text-ink-600 ring-ink-100 hover:ring-ink-200'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {ty.label}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <Label htmlFor="fullName">{t.auth.fullName}</Label>
          <Input id="fullName" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} autoComplete="name" required minLength={2} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="phone">{t.auth.phone}</Label>
            <Input id="phone" type="tel" inputMode="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="09XX XXX XXX" autoComplete="tel" required />
          </div>
          <div>
            <Label htmlFor="email">{t.auth.email}</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" required />
          </div>
        </div>
        {type === 'BROKER' && (
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="businessName" optional={t.common.optional}>
                {t.auth.businessName}
              </Label>
              <Input id="businessName" value={form.businessName} onChange={(e) => set('businessName', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="licenseNumber" optional={t.common.optional}>
                {t.auth.licenseNumber}
              </Label>
              <Input id="licenseNumber" value={form.licenseNumber} onChange={(e) => set('licenseNumber', e.target.value)} />
            </div>
          </div>
        )}
        <div>
          <Label htmlFor="password">{t.auth.password}</Label>
          <Input id="password" type="password" value={form.password} onChange={(e) => set('password', e.target.value)} autoComplete="new-password" required minLength={8} />
          <p className="mt-1 text-xs text-ink-400">{t.auth.passwordHint}</p>
        </div>
        <FormAlert>{error}</FormAlert>
        <Button type="submit" size="lg" className="w-full" isLoading={busy}>
          {busy ? t.auth.creating : t.auth.createAccount}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        {t.auth.haveAccount}{' '}
        <Link href={`/login${next ? `?next=${encodeURIComponent(next)}` : ''}`} className="font-semibold text-brand-700 hover:underline">
          {t.auth.signIn}
        </Link>
      </p>
    </div>
  );
}
