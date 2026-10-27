'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Search, LayoutGrid } from 'lucide-react';
import { useTranslation } from '@/lib/i18n-context';
import { PROPERTY_TYPES, VEHICLE_TYPES, ZONE_NAMES } from '@/lib/constants';
import { cn } from '@/lib/cn';

type Tab = 'all' | 'REAL_ESTATE' | 'VEHICLE';

export function HeroSearch() {
  const { t } = useTranslation();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('all');
  const [q, setQ] = useState('');
  const [zone, setZone] = useState('');
  const [category, setCategory] = useState('');

  const categories =
    tab === 'VEHICLE'
      ? VEHICLE_TYPES.map((c) => ({ value: c, label: t.vehicleType[c] }))
      : tab === 'REAL_ESTATE'
        ? PROPERTY_TYPES.map((c) => ({ value: c, label: t.propertyType[c] }))
        : [];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (zone) params.set('zone', zone);
    if (category) params.set('category', category);
    const base = tab === 'VEHICLE' ? '/vehicles' : tab === 'REAL_ESTATE' ? '/properties' : '/search';
    const qs = params.toString();
    router.push(qs ? `${base}?${qs}` : base);
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'all', label: t.home.tabAll },
    { id: 'REAL_ESTATE', label: t.home.tabProperties },
    { id: 'VEHICLE', label: t.home.tabVehicles },
  ];

  const selectClass =
    'h-full w-full cursor-pointer appearance-none bg-transparent pl-10 pr-3 text-[15px] font-medium text-ink-800 focus:outline-none';

  return (
    <div className="w-full max-w-3xl">
      <div className="mb-3 inline-flex rounded-2xl bg-white/10 p-1 ring-1 ring-white/15 backdrop-blur" role="tablist">
        {tabs.map((tb) => (
          <button
            key={tb.id}
            role="tab"
            aria-selected={tab === tb.id}
            onClick={() => {
              setTab(tb.id);
              setCategory('');
            }}
            className={cn(
              'rounded-xl px-4 py-2 text-sm font-semibold transition-all',
              tab === tb.id ? 'bg-white text-brand-900 shadow-soft' : 'text-white/80 hover:text-white'
            )}
          >
            {tb.label}
          </button>
        ))}
      </div>

      <form
        onSubmit={submit}
        className="flex flex-col gap-1 rounded-3xl bg-white p-2 shadow-lift sm:flex-row sm:items-stretch sm:gap-0"
      >
        <label className="relative flex h-14 flex-[1.6] items-center">
          <span className="sr-only">{t.filters.keyword}</span>
          <Search className="pointer-events-none absolute left-4 h-5 w-5 text-ink-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.home.searchPlaceholder}
            className="h-full w-full rounded-2xl bg-transparent pl-12 pr-3 text-[15px] text-ink-900 placeholder:text-ink-400 focus:outline-none"
          />
        </label>
        <div className="hidden w-px self-stretch bg-ink-100 sm:block" />
        <label className="relative flex h-14 flex-1 items-center rounded-2xl bg-ink-50 sm:bg-transparent">
          <span className="sr-only">{t.filters.location}</span>
          <MapPin className="pointer-events-none absolute left-3.5 h-[18px] w-[18px] text-brand-600" />
          <select value={zone} onChange={(e) => setZone(e.target.value)} className={selectClass}>
            <option value="">{t.home.allLocations}</option>
            {ZONE_NAMES.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </label>
        {categories.length > 0 && (
          <>
            <div className="hidden w-px self-stretch bg-ink-100 sm:block" />
            <label className="relative flex h-14 flex-1 items-center rounded-2xl bg-ink-50 sm:bg-transparent">
              <span className="sr-only">{t.filters.category}</span>
              <LayoutGrid className="pointer-events-none absolute left-3.5 h-[18px] w-[18px] text-brand-600" />
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
                <option value="">{t.home.allCategories}</option>
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}
        <button
          type="submit"
          className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-brand-700 px-7 text-[15px] font-bold text-white transition-colors hover:bg-brand-800"
        >
          <Search className="h-5 w-5" />
          {t.home.searchButton}
        </button>
      </form>
    </div>
  );
}
