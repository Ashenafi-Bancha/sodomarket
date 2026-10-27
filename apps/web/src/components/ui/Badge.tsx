import React from 'react';
import { cn } from '@/lib/cn';

type Tone = 'brand' | 'gold' | 'neutral' | 'red' | 'blue' | 'violet' | 'dark' | 'white';

const tones: Record<Tone, string> = {
  brand: 'bg-brand-50 text-brand-800 ring-brand-200/70',
  gold: 'bg-gold-50 text-gold-800 ring-gold-200/70',
  neutral: 'bg-ink-100 text-ink-700 ring-ink-200/70',
  red: 'bg-red-50 text-red-700 ring-red-200/70',
  blue: 'bg-sky-50 text-sky-800 ring-sky-200/70',
  violet: 'bg-violet-50 text-violet-800 ring-violet-200/70',
  dark: 'bg-ink-900/80 text-white ring-white/10 backdrop-blur',
  white: 'bg-white/95 text-ink-900 ring-black/5 backdrop-blur shadow-soft',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  size?: 'sm' | 'md';
}

export function Badge({ tone = 'neutral', size = 'sm', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold ring-1 ring-inset whitespace-nowrap',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
