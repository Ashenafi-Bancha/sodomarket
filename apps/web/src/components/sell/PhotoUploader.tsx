'use client';

import React, { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ImagePlus, Link2, Loader2, Star, Trash2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n-context';
import { api, errorMessage } from '@/lib/api-client';
import { MAX_PHOTOS } from '@/lib/constants';
import { compressImage } from './image-utils';
import { cn } from '@/lib/cn';

export interface Photo {
  url: string;
  caption?: string;
}

export function PhotoUploader({ photos, onChange }: { photos: Photo[]; onChange: (photos: Photo[]) => void }) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [link, setLink] = useState('');

  // Keep the latest list available inside async upload callbacks.
  const latest = useRef(photos);
  latest.current = photos;

  const upload = async (files: FileList | File[]) => {
    setError('');
    const room = MAX_PHOTOS - latest.current.length;
    const list = Array.from(files).filter((f) => f.type.startsWith('image/')).slice(0, room);
    if (!list.length) return;
    setUploading((n) => n + list.length);
    for (const file of list) {
      try {
        const blob = await compressImage(file);
        const form = new FormData();
        form.append('file', blob, file.name.replace(/\.\w+$/, '') + (blob.type === 'image/jpeg' ? '.jpg' : ''));
        const res = await api.post<{ url: string }>('/uploads', form);
        onChange([...latest.current, { url: res.url }]);
      } catch (err) {
        setError(errorMessage(err));
      } finally {
        setUploading((n) => n - 1);
      }
    }
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= photos.length) return;
    const next = [...photos];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  const addLink = () => {
    const url = link.trim();
    if (!/^https:\/\/\S+$/.test(url)) {
      setError('Please paste a full https:// image link.');
      return;
    }
    onChange([...photos, { url }]);
    setLink('');
    setError('');
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          upload(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-10 text-center transition-colors',
          dragging ? 'border-brand-500 bg-brand-50' : 'border-ink-200 bg-ink-50/50 hover:border-brand-300 hover:bg-brand-50/40'
        )}
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-soft">
          <ImagePlus className="h-7 w-7" />
        </span>
        <p className="mt-4 font-bold text-ink-900">{t.wizard.uploadPhotos}</p>
        <p className="mt-1 text-sm text-ink-500">{t.wizard.dropHint}</p>
        <p className="mt-1 text-xs text-ink-400">{t.wizard.imageUploadHint}</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) upload(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {(photos.length > 0 || uploading > 0) && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((p, i) => (
            <li key={`${p.url}-${i}`} className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-ink-100 ring-1 ring-ink-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt="" className="h-full w-full object-cover" />
              {i === 0 && (
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-gold-400 px-2 py-0.5 text-[11px] font-bold text-ink-950">
                  <Star className="h-3 w-3" /> {t.wizard.cover}
                </span>
              )}
              <div className="absolute inset-x-2 bottom-2 flex justify-between opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                <div className="flex gap-1">
                  <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} className="rounded-lg bg-white/90 p-1.5 text-ink-800 disabled:opacity-40" aria-label="Move left">
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => move(i, i + 1)} disabled={i === photos.length - 1} className="rounded-lg bg-white/90 p-1.5 text-ink-800 disabled:opacity-40" aria-label="Move right">
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  {i !== 0 && (
                    <button type="button" onClick={() => move(i, 0)} className="rounded-lg bg-white/90 p-1.5 text-ink-800" aria-label={t.wizard.cover}>
                      <Star className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onChange(photos.filter((_, j) => j !== i))}
                  className="rounded-lg bg-white/90 p-1.5 text-red-600"
                  aria-label={t.common.delete}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
          {Array.from({ length: uploading }).map((_, i) => (
            <li key={`up-${i}`} className="skeleton flex aspect-[4/3] items-center justify-center rounded-2xl">
              <span className="flex items-center gap-2 text-sm font-medium text-ink-500">
                <Loader2 className="h-4 w-4 animate-spin" /> {t.wizard.uploading}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addLink();
              }
            }}
            placeholder={t.wizard.pasteUrl}
            className="h-11 w-full rounded-xl border border-ink-200 bg-white pl-10 pr-3 text-sm placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
          />
        </div>
        <button type="button" onClick={addLink} className="h-11 rounded-xl border border-ink-200 px-4 text-sm font-semibold text-ink-800 hover:bg-ink-50">
          {t.wizard.addUrl}
        </button>
      </div>
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
    </div>
  );
}
