import React from 'react';
import { cn } from '@/lib/cn';
import { initials } from '@/lib/formatters';
import { brand, LOCKUP_RATIO } from '@/lib/brand';
import { platformConfig } from '@/lib/config';

/** The Zamana Market logo: symbol + name. `tone` is the background it sits on. */
export function BrandLogo({
  tone = 'light',
  height = 32,
  geez = false,
  className,
}: {
  tone?: 'light' | 'dark';
  height?: number;
  /** Ge'ez lockup (ዛማና ማርኬት) for the Amharic site. */
  geez?: boolean;
  className?: string;
}) {
  const src = geez ? (tone === 'dark' ? brand.geezOnNavy : brand.geezOnWhite) : tone === 'dark' ? brand.horizontalOnNavy : brand.horizontalOnWhite;
  const width = Math.round(height * (geez ? LOCKUP_RATIO.geez : LOCKUP_RATIO.latin));
  // Plain <img>: the SVGs are already tiny vectors, so image optimisation adds nothing.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={platformConfig.brandName} width={width} height={height} className={cn('block h-auto max-w-full', className)} />;
}

/** The symbol alone, as the rounded app icon. */
export function LogoMark({ className }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={brand.appIcon} alt="" aria-hidden width={40} height={40} className={cn('h-10 w-10', className)} />;
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
