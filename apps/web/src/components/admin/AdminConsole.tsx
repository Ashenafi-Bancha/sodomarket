'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  AlertTriangle,
  BadgeCheck,
  Check,
  ClipboardList,
  Flag,
  History,
  Inbox,
  ShieldCheck,
  Sparkles,
  UserX,
  Users,
  X,
  Pencil,
} from 'lucide-react';
import type { AuditLogItem, ListingItem, ReportItem, Role, User } from '@/lib/types';
import { useTranslation } from '@/lib/i18n-context';
import { api, errorMessage } from '@/lib/api-client';
import { formatDate, formatPrice, isRental, listingPath, timeAgo } from '@/lib/formatters';
import { categoryLabel, humanize } from '@/lib/labels';
import { useToast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { Avatar, EmptyState } from '@/components/ui/Misc';
import { StatCard } from '@/components/workspace/shared';
import { cn } from '@/lib/cn';

export interface AdminData {
  pending: (ListingItem & { possibleDuplicate: boolean })[];
  reports: ReportItem[];
  users: User[];
  auditLogs: AuditLogItem[];
  stats: { published: number; pending: number; openReports: number; userCount: number; leadsThisWeek: number };
}

type TabId = 'queue' | 'reports' | 'users' | 'audit';

export function AdminConsole({ data, currentUserId }: { data: AdminData; currentUserId: string }) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = (['queue', 'reports', 'users', 'audit'].includes(searchParams.get('tab') ?? '') ? searchParams.get('tab') : 'queue') as TabId;

  const tabs: { id: TabId; label: string; icon: React.ElementType; count?: number }[] = [
    { id: 'queue', label: t.admin.reviewQueue, icon: ClipboardList, count: data.pending.length },
    { id: 'reports', label: t.admin.reports, icon: Flag, count: data.stats.openReports },
    { id: 'users', label: t.admin.userManagement, icon: Users },
    { id: 'audit', label: t.admin.auditLogs, icon: History },
  ];

  return (
    <div className="container-page py-8 sm:py-10">
      <header>
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-red-600">
          <ShieldCheck className="h-4 w-4" /> Admin
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink-900">{t.admin.centerTitle}</h1>
        <p className="mt-1 text-[15px] text-ink-500">{t.admin.centerSubtitle}</p>
      </header>

      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard accent label={t.admin.statusPending} value={data.stats.pending} icon={<ClipboardList className="h-5 w-5" />} />
        <StatCard label={t.home.statListings} value={data.stats.published} icon={<BadgeCheck className="h-5 w-5" />} />
        <StatCard label={t.admin.reports} value={data.stats.openReports} icon={<Flag className="h-5 w-5" />} />
        <StatCard label="Inquiries this week" value={data.stats.leadsThisWeek} icon={<Inbox className="h-5 w-5" />} />
      </div>

      <nav className="no-scrollbar -mx-4 mt-8 flex gap-1 overflow-x-auto border-b border-ink-100 px-4 sm:mx-0 sm:px-0">
        {tabs.map((tb) => {
          const Icon = tb.icon;
          return (
            <button
              key={tb.id}
              onClick={() => router.replace(`${pathname}?tab=${tb.id}`, { scroll: false })}
              className={cn(
                '-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3.5 py-3 text-sm font-semibold',
                tab === tb.id ? 'border-brand-700 text-brand-800' : 'border-transparent text-ink-500 hover:text-ink-900'
              )}
            >
              <Icon className="h-4 w-4" /> {tb.label}
              {!!tb.count && <span className="rounded-full bg-red-600 px-1.5 text-[11px] text-white">{tb.count}</span>}
            </button>
          );
        })}
      </nav>

      <div className="mt-8">
        {tab === 'queue' && <ReviewQueue listings={data.pending} />}
        {tab === 'reports' && <ReportsList reports={data.reports} />}
        {tab === 'users' && <UsersTable users={data.users} currentUserId={currentUserId} />}
        {tab === 'audit' && <AuditTrail logs={data.auditLogs} />}
      </div>
    </div>
  );
}

