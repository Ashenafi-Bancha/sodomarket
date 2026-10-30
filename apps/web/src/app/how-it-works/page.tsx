import type { Metadata } from 'next';
import { BadgeCheck, CalendarCheck, Camera, ClipboardCheck, Handshake, MessageCircle, Search, ShieldCheck } from 'lucide-react';
import { getT } from '@/lib/i18n-server';
import { ContentPage } from '@/components/ui/ContentPage';
import { ButtonLink } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'How It Works',
  description: 'How to buy, rent, sell and list on Wolaita Marketplace.',
};

function Steps({ items }: { items: { icon: React.ElementType; title: string; desc: string }[] }) {
  return (
    <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {items.map((s, i) => {
        const Icon = s.icon;
        return (
          <li key={s.title} className="rounded-3xl bg-white p-6 ring-1 ring-ink-100">
            <div className="flex items-center justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-700 text-white">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-3xl font-extrabold text-ink-100">0{i + 1}</span>
            </div>
            <h3 className="mt-5 font-bold text-ink-900">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">{s.desc}</p>
          </li>
        );
      })}
    </ol>
  );
}

export default async function HowItWorksPage() {
  const { t } = await getT();
  return (
    <ContentPage eyebrow={t.nav.howItWorks} title={t.home.howItWorksTitle} intro={t.home.heroSubtitle}>
      <section>
        <h2 className="mb-6 text-2xl font-extrabold tracking-tight text-ink-900">For buyers & tenants</h2>
        <Steps
          items={[
            { icon: Search, title: 'Search & filter', desc: 'Filter by zone, price, bedrooms, vehicle year and more. Save favourites with the heart.' },
            { icon: MessageCircle, title: 'Contact directly', desc: 'Call, WhatsApp or send a message. No account is needed to contact a seller.' },
            { icon: CalendarCheck, title: 'Book a viewing', desc: 'Pick a date and time. The seller confirms by phone and the viewing appears in their calendar.' },
            { icon: ShieldCheck, title: 'Verify, then pay', desc: 'Check the title deed or libre at the official office before paying any deposit.' },
          ]}
        />
      </section>
      <section className="mt-14">
        <h2 className="mb-6 text-2xl font-extrabold tracking-tight text-ink-900">For owners, brokers & dealers</h2>
        <Steps
          items={[
            { icon: Camera, title: 'Create your listing', desc: 'A short 5-step form with photo upload. Photos are shrunk automatically to save data.' },
            { icon: ClipboardCheck, title: 'Local review', desc: 'Our team checks every listing for accuracy and ownership before it goes live.' },
            { icon: BadgeCheck, title: 'Get inquiries', desc: 'Messages and viewing requests arrive in your workspace with the buyer’s phone number.' },
            { icon: Handshake, title: 'Close the deal', desc: 'Track each buyer’s stage, schedule viewings and record deals and commission.' },
          ]}
        />
      </section>
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
