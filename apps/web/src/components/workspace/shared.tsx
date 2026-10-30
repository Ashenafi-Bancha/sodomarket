'use client';

import React from 'react';
import type { LeadStage, ListingStatus } from '@/lib/types';
import type { Dictionary } from '@/locales';
import { Badge } from '@/components/ui/Badge';

export function StatusBadge({ status, t }: { status: ListingStatus; t: Dictionary }) {
  const tone =
    status === 'PUBLISHED'
      ? 'brand'
      : status === 'PENDING_REVIEW'
        ? 'blue'
        : status === 'CHANGES_REQUESTED'
          ? 'gold'
          : status === 'REJECTED'
            ? 'red'
            : 'neutral';
  return <Badge tone={tone}>{t.status[status]}</Badge>;
}

export function stageLabel(stage: LeadStage, t: Dictionary) {
  const map: Record<LeadStage, string> = {
    NEW_INQUIRY: t.crm.stageNewInquiry,
    CONTACT_ATTEMPTED: t.crm.stageContactAttempted,
    CONTACTED: t.crm.stageContacted,
    VIEWING_SCHEDULED: t.crm.stageViewingScheduled,
    NEGOTIATION: t.crm.stageNegotiation,
    FOLLOW_UP_REQUIRED: t.crm.stageFollowUp,
    WON: t.crm.stageWon,
    LOST: t.crm.stageLost,
  };
  return map[stage];
}

export function StageBadge({ stage, t }: { stage: LeadStage; t: Dictionary }) {
  const tone = stage === 'NEW_INQUIRY' ? 'blue' : stage === 'WON' ? 'brand' : stage === 'LOST' ? 'red' : stage === 'NEGOTIATION' ? 'gold' : 'neutral';
  return <Badge tone={tone}>{stageLabel(stage, t)}</Badge>;
}

export function StatCard({ label, value, icon, accent }: { label: string; value: React.ReactNode; icon: React.ReactNode; accent?: boolean }) {
  return (
    <div className={`rounded-3xl p-5 ring-1 ${accent ? 'bg-brand-900 text-white ring-brand-900' : 'bg-white ring-ink-100'}`}>
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent ? 'bg-white/10 text-gold-300' : 'bg-brand-50 text-brand-700'}`}>{icon}</div>
      <p className={`mt-4 text-3xl font-extrabold tracking-tight ${accent ? 'text-white' : 'text-ink-900'}`}>{value}</p>
      <p className={`mt-0.5 text-sm ${accent ? 'text-brand-100/70' : 'text-ink-500'}`}>{label}</p>
    </div>
  );
}

export function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl bg-white p-5 ring-1 ring-ink-100 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-ink-900">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Value for <input type="datetime-local"> from a Date. */
export function toLocalInput(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
