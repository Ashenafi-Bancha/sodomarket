import Link from 'next/link';
import { ArrowRight, MessageCircle, Phone, Sparkles } from 'lucide-react';
import { getT } from '@/lib/i18n-server';
import { platformConfig } from '@/lib/config';
import { formatPhone, whatsappLink } from '@/lib/formatters';

const supportPhone = platformConfig.supportPhone.replace(/\s+/g, '');

/** Thin notice under the navbar while the site runs on sample data. */
export async function PreviewBanner() {
  const { t } = await getT();
  return (
    <div className="border-b border-gold-200 bg-gold-50 text-ink-800">
      <div className="container-page flex flex-wrap items-center justify-center gap-x-3 gap-y-1 py-2 text-center text-[13px]">
        <span className="inline-flex items-center gap-1 rounded-full bg-gold-400/20 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-gold-800">
          <Sparkles className="h-3 w-3" /> {t.preview.badge}
        </span>
        <span>{t.preview.banner}</span>
        <a href={`tel:${supportPhone}`} className="font-bold text-brand-700 hover:underline">
          {t.preview.contactUs}
        </a>
      </div>
    </div>
  );
}

/** Replaces sign-in, sign-up and other account screens while the database isn't ready. */
export async function ComingSoon() {
  const { t } = await getT();
  return (
    <div>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gold-700 ring-1 ring-gold-200">
        <Sparkles className="h-3.5 w-3.5" /> {t.preview.badge}
      </span>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink-900">{t.preview.comingSoonTitle}</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-600">{t.preview.comingSoonText}</p>
      <div className="mt-8 grid gap-2.5 sm:grid-cols-2">
        <a
          href={`tel:${supportPhone}`}
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-ink-900 text-sm font-semibold text-white hover:bg-ink-800"
        >
          <Phone className="h-4 w-4" /> {formatPhone(supportPhone)}
        </a>
        <a
          href={whatsappLink(supportPhone, 'Hello, I would like help on Zamana Market.')}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#25D366] text-sm font-semibold text-white hover:brightness-95"
        >
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </a>
      </div>
      <Link href="/search" className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline">
        {t.preview.browse} <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
