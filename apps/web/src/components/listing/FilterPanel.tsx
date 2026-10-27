'use client';

import React, { useEffect, useState } from 'react';
import { RotateCcw, Search } from 'lucide-react';
import type { AssetType } from '@/lib/types';
import { useTranslation } from '@/lib/i18n-context';
import { FUEL_TYPES, PROPERTY_TYPES, VEHICLE_TYPES, ZONE_NAMES } from '@/lib/constants';
import { Select } from '@/components/ui/Input';
import { useFilterParams } from './useFilterParams';
import { cn } from '@/lib/cn';

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-full px-3.5 py-1.5 text-sm font-medium ring-1 ring-inset transition-colors',
        active ? 'bg-brand-700 text-white ring-brand-700' : 'bg-white text-ink-700 ring-ink-200 hover:ring-ink-300'
      )}
    >
      {children}
    </button>
  );
}

function Segmented({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex rounded-xl bg-ink-100 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={cn(
            'flex-1 rounded-lg px-2 py-2 text-sm font-semibold transition-all',
            value === o.value ? 'bg-white text-ink-900 shadow-soft' : 'text-ink-500 hover:text-ink-800'
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-ink-100 py-5 last:border-0">
      <h3 className="mb-3 text-sm font-bold text-ink-900">{title}</h3>
      {children}
    </div>
  );
}

export function FilterPanel({ lockAssetType, onApplied }: { lockAssetType?: AssetType; onApplied?: () => void }) {
  const { t } = useTranslation();
  const { get, update, clear } = useFilterParams();

  const assetType = (lockAssetType ?? get('assetType')) as AssetType | '';
  const [q, setQ] = useState(get('q'));
  const [minPrice, setMinPrice] = useState(get('minPrice'));
  const [maxPrice, setMaxPrice] = useState(get('maxPrice'));

  // Keep text fields in sync when the URL changes (e.g. chip removed).
  const urlQ = get('q');
  const urlMin = get('minPrice');
  const urlMax = get('maxPrice');
  useEffect(() => setQ(urlQ), [urlQ]);
  useEffect(() => setMinPrice(urlMin), [urlMin]);
  useEffect(() => setMaxPrice(urlMax), [urlMax]);

  const set = (key: string, value: string) => {
    update({ [key]: value });
    onApplied?.();
  };

  const applyText = (e?: React.FormEvent) => {
    e?.preventDefault();
    update({ q: q.trim(), minPrice: minPrice.replace(/\D/g, ''), maxPrice: maxPrice.replace(/\D/g, '') });
    onApplied?.();
  };

  const categories =
    assetType === 'VEHICLE'
      ? VEHICLE_TYPES.map((c) => ({ value: c, label: t.vehicleType[c] }))
      : assetType === 'REAL_ESTATE'
        ? PROPERTY_TYPES.map((c) => ({ value: c, label: t.propertyType[c] }))
        : [];

  const thisYear = new Date().getFullYear();

  return (
    <form onSubmit={applyText} className="text-ink-800">
      <div className="pb-5">
        <label className="relative block">
          <span className="sr-only">{t.filters.keyword}</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onBlur={() => q !== urlQ && applyText()}
            placeholder={t.filters.keyword}
            className="h-11 w-full rounded-xl border border-ink-200 bg-white pl-10 pr-3 text-[15px] placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
          />
        </label>
      </div>

      {!lockAssetType && (
        <Section title={t.listingDetail.propertyType}>
          <Segmented
            value={assetType}
            onChange={(v) => update({ assetType: v, category: null, transactionType: null, bedrooms: null, transmission: null, fuelType: null, minYear: null })}
            options={[
              { value: '', label: t.common.all },
              { value: 'REAL_ESTATE', label: t.home.tabProperties },
              { value: 'VEHICLE', label: t.home.tabVehicles },
            ]}
          />
        </Section>
      )}

      {categories.length > 0 && (
        <Section title={t.filters.category}>
          <div className="flex flex-wrap gap-2">
            <Chip active={!get('category')} onClick={() => set('category', '')}>
              {t.common.all}
            </Chip>
            {categories.map((c) => (
              <Chip key={c.value} active={get('category') === c.value} onClick={() => set('category', c.value)}>
                {c.label}
              </Chip>
            ))}
          </div>
        </Section>
      )}

      {assetType === 'REAL_ESTATE' && (
        <>
          <Section title={t.filters.transactionType}>
            <Segmented
              value={get('transactionType')}
              onChange={(v) => set('transactionType', v)}
              options={[
                { value: '', label: t.common.any },
                { value: 'FOR_SALE', label: t.filters.forSale },
                { value: 'FOR_RENT', label: t.filters.forRent },
              ]}
            />
          </Section>
          <Section title={t.filters.bedrooms}>
            <div className="flex flex-wrap gap-2">
              {['', '1', '2', '3', '4', '5'].map((n) => (
                <Chip key={n} active={get('bedrooms') === n} onClick={() => set('bedrooms', n)}>
                  {n ? `${n}+` : t.common.any}
                </Chip>
              ))}
            </div>
          </Section>
        </>
      )}

      {assetType === 'VEHICLE' && (
        <>
          <Section title={t.filters.transmission}>
            <Segmented
              value={get('transmission')}
              onChange={(v) => set('transmission', v)}
              options={[
                { value: '', label: t.common.any },
                { value: 'AUTOMATIC', label: t.transmission.AUTOMATIC },
                { value: 'MANUAL', label: t.transmission.MANUAL },
              ]}
            />
          </Section>
          <Section title={t.filters.fuelType}>
            <Select
              value={get('fuelType')}
              onChange={(e) => set('fuelType', e.target.value)}
              placeholder={t.common.any}
              options={FUEL_TYPES.map((f) => ({ value: f, label: t.fuel[f] }))}
            />
          </Section>
          <Section title={t.filters.minYear}>
            <Select
              value={get('minYear')}
              onChange={(e) => set('minYear', e.target.value)}
              placeholder={t.common.any}
              options={[thisYear - 3, thisYear - 5, thisYear - 8, thisYear - 10, thisYear - 15].map((y) => ({
                value: String(y),
                label: `${y}+`,
              }))}
            />
          </Section>
        </>
      )}

      <Section title={t.filters.location}>
        <Select
          value={get('zone')}
          onChange={(e) => set('zone', e.target.value)}
          placeholder={t.home.allLocations}
          options={ZONE_NAMES.map((z) => ({ value: z, label: z }))}
        />
      </Section>

      <Section title={t.filters.priceRange}>
        <div className="flex items-center gap-2">
          <input
            inputMode="numeric"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            onBlur={() => minPrice !== urlMin && applyText()}
            placeholder={t.filters.minPrice}
            aria-label={t.filters.minPrice}
            className="h-11 w-full min-w-0 rounded-xl border border-ink-200 bg-white px-3 text-[15px] placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
          />
          <span className="text-ink-300">–</span>
          <input
            inputMode="numeric"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            onBlur={() => maxPrice !== urlMax && applyText()}
            placeholder={t.filters.maxPrice}
            aria-label={t.filters.maxPrice}
            className="h-11 w-full min-w-0 rounded-xl border border-ink-200 bg-white px-3 text-[15px] placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
          />
        </div>
        <button type="submit" className="sr-only">
          {t.filters.apply}
        </button>
      </Section>

      <button
        type="button"
        onClick={() => {
          clear(['sort']);
          onApplied?.();
        }}
        className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-900"
      >
        <RotateCcw className="h-4 w-4" />
        {t.filters.clearAll}
      </button>
    </form>
  );
}
