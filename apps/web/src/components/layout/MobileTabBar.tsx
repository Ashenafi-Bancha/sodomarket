'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Home, Plus, Search, User } from 'lucide-react';
import { useTranslation } from '@/lib/i18n-context';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/cn';

/** App-style bottom navigation for phones. */
export function MobileTabBar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { user } = useAuth();

  // Listing pages show their own contact bar instead.
  if (/^\/(properties|vehicles)\/[^/]+$/.test(pathname)) return null;

  const tabs = [
    { href: '/', label: t.common.home, icon: Home, active: pathname === '/' },
    {
      href: '/search',
      label: t.nav.explore,
      icon: Search,
      active: ['/search', '/properties', '/vehicles'].some((p) => pathname.startsWith(p)),
    },
    { href: '/sell', label: t.nav.listAsset, icon: Plus, active: pathname.startsWith('/sell'), primary: true },
    {
      href: user ? '/dashboard?tab=saved' : '/login?next=/dashboard?tab=saved',
      label: t.nav.saved,
      icon: Heart,
      active: false,
    },
    {
      href: user ? '/dashboard' : '/login',
      label: t.nav.account,
      icon: User,
      active: pathname.startsWith('/dashboard') || pathname.startsWith('/login') || pathname.startsWith('/register'),
    },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
      aria-label="Bottom navigation"
    >
      <div className="grid grid-cols-5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.label}
              href={tab.href}
              className="flex flex-col items-center gap-1 py-2 text-[10.5px] font-semibold"
              aria-current={tab.active ? 'page' : undefined}
            >
              {tab.primary ? (
                <span className="-mt-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-700 text-white shadow-glow ring-4 ring-white">
                  <Icon className="h-6 w-6" />
                </span>
              ) : (
                <Icon className={cn('h-[22px] w-[22px]', tab.active ? 'text-brand-700' : 'text-ink-400')} strokeWidth={tab.active ? 2.4 : 2} />
              )}
              <span className={cn('max-w-full truncate px-1', tab.active ? 'text-brand-800' : 'text-ink-500')}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
