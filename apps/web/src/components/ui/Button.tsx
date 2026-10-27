import React from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'accent' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'white';
type Size = 'sm' | 'md' | 'lg' | 'icon';

const base =
  'inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap rounded-xl transition-all duration-200 select-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500';

const variants: Record<Variant, string> = {
  primary: 'bg-brand-700 text-white hover:bg-brand-800 shadow-soft hover:shadow-glow',
  accent: 'bg-gold-400 text-ink-950 hover:bg-gold-300 shadow-soft',
  secondary: 'bg-brand-50 text-brand-800 hover:bg-brand-100',
  outline: 'bg-white text-ink-800 border border-ink-200 hover:border-ink-300 hover:bg-ink-50',
  ghost: 'text-ink-700 hover:bg-ink-100',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-soft',
  white: 'bg-white text-ink-900 hover:bg-ink-50 shadow-soft',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-13 px-7 text-base',
  icon: 'h-10 w-10 p-0',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  )
);
Button.displayName = 'Button';

export interface ButtonLinkProps extends React.ComponentProps<typeof Link> {
  variant?: Variant;
  size?: Size;
}

export function ButtonLink({ className, variant = 'primary', size = 'md', ...props }: ButtonLinkProps) {
  return <Link className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
