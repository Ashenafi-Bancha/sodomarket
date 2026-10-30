'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CalendarPlus, Handshake, Inbox, Phone } from 'lucide-react';
import type { LeadItem, LeadStage } from '@/lib/types';
import { useTranslation } from '@/lib/i18n-context';
import { api, errorMessage } from '@/lib/api-client';
import { formatPhone, formatPrice, listingPath, timeAgo, whatsappLink } from '@/lib/formatters';
import { LEAD_STAGES } from '@/lib/constants';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Input, Label, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/Misc';
import { StageBadge, stageLabel, toLocalInput } from './shared';
import { cn } from '@/lib/cn';

export function InquiriesTab({ leads }: { leads: LeadItem[] }) {
  const { t, locale } = useTranslation();
  const toast = useToast();
  const router = useRouter();
  const [filter, setFilter] = useState<'open' | 'all'>('open');
  const [viewingFor, setViewingFor] = useState<LeadItem | null>(null);
  const [dealFor, setDealFor] = useState<LeadItem | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const shown = filter === 'open' ? leads.filter((l) => l.stage !== 'WON' && l.stage !== 'LOST') : leads;

  const patch = async (id: string, body: Record<string, unknown>, msg?: string) => {
    try {
      await api.patch(`/leads/${id}`, body);
      if (msg) toast(msg);
      router.refresh();
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
  };

  if (!leads.length) {
    return <EmptyState icon={<Inbox className="h-7 w-7" />} title="No inquiries yet" description="When buyers message you about your listings, they will appear here." />;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(['open', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-semibold ring-1 ring-inset',
              filter === f ? 'bg-ink-900 text-white ring-ink-900' : 'bg-white text-ink-600 ring-ink-200'
            )}
          >
            {f === 'open' ? `Open (${leads.filter((l) => l.stage !== 'WON' && l.stage !== 'LOST').length})` : `${t.common.all} (${leads.length})`}
          </button>
        ))}
      </div>

      {shown.map((lead) => (
        <article key={lead.id} className="rounded-3xl bg-white p-5 ring-1 ring-ink-100">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <StageBadge stage={lead.stage} t={t} />
                {lead.source === 'VIEWING_REQUEST' && <span className="text-xs font-semibold text-violet-700">Viewing request</span>}
                <span className="text-xs text-ink-400">{timeAgo(lead.createdAt, locale)}</span>
              </div>
              <h3 className="mt-2 font-bold text-ink-900">{lead.customerName}</h3>
              {lead.listingTitle && lead.listingSlug && (
                <Link href={listingPath({ assetType: lead.listingAssetType ?? 'REAL_ESTATE', slug: lead.listingSlug })} className="text-sm text-brand-700 hover:underline">
                  {lead.listingTitle}
                </Link>
              )}
              <p className="mt-3 rounded-2xl bg-ink-50 px-4 py-3 text-[15px] leading-relaxed text-ink-700">{lead.message}</p>
              {(lead.budgetMax || lead.customerEmail) && (
                <p className="mt-2 text-sm text-ink-500">
                  {lead.budgetMax ? `Budget: ${formatPrice(lead.budgetMax)}` : ''}
                  {lead.budgetMax && lead.customerEmail ? ' · ' : ''}
                  {lead.customerEmail}
                </p>
              )}
              <div className="mt-3">
                <Label htmlFor={`notes-${lead.id}`} className="text-xs text-ink-500">
                  Private notes
                </Label>
                <Textarea
                  id={`notes-${lead.id}`}
                  rows={2}
                  className="min-h-0 text-sm"
                  value={notes[lead.id] ?? lead.notes ?? ''}
                  onChange={(e) => setNotes((n) => ({ ...n, [lead.id]: e.target.value }))}
                  onBlur={() => notes[lead.id] !== undefined && notes[lead.id] !== (lead.notes ?? '') && patch(lead.id, { notes: notes[lead.id] }, t.common.saved)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 lg:w-56">
              <div className="grid grid-cols-2 gap-2">
                <a href={`tel:${lead.customerPhone}`} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-ink-900 text-sm font-semibold text-white hover:bg-ink-800">
                  <Phone className="h-4 w-4" /> {t.listingDetail.callNow}
                </a>
                <a
                  href={whatsappLink(lead.customerPhone, `Hello ${lead.customerName}, thank you for your message about “${lead.listingTitle ?? ''}”.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-[#25D366]/10 text-sm font-semibold text-[#128C7E] hover:bg-[#25D366]/20"
                >
                  WhatsApp
                </a>
              </div>
              <p className="text-center text-xs text-ink-500">{formatPhone(lead.customerPhone)}</p>
              <select
                value={lead.stage}
                onChange={(e) => patch(lead.id, { stage: e.target.value as LeadStage }, stageLabel(e.target.value as LeadStage, t))}
                className="h-10 rounded-xl border border-ink-200 bg-white px-3 text-sm font-semibold text-ink-800"
                aria-label="Stage"
              >
                {LEAD_STAGES.map((s) => (
                  <option key={s} value={s}>
                    {stageLabel(s, t)}
                  </option>
                ))}
              </select>
              <Button variant="outline" size="sm" onClick={() => setViewingFor(lead)}>
                <CalendarPlus className="h-4 w-4" /> {t.crm.recordAppointment}
              </Button>
              {lead.listingId && (
                <Button variant="secondary" size="sm" onClick={() => setDealFor(lead)}>
                  <Handshake className="h-4 w-4" /> Record deal
                </Button>
              )}
            </div>
          </div>
        </article>
      ))}

      {viewingFor && <ScheduleModal lead={viewingFor} onClose={() => setViewingFor(null)} />}
      {dealFor && <DealModal lead={dealFor} onClose={() => setDealFor(null)} />}
    </div>
  );
}

function ScheduleModal({ lead, onClose }: { lead: LeadItem; onClose: () => void }) {
  const { t } = useTranslation();
  const toast = useToast();
  const router = useRouter();
  const [when, setWhen] = useState(() => toLocalInput(new Date(lead.nextFollowUpAt ?? Date.now() + 86_400_000)));
  const [place, setPlace] = useState('');
  const [busy, setBusy] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/appointments', {
        leadId: lead.id,
        title: `Viewing with ${lead.customerName}`,
        scheduledAt: new Date(when).toISOString(),
        locationNotes: place || undefined,
      });
      toast(t.crm.stageViewingScheduled);
      onClose();
      router.refresh();
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={t.crm.recordAppointment} subtitle={lead.customerName}>
      <form onSubmit={save} className="space-y-4">
        <div>
          <Label htmlFor="sv-when">{t.contact.preferredTime}</Label>
          <Input id="sv-when" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="sv-place" optional={t.common.optional}>
            Meeting point
          </Label>
          <Input id="sv-place" value={place} onChange={(e) => setPlace(e.target.value)} placeholder="e.g. In front of the Commercial Bank" />
        </div>
        <Button type="submit" className="w-full" isLoading={busy}>
          {t.crm.recordAppointment}
        </Button>
      </form>
    </Modal>
  );
}

function DealModal({ lead, onClose }: { lead: LeadItem; onClose: () => void }) {
  const { t } = useTranslation();
  const toast = useToast();
  const router = useRouter();
  const [price, setPrice] = useState(lead.budgetMax ? String(lead.budgetMax) : '');
  const [commission, setCommission] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/deals', {
        listingId: lead.listingId,
        leadId: lead.id,
        agreedPrice: Number(price.replace(/\D/g, '')),
        commissionExpected: commission ? Number(commission.replace(/\D/g, '')) : undefined,
        notes: notes || undefined,
      });
      toast(t.crm.stageWon);
      onClose();
      router.refresh();
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setBusy(false);
    }
  };

  const suggested = price ? Math.round(Number(price.replace(/\D/g, '')) * 0.02) : 0;

  return (
    <Modal isOpen onClose={onClose} title="Record a deal" subtitle={lead.listingTitle}>
      <form onSubmit={save} className="space-y-4">
        <div>
          <Label htmlFor="d-price">{t.crm.agreedPrice} (ETB)</Label>
          <Input id="d-price" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="d-comm" optional={t.common.optional}>
            {t.crm.commission} (ETB)
          </Label>
          <Input id="d-comm" inputMode="numeric" value={commission} onChange={(e) => setCommission(e.target.value)} placeholder={suggested ? `2% = ${suggested}` : ''} />
        </div>
        <div>
          <Label htmlFor="d-notes" optional={t.common.optional}>
            Notes
          </Label>
          <Textarea id="d-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <Button type="submit" className="w-full" isLoading={busy}>
          Save deal
        </Button>
      </form>
    </Modal>
  );
}
