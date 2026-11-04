import type { Metadata } from 'next';
import Link from 'next/link';
import { ContentPage, LegalSection } from '@/components/ui/ContentPage';
import { platformConfig } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'What personal information Wolaita Marketplace collects and how it is used.',
};

const UPDATED = '4 November 2026';

export default function PrivacyPage() {
  const { brandName, supportEmail, supportPhone } = platformConfig;
  return (
    <ContentPage
      eyebrow="Legal"
      title="Privacy Policy"
      intro={`What we collect, why, and the choices you have. Last updated ${UPDATED}.`}
    >
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-6 ring-1 ring-ink-100 sm:p-10">
        <LegalSection n={1} title="What we collect">
          <ul>
            <li>
              <strong>Account details:</strong> your name, phone number, email, password (stored only as a secure hash), and for
              brokers and dealers your business name and license number.
            </li>
            <li>
              <strong>Ads:</strong> the photos, descriptions, prices and locations you post, and the ownership statement you give.
            </li>
            <li>
              <strong>Messages and viewing requests:</strong> the name, phone number and message a buyer sends to a seller.
            </li>
            <li>
              <strong>Basic technical data:</strong> a sign-in cookie, your language choice, and your IP address for security and
              to stop abuse. We do not use advertising trackers.
            </li>
          </ul>
        </LegalSection>

        <LegalSection n={2} title="How we use it">
          <ul>
            <li>To run your account and show your ads.</li>
            <li>To pass your inquiry to the seller you contacted, so they can call or message you back.</li>
            <li>To review ads, verify sellers and brokers, and investigate reports of fraud.</li>
            <li>To keep the site secure, for example limiting repeated sign-in attempts.</li>
          </ul>
        </LegalSection>

        <LegalSection n={3} title="What other people can see">
          <p>
            When you post an ad, your name, phone number, seller type and the general area of the property or vehicle are shown
            publicly so buyers can contact you. Your email address is never shown publicly. When you send an inquiry, only the
            seller of that ad (and our moderators) can see your details.
          </p>
        </LegalSection>

        <LegalSection n={4} title="Sharing">
          <p>
            We do not sell your personal information. We share it only with the service providers that host the site and store
            photos for us, or when Ethiopian law or a lawful request from the authorities requires it.
          </p>
        </LegalSection>

        <LegalSection n={5} title="How long we keep it">
          <p>
            We keep your account while it is open. Removed ads and old inquiries are kept for a limited time for fraud
            prevention and record-keeping, then deleted.
          </p>
        </LegalSection>

        <LegalSection n={6} title="Your choices">
          <ul>
            <li>You can edit your profile, phone number and password in your workspace at any time.</li>
            <li>You can delete your ads, or ask us to close your account and delete your data.</li>
            <li>You can ask for a copy of the personal information we hold about you.</li>
          </ul>
          <p>We handle requests in line with Ethiopian law, including the country’s personal data protection rules.</p>
        </LegalSection>

        <LegalSection n={7} title="Contact">
          <p>
            For any privacy question or request, contact {brandName} at{' '}
            <a href={`mailto:${supportEmail}`} className="font-semibold text-brand-700 hover:underline">
              {supportEmail}
            </a>{' '}
            or{' '}
            <a href={`tel:${supportPhone}`} className="font-semibold text-brand-700 hover:underline">
              {supportPhone}
            </a>
            . See also our <Link href="/terms" className="font-semibold text-brand-700 hover:underline">terms of use</Link>.
          </p>
        </LegalSection>
      </div>
    </ContentPage>
  );
}
