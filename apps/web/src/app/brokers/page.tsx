import type { Metadata } from 'next';
import { BadgeCheck, Building2, Car, House, Phone } from 'lucide-react';
import { getT } from '@/lib/i18n-server';
import { getBrokers } from '@/lib/server/listings';
import { formatDate, formatPhone } from '@/lib/formatters';
import { sellerTypeLabel } from '@/lib/labels';
import { Avatar } from '@/components/ui/Misc';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Verified Brokers & Dealers in Wolaita Sodo',
  description: 'Licensed real estate brokers and vehicle dealers serving Wolaita Sodo.',
};

export default async function BrokersPage() {
  const [{ t, locale }, brokers] = await Promise.all([getT(), getBrokers()]);

  return (
    <div className="container-page py-10 sm:py-14">
      <header className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-600">{t.common.verified}</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">{t.nav.brokers}</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-500">
          Every broker and dealer below is reviewed by our team. Look for the verified badge, and always ask to see the license.
        </p>
      </header>

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {brokers.map((b) => (
          <article key={b.user.id} className="flex flex-col rounded-3xl bg-white p-6 ring-1 ring-ink-100 transition-shadow hover:shadow-card">
            <div className="flex items-start gap-4">
              <Avatar name={b.user.fullName} src={b.user.avatarUrl} size="lg" />
              <div className="min-w-0">
                <h2 className="flex items-center gap-1.5 text-lg font-bold text-ink-900">
                  <span className="truncate">{b.user.fullName}</span>
                  {b.user.idVerified && <BadgeCheck className="h-5 w-5 shrink-0 text-brand-600" />}
                </h2>
                <p className="text-sm text-ink-500">{sellerTypeLabel(b.user.role, t)}</p>
                {(b.agencyName || b.user.businessName) && (
                  <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-ink-700">
                    <Building2 className="h-4 w-4 text-ink-400" /> {b.agencyName ?? b.user.businessName}
                  </p>
                )}
              </div>
            </div>
            {b.user.bio && <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-ink-600">{b.user.bio}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              {b.specialties.includes('REAL_ESTATE') && (
                <Badge tone="brand">
                  <House className="h-3 w-3" /> {t.categories.realEstate}
                </Badge>
              )}
              {b.specialties.includes('VEHICLE') && (
                <Badge tone="blue">
                  <Car className="h-3 w-3" /> {t.categories.vehicles}
                </Badge>
              )}
              <Badge tone="neutral">
                {b.listingCount} {b.listingCount === 1 ? t.common.listing : t.common.listings}
              </Badge>
            </div>
            <div className="mt-auto pt-5">
              <div className="flex items-center justify-between border-t border-ink-100 pt-4 text-xs text-ink-500">
                {b.user.licenseNumber ? (
                  <span>
                    License <span className="font-mono font-semibold text-ink-700">{b.user.licenseNumber}</span>
                  </span>
                ) : (
                  <span />
                )}
                {b.user.createdAt && (
                  <span>
                    {t.listingDetail.memberSince} {formatDate(b.user.createdAt, locale)}
                  </span>
                )}
              </div>
              <a
                href={`tel:${b.user.phone}`}
                className="mt-4 flex h-11 items-center justify-center gap-2 rounded-xl bg-ink-900 text-sm font-semibold text-white hover:bg-ink-800"
              >
                <Phone className="h-4 w-4" /> {formatPhone(b.user.phone)}
              </a>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-14 flex flex-col items-start justify-between gap-6 rounded-[2rem] bg-gold-50 p-8 ring-1 ring-gold-100 sm:flex-row sm:items-center sm:p-10">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-ink-900">{t.home.brokerTitle}</h2>
          <p className="mt-2 max-w-xl text-ink-600">{t.home.brokerDesc}</p>
        </div>
        <ButtonLink href="/register?type=BROKER" size="lg">
          {t.home.brokerCta}
        </ButtonLink>
      </div>
    </div>
  );
}
