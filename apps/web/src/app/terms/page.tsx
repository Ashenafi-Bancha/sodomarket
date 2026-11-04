import type { Metadata } from 'next';
import Link from 'next/link';
import { ContentPage, LegalSection } from '@/components/ui/ContentPage';
import { platformConfig } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'The rules for buying, renting and selling on Wolaita Marketplace.',
};

const UPDATED = '4 November 2026';

export default function TermsPage() {
  const { brandName, supportEmail, supportPhone } = platformConfig;
  return (
    <ContentPage
      eyebrow="Legal"
      title="Terms of Use"
      intro={`The rules for using ${brandName}. Please read them before you post an ad or contact a seller. Last updated ${UPDATED}.`}
    >
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-6 ring-1 ring-ink-100 sm:p-10">
        <LegalSection n={1} title="What we are">
          <p>
            {brandName} is an online classifieds marketplace for property and vehicles in Wolaita Sodo, Ethiopia. We connect
            buyers and tenants with owners, licensed brokers and dealers. We are not a party to any sale or rental, we do not
            hold money for anyone, and we do not own the items advertised.
          </p>
        </LegalSection>

        <LegalSection n={2} title="Your account">
          <ul>
            <li>You must be at least 18 years old and give your real name and a phone number you can be reached on.</li>
            <li>Keep your password private. You are responsible for everything done with your account.</li>
            <li>Brokers and dealers must give a valid license number when asked, and keep it up to date.</li>
            <li>We may verify your identity or license and show a “verified” badge when we have done so.</li>
          </ul>
        </LegalSection>

        <LegalSection n={3} title="Posting ads">
          <ul>
            <li>Only advertise property or vehicles you own, or that the owner has authorised you to market.</li>
            <li>Ads must be truthful: real photos, the real price, the correct location and an honest description of the condition and documents (title deed, lease, libre, bolo, duty status).</li>
            <li>Every ad is reviewed before it goes live. We may ask for changes, reject or remove an ad, and we may ask to see ownership documents.</li>
            <li>Mark your ad as sold or rented as soon as it is no longer available.</li>
            <li>Posting is free during our launch period. If we introduce paid features we will announce the prices first.</li>
          </ul>
        </LegalSection>

        <LegalSection n={4} title="Not allowed">
          <ul>
            <li>Fake, duplicate or misleading ads, or ads for items you are not entitled to sell or rent.</li>
            <li>Asking buyers for deposits or “reservation fees” before they have seen the property or vehicle.</li>
            <li>Harassment, discrimination, or using contact details from the site for spam.</li>
            <li>Copying other people’s photos or ads, or scraping the site.</li>
            <li>Anything illegal under Ethiopian law.</li>
          </ul>
        </LegalSection>

        <LegalSection n={5} title="Dealing with other users">
          <p>
            You deal directly with the other person. Check documents at the official office (the municipal land office for
            property, the transport office for vehicles), meet in a safe place and never pay before you have seen the item.
            Our <Link href="/safety" className="font-semibold text-brand-700 hover:underline">safety guide</Link> explains how.
          </p>
          <p>
            Broker commission is agreed between you and the broker. As a guide, the usual rate in Sodo is around{' '}
            {platformConfig.commissionGuidelines.realEstateStandardPercent}% for property.
          </p>
        </LegalSection>

        <LegalSection n={6} title="Reports, suspension and removal">
          <p>
            Anyone can report an ad. We review reports and may remove ads, and warn, suspend or close accounts that break these
            terms. Serious fraud may be reported to the police.
          </p>
        </LegalSection>

        <LegalSection n={7} title="Liability">
          <p>
            We work hard to keep the marketplace safe, but we cannot guarantee that every ad is accurate or that a deal will go
            through. To the extent the law allows, we are not responsible for losses that come from dealings between users.
          </p>
        </LegalSection>

        <LegalSection n={8} title="Changes and contact">
          <p>
            We may update these terms; the date above shows the latest version. Questions? Contact us at{' '}
            <a href={`mailto:${supportEmail}`} className="font-semibold text-brand-700 hover:underline">
              {supportEmail}
            </a>{' '}
            or{' '}
            <a href={`tel:${supportPhone}`} className="font-semibold text-brand-700 hover:underline">
              {supportPhone}
            </a>
            . See also our <Link href="/privacy" className="font-semibold text-brand-700 hover:underline">privacy policy</Link>.
          </p>
        </LegalSection>
      </div>
    </ContentPage>
  );
}
