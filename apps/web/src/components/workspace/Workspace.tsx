'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  AlertTriangle,
  Building2,
  CalendarDays,
  ChevronRight,
  Clock,
  Handshake,
  Heart,
  Inbox,
  LayoutDashboard,
  MessageSquare,
  Plus,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';
import type { AppointmentItem, DealItem, LeadItem, ListingItem, User } from '@/lib/types';
import { useTranslation } from '@/lib/i18n-context';
import { formatDateTime, listingPath, timeAgo } from '@/lib/formatters';
import { sellerTypeLabel } from '@/lib/labels';
import { ButtonLink } from '@/components/ui/Button';
import { Avatar, EmptyState } from '@/components/ui/Misc';
import { ListingGrid } from '@/components/listing/ListingCard';
import { ListingsTab } from './ListingsTab';
import { InquiriesTab } from './InquiriesTab';
import { DealsTab, ViewingsTab } from './ViewingsDealsTabs';
import { ProfileTab } from './ProfileTab';
import { Panel, StageBadge, StatCard } from './shared';
import { cn } from '@/lib/cn';

export interface WorkspaceData {
  listings: ListingItem[];
  leads: LeadItem[];
  appointments: AppointmentItem[];
  deals: DealItem[];
  favorites: ListingItem[];
  inquiries: LeadItem[];
}

type TabId = 'overview' | 'listings' | 'inquiries' | 'viewings' | 'deals' | 'saved' | 'messages' | 'profile';

