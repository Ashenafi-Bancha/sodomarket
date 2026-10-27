import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { after } from 'next/server';
import type { Metadata } from 'next';
import {
  Bath,
  BedDouble,
  Calendar,
  Car,
  CircleCheck,
  Droplets,
  Eye,
  Fuel,
  Gauge,
  Info,
  Landmark,
  LayoutGrid,
  MapPin,
  Maximize2,
  Navigation,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  Sofa,
  Sparkles,
  Tag,
  Trees,
  Zap,
} from 'lucide-react';
import type { AssetType } from '@/lib/types';
import { getT } from '@/lib/i18n-server';
import { getCurrentUser } from '@/lib/server/session';
import { getFavoriteIds, getListingBySlug, getSimilarListings, recordView } from '@/lib/server/listings';
import { formatDate, formatNumber, listingPath } from '@/lib/formatters';
import { categoryLabel, offerLabel } from '@/lib/labels';
import { platformConfig } from '@/lib/config';
import { Badge } from '@/components/ui/Badge';
import { ListingGallery } from './ListingGallery';
import { ContactPanel } from './ContactPanel';
import { FavoriteButton } from './FavoriteButton';
import { ShareButton } from './ShareButton';
import { ReportButton } from './ReportButton';
import { ListingGrid } from './ListingCard';

export async function listingMetadata(slug: string): Promise<Metadata> {
  const listing = await getListingBySlug(slug);
  if (!listing || listing.status !== 'PUBLISHED') return { title: 'Listing not found' };
  const cover = listing.media[0]?.url;
  const description = listing.description.replace(/\s+/g, ' ').slice(0, 155);
  return {
    title: `${listing.title} — ${listing.location.zone}`,
    description,
    alternates: { canonical: listingPath(listing) },
    openGraph: {
      title: listing.title,
      description,
      type: 'website',
      images: cover ? [{ url: cover, width: 1200, height: 800, alt: listing.title }] : undefined,
    },
  };
}

