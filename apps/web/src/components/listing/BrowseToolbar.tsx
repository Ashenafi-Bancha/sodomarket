'use client';

import React, { useState } from 'react';
import { ArrowUpDown, SlidersHorizontal, X } from 'lucide-react';
import type { AssetType } from '@/lib/types';
import { useTranslation } from '@/lib/i18n-context';
import { fmt } from '@/locales';
import { formatNumber } from '@/lib/formatters';
import { Modal } from '@/components/ui/Modal';
import { FilterPanel } from './FilterPanel';
import { useFilterParams } from './useFilterParams';

export function BrowseToolbar({ total, lockAssetType }: { total: number; lockAssetType?: AssetType }) {
  const { t } = useTranslation();
  const { get, update, isPending } = useFilterParams();
  const [drawer, setDrawer] = useState(false);

  // Human-readable chips for each active filter.
  const chips: { key: string; label: string }[] = [];
  const q = get('q');
  if (q) chips.push({ key: 'q', label: `“${q}”` });
  const assetType = get('assetType');
  if (assetType && !lockAssetType) chips.push({ key: 'assetType', label: assetType === 'VEHICLE' ? t.home.tabVehicles : t.home.tabProperties });
  const category = get('category');
  if (category) {
    const label = (t.propertyType as Record<string, string>)[category] ?? (t.vehicleType as Record<string, string>)[category] ?? category;
    chips.push({ key: 'category', label });
  }
  const tx = get('transactionType');
  if (tx) chips.push({ key: 'transactionType', label: tx === 'FOR_RENT' ? t.filters.forRent : t.filters.forSale });
  if (get('zone')) chips.push({ key: 'zone', label: get('zone') });
  if (get('bedrooms')) chips.push({ key: 'bedrooms', label: `${get('bedrooms')}+ ${t.filters.bedrooms}` });
  const tr = get('transmission');
  if (tr) chips.push({ key: 'transmission', label: (t.transmission as Record<string, string>)[tr] ?? tr });
  const fuel = get('fuelType');
  if (fuel) chips.push({ key: 'fuelType', label: (t.fuel as Record<string, string>)[fuel] ?? fuel });
  if (get('minYear')) chips.push({ key: 'minYear', label: `${get('minYear')}+` });
  if (get('minPrice')) chips.push({ key: 'minPrice', label: `≥ ${formatNumber(Number(get('minPrice')))} ETB` });
  if (get('maxPrice')) chips.push({ key: 'maxPrice', label: `≤ ${formatNumber(Number(get('maxPrice')))} ETB` });

  const activeCount = chips.length;

  return (
    <div className="mb-6 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-ink-600" aria-live="polite">
          <span className="font-bold text-ink-900">{fmt(t.filters.resultsCount, { count: formatNumber(total) })}</span>
          {isPending && <span className="ml-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-brand-600 border-t-transparent align-middle" />}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDrawer(true)}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-ink-200 bg-white px-3.5 text-sm font-semibold text-ink-800 hover:bg-ink-50 lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {t.filters.title}
            {activeCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-700 px-1.5 text-[11px] text-white">
                {activeCount}
              </span>
            )}
          </button>
          <label className="relative">
            <span className="sr-only">{t.filters.sortBy}</span>
            <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <select
              value={get('sort') || 'newest'}
              onChange={(e) => update({ sort: e.target.value === 'newest' ? null : e.target.value })}
              className="h-10 cursor-pointer appearance-none rounded-xl border border-ink-200 bg-white pl-9 pr-4 text-sm font-semibold text-ink-800 hover:bg-ink-50 focus:outline-none"
            >
              <option value="newest">{t.filters.newest}</option>
              <option value="price_asc">{t.filters.priceLowHigh}</option>
              <option value="price_desc">{t.filters.priceHighLow}</option>
              <option value="popular">{t.filters.popular}</option>
            </select>
          </label>
        </div>
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {chips.map((c) => (
            <button
              key={c.key}
              onClick={() => update({ [c.key]: null })}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 py-1 pl-3 pr-2 text-sm font-medium text-brand-800 ring-1 ring-inset ring-brand-200 hover:bg-brand-100"
            >
              {c.label}
              <X className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
      )}

      <Modal isOpen={drawer} onClose={() => setDrawer(false)} title={t.filters.title}>
        <FilterPanel lockAssetType={lockAssetType} />
        <button
          onClick={() => setDrawer(false)}
          className="sticky bottom-0 mt-4 h-12 w-full rounded-xl bg-brand-700 text-[15px] font-bold text-white"
        >
          {t.filters.apply} ({formatNumber(total)})
        </button>
      </Modal>
    </div>
  );
}
