import type { Metadata } from 'next';
import { Banknote, BadgeCheck, Car, FileCheck2, Flag, MapPin, ShieldAlert, Users } from 'lucide-react';
import { getT } from '@/lib/i18n-server';
import { ContentPage, InfoCard } from '@/components/ui/ContentPage';
import { platformConfig } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Trust & Safety',
  description: 'How to buy, rent and sell safely in Wolaita Sodo.',
};

export default async function SafetyPage() {
  const { t } = await getT();
  return (
    <ContentPage eyebrow={t.nav.safety} title="Buy, rent and sell with confidence" intro={t.footer.safetyText}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <InfoCard icon={<FileCheck2 className="h-6 w-6" />} title="Check the title deed">
          Ask to see the original title deed (karta) or lease certificate and verify it at the Wolaita Sodo municipal land office before paying.
        </InfoCard>
        <InfoCard icon={<Car className="h-6 w-6" />} title="Check the vehicle libre">
          Confirm the libre (ownership booklet) matches the seller’s ID, the chassis and the plate number at the transport office.
        </InfoCard>
        <InfoCard icon={<Banknote className="h-6 w-6" />} title="Never pay before you see it">
          Do not send deposits by mobile money or bank transfer for property or vehicles you have not seen in person.
        </InfoCard>
        <InfoCard icon={<MapPin className="h-6 w-6" />} title="Meet safely">
          Meet in daylight, at the property or a public place, and bring a friend or family member.
        </InfoCard>
        <InfoCard icon={<BadgeCheck className="h-6 w-6" />} title="Look for the verified badge">
          Verified sellers and brokers have had their identity or license checked by our team.
        </InfoCard>
        <InfoCard icon={<Users className="h-6 w-6" />} title="Use a licensed broker">
          Licensed brokers are accountable and know local procedures. Standard commission is around {platformConfig.commissionGuidelines.realEstateStandardPercent}%.
        </InfoCard>
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl bg-red-50 p-6 ring-1 ring-red-100">
          <h2 className="flex items-center gap-2 text-lg font-bold text-red-900">
            <ShieldAlert className="h-5 w-5" /> Warning signs
          </h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] text-red-900/80">
            <li>The price is far below similar listings.</li>
            <li>The seller is “abroad” and asks for payment first.</li>
            <li>Pressure to decide today or to pay a “reservation fee”.</li>
            <li>Documents that cannot be checked at an official office.</li>
          </ul>
        </div>
        <div className="rounded-3xl bg-white p-6 ring-1 ring-ink-100">
          <h2 className="flex items-center gap-2 text-lg font-bold text-ink-900">
            <Flag className="h-5 w-5 text-brand-600" /> Report a problem
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-600">
            Use “{t.listingDetail.reportListing}” on any listing, or contact us at{' '}
            <a href={`mailto:${platformConfig.supportEmail}`} className="font-semibold text-brand-700 hover:underline">
              {platformConfig.supportEmail}
            </a>{' '}
            or{' '}
            <a href={`tel:${platformConfig.supportPhone}`} className="font-semibold text-brand-700 hover:underline">
              {platformConfig.supportPhone}
            </a>
            . Our team reviews every report.
          </p>
        </div>
      </div>
    </ContentPage>
  );
}
