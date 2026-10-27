'use client';

import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const widths = { sm: 'sm:max-w-sm', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl', xl: 'sm:max-w-4xl' };

/** Accessible dialog. Shows as a bottom sheet on phones. */
export function Modal({ isOpen, onClose, title, subtitle, children, size = 'md' }: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLElement>('input, textarea, select, button[data-autofocus]')?.focus();
    });
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 animate-fade-in bg-ink-950/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'relative flex max-h-[92dvh] w-full animate-slide-up flex-col overflow-hidden rounded-t-3xl bg-white shadow-lift sm:animate-scale-in sm:rounded-3xl',
          widths[size]
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-ink-100 px-5 pb-4 pt-5 sm:px-6">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-bold tracking-tight text-ink-900">
              {title}
            </h2>
            {subtitle && <div className="mt-0.5 text-sm text-ink-500">{subtitle}</div>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mr-1 rounded-full p-2 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
      </div>
    </div>
  );
}
