'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CalendarCheck, CalendarDays, Check, Handshake, MapPin, X } from 'lucide-react';
import type { AppointmentItem, AppointmentStatus, DealItem } from '@/lib/types';
import { useTranslation } from '@/lib/i18n-context';
import { api, errorMessage } from '@/lib/api-client';
import { formatDateTime, formatPrice, listingPath } from '@/lib/formatters';
import { useToast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/Misc';

const apptTone: Record<AppointmentStatus, 'violet' | 'brand' | 'gold' | 'neutral' | 'red'> = {
  REQUESTED: 'violet',
  CONFIRMED: 'brand',
  RESCHEDULED: 'gold',
  COMPLETED: 'neutral',
  CANCELLED: 'red',
};

export function ViewingsTab({ appointments }: { appointments: AppointmentItem[] }) {
  const { t, locale } = useTranslation();
  const toast = useToast();
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [now] = useState(() => Date.now());

  const update = async (id: string, status: AppointmentStatus) => {
    setBusy(id);
    try {
      await api.patch(`/appointments/${id}`, { status });
      toast(status.charAt(0) + status.slice(1).toLowerCase());
      router.refresh();
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setBusy(null);
    }
  };

  if (!appointments.length) {
    return <EmptyState icon={<CalendarDays className="h-7 w-7" />} title="No viewings yet" description="Viewing requests from buyers and viewings you schedule will appear here." />;
  }

  const upcoming = appointments.filter((a) => new Date(a.scheduledAt).getTime() >= now - 3_600_000 && a.status !== 'CANCELLED' && a.status !== 'COMPLETED');
  const past = appointments.filter((a) => !upcoming.includes(a));

  const Row = ({ a }: { a: AppointmentItem }) => (
    <article className="flex flex-col gap-4 rounded-3xl bg-white p-5 ring-1 ring-ink-100 sm:flex-row sm:items-center">
      <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-brand-50 text-brand-800">
        <span className="text-xs font-bold uppercase">{new Date(a.scheduledAt).toLocaleDateString('en-GB', { month: 'short', timeZone: 'Africa/Addis_Ababa' })}</span>
        <span className="text-2xl font-extrabold leading-none">{new Date(a.scheduledAt).toLocaleDateString('en-GB', { day: 'numeric', timeZone: 'Africa/Addis_Ababa' })}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={apptTone[a.status]}>{a.status === 'REQUESTED' ? 'Requested by buyer' : a.status.charAt(0) + a.status.slice(1).toLowerCase()}</Badge>
          <span className="text-sm font-semibold text-ink-700">{formatDateTime(a.scheduledAt, locale)}</span>
        </div>
        <p className="mt-1 font-bold text-ink-900">{a.title}</p>
        {a.listingTitle && a.listingSlug && (
          <Link href={listingPath({ assetType: a.listingAssetType ?? 'REAL_ESTATE', slug: a.listingSlug })} className="text-sm text-brand-700 hover:underline">
            {a.listingTitle}
          </Link>
        )}
        {a.locationNotes && (
          <p className="mt-1 flex items-start gap-1.5 text-sm text-ink-500">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {a.locationNotes}
          </p>
        )}
      </div>
      {upcoming.includes(a) && (
        <div className="flex gap-2">
          {a.status === 'REQUESTED' && (
            <Button size="sm" onClick={() => update(a.id, 'CONFIRMED')} isLoading={busy === a.id}>
              <Check className="h-4 w-4" /> Confirm
            </Button>
          )}
          {a.status !== 'REQUESTED' && (
            <Button size="sm" variant="secondary" onClick={() => update(a.id, 'COMPLETED')} isLoading={busy === a.id}>
              <CalendarCheck className="h-4 w-4" /> Done
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => update(a.id, 'CANCELLED')} disabled={busy === a.id}>
            <X className="h-4 w-4" /> {t.common.cancel}
          </Button>
        </div>
      )}
    </article>
  );

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-ink-400">Upcoming ({upcoming.length})</h3>
        {upcoming.length ? upcoming.map((a) => <Row key={a.id} a={a} />) : <p className="text-sm text-ink-500">Nothing scheduled.</p>}
      </div>
      {past.length > 0 && (
        <div className="space-y-3 opacity-80">
          <h3 className="text-sm font-bold uppercase tracking-wider text-ink-400">Past & cancelled</h3>
          {past.map((a) => (
            <Row key={a.id} a={a} />
          ))}
        </div>
      )}
    </div>
  );
}

export function DealsTab({ deals }: { deals: DealItem[] }) {
  const { t } = useTranslation();
  const toast = useToast();
  const router = useRouter();

  const update = async (id: string, body: Record<string, unknown>) => {
    try {
      await api.patch(`/deals/${id}`, body);
      toast(t.common.saved);
      router.refresh();
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
  };

  if (!deals.length) {
    return <EmptyState icon={<Handshake className="h-7 w-7" />} title="No deals yet" description="Record a deal from an inquiry when you agree a price with a buyer." />;
  }

  const expected = deals.filter((d) => d.status !== 'CANCELLED').reduce((s, d) => s + (d.commissionExpected ?? 0), 0);
  const paid = deals.reduce((s, d) => s + (d.commissionPaid ?? 0), 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-3xl bg-white p-5 ring-1 ring-ink-100">
          <p className="text-sm text-ink-500">{t.crm.commission} (expected)</p>
          <p className="mt-1 text-2xl font-extrabold text-ink-900">{formatPrice(expected)}</p>
        </div>
        <div className="rounded-3xl bg-brand-900 p-5 text-white">
          <p className="text-sm text-brand-100/70">{t.crm.commission} (received)</p>
          <p className="mt-1 text-2xl font-extrabold">{formatPrice(paid)}</p>
        </div>
      </div>
      {deals.map((d) => (
        <article key={d.id} className="flex flex-col gap-4 rounded-3xl bg-white p-5 ring-1 ring-ink-100 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Badge tone={d.status === 'COMPLETED' ? 'brand' : d.status === 'CANCELLED' ? 'red' : 'gold'}>
                {d.status === 'IN_PROGRESS' ? 'In progress' : d.status.charAt(0) + d.status.slice(1).toLowerCase()}
              </Badge>
            </div>
            <p className="mt-1.5 font-bold text-ink-900">{d.listingTitle}</p>
            <p className="text-sm text-ink-600">
              {t.crm.agreedPrice}: <strong>{formatPrice(d.agreedPrice, d.currency)}</strong>
              {d.commissionExpected ? ` · ${t.crm.commission}: ${formatPrice(d.commissionExpected)}` : ''}
            </p>
            {d.notes && <p className="mt-1 text-sm text-ink-500">{d.notes}</p>}
          </div>
          {d.status === 'IN_PROGRESS' && (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => update(d.id, { status: 'COMPLETED', commissionPaid: d.commissionExpected ?? 0 })}>
                <Check className="h-4 w-4" /> Completed & paid
              </Button>
              <Button size="sm" variant="outline" onClick={() => update(d.id, { status: 'CANCELLED' })}>
                {t.common.cancel}
              </Button>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