export async function ListingDetail({ slug, expected }: { slug: string; expected: AssetType }) {
  const [{ t, locale }, user, listing] = await Promise.all([getT(), getCurrentUser(), getListingBySlug(slug)]);
  if (!listing) notFound();

  const isOwner = !!user && user.id === listing.author.id;
  const isAdmin = user?.role === 'ADMIN';
  if (listing.status !== 'PUBLISHED' && !isOwner && !isAdmin) notFound();
  if (listing.assetType !== expected) redirect(listingPath(listing));

  if (listing.status === 'PUBLISHED' && !isOwner) {
    after(() => recordView(listing.id));
  }

  const [similar, savedIds] = await Promise.all([getSimilarListings(listing), getFavoriteIds(user?.id)]);
  const p = listing.propertyDetails;
  const v = listing.vehicleDetails;
  const browsePath = listing.assetType === 'VEHICLE' ? '/vehicles' : '/properties';
  const browseLabel = listing.assetType === 'VEHICLE' ? t.nav.vehicles : t.nav.properties;

  const facts: { icon: React.ElementType; label: string; value: string }[] = [];
  if (p) {
    facts.push({ icon: LayoutGrid, label: t.listingDetail.propertyType, value: t.propertyType[p.propertyType] });
    facts.push({ icon: Tag, label: t.listingDetail.transaction, value: offerLabel(listing, t) });
    if (p.bedrooms) facts.push({ icon: BedDouble, label: t.listingDetail.bedrooms, value: String(p.bedrooms) });
    if (p.bathrooms) facts.push({ icon: Bath, label: t.listingDetail.bathrooms, value: String(p.bathrooms) });
    if (p.areaSqM) facts.push({ icon: Maximize2, label: t.listingDetail.area, value: `${formatNumber(p.areaSqM)} m²` });
    if (p.compoundSizeSqM) facts.push({ icon: Trees, label: t.listingDetail.compound, value: `${formatNumber(p.compoundSizeSqM)} m²` });
    if (p.parkingSpaces) facts.push({ icon: Car, label: t.listingDetail.parking, value: String(p.parkingSpaces) });
  }
  if (v) {
    facts.push({ icon: Car, label: t.listingDetail.make, value: `${v.make} ${v.model}` });
    facts.push({ icon: Calendar, label: t.listingDetail.year, value: String(v.year) });
    if (v.mileageKm != null) facts.push({ icon: Gauge, label: t.listingDetail.mileage, value: `${formatNumber(v.mileageKm)} km` });
    facts.push({ icon: Settings2, label: t.listingDetail.transmission, value: t.transmission[v.transmission] });
    facts.push({ icon: Fuel, label: t.listingDetail.fuel, value: t.fuel[v.fuelType] });
    facts.push({ icon: Sparkles, label: t.listingDetail.condition, value: t.condition[v.condition] });
    if (v.plateCode) facts.push({ icon: Tag, label: t.listingDetail.plate, value: v.plateCode });
  }

  const features: { icon: React.ElementType; label: string }[] = [];
  if (p?.waterConnected) features.push({ icon: Droplets, label: t.listingDetail.water });
  if (p?.electricityConnected) features.push({ icon: Zap, label: t.listingDetail.electricity });
  if (p?.furnishing && p.propertyType !== 'RESIDENTIAL_LAND' && p.propertyType !== 'COMMERCIAL_LAND') {
    features.push({ icon: Sofa, label: t.furnishing[p.furnishing] });
  }
  if (p?.parkingSpaces) features.push({ icon: Car, label: `${t.listingDetail.parking}: ${p.parkingSpaces}` });

  const mapQuery = encodeURIComponent(
    [listing.location.landmark, listing.location.zone, 'Wolaita Sodo, Ethiopia'].filter(Boolean).join(', ')
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': listing.assetType === 'VEHICLE' ? 'Car' : 'Product',
    name: listing.title,
    description: listing.description,
    image: listing.media.map((m) => m.url),
    ...(v ? { brand: v.make, model: v.model, vehicleModelDate: String(v.year) } : {}),
    offers: {
      '@type': 'Offer',
      price: listing.price,
      priceCurrency: listing.currency,
      availability: listing.status === 'PUBLISHED' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
      areaServed: `${listing.location.zone}, Wolaita Sodo`,
      seller: { '@type': listing.agency ? 'Organization' : 'Person', name: listing.agency?.name ?? listing.author.fullName },
    },
  };

  return (
    <div className="container-page pb-28 pt-4 sm:pt-8 lg:pb-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />

      {listing.status !== 'PUBLISHED' && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl bg-gold-50 p-4 text-sm text-gold-900 ring-1 ring-gold-200">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" />
          <div>
            <p className="font-bold">{t.listingDetail.notPublishedTitle}</p>
            <p>
              {t.listingDetail.notPublishedDesc} <strong>{t.status[listing.status]}</strong>
            </p>
            {(listing.moderationNotes || listing.rejectionReason) && (
              <p className="mt-1 italic">“{listing.rejectionReason ?? listing.moderationNotes}”</p>
            )}
          </div>
        </div>
      )}

      <nav className="mb-4 hidden text-sm text-ink-500 sm:block" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-ink-900">
          {t.common.home}
        </Link>
        <span className="mx-2 text-ink-300">/</span>
        <Link href={browsePath} className="hover:text-ink-900">
          {browseLabel}
        </Link>
        <span className="mx-2 text-ink-300">/</span>
        <Link href={`${browsePath}?zone=${encodeURIComponent(listing.location.zone)}`} className="hover:text-ink-900">
          {listing.location.zone}
        </Link>
      </nav>

      <ListingGallery media={listing.media} title={listing.title} />

      <div className="mt-6 grid gap-10 lg:mt-8 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-8">
          <div className="flex flex-wrap items-center gap-2">
            {listing.isFeatured && (
              <Badge tone="gold" size="md">
                <Sparkles className="h-3.5 w-3.5" /> {t.common.featured}
              </Badge>
            )}
            <Badge tone="brand" size="md">
              {categoryLabel(listing, t)}
            </Badge>
            {p && (
              <Badge tone="neutral" size="md">
                {offerLabel(listing, t)}
              </Badge>
            )}
          </div>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-ink-900 sm:text-[2rem]">{listing.title}</h1>
              <p className="mt-2 flex items-center gap-1.5 text-[15px] text-ink-600">
                <MapPin className="h-4 w-4 shrink-0 text-brand-600" />
                {listing.location.zone}, {listing.location.city}
                {listing.location.kebele && ` · ${t.listingDetail.kebele} ${listing.location.kebele}`}
              </p>
              <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-400">
                <span>
                  {t.listingDetail.posted} {formatDate(listing.publishedAt ?? listing.createdAt, locale)}
                </span>
                {!!listing.viewCount && (
                  <span className="inline-flex items-center gap-1">
                    <Eye className="h-4 w-4" /> {formatNumber(listing.viewCount)} {t.common.views}
                  </span>
                )}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1 sm:-mr-3">
              <ShareButton title={listing.title} />
              {listing.status === 'PUBLISHED' && (
                <FavoriteButton listingId={listing.id} initialSaved={savedIds.includes(listing.id)} variant="button" />
              )}
            </div>
          </div>

          <section className="mt-8">
            <h2 className="text-lg font-bold text-ink-900">{t.listingDetail.specifications}</h2>
            <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {facts.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.label} className="flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-ink-100">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <dt className="text-xs text-ink-500">{f.label}</dt>
                      <dd className="truncate text-[15px] font-bold text-ink-900">{f.value}</dd>
                    </div>
                  </div>
                );
              })}
            </dl>
          </section>

          <section className="mt-10">
            <h2 className="text-lg font-bold text-ink-900">{t.listingDetail.description}</h2>
            <div className="mt-3 whitespace-pre-line text-[15px] leading-7 text-ink-700">{listing.description}</div>
          </section>

          {features.length > 0 && (
            <section className="mt-10">
              <h2 className="text-lg font-bold text-ink-900">{t.listingDetail.features}</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {features.map((f) => {
                  const Icon = f.icon;
                  return (
                    <li key={f.label} className="flex items-center gap-3 text-[15px] text-ink-700">
                      <Icon className="h-5 w-5 text-brand-600" />
                      {f.label}
                      <CircleCheck className="ml-auto h-4 w-4 text-brand-500 sm:ml-0" />
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <section className="mt-10">
            <h2 className="text-lg font-bold text-ink-900">{t.listingDetail.location}</h2>
            <div className="mt-4 overflow-hidden rounded-3xl ring-1 ring-ink-100">
              <div className="relative h-40 bg-brand-900">
                <div className="hero-pattern absolute inset-0" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lift">
                    <MapPin className="h-7 w-7 text-brand-700" />
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-4 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1 text-[15px]">
                  <p className="font-bold text-ink-900">
                    {listing.location.zone}, {platformConfig.primaryLocation}
                  </p>
                  {listing.location.landmark && (
                    <p className="flex items-start gap-2 text-ink-600">
                      <Landmark className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" /> {listing.location.landmark}
                    </p>
                  )}
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-ink-200 px-4 text-sm font-semibold text-ink-800 hover:bg-ink-50"
                >
                  <Navigation className="h-4 w-4" /> {t.listingDetail.openMap}
                </a>
              </div>
            </div>
          </section>

          <section className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-white p-5 ring-1 ring-ink-100">
              <h3 className="flex items-center gap-2 font-bold text-ink-900">
                <ShieldCheck className="h-5 w-5 text-brand-600" /> {t.listingDetail.verifiedOwner}
              </h3>
              <p className="mt-2 text-sm italic leading-relaxed text-ink-600">“{listing.ownerDeclaration}”</p>
            </div>
            <div className="rounded-3xl bg-gold-50 p-5 ring-1 ring-gold-100">
              <h3 className="flex items-center gap-2 font-bold text-ink-900">
                <Info className="h-5 w-5 text-gold-600" /> {t.listingDetail.safetyTitle}
              </h3>
              <ul className="mt-2 space-y-1.5 text-sm text-ink-700">
                {[t.listingDetail.safety1, t.listingDetail.safety2, t.listingDetail.safety3].map((tip) => (
                  <li key={tip} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <div className="mt-8">
            <ReportButton listingId={listing.id} />
          </div>
        </div>

        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-24">
            <ContactPanel listing={listing} isOwner={isOwner} />
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 text-2xl font-extrabold tracking-tight text-ink-900">{t.listingDetail.relatedListings}</h2>
          <ListingGrid listings={similar} savedIds={savedIds} />
        </section>
      )}
    </div>
  );
}

