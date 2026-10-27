import React from 'react';
import { cn } from '@/lib/cn';
import { initials } from '@/lib/formatters';

/** Brand mark: a roofline over Mount Damota with the Sodo sun. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn('h-10 w-10', className)} aria-hidden>
      <defs>
        <linearGradient id="wm-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#157c4f" />
          <stop offset="1" stopColor="#062419" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="12" fill="url(#wm-g)" />
      <circle cx="27.5" cy="12.5" r="3.6" fill="#e9aa2b" />
      <path d="M8 29.5 L20 15.5 L32 29.5" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.5 29.5 v-5.5 h9 v5.5" fill="none" stroke="#b0e7c7" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Avatar({ name, src, size = 'md', className }: { name?: string; src?: string; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const dims = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-lg' }[size];
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name ?? ''} className={cn('rounded-full object-cover', dims, className)} />;
  }
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-brand-200 font-bold uppercase text-brand-800 ring-2 ring-white',
        dims,
        className
      )}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('rounded-3xl border border-dashed border-ink-200 bg-white px-6 py-14 text-center', className)}>
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-50 text-ink-400">{icon}</div>
      <h3 className="text-base font-bold text-ink-900">{title}</h3>
      {description && <p className="mx-auto mt-1 max-w-sm text-sm text-ink-500">{description}</p>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="max-w-2xl">
        {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-brand-600">{eyebrow}</p>}
        <h2 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">{title}</h2>
        {subtitle && <p className="mt-2 text-[15px] text-ink-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
