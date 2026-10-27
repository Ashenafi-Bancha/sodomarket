import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Bike,
  Briefcase,
  Building2,
  Car,
  CircleCheck,
  House,
  LandPlot,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  Store,
  Truck,
} from 'lucide-react';
import { getT } from '@/lib/i18n-server';
import { getCurrentUser } from '@/lib/server/session';
import { getFavoriteIds, getFeaturedListings, getMarketStats, getRecentListings } from '@/lib/server/listings';
import { ZONES } from '@/lib/constants';
import { formatNumber } from '@/lib/formatters';
import { HeroSearch } from '@/components/home/HeroSearch';
import { ListingGrid } from '@/components/listing/ListingCard';
import { ButtonLink } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/Misc';
export default async function HomePage() {
  const { t } = await getT();
  const user = await getCurrentUser();
  const stats = await getMarketStats();
  const featured = await getFeaturedListings(8);
  const latestProperties = await getRecentListings(4, 'REAL_ESTATE');
  const latestVehicles = await getRecentListings(4, 'VEHICLE');
  const savedIds = await getFavoriteIds(user?.id);

  const heroImages = featured
    .slice(0, 3)
    .map((l) => ({ url: l.media[0]?.url?.replace(/w=\d+/, 'w=900'), title: l.title, zone: l.location.zone }));

  const categories = [
    { key: 'HOUSE', label: t.categories.house, icon: House, href: '/properties?category=HOUSE' },
    { key: 'APARTMENT', label: t.categories.apartment, icon: Building2, href: '/properties?category=APARTMENT' },
    { key: 'RESIDENTIAL_LAND', label: t.categories.residentialLand, icon: LandPlot, href: '/properties?category=RESIDENTIAL_LAND' },
    { key: 'SHOP', label: t.categories.shop, icon: Store, href: '/properties?category=SHOP' },
    { key: 'OFFICE', label: t.categories.office, icon: Briefcase, href: '/properties?category=OFFICE' },
    { key: 'CAR', label: t.categories.car, icon: Car, href: '/vehicles?category=CAR' },
    { key: 'TRUCK', label: t.categories.truck, icon: Truck, href: '/vehicles?category=TRUCK' },
    { key: 'MOTORCYCLE', label: t.categories.motorcycle, icon: Bike, href: '/vehicles?category=MOTORCYCLE' },
  ];

  const steps = [
    { icon: Search, title: t.home.howItWorksStep1Title, desc: t.home.howItWorksStep1Desc },
    { icon: MessageCircle, title: t.home.howItWorksStep2Title, desc: t.home.howItWorksStep2Desc },
    { icon: ShieldCheck, title: t.home.howItWorksStep3Title, desc: t.home.howItWorksStep3Desc },
  ];

  return (
    <div>
      {/* ─── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-brand-950 text-white">
        <div className="hero-pattern absolute inset-0" aria-hidden />
        <div className="grain absolute inset-0 opacity-60" aria-hidden />
        <div className="container-page relative grid items-center gap-12 pb-28 pt-12 sm:pt-16 lg:grid-cols-12 lg:pb-36 lg:pt-20">
          <div className="lg:col-span-7">
            <p className="inline-flex animate-fade-up items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-brand-100 ring-1 ring-white/15 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
              {t.home.heroEyebrow}
            </p>
            <h1 className="mt-5 animate-fade-up text-4xl font-extrabold leading-[1.08] tracking-tight [animation-delay:60ms] sm:text-5xl lg:text-6xl">
              {t.home.heroTitle}
            </h1>
            <p className="mt-5 max-w-xl animate-fade-up text-base leading-relaxed text-brand-100/80 [animation-delay:120ms] sm:text-lg">
              {t.home.heroSubtitle}
            </p>
            <div className="mt-8 animate-fade-up [animation-delay:180ms]">
              <HeroSearch />
            </div>
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-brand-100/80">
              {[t.home.trustReviewed, t.home.trustVerified, t.home.trustFree].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CircleCheck className="h-4 w-4 text-brand-300" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {heroImages.length === 3 && (
            <div className="relative hidden h-[480px] lg:col-span-5 lg:block" aria-hidden>
              {/* eslint-disable @next/next/no-img-element */}
              <div className="absolute right-0 top-0 h-[300px] w-[78%] overflow-hidden rounded-[2rem] shadow-lift ring-1 ring-white/10">
                <img src={heroImages[0].url} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="absolute bottom-0 left-0 h-[230px] w-[56%] overflow-hidden rounded-[2rem] shadow-lift ring-4 ring-brand-950">
                <img src={heroImages[1].url} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="absolute bottom-10 right-4 h-[170px] w-[38%] overflow-hidden rounded-[1.75rem] shadow-lift ring-4 ring-brand-950">
                <img src={heroImages[2].url} alt="" className="h-full w-full object-cover" />
              </div>
              {/* eslint-enable @next/next/no-img-element */}
              <div className="absolute left-6 top-24 flex items-center gap-3 rounded-2xl bg-white/95 p-3 pr-5 text-ink-900 shadow-lift">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
                  <BadgeCheck className="h-5 w-5 text-brand-600" />
                </span>
                <span>
                  <span className="block text-sm font-bold">{t.home.trustReviewed}</span>
                  <span className="block text-xs text-ink-500">{heroImages[0].zone}, Wolaita Sodo</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── Stats ───────────────────────────────────────── */}
      <section className="container-page relative z-10 -mt-16">
        <div className="grid grid-cols-2 overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-ink-100 lg:grid-cols-4">
          {[
            { value: formatNumber(stats.totalListings), label: t.home.statListings },
            { value: formatNumber(stats.verifiedSellers), label: t.home.statVerified },
            { value: String(ZONES.length), label: t.home.statZones },
            { value: '0 ETB', label: t.home.statFree },
          ].map((s, i) => (
            <div
              key={s.label}
              className={`p-5 sm:p-7 ${i % 2 === 1 ? 'border-l border-ink-100' : ''} ${i >= 2 ? 'border-t border-ink-100 lg:border-t-0' : ''} ${i === 2 ? 'lg:border-l' : ''}`}
            >
              <p className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">{s.value}</p>
              <p className="mt-1 text-sm text-ink-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Categories ──────────────────────────────────── */}
      <section className="container-page mt-20">
        <SectionHeading title={t.home.browseByCategory} subtitle={t.home.categoriesSubtitle} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {categories.map((c) => {
            const Icon = c.icon;
            const count = stats.byCategory[c.key] ?? 0;
            return (
              <Link
                key={c.key}
                href={c.href}
                className="group flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-ink-100 transition-all hover:-translate-y-0.5 hover:shadow-card hover:ring-brand-200 sm:p-5"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-700 group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[15px] font-bold text-ink-900">{c.label}</span>
                  <span className="text-sm text-ink-500">
                    {count} {t.common.listings}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ─── Featured ────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="container-page mt-20">
          <SectionHeading
            eyebrow={t.common.featured}
            title={t.home.featuredTitle}
            subtitle={t.home.featuredSubtitle}
            action={
              <Link href="/search?sort=popular" className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 hover:text-brand-900">
                {t.common.viewAll} <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
          <ListingGrid listings={featured} savedIds={savedIds} />
        </section>
      )}

      {/* ─── Neighbourhoods ──────────────────────────────── */}
      <section className="container-page mt-20">
        <SectionHeading title={t.home.zonesTitle} subtitle={t.home.zonesSubtitle} />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {ZONES.map((z, i) => (
            <Link
              key={z.name}
              href={`/search?zone=${encodeURIComponent(z.name)}`}
              className={`group relative overflow-hidden rounded-3xl p-5 ring-1 transition-all hover:-translate-y-0.5 hover:shadow-card sm:p-6 ${
                i === 0 ? 'bg-brand-900 text-white ring-brand-900' : 'bg-white ring-ink-100 hover:ring-brand-200'
              }`}
            >
              <MapPin className={`h-5 w-5 ${i === 0 ? 'text-gold-400' : 'text-brand-600'}`} />
              <p className={`mt-6 text-lg font-bold ${i === 0 ? 'text-white' : 'text-ink-900'}`}>{z.name}</p>
              <p className={`mt-0.5 line-clamp-1 text-sm ${i === 0 ? 'text-brand-100/70' : 'text-ink-500'}`}>{z.description}</p>
              <p className={`mt-4 text-sm font-semibold ${i === 0 ? 'text-gold-300' : 'text-brand-700'}`}>
                {stats.byZone[z.name] ?? 0} {t.common.listings}
              </p>
              <ArrowUpRight
                className={`absolute right-5 top-5 h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${
                  i === 0 ? 'text-white/60' : 'text-ink-300'
                }`}
              />
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Latest ──────────────────────────────────────── */}
      {latestProperties.length > 0 && (
        <section className="container-page mt-20">
          <SectionHeading
            title={t.home.latestProperties}
            action={
              <Link href="/properties" className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 hover:text-brand-900">
                {t.common.viewAll} <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
          <ListingGrid listings={latestProperties} savedIds={savedIds} />
        </section>
      )}

      {latestVehicles.length > 0 && (
        <section className="container-page mt-20">
          <SectionHeading
            title={t.home.latestVehicles}
            action={
              <Link href="/vehicles" className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 hover:text-brand-900">
                {t.common.viewAll} <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
          <ListingGrid listings={latestVehicles} savedIds={savedIds} />
        </section>
      )}

      {/* ─── How it works ────────────────────────────────── */}
      <section className="container-page mt-24">
        <div className="rounded-[2rem] bg-white p-8 ring-1 ring-ink-100 sm:p-12">
          <SectionHeading title={t.home.howItWorksTitle} className="mb-10" />
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.title} className="relative">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-700 text-white shadow-glow">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-bold text-ink-300">0{i + 1}</span>
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-ink-900">{s.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-500">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── CTAs ────────────────────────────────────────── */}
      <section className="container-page mt-8 grid gap-4 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-[2rem] bg-brand-900 p-8 text-white sm:p-10">
          <div className="hero-pattern absolute inset-0 opacity-70" aria-hidden />
          <div className="relative">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t.home.readyToListTitle}</h2>
            <p className="mt-3 max-w-md text-brand-100/80">{t.home.readyToListDesc}</p>
            <ButtonLink href="/sell" variant="accent" size="lg" className="mt-7">
              {t.home.postListingCta} <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        </div>
        <div className="rounded-[2rem] bg-gold-50 p-8 ring-1 ring-gold-100 sm:p-10">
          <h2 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">{t.home.brokerTitle}</h2>
          <p className="mt-3 max-w-md text-ink-600">{t.home.brokerDesc}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink href="/register?type=BROKER" variant="primary" size="lg">
              {t.home.brokerCta}
            </ButtonLink>
            <ButtonLink href="/brokers" variant="outline" size="lg">
              {t.nav.brokers}
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}
