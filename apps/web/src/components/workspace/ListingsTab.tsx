'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, Heart, MessageCircle, Pencil, Plus, Trash2, Building2 } from 'lucide-react';
import type { ListingItem, ListingStatus } from '@/lib/types';
import { useTranslation } from '@/lib/i18n-context';
import { api, errorMessage } from '@/lib/api-client';
import { formatNumber, formatPrice, isRental, listingPath, timeAgo } from '@/lib/formatters';
import { OWNER_STATUSES } from '@/lib/constants';
import { useToast } from '@/components/ui/Toast';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/Misc';
import { StatusBadge } from './shared';

export function ListingsTab({ listings }: { listings: ListingItem[] }) {
  const { t, locale } = useTranslation();
  const toast = useToast();
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  const changeStatus = async (l: ListingItem, status: ListingStatus) => {
    setBusyId(l.id);
    try {
      await api.patch(`/listings/${l.id}`, { status });
      toast(t.status[status]);
      router.refresh();
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (l: ListingItem) => {
    if (!window.confirm(`${t.common.delete}: “${l.title}”?`)) return;
    setBusyId(l.id);
    try {
      await api.delete(`/listings/${l.id}`);
      toast(`${t.common.delete} ✓`);
      router.refresh();
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setBusyId(null);
    }
  };

  if (!listings.length) {
    return (
      <EmptyState
        icon={<Building2 className="h-7 w-7" />}
        title={t.home.readyToListTitle}
        description={t.home.readyToListDesc}
        action={
          <ButtonLink href="/sell">
            <Plus className="h-4 w-4" /> {t.home.postListingCta}
          </ButtonLink>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <ButtonLink href="/sell" size="sm">
          <Plus className="h-4 w-4" /> {t.nav.listAsset}
        </ButtonLink>
      </div>
      {listings.map((l) => {
        const canToggle = OWNER_STATUSES.includes(l.status) && !!l.publishedAt;
        const note = l.status === 'REJECTED' ? l.rejectionReason : l.status === 'CHANGES_REQUESTED' ? l.moderationNotes : undefined;
        return (
          <article key={l.id} className="flex flex-col gap-4 rounded-3xl bg-white p-4 ring-1 ring-ink-100 sm:flex-row sm:items-center">
            <Link href={listingPath(l)} className="shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={l.media[0]?.url?.replace(/w=\d+/, 'w=400')} alt="" className="aspect-[4/3] w-full rounded-2xl object-cover sm:w-36" />
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={l.status} t={t} />
                <span className="text-xs text-ink-400">{timeAgo(l.updatedAt, locale)}</span>
              </div>
              <Link href={listingPath(l)} className="mt-1.5 block truncate font-bold text-ink-900 hover:text-brand-700">
                {l.title}
              </Link>
              <p className="text-sm font-semibold text-ink-700">
                {formatPrice(l.price, l.currency)}
                {isRental(l) && <span className="font-normal text-ink-500"> {t.common.perMonth}</span>}
                <span className="font-normal text-ink-400"> · {l.location.zone}</span>
              </p>
              <p className="mt-1.5 flex gap-4 text-xs text-ink-500">
                <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {formatNumber(l.viewCount ?? 0)}</span>
                <span className="inline-flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" /> {l.leadCount ?? 0}</span>
                <span className="inline-flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> {l.favoriteCount ?? 0}</span>
              </p>
              {note && <p className="mt-2 rounded-xl bg-gold-50 px-3 py-2 text-sm text-gold-900">“{note}”</p>}
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-stretch">
              {canToggle && (
                <select
                  value={l.status}
                  disabled={busyId === l.id}
                  onChange={(e) => changeStatus(l, e.target.value as ListingStatus)}
                  className="h-9 rounded-xl border border-ink-200 bg-white px-3 text-sm font-semibold text-ink-800"
                  aria-label="Status"
                >
                  {OWNER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {t.status[s]}
                    </option>
                  ))}
                </select>
              )}
              <div className="flex gap-2">
                <ButtonLink href={`/sell?edit=${l.id}`} variant="outline" size="sm" className="flex-1">
                  <Pencil className="h-3.5 w-3.5" /> {t.common.edit}
                </ButtonLink>
                <button
                  onClick={() => remove(l)}
                  disabled={busyId === l.id}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-ink-200 text-ink-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  aria-label={t.common.delete}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
