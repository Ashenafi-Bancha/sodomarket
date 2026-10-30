'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import type { User } from '@/lib/types';
import { useTranslation } from '@/lib/i18n-context';
import { useAuth } from '@/lib/auth-context';
import { api, errorMessage } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { FormAlert, Input, Label } from '@/components/ui/Input';

const DEMO_ACCOUNTS = [
  { label: 'Buyer', email: 'buyer.tariku@gmail.com' },
  { label: 'Owner', email: 'seller.bekele@wolaitamarketplace.et' },
  { label: 'Broker', email: 'broker.alemu@wolaitamarketplace.et' },
  { label: 'Car dealer', email: 'dealer.marta@wolaitamarketplace.et' },
  { label: 'Admin', email: 'admin@wolaitamarketplace.et' },
];
const DEMO_PASSWORD = 'DemoPass123!';

/** Only allow redirects to pages on this site. */
function safeNext(next?: string) {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';
}

export function LoginForm({ next, demoMode }: { next?: string; demoMode: boolean }) {
  const { t } = useTranslation();
  const { setUser } = useAuth();
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const signIn = async (id: string, pw: string) => {
    setBusy(true);
    setError('');
    try {
      const user = await api.post<User>('/auth/login', { identifier: id, password: pw });
      setUser(user);
      router.push(user.role === 'ADMIN' && !next ? '/admin' : safeNext(next));
      router.refresh();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight text-ink-900">{t.auth.signInTitle}</h1>
      <p className="mt-2 text-[15px] text-ink-500">{t.auth.signInSubtitle}</p>

      <form
        className="mt-8 space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          signIn(identifier, password);
        }}
      >
        <div>
          <Label htmlFor="identifier">{t.auth.emailOrPhone}</Label>
          <Input id="identifier" value={identifier} onChange={(e) => setIdentifier(e.target.value)} autoComplete="username" required />
        </div>
        <div>
          <Label htmlFor="password">{t.auth.password}</Label>
          <div className="relative">
            <Input
              id="password"
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-ink-400 hover:text-ink-700"
              aria-label={show ? 'Hide password' : 'Show password'}
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <FormAlert>{error}</FormAlert>
        <Button type="submit" size="lg" className="w-full" isLoading={busy}>
          {busy ? t.auth.signingIn : t.auth.signIn}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        {t.auth.noAccount}{' '}
        <Link href={`/register${next ? `?next=${encodeURIComponent(next)}` : ''}`} className="font-semibold text-brand-700 hover:underline">
          {t.auth.createOne}
        </Link>
      </p>

      {demoMode && (
        <div className="mt-8 rounded-2xl bg-ink-50 p-4 ring-1 ring-ink-100">
          <p className="text-sm font-bold text-ink-800">{t.auth.demoTitle}</p>
          <p className="mt-0.5 text-xs text-ink-500">{t.auth.demoHint}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {DEMO_ACCOUNTS.map((d) => (
              <button
                key={d.email}
                type="button"
                disabled={busy}
                onClick={() => signIn(d.email, DEMO_PASSWORD)}
                className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-ink-700 ring-1 ring-ink-200 hover:ring-brand-400 disabled:opacity-50"
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
