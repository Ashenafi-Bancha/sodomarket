'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useTranslation } from '@/lib/i18n-context';
import { api, errorMessage } from '@/lib/api-client';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/cn';

export function FavoriteButton({
  listingId,
  initialSaved,
  variant = 'overlay',
  className,
}: {
  listingId: string;
  initialSaved: boolean;
  variant?: 'overlay' | 'button';
  className?: string;
}) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const toast = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const [saved, setSaved] = useState(initialSaved);
  const [busy, setBusy] = useState(false);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (busy) return;
    setBusy(true);
    setSaved((s) => !s);
    try {
      const res = await api.post<{ saved: boolean }>(`/listings/${listingId}/favorite`);
      setSaved(res.saved);
      toast(res.saved ? t.common.saved : `${t.common.save} ✕`);
      router.refresh();
    } catch (err) {
      setSaved((s) => !s);
      toast(errorMessage(err), 'error');
    } finally {
      setBusy(false);
    }
  };

  if (variant === 'button') {
    return (
      <button
        onClick={toggle}
        className={cn(
          'inline-flex h-10 items-center gap-2 rounded-xl px-3.5 text-sm font-semibold transition-colors',
          saved ? 'bg-red-50 text-red-600' : 'text-ink-700 hover:bg-ink-100',
          className
        )}
        aria-pressed={saved}
      >
        <Heart className={cn('h-[18px] w-[18px]', saved && 'fill-current')} />
        {saved ? t.common.saved : t.common.save}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-soft backdrop-blur transition-transform hover:scale-110 active:scale-95',
        className
      )}
      aria-label={saved ? t.common.saved : t.common.save}
      aria-pressed={saved}
      title={user ? undefined : t.common.signInToSave}
    >
      <Heart className={cn('h-[18px] w-[18px]', saved ? 'fill-red-500 text-red-500' : 'text-ink-700')} />
    </button>
  );
}
