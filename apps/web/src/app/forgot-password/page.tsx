import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Mail, MessageCircle, Phone } from 'lucide-react';
import { getT } from '@/lib/i18n-server';
import { platformConfig } from '@/lib/config';
import { formatPhone, whatsappLink } from '@/lib/formatters';
import { AuthShell } from '@/components/auth/AuthShell';

export const metadata: Metadata = { title: 'Reset your password', robots: { index: false } };

/**
 * Password help. There is no email/SMS provider yet, so support confirms the person
 * and an admin issues a temporary password from the admin console.
 */
export default async function ForgotPasswordPage() {
  const { t } = await getT();
  const { supportPhone, supportEmail } = platformConfig;
  const steps = [t.auth.forgotStep1, t.auth.forgotStep2, t.auth.forgotStep3];

  return (
    <AuthShell>
      <h1 className="text-3xl font-extrabold tracking-tight text-ink-900">{t.auth.forgotTitle}</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-500">{t.auth.forgotSubtitle}</p>

      <ol className="mt-8 space-y-4">
        {steps.map((step, i) => (
          <li key={step} className="flex gap-3.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">
              {i + 1}
            </span>
            <p className="pt-0.5 text-[15px] leading-relaxed text-ink-700">{step}</p>
          </li>
        ))}
      </ol>

      <div className="mt-8 grid gap-2.5 sm:grid-cols-2">
        <a
          href={`tel:${supportPhone.replace(/\s+/g, '')}`}
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-ink-900 text-sm font-semibold text-white hover:bg-ink-800"
        >
          <Phone className="h-4 w-4" /> {formatPhone(supportPhone)}
        </a>
        <a
          href={whatsappLink(supportPhone, 'Hello, I need help resetting my Wolaita Marketplace password.')}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#25D366] text-sm font-semibold text-white hover:brightness-95"
        >
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </a>
      </div>
      <a
        href={`mailto:${supportEmail}?subject=${encodeURIComponent('Password reset')}`}
        className="mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-ink-600 hover:text-ink-900"
      >
        <Mail className="h-4 w-4" /> {supportEmail}
      </a>

      <Link href="/login" className="mt-10 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline">
        <ArrowLeft className="h-4 w-4" /> {t.auth.backToSignIn}
      </Link>
    </AuthShell>
  );
}
