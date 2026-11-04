import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BadgeCheck, Building2, MessageCircle, Phone, ShieldAlert, ShieldCheck } from 'lucide-react';
import { getT } from '@/lib/i18n-server';
import { getCurrentUser } from '@/lib/server/session';
import { getFavoriteIds, getSellerProfile } from '@/lib/server/listings';
import { formatDate, formatNumber, formatPhone, whatsappLink } from '@/lib/formatters';
import { sellerTypeLabel } from '@/lib/labels';
import { fmt } from '@/locales';
import { Avatar, EmptyState } from '@/components/ui/Misc';
import { ListingGrid } from '@/components/listing/ListingCard';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const seller = await getSellerProfile((await params).id);
  if (!seller) return { title: 'Seller not found', robots: { index: false } };
  const name = seller.agencyName ?? seller.user.businessName ?? seller.user.fullName;
  return {
    title: `${name} — Ads in Wolaita Sodo`,
    description: seller.user.bio ?? `${seller.listings.length} live ads from ${name} on Wolaita Marketplace.`,
  };
}

export default async function SellerPage({ params }: Props) {
  const { id } = await params;
  const [{ t, locale }, seller, viewer] = await Promise.all([getT(), getSellerProfile(id), getCurrentUser()]);
  if (!seller) notFound();
  const savedIds = await getFavoriteIds(viewer?.id);
  const { user } = seller;
  const waText = `Hello ${user.fullName}, I found your ads on Wolaita Marketplace.`;

  return (
    <div className="container-page py-10 sm:py-14">
      <section className="rounded-[2rem] bg-white p-6 ring-1 ring-ink-100 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4 sm:gap-5">
            <Avatar name={user.fullName} src={user.avatarUrl} size="lg" />
            <div className="min-w-0">
              <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
                <span className="truncate">{user.fullName}</span>
                {user.idVerified && <BadgeCheck className="h-6 w-6 shrink-0 text-brand-600" aria-label={t.common.verified} />}
              </h1>
              <p className="mt-0.5 text-ink-500">{sellerTypeLabel(user.role, t)}</p>
              {(seller.agencyName || user.businessName) && (
                <p className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-ink-700">
                  <Building2 className="h-4 w-4 text-ink-400" />
                  {seller.agencyName ?? user.businessName}
                  {seller.agencyVerified && <ShieldCheck className="h-4 w-4 text-brand-600" />}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-500">
                <span>
                  <span className="font-bold text-ink-900">{formatNumber(seller.listings.length)}</span> {t.seller.liveAds}
                </span>
                <span>
                  <span className="font-bold text-ink-900">{formatNumber(seller.completedCount)}</span> {t.seller.completed}
                </span>
                {user.createdAt && (
                  <span>
                    {t.listingDetail.memberSince} {formatDate(user.createdAt, locale)}
                  </span>
                )}
                {user.licenseNumber && (
                  <span>
                    License <span className="font-mono font-semibold text-ink-700">{user.licenseNumber}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2.5 sm:shrink-0">
            <a
              href={`tel:${user.phone}`}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-ink-900 px-5 text-sm font-semibold text-white hover:bg-ink-800 sm:flex-none"
            >
              <Phone className="h-4 w-4" /> {formatPhone(user.phone)}
            </a>
            <a
              href={whatsappLink(user.phone, waText)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 text-sm font-semibold text-white hover:brightness-95 sm:flex-none"
            >
              <MessageCircle className="h-4 w-4" /> {t.listingDetail.whatsapp}
            </a>
          </div>
        </div>
        {user.bio && <p className="mt-6 max-w-3xl text-[15px] leading-relaxed text-ink-600">{user.bio}</p>}
        <p className="mt-6 flex items-start gap-2 rounded-2xl bg-gold-50 p-3.5 text-sm text-ink-700 ring-1 ring-gold-100">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
          {t.seller.safetyNote}
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-extrabold tracking-tight text-ink-900">{fmt(t.seller.adsBy, { name: user.fullName })}</h2>
        <div className="mt-5">
          {seller.listings.length > 0 ? (
            <ListingGrid listings={seller.listings} savedIds={savedIds} />
          ) : (
            <EmptyState icon={<Building2 className="h-6 w-6" />} title={t.seller.noAds} />
          )}
        </div>
      </section>
    </div>
  );
}