function ReviewQueue({ listings }: { listings: AdminData['pending'] }) {
  const { t, locale } = useTranslation();
  const toast = useToast();
  const router = useRouter();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const act = async (id: string, action: 'approve' | 'reject' | 'request_changes' | 'feature') => {
    setBusy(id + action);
    try {
      await api.post(`/admin/listings/${id}`, { action, notes: notes[id] || undefined });
      toast(action === 'approve' ? t.admin.statusApproved : action === 'reject' ? t.admin.statusRejected : t.status.CHANGES_REQUESTED);
      router.refresh();
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setBusy(null);
    }
  };

  if (!listings.length) {
    return <EmptyState icon={<Check className="h-7 w-7" />} title="All caught up" description="There are no listings waiting for review." />;
  }

  return (
    <div className="space-y-4">
      {listings.map((l) => (
        <article key={l.id} className="overflow-hidden rounded-3xl bg-white ring-1 ring-ink-100">
          <div className="grid gap-0 md:grid-cols-[260px_1fr]">
            <div className="relative bg-ink-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={l.media[0]?.url?.replace(/w=\d+/, 'w=600')} alt="" className="aspect-[4/3] h-full w-full object-cover" />
              <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">{l.media.length} 📷</span>
            </div>
            <div className="p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="blue">{categoryLabel(l, t)}</Badge>
                <span className="text-xs text-ink-400">Submitted {timeAgo(l.createdAt, locale)}</span>
                {l.possibleDuplicate && (
                  <Badge tone="red">
                    <AlertTriangle className="h-3 w-3" /> {t.admin.duplicateWarning}
                  </Badge>
                )}
              </div>
              <Link href={listingPath(l)} target="_blank" className="mt-2 block text-lg font-bold text-ink-900 hover:text-brand-700">
                {l.title}
              </Link>
              <p className="text-sm font-semibold text-ink-700">
                {formatPrice(l.price, l.currency)}
                {isRental(l) && ` ${t.common.perMonth}`} · {l.location.zone}
                {l.location.kebele && `, Kebele ${l.location.kebele}`}
              </p>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-600">{l.description}</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <span className="flex items-center gap-1.5 text-ink-700">
                  <Avatar name={l.author.fullName} size="sm" /> {l.author.fullName}
                  {l.author.idVerified && <BadgeCheck className="h-4 w-4 text-brand-600" />}
                </span>
                <span className="text-ink-500">{l.author.phone}</span>
              </div>
              <p className="mt-3 rounded-xl bg-ink-50 px-3 py-2 text-sm italic text-ink-600">“{l.ownerDeclaration}”</p>
              <Textarea
                rows={2}
                className="mt-3 min-h-0 text-sm"
                placeholder={t.admin.moderationNotesPlaceholder}
                value={notes[l.id] ?? ''}
                onChange={(e) => setNotes((n) => ({ ...n, [l.id]: e.target.value }))}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => act(l.id, 'approve')} isLoading={busy === l.id + 'approve'}>
                  <Check className="h-4 w-4" /> {t.admin.approveListing}
                </Button>
                <Button size="sm" variant="outline" onClick={() => act(l.id, 'request_changes')} isLoading={busy === l.id + 'request_changes'}>
                  <Pencil className="h-4 w-4" /> {t.admin.requestChanges}
                </Button>
                <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => act(l.id, 'reject')} isLoading={busy === l.id + 'reject'}>
                  <X className="h-4 w-4" /> {t.admin.rejectListing}
                </Button>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function ReportsList({ reports }: { reports: ReportItem[] }) {
  const { t, locale } = useTranslation();
  const toast = useToast();
  const router = useRouter();

  const resolve = async (id: string, status: ReportItem['status'], unpublishListing = false) => {
    try {
      await api.patch(`/reports/${id}`, { status, unpublishListing });
      toast(humanize(status));
      router.refresh();
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
  };

  if (!reports.length) return <EmptyState icon={<Flag className="h-7 w-7" />} title="No reports" description="Reports from visitors will appear here." />;

  return (
    <div className="space-y-3">
      {reports.map((r) => {
        const open = r.status === 'OPEN' || r.status === 'UNDER_REVIEW';
        return (
          <article key={r.id} className={cn('rounded-3xl bg-white p-5 ring-1 ring-ink-100', !open && 'opacity-70')}>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={open ? 'red' : 'neutral'}>{humanize(r.status)}</Badge>
              <Badge tone="gold">{t.report.reasons[r.reason as keyof typeof t.report.reasons] ?? r.reason}</Badge>
              <span className="text-xs text-ink-400">{timeAgo(r.createdAt, locale)}</span>
            </div>
            {r.listingSlug ? (
              <Link href={listingPath({ assetType: r.listingAssetType ?? 'REAL_ESTATE', slug: r.listingSlug })} target="_blank" className="mt-2 block font-bold text-ink-900 hover:text-brand-700">
                {r.listingTitle}
              </Link>
            ) : (
              <p className="mt-2 font-bold">{r.listingTitle}</p>
            )}
            <p className="mt-1 text-[15px] text-ink-700">{r.details}</p>
            <p className="mt-1 text-sm text-ink-500">
              {[r.reporterEmail, r.reporterPhone].filter(Boolean).join(' · ')}
            </p>
            {open && (
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="danger" onClick={() => resolve(r.id, 'RESOLVED', true)}>
                  <UserX className="h-4 w-4" /> Take listing down
                </Button>
                <Button size="sm" onClick={() => resolve(r.id, 'RESOLVED')}>
                  <Check className="h-4 w-4" /> Resolved
                </Button>
                <Button size="sm" variant="outline" onClick={() => resolve(r.id, 'DISMISSED')}>
                  Dismiss
                </Button>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

const ROLES: Role[] = ['BUYER', 'SELLER', 'BROKER', 'AGENCY_ADMIN', 'ADMIN'];

function UsersTable({ users, currentUserId }: { users: User[]; currentUserId: string }) {
  const { locale } = useTranslation();
  const toast = useToast();
  const router = useRouter();
  const [q, setQ] = useState('');

  const update = async (id: string, body: Record<string, unknown>) => {
    try {
      await api.patch(`/admin/users/${id}`, body);
      toast('Updated');
      router.refresh();
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
  };

  const shown = users.filter((u) => `${u.fullName} ${u.email} ${u.phone} ${u.businessName ?? ''}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-4">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search name, email or phone…"
        className="h-11 w-full max-w-sm rounded-xl border border-ink-200 bg-white px-3.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
      />
      <div className="overflow-x-auto rounded-3xl bg-white ring-1 ring-ink-100">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-ink-100 text-xs uppercase tracking-wider text-ink-400">
            <tr>
              <th className="px-5 py-3 font-semibold">User</th>
              <th className="px-5 py-3 font-semibold">Role</th>
              <th className="px-5 py-3 font-semibold">Listings</th>
              <th className="px-5 py-3 font-semibold">Joined</th>
              <th className="px-5 py-3 font-semibold">Verification</th>
              <th className="px-5 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {shown.map((u) => (
              <tr key={u.id} className={cn(!u.isActive && 'bg-red-50/40')}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={u.fullName} size="sm" />
                    <div className="min-w-0">
                      <p className="flex items-center gap-1 font-semibold text-ink-900">
                        {u.fullName} {u.idVerified && <BadgeCheck className="h-4 w-4 text-brand-600" />}
                      </p>
                      <p className="truncate text-xs text-ink-500">
                        {u.email} · {u.phone}
                      </p>
                      {u.licenseNumber && <p className="text-xs text-ink-400">License {u.licenseNumber}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <select
                    value={u.role}
                    disabled={u.id === currentUserId}
                    onChange={(e) => update(u.id, { role: e.target.value })}
                    className="h-9 rounded-lg border border-ink-200 bg-white px-2 text-xs font-semibold"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {humanize(r)}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-5 py-3 text-ink-700">{u.listingCount ?? 0}</td>
                <td className="px-5 py-3 text-ink-500">{formatDate(u.createdAt, locale)}</td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => update(u.id, { idVerified: !u.idVerified })}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ring-1',
                      u.idVerified ? 'bg-brand-50 text-brand-800 ring-brand-200' : 'bg-white text-ink-600 ring-ink-200 hover:ring-brand-300'
                    )}
                  >
                    {u.idVerified ? <><BadgeCheck className="h-3.5 w-3.5" /> Verified</> : 'Verify'}
                  </button>
                </td>
                <td className="px-5 py-3">
                  {u.id !== currentUserId && (
                    <button
                      onClick={() => update(u.id, { isActive: !u.isActive })}
                      className={cn('text-xs font-semibold', u.isActive ? 'text-red-600 hover:underline' : 'text-brand-700 hover:underline')}
                    >
                      {u.isActive ? 'Suspend' : 'Reactivate'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AuditTrail({ logs }: { logs: AuditLogItem[] }) {
  const { locale } = useTranslation();
  return (
    <ol className="space-y-2">
      {logs.map((log) => (
        <li key={log.id} className="flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-ink-100">
          <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-50 text-ink-500">
            {log.action.includes('APPROVED') || log.action.includes('VERIFIED') ? (
              <Check className="h-4 w-4 text-brand-600" />
            ) : log.action.includes('FEATURED') ? (
              <Sparkles className="h-4 w-4 text-gold-600" />
            ) : (
              <History className="h-4 w-4" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm">
              <span className="font-semibold text-ink-900">{log.actorName}</span>{' '}
              <span className="text-ink-600">{humanize(log.action).toLowerCase()}</span>
            </p>
            {log.metadata && <p className="truncate text-sm text-ink-500">{log.metadata}</p>}
          </div>
          <span className="shrink-0 text-xs text-ink-400">{timeAgo(log.createdAt, locale)}</span>
        </li>
      ))}
    </ol>
  );
}
