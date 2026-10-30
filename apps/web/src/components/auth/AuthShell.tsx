import Link from 'next/link';
import { CircleCheck } from 'lucide-react';
import { getT } from '@/lib/i18n-server';
import { LogoMark } from '@/components/ui/Misc';
import { platformConfig } from '@/lib/config';

/** Split-screen layout for sign-in and registration. */
export async function AuthShell({ children }: { children: React.ReactNode }) {
  const { t } = await getT();
  return (
    <div className="container-page grid min-h-[calc(100dvh-4rem)] items-center gap-10 py-10 lg:grid-cols-2">
      <div className="mx-auto w-full max-w-md">{children}</div>
      <div className="relative hidden h-full max-h-[720px] overflow-hidden rounded-[2rem] bg-brand-950 lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/60 to-transparent" />
        <div className="relative flex h-full flex-col justify-between p-10 text-white">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark />
            <span className="text-lg font-extrabold">{platformConfig.brandName}</span>
          </Link>
          <div>
            <h2 className="max-w-md text-3xl font-extrabold leading-tight tracking-tight">{t.auth.sideTitle}</h2>
            <ul className="mt-6 space-y-3 text-brand-100">
              {[t.auth.sidePoint1, t.auth.sidePoint2, t.auth.sidePoint3].map((p) => (
                <li key={p} className="flex items-center gap-3">
                  <CircleCheck className="h-5 w-5 shrink-0 text-gold-400" /> {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
