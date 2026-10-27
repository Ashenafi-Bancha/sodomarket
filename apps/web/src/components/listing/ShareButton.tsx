'use client';

import { Share2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n-context';
import { useToast } from '@/components/ui/Toast';

export function ShareButton({ title }: { title: string }) {
  const { t } = useTranslation();
  const toast = useToast();

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // User cancelled; fall through to copy.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast(t.common.linkCopied);
    } catch {
      toast(url);
    }
  };

  return (
    <button
      onClick={share}
      className="inline-flex h-10 items-center gap-2 rounded-xl px-3.5 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-100"
    >
      <Share2 className="h-[18px] w-[18px]" />
      {t.listingDetail.shareListing}
    </button>
  );
}
