import Link from 'next/link';
import { Mail, MapPin, Phone, Send, ShieldCheck } from 'lucide-react';
import { getT } from '@/lib/i18n-server';
import { platformConfig } from '@/lib/config';
import { ZONES } from '@/lib/constants';
import { LogoMark } from '@/components/ui/Misc';

export async function Footer() {
  const { t } = await getT();

  const columns = [
    {
      title: t.footer.quickLinks,
      links: [
        { href: '/properties', label: t.nav.properties },
        { href: '/vehicles', label: t.nav.vehicles },
        { href: '/properties?transactionType=FOR_RENT', label: `${t.filters.forRent}` },
        { href: '/brokers', label: t.nav.brokers },
        { href: '/sell', label: t.nav.listAsset },
      ],
    },
    {
      title: t.footer.company,
      links: [
        { href: '/about', label: t.nav.about },
        { href: '/how-it-works', label: t.nav.howItWorks },
        { href: '/safety', label: t.nav.safety },
      ],
    },
    {
      title: t.home.zonesTitle,
      links: ZONES.slice(0, 5).map((z) => ({ href: `/search?zone=${encodeURIComponent(z.name)}`, label: z.name })),
    },
  ];

  return (
    <footer className="mt-24 bg-brand-950 pb-16 text-brand-100/80 md:pb-0">
      <div className="container-page py-14">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-2.5">
              <LogoMark className="h-10 w-10" />
              <span>
                <span className="block text-base font-extrabold text-white">{platformConfig.brandName}</span>
                <span className="block text-xs font-semibold text-brand-300">{platformConfig.subTitle}</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed">{t.footer.tagline}</p>
            <div className="mt-6 space-y-2.5 text-sm">
              <a href={`tel:${platformConfig.supportPhone}`} className="flex items-center gap-2.5 hover:text-white">
                <Phone className="h-4 w-4 text-brand-400" /> {platformConfig.supportPhone}
              </a>
              <a href={`mailto:${platformConfig.supportEmail}`} className="flex items-center gap-2.5 hover:text-white">
                <Mail className="h-4 w-4 text-brand-400" /> {platformConfig.supportEmail}
              </a>
              <p className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-brand-400" /> {platformConfig.primaryLocation}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-5">
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="text-sm font-bold text-white">{col.title}</h3>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="transition-colors hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="lg:col-span-3">
            <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
              <h3 className="flex items-center gap-2 text-sm font-bold text-white">
                <ShieldCheck className="h-4 w-4 text-gold-400" />
                {t.footer.safetyNotice}
              </h3>
              <p className="mt-2 text-xs leading-relaxed">{t.footer.safetyText}</p>
            </div>
            {platformConfig.socials.telegram && (
              <a
                href={platformConfig.socials.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/10 hover:bg-white/10"
              >
                <Send className="h-4 w-4" /> Telegram
              </a>
            )}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>{t.footer.copyright}</p>
          <p className="text-brand-300/70">{t.footer.madeIn}</p>
        </div>
      </div>
    </footer>
  );
}
