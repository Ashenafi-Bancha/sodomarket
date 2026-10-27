'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Images, X } from 'lucide-react';
import type { ListingMedia } from '@/lib/types';
import { useTranslation } from '@/lib/i18n-context';
import { cn } from '@/lib/cn';

const sized = (url: string, w: number) => (url.includes('images.unsplash.com') ? url.replace(/w=\d+/, `w=${w}`) : url);

export function ListingGallery({ media, title }: { media: ListingMedia[]; title: string }) {
  const { t } = useTranslation();
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [mobileIndex, setMobileIndex] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);
  const photos = media.length ? media : [];

  const open = (i: number) => setLightbox(i);
  const close = useCallback(() => setLightbox(null), []);
  const step = useCallback(
    (dir: number) => setLightbox((i) => (i === null ? null : (i + dir + photos.length) % photos.length)),
    [photos.length]
  );

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [lightbox, close, step]);

  if (!photos.length) return <div className="aspect-[16/9] rounded-3xl bg-ink-100" />;

  const side = photos.slice(1, 5);

  return (
    <>
      {/* Phones: swipeable strip */}
      <div className="relative -mx-4 sm:hidden">
        <div
          ref={scroller}
          onScroll={(e) => {
            const el = e.currentTarget;
            setMobileIndex(Math.round(el.scrollLeft / el.clientWidth));
          }}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
        >
          {photos.map((m, i) => (
            <button key={m.id} onClick={() => open(i)} className="aspect-[4/3] w-full shrink-0 snap-center" aria-label={`${t.listingDetail.viewGallery} ${i + 1}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={sized(m.url, 900)} alt={m.caption ?? title} className="h-full w-full object-cover" loading={i === 0 ? 'eager' : 'lazy'} />
            </button>
          ))}
        </div>
        <span className="absolute bottom-3 right-4 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white">
          {mobileIndex + 1} / {photos.length}
        </span>
      </div>

      {/* Tablet & desktop: mosaic */}
      <div
        className={cn(
          'relative hidden gap-2 overflow-hidden rounded-3xl sm:grid',
          side.length === 0 ? 'grid-cols-1' : side.length === 1 ? 'grid-cols-2' : 'grid-cols-4 grid-rows-2'
        )}
        style={{ height: 'min(62vh, 520px)' }}
      >
        <button
          onClick={() => open(0)}
          className={cn('group relative overflow-hidden bg-ink-100', side.length >= 2 && 'col-span-2 row-span-2')}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={sized(photos[0].url, 1400)} alt={photos[0].caption ?? title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
        </button>
        {side.map((m, i) => (
          <button
            key={m.id}
            onClick={() => open(i + 1)}
            className={cn(
              'group relative overflow-hidden bg-ink-100',
              side.length === 2 && 'col-span-2',
              side.length === 3 && i === 2 && 'col-span-2'
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={sized(m.url, 800)} alt={m.caption ?? title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]" loading="lazy" />
          </button>
        ))}
        {photos.length > 1 && (
          <button
            onClick={() => open(0)}
            className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-xl bg-white/95 px-4 py-2 text-sm font-semibold text-ink-900 shadow-card backdrop-blur hover:bg-white"
          >
            <Images className="h-4 w-4" />
            {t.listingDetail.viewGallery} ({photos.length})
          </button>
        )}
      </div>

      {lightbox !== null && (
        <div className="fixed inset-0 z-[70] flex animate-fade-in flex-col bg-ink-950/95" role="dialog" aria-modal="true" aria-label={title}>
          <div className="flex items-center justify-between px-4 py-3 text-white">
            <span className="text-sm font-semibold">
              {lightbox + 1} / {photos.length}
              {photos[lightbox].caption && <span className="ml-3 font-normal text-white/60">{photos[lightbox].caption}</span>}
            </span>
            <button onClick={close} className="rounded-full p-2 hover:bg-white/10" aria-label={t.common.close}>
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="relative flex flex-1 items-center justify-center px-2 pb-6 sm:px-16">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={lightbox}
              src={sized(photos[lightbox].url, 2000)}
              alt={photos[lightbox].caption ?? title}
              className="max-h-full max-w-full animate-fade-in rounded-xl object-contain"
            />
            {photos.length > 1 && (
              <>
                <button onClick={() => step(-1)} className="absolute left-2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 sm:left-4" aria-label="Previous photo">
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button onClick={() => step(1)} className="absolute right-2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 sm:right-4" aria-label="Next photo">
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
