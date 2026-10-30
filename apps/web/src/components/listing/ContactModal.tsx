'use client';

import React, { useState } from 'react';
import { CalendarCheck, CheckCircle2, Lock } from 'lucide-react';
import type { ListingItem } from '@/lib/types';
import { useTranslation } from '@/lib/i18n-context';
import { useAuth } from '@/lib/auth-context';
import { fmt } from '@/locales';
import { api, errorMessage } from '@/lib/api-client';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { FormAlert, Input, Label, Textarea } from '@/components/ui/Input';

export type ContactMode = 'INQUIRY' | 'VIEWING';

/** Default viewing slot: tomorrow at 10:00 local time, formatted for <input type="datetime-local">. */
function defaultSlot() {
  const d = new Date(Date.now() + 86_400_000);
  d.setHours(10, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ContactModal({
  listing,
  mode,
  isOpen,
  onClose,
}: {
  listing: ListingItem;
  mode: ContactMode;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { user } = useAuth();
  // The modal is mounted fresh each time it opens, so initial values are enough.
  const [name, setName] = useState(user?.fullName ?? '');
  const [phone, setPhone] = useState(user?.phone ? user.phone.replace(/^\+251/, '0') : '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [budget, setBudget] = useState('');
  const [message, setMessage] = useState(() =>
    fmt(mode === 'VIEWING' ? t.contact.viewingMessage : t.contact.defaultMessage, { title: listing.title })
  );
  const [when, setWhen] = useState(defaultSlot);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.post('/leads', {
        listingId: listing.id,
        type: mode,
        customerName: name,
        customerPhone: phone,
        customerEmail: email || undefined,
        budgetMax: budget ? Number(budget.replace(/\D/g, '')) : undefined,
        message,
        preferredAt: mode === 'VIEWING' ? new Date(when).toISOString() : undefined,
      });
      setDone(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const title = mode === 'VIEWING' ? t.contact.viewingTitle : t.contact.inquiryTitle;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={done ? '' : title} subtitle={done ? undefined : listing.title}>
      {done ? (
        <div className="py-6 text-center">
          <div className="mx-auto flex h-16 w-16 animate-scale-in items-center justify-center rounded-full bg-brand-50">
            {mode === 'VIEWING' ? <CalendarCheck className="h-8 w-8 text-brand-600" /> : <CheckCircle2 className="h-8 w-8 text-brand-600" />}
          </div>
          <h3 className="mt-5 text-xl font-bold text-ink-900">{mode === 'VIEWING' ? t.contact.viewingSent : t.contact.inquirySent}</h3>
          <p className="mx-auto mt-2 max-w-sm text-[15px] text-ink-500">
            {mode === 'VIEWING' ? t.contact.viewingSentDesc : t.contact.inquirySentDesc}
          </p>
          <Button onClick={onClose} variant="outline" className="mt-6">
            {t.common.close}
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="c-name">{t.contact.yourName}</Label>
              <Input id="c-name" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} autoComplete="name" />
            </div>
            <div>
              <Label htmlFor="c-phone">{t.contact.yourPhone}</Label>
              <Input
                id="c-phone"
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09XX XXX XXX"
                required
                autoComplete="tel"
              />
            </div>
          </div>
          {mode === 'VIEWING' ? (
            <div>
              <Label htmlFor="c-when">{t.contact.preferredTime}</Label>
              <Input id="c-when" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} required />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="c-email" optional={t.common.optional}>
                  {t.contact.yourEmail}
                </Label>
                <Input id="c-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              </div>
              <div>
                <Label htmlFor="c-budget" optional={t.common.optional}>
                  {t.contact.budget}
                </Label>
                <Input id="c-budget" inputMode="numeric" value={budget} onChange={(e) => setBudget(e.target.value)} />
              </div>
            </div>
          )}
          <div>
            <Label htmlFor="c-msg">{t.contact.message}</Label>
            <Textarea id="c-msg" value={message} onChange={(e) => setMessage(e.target.value)} required minLength={5} rows={4} />
          </div>
          <FormAlert>{error}</FormAlert>
          <Button type="submit" size="lg" className="w-full" isLoading={busy}>
            {busy ? t.common.sending : mode === 'VIEWING' ? t.contact.requestViewing : t.contact.sendInquiry}
          </Button>
          <p className="flex items-center justify-center gap-1.5 text-xs text-ink-400">
            <Lock className="h-3.5 w-3.5" /> {t.contact.privacy}
          </p>
        </form>
      )}
    </Modal>
  );
}
