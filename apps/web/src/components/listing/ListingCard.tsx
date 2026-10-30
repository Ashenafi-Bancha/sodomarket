'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bath, BedDouble, Calendar, Camera, Fuel, Gauge, MapPin, Maximize2, Settings2, ShieldCheck, Sparkles } from 'lucide-react';
import type { ListingItem } from '@/lib/types';
import { formatNumber, formatPrice, isRental, listingPath, timeAgo } from '@/lib/formatters';
import { categoryLabel, offerLabel } from '@/lib/labels';
import { useTranslation } from '@/lib/i18n-context';
import { Badge } from '@/components/ui/Badge';
import { FavoriteButton } from './FavoriteButton';
import { cn } from '@/lib/cn';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=70';

function cardImage(url?: string) {
  if (!url) return FALLBACK_IMAGE;
  // Ask the image CDN for a card-sized version.
  return url.includes('images.unsplash.com') ? url.replace(/w=\d+/, 'w=720') : url;
}

export function ListingCard({
  listing,
  saved = false,
  priority = false,
  className,
}: {
  listing: ListingItem;
  saved?: boolean;
  priority?: boolean;
  className?: string;
}) {
  const { t, locale } = useTranslation();
  const href = listingPath(listing);
  const p = listing.propertyDetails;
  const v = listing.vehicleDetails;
  const cover = listing.media.find((m) => m.isPrimary)?.url ?? listing.media[0]?.url;
  const [now] = useState(() => Date.now());
  const isNew = !!listing.publishedAt && now - new Date(listing.publishedAt).getTime() < 3 * 86_400_000;

  const specs: { icon: React.ElementType; label: string }[] = [];
  if (p) {
    if (p.bedrooms) specs.push({ icon: BedDouble, label: `${p.bedrooms}` });
    if (p.bathrooms) specs.push({ icon: Bath, label: `${p.bathrooms}` });
    if (p.areaSqM) specs.push({ icon: Maximize2, label: `${formatNumber(p.areaSqM)} m²` });
  } else if (v) {
    specs.push({ icon: Calendar, label: `${v.year}` });
    if (v.mileageKm != null) specs.push({ icon: Gauge, label: `${formatNumber(Math.round(v.mileageKm / 1000))}k km` });
    specs.push({ icon: Settings2, label: t.transmission[v.transmission] });
    specs.push({ icon: Fuel, label: t.fuel[v.fuelType] });
  }

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-ink-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift hover:ring-ink-200',
        className
      )}
    >
      <Link href={href} className="relative block aspect-[4/3] overflow-hidden bg-ink-100" tabIndex={-1} aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cardImage(cover)}
          alt=""
          loading={priority ? 'eager' : 'lazy'}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {listing.isFeatured && (
            <Badge tone="gold" className="bg-gold-400 text-ink-950 ring-0">
              <Sparkles className="h-3 w-3" /> {t.common.featured}
            </Badge>
          )}
          <Badge tone="white">{p ? offerLabel(listing, t) : categoryLabel(listing, t)}</Badge>
          {isNew && !listing.isFeatured && <Badge tone="brand" className="bg-brand-600 text-white ring-0">{t.common.newBadge}</Badge>}
        </div>
        {listing.media.length > 1 && (
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur">
            <Camera className="h-3 w-3" /> {listing.media.length}
          </span>
        )}
      </Link>

      <FavoriteButton listingId={listing.id} initialSaved={saved} className="absolute right-3 top-3 z-10" />

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-extrabold tracking-tight text-ink-900">{formatPrice(listing.price, listing.currency)}</span>
          {isRental(listing) && <span className="text-sm font-medium text-ink-500">{t.common.perMonth}</span>}
          {listing.isNegotiable && (
            <span className="ml-auto text-[11px] font-semibold text-gold-700">{t.listingDetail.negotiable}</span>
          )}
        </div>

        <h3 className="mt-1.5 line-clamp-2 text-[15px] font-semibold leading-snug text-ink-800">
          <Link href={href} className="after:absolute after:inset-0 after:content-[''] focus:outline-none">
            {listing.title}
          </Link>
        </h3>

        <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-500">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-600" />
          <span className="truncate">
            {listing.location.zone}, {listing.location.city}
          </span>
        </p>

        {specs.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-[13px] text-ink-600">
            {specs.map((s, i) => {
              const Icon = s.icon;
              return (
                <span key={i} className="inline-flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5 text-ink-400" />
                  {s.label}
                </span>
              );
            })}
          </div>
        )}

        <div className="mt-auto pt-4">
        <div className="flex items-center justify-between gap-2 border-t border-ink-100 pt-3.5 text-xs text-ink-500">
          <span className="flex min-w-0 items-center gap-1.5 font-medium text-ink-700">
            <span className="truncate">{listing.agency?.name ?? listing.author.fullName}</span>
            {(listing.author.idVerified || listing.agency?.isVerified) && (
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-brand-600" aria-label={t.common.verified} />
            )}
          </span>
          <span className="shrink-0">{timeAgo(listing.publishedAt ?? listing.createdAt, locale)}</span>
        </div>
        </div>
      </div>
    </article>
  );
}

export function ListingCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-ink-100">
      <div className="skeleton aspect-[4/3]" />
      <div className="space-y-3 p-5">
        <div className="skeleton h-6 w-1/2 rounded-lg" />
        <div className="skeleton h-4 w-full rounded-lg" />
        <div className="skeleton h-4 w-2/3 rounded-lg" />
        <div className="skeleton mt-4 h-4 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function ListingGrid({
  listings,
  savedIds = [],
  className,
}: {
  listings: ListingItem[];
  savedIds?: string[];
  className?: string;
}) {
  const saved = new Set(savedIds);
  return (
    <div className={cn('grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4', className)}>
      {listings.map((l, i) => (
        <ListingCard key={l.id} listing={l} saved={saved.has(l.id)} priority={i < 4} />
      ))}
    </div>
  );
}