export function Workspace({ user, data }: { user: User; data: WorkspaceData }) {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [now] = useState(() => Date.now());
  const isPro = user.role === 'BROKER' || user.role === 'AGENCY_ADMIN' || user.role === 'ADMIN';
  const sells = isPro || user.role === 'SELLER' || data.listings.length > 0;

  const openLeads = data.leads.filter((l) => l.stage !== 'WON' && l.stage !== 'LOST');
  const newLeads = data.leads.filter((l) => l.stage === 'NEW_INQUIRY');
  const requested = data.appointments.filter((a) => a.status === 'REQUESTED');
  const upcoming = data.appointments.filter(
    (a) => (a.status === 'CONFIRMED' || a.status === 'RESCHEDULED') && new Date(a.scheduledAt).getTime() > now
  );
  const needsWork = data.listings.filter((l) => l.status === 'CHANGES_REQUESTED' || l.status === 'REJECTED');

  const tabs: { id: TabId; label: string; icon: React.ElementType; count?: number; show: boolean }[] = [
    { id: 'overview', label: t.crm.overview, icon: LayoutDashboard, show: sells },
    { id: 'listings', label: t.crm.myListings, icon: Building2, count: data.listings.length, show: sells },
    { id: 'inquiries', label: t.crm.leadsTitle, icon: Inbox, count: newLeads.length || undefined, show: sells },
    { id: 'viewings', label: t.crm.appointmentsTitle, icon: CalendarDays, count: requested.length || undefined, show: sells },
    { id: 'deals', label: t.crm.dealsTitle, icon: Handshake, show: isPro || data.deals.length > 0 },
    { id: 'saved', label: t.crm.saved, icon: Heart, count: data.favorites.length, show: true },
    { id: 'messages', label: t.crm.sentInquiries, icon: MessageSquare, count: data.inquiries.length || undefined, show: true },
    { id: 'profile', label: t.crm.profile, icon: UserIcon, show: true },
  ];
  const visible = tabs.filter((tb) => tb.show);
  const requestedTab = searchParams.get('tab') as TabId | null;
  const active: TabId = visible.some((tb) => tb.id === requestedTab) ? requestedTab! : visible[0].id;

  const go = (id: TabId) => router.replace(`${pathname}?tab=${id}`, { scroll: false });

  return (
    <div className="container-page py-8 sm:py-10">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar name={user.fullName} src={user.avatarUrl} size="lg" />
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
              {user.businessName && isPro ? user.businessName : user.fullName}
              {user.idVerified && <ShieldCheck className="h-6 w-6 text-brand-600" />}
            </h1>
            <p className="text-sm text-ink-500">
              {sellerTypeLabel(user.role, t)}
              {user.role === 'BUYER' && ' · '}
              {user.role === 'BUYER' && t.auth.buyer}
            </p>
          </div>
        </div>
        <ButtonLink href="/sell" variant="accent">
          <Plus className="h-4 w-4" /> {t.nav.listAsset}
        </ButtonLink>
      </header>

      <nav className="no-scrollbar -mx-4 mt-8 flex gap-1 overflow-x-auto border-b border-ink-100 px-4 sm:mx-0 sm:px-0" aria-label="Workspace">
        {visible.map((tb) => {
          const Icon = tb.icon;
          return (
            <button
              key={tb.id}
              onClick={() => go(tb.id)}
              aria-current={active === tb.id ? 'page' : undefined}
              className={cn(
                '-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3.5 py-3 text-sm font-semibold transition-colors',
                active === tb.id ? 'border-brand-700 text-brand-800' : 'border-transparent text-ink-500 hover:text-ink-900'
              )}
            >
              <Icon className="h-4 w-4" />
              {tb.label}
              {tb.count !== undefined && tb.count > 0 && (
                <span className={cn('rounded-full px-1.5 text-[11px]', active === tb.id ? 'bg-brand-700 text-white' : 'bg-ink-100 text-ink-600')}>
                  {tb.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-8">
        {active === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard accent label={t.crm.activeListings} value={data.listings.filter((l) => l.status === 'PUBLISHED').length} icon={<Building2 className="h-5 w-5" />} />
              <StatCard label={t.crm.pendingListings} value={data.listings.filter((l) => l.status === 'PENDING_REVIEW').length} icon={<Clock className="h-5 w-5" />} />
              <StatCard label={t.crm.inquiriesCount} value={openLeads.length} icon={<Inbox className="h-5 w-5" />} />
              <StatCard label={t.crm.upcomingAppointments} value={upcoming.length} icon={<CalendarDays className="h-5 w-5" />} />
            </div>

            {(needsWork.length > 0 || requested.length > 0) && (
              <div className="space-y-2">
                {needsWork.map((l) => (
                  <Link key={l.id} href={`/sell?edit=${l.id}`} className="flex items-center gap-3 rounded-2xl bg-gold-50 p-4 text-sm text-gold-900 ring-1 ring-gold-200 hover:bg-gold-100">
                    <AlertTriangle className="h-5 w-5 shrink-0 text-gold-600" />
                    <span className="flex-1">
                      <strong>{t.status[l.status]}:</strong> {l.title}
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                ))}
                {requested.map((a) => (
                  <button key={a.id} onClick={() => go('viewings')} className="flex w-full items-center gap-3 rounded-2xl bg-violet-50 p-4 text-left text-sm text-violet-900 ring-1 ring-violet-200 hover:bg-violet-100">
                    <CalendarDays className="h-5 w-5 shrink-0 text-violet-600" />
                    <span className="flex-1">
                      <strong>{a.title}</strong> — {formatDateTime(a.scheduledAt, locale)}
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ))}
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
              <Panel
                title={t.crm.leadsTitle}
                action={
                  <button onClick={() => go('inquiries')} className="text-sm font-semibold text-brand-700 hover:underline">
                    {t.common.viewAll}
                  </button>
                }
              >
                {data.leads.length === 0 ? (
                  <p className="text-sm text-ink-500">No inquiries yet.</p>
                ) : (
                  <ul className="divide-y divide-ink-100">
                    {data.leads.slice(0, 5).map((l) => (
                      <li key={l.id} className="flex items-center gap-3 py-3">
                        <Avatar name={l.customerName} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-ink-900">{l.customerName}</p>
                          <p className="truncate text-xs text-ink-500">{l.listingTitle}</p>
                        </div>
                        <StageBadge stage={l.stage} t={t} />
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
              <Panel
                title={t.crm.upcomingAppointments}
                action={
                  <button onClick={() => go('viewings')} className="text-sm font-semibold text-brand-700 hover:underline">
                    {t.common.viewAll}
                  </button>
                }
              >
                {upcoming.length === 0 ? (
                  <p className="text-sm text-ink-500">Nothing scheduled.</p>
                ) : (
                  <ul className="divide-y divide-ink-100">
                    {upcoming.slice(0, 5).map((a) => (
                      <li key={a.id} className="py-3">
                        <p className="text-sm font-semibold text-ink-900">{a.title}</p>
                        <p className="text-xs text-ink-500">{formatDateTime(a.scheduledAt, locale)}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            </div>
          </div>
        )}

        {active === 'listings' && <ListingsTab listings={data.listings} />}
        {active === 'inquiries' && <InquiriesTab leads={data.leads} />}
        {active === 'viewings' && <ViewingsTab appointments={data.appointments} />}
        {active === 'deals' && <DealsTab deals={data.deals} />}
        {active === 'saved' &&
          (data.favorites.length ? (
            <ListingGrid listings={data.favorites} savedIds={data.favorites.map((f) => f.id)} />
          ) : (
            <EmptyState
              icon={<Heart className="h-7 w-7" />}
              title={t.nav.saved}
              description="Tap the heart on any listing to save it here."
              action={<ButtonLink href="/search">{t.common.search}</ButtonLink>}
            />
          ))}
        {active === 'messages' &&
          (data.inquiries.length ? (
            <ul className="space-y-3">
              {data.inquiries.map((l) => (
                <li key={l.id} className="flex flex-col gap-3 rounded-3xl bg-white p-5 ring-1 ring-ink-100 sm:flex-row sm:items-center">
                  {l.listingImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={l.listingImage.replace(/w=\d+/, 'w=300')} alt="" className="aspect-[4/3] w-full rounded-2xl object-cover sm:w-28" />
                  )}
                  <div className="min-w-0 flex-1">
                    {l.listingSlug ? (
                      <Link href={listingPath({ assetType: l.listingAssetType ?? 'REAL_ESTATE', slug: l.listingSlug })} className="font-bold text-ink-900 hover:text-brand-700">
                        {l.listingTitle}
                      </Link>
                    ) : (
                      <p className="font-bold text-ink-900">{l.listingTitle ?? '—'}</p>
                    )}
                    <p className="mt-1 line-clamp-2 text-sm text-ink-600">{l.message}</p>
                    <p className="mt-1 text-xs text-ink-400">{timeAgo(l.createdAt, locale)}</p>
                  </div>
                  <StageBadge stage={l.stage} t={t} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={<MessageSquare className="h-7 w-7" />}
              title={t.crm.sentInquiries}
              description="Messages and viewing requests you send to sellers will appear here."
              action={<ButtonLink href="/search">{t.common.search}</ButtonLink>}
            />
          ))}
        {active === 'profile' && <ProfileTab user={user} />}
      </div>
    </div>
  );
}
