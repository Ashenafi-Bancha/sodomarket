import type { Metadata } from 'next';
import { Globe2, HeartHandshake, MapPin, ShieldCheck } from 'lucide-react';
import { getT } from '@/lib/i18n-server';
import { getMarketStats } from '@/lib/server/listings';
import { ContentPage, InfoCard } from '@/components/ui/ContentPage';
import { ButtonLink } from '@/components/ui/Button';
import { ZONES } from '@/lib/constants';
import { formatNumber } from '@/lib/formatters';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Wolaita Marketplace is the digital marketplace for property and vehicles in Wolaita Sodo.',
};

export default async function AboutPage() {
  const [{ t }, stats] = await Promise.all([getT(), getMarketStats()]);
  return (
    <ContentPage eyebrow={t.nav.about} title="Built in Wolaita Sodo, for Wolaita Sodo" intro={t.footer.tagline}>
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="space-y-5 text-[17px] leading-8 text-ink-700 lg:col-span-7">
          <p>
            Finding a house, a shop or a reliable car in Sodo used to mean walking around town, asking friends and calling many brokers. Prices
            were unclear and it was hard to know who to trust.
          </p>
          <p>
            Wolaita Marketplace brings it all into one place. Every listing is reviewed by our local team before it is published, sellers declare
            their right to sell, and brokers can be verified — so buyers can search with confidence and sellers reach serious people.
          </p>
          <p>The platform works in Wolaytta, Amharic and English, and is designed to be fast on mobile phones and slow connections.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:col-span-5">
          {[
            { v: formatNumber(stats.totalListings), l: t.home.statListings },
            { v: formatNumber(stats.verifiedSellers), l: t.home.statVerified },
            { v: String(ZONES.length), l: t.home.statZones },
            { v: '3', l: 'Languages' },
          ].map((s) => (
            <div key={s.l} className="rounded-3xl bg-white p-6 ring-1 ring-ink-100">
              <p className="text-3xl font-extrabold text-ink-900">{s.v}</p>
              <p className="mt-1 text-sm text-ink-500">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <InfoCard icon={<ShieldCheck className="h-6 w-6" />} title="Trust first">
          Moderated listings, verified brokers and a clear way to report problems.
        </InfoCard>
        <InfoCard icon={<MapPin className="h-6 w-6" />} title="Truly local">
          Organised by Sodo neighbourhoods, landmarks and kebeles — the way people here describe places.
        </InfoCard>
        <InfoCard icon={<Globe2 className="h-6 w-6" />} title="In your language">
          Wolaytta, Amharic and English, switchable at any time.
        </InfoCard>
        <InfoCard icon={<HeartHandshake className="h-6 w-6" />} title="Free to start">
          Browsing is always free and listing is free during our launch period.
        </InfoCard>
      </div>

      <div className="mt-14 flex flex-wrap gap-3">
        <ButtonLink href="/search" size="lg">
          {t.common.search}
        </ButtonLink>
        <ButtonLink href="/sell" variant="outline" size="lg">
          {t.nav.listAsset}
        </ButtonLink>
      </div>
    </ContentPage>
  );
}
