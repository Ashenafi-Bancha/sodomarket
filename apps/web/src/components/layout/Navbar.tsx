'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Search,
  ShieldCheck,
  ShieldAlert,
  User as UserIcon,
  X,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n-context';
import { useAuth } from '@/lib/auth-context';
import { platformConfig } from '@/lib/config';
import { LanguageSelector } from './LanguageSelector';
import { ButtonLink } from '@/components/ui/Button';
import { Avatar, LogoMark } from '@/components/ui/Misc';
import { cn } from '@/lib/cn';

export function Navbar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => setDrawerOpen(false), [pathname]);

  const links = [
    { href: '/properties', label: t.nav.properties },
    { href: '/vehicles', label: t.nav.vehicles },
    { href: '/brokers', label: t.nav.brokers },
    { href: '/how-it-works', label: t.nav.howItWorks },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100/80 bg-white/85 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5" aria-label={platformConfig.brandName}>
          <LogoMark className="h-9 w-9 transition-transform group-hover:scale-105" />
          <span className="leading-none">
            <span className="block text-[15px] font-extrabold tracking-tight text-ink-900">{platformConfig.brandName}</span>
            <span className="mt-0.5 block text-[11px] font-semibold text-brand-600">{platformConfig.subTitle}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors',
                isActive(link.href) ? 'bg-brand-50 text-brand-800' : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-1.5">
          <Link
            href="/search"
            className="hidden h-10 w-10 items-center justify-center rounded-xl text-ink-600 transition-colors hover:bg-ink-100 sm:flex"
            aria-label={t.common.search}
          >
            <Search className="h-[18px] w-[18px]" />
          </Link>
          <LanguageSelector />
          {user && (
            <Link
              href="/dashboard?tab=saved"
              className="hidden h-10 w-10 items-center justify-center rounded-xl text-ink-600 transition-colors hover:bg-ink-100 sm:flex"
              aria-label={t.nav.saved}
            >
              <Heart className="h-[18px] w-[18px]" />
            </Link>
          )}
          <ButtonLink href="/sell" variant="accent" size="sm" className="ml-1 hidden sm:inline-flex">
            <Plus className="h-4 w-4" />
            {t.nav.listAsset}
          </ButtonLink>
          {user ? (
            <UserMenu />
          ) : (
            <ButtonLink href="/login" variant="ghost" size="sm" className="hidden md:inline-flex">
              {t.nav.signIn}
            </ButtonLink>
          )}
          <button
            onClick={() => setDrawerOpen((o) => !o)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-700 hover:bg-ink-100 lg:hidden"
            aria-label={t.nav.menu}
            aria-expanded={drawerOpen}
          >
            {drawerOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {drawerOpen && (
        <div className="animate-fade-in border-t border-ink-100 bg-white lg:hidden">
          <div className="container-page space-y-5 py-5">
            <nav className="grid gap-1" aria-label="Mobile">
              {[...links, { href: '/safety', label: t.nav.safety }, { href: '/about', label: t.nav.about }].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'rounded-xl px-3 py-3 text-[15px] font-semibold',
                    isActive(link.href) ? 'bg-brand-50 text-brand-800' : 'text-ink-800 hover:bg-ink-50'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <LanguageSelector variant="list" />
            {!user && (
              <div className="grid grid-cols-2 gap-2">
                <ButtonLink href="/login" variant="outline">
                  {t.nav.signIn}
                </ButtonLink>
                <ButtonLink href="/register" variant="primary">
                  {t.nav.register}
                </ButtonLink>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function UserMenu() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  if (!user) return null;
  const item = 'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-700 transition-colors hover:bg-ink-50';

  return (
    <div className="relative ml-1" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center rounded-full p-0.5 transition-shadow hover:ring-4 hover:ring-ink-100"
        aria-label={t.nav.account}
        aria-expanded={open}
      >
        <Avatar name={user.fullName} src={user.avatarUrl} size="sm" />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-64 animate-scale-in rounded-2xl bg-white p-1.5 shadow-lift ring-1 ring-ink-100">
          <div className="px-3 pb-3 pt-2">
            <p className="flex items-center gap-1.5 truncate text-sm font-bold text-ink-900">
              {user.fullName}
              {user.idVerified && <ShieldCheck className="h-4 w-4 shrink-0 text-brand-600" />}
            </p>
            <p className="truncate text-xs text-ink-500">{user.email}</p>
          </div>
          <div className="border-t border-ink-100 pt-1.5">
            <Link href="/dashboard" className={item}>
              <LayoutDashboard className="h-4 w-4 text-ink-400" />
              {t.nav.dashboard}
            </Link>
            <Link href="/dashboard?tab=saved" className={item}>
              <Heart className="h-4 w-4 text-ink-400" />
              {t.nav.saved}
            </Link>
            <Link href="/dashboard?tab=profile" className={item}>
              <UserIcon className="h-4 w-4 text-ink-400" />
              {t.crm.profile}
            </Link>
            {user.role === 'ADMIN' && (
              <Link href="/admin" className={cn(item, 'text-red-700 hover:bg-red-50')}>
                <ShieldAlert className="h-4 w-4" />
                {t.nav.admin}
              </Link>
            )}
          </div>
          <div className="mt-1.5 border-t border-ink-100 pt-1.5">
            <button onClick={logout} className={item}>
              <LogOut className="h-4 w-4 text-ink-400" />
              {t.nav.signOut}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
