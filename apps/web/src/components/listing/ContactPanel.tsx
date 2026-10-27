'use client';

import React, { useState } from 'react';
import { BadgeCheck, CalendarCheck, MessageCircle, Pencil, Phone, ShieldCheck, LayoutDashboard } from 'lucide-react';
import type { ListingItem } from '@/lib/types';
import { useTranslation } from '@/lib/i18n-context';
import { formatDate, formatPhone, formatPrice, isRental, whatsappLink } from '@/lib/formatters';
import { sellerTypeLabel } from '@/lib/labels';
import { fmt } from '@/locales';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Misc';
import { ContactModal, type ContactMode } from './ContactModal';

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.7.6.7.2 1.3.2 1.8.1.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z" />
    </svg>
  );
}

export function ContactPanel({ listing, isOwner }: { listing: ListingItem; isOwner: boolean }) {
  const { t, locale } = useTranslation();
  const [mode, setMode] = useState<ContactMode | null>(null);
  const [showPhone, setShowPhone] = useState(false);
  const seller = listing.author;
  const phone = seller.phone;
  const waText = fmt(t.contact.defaultMessage, { title: listing.title });
  const rental = isRental(listing);

  return (
    <>
      <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-ink-100">
        <p className="text-sm font-medium text-ink-500">{t.listingDetail.priceLabel}</p>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
          <span className="text-3xl font-extrabold tracking-tight text-ink-900">{formatPrice(listing.price, listing.currency)}</span>
          {rental && <span className="text-base font-medium text-ink-500">{t.common.perMonth}</span>}
        </div>
        <div className="mt-2">
          {listing.isNegotiable ? (
            <Badge tone="gold">{t.listingDetail.negotiable}</Badge>
          ) : (
            <Badge tone="neutral">{t.listingDetail.fixedPrice}</Badge>
          )}
        </div>

        {isOwner ? (
          <div className="mt-6 grid gap-2.5">
            <ButtonLink href={`/sell?edit=${listing.id}`} size="lg">
              <Pencil className="h-4 w-4" /> {t.common.edit}
            </ButtonLink>
            <ButtonLink href="/dashboard?tab=listings" variant="outline" size="lg">
              <LayoutDashboard className="h-4 w-4" /> {t.nav.dashboard}
            </ButtonLink>
          </div>
        ) : (
          <div className="mt-6 grid gap-2.5">
            <Button size="lg" onClick={() => setMode('INQUIRY')}>
              <MessageCircle className="h-[18px] w-[18px]" /> {t.listingDetail.inquireForm}
            </Button>
            <Button size="lg" variant="outline" onClick={() => setMode('VIEWING')}>
              <CalendarCheck className="h-[18px] w-[18px]" /> {t.listingDetail.scheduleViewing}
            </Button>
            <div className="grid grid-cols-2 gap-2.5">
              {showPhone ? (
                <a
                  href={`tel:${phone}`}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-ink-900 px-3 text-sm font-semibold text-white hover:bg-ink-800"
                >
                  <Phone className="h-4 w-4" /> {formatPhone(phone)}
                </a>
              ) : (
                <button
                  onClick={() => setShowPhone(true)}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-ink-100 px-3 text-sm font-semibold text-ink-900 hover:bg-ink-200"
                >
                  <Phone className="h-4 w-4" /> {t.listingDetail.callNow}
                </button>
              )}
              <a
                href={whatsappLink(phone, waText)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#25D366]/10 px-3 text-sm font-semibold text-[#128C7E] hover:bg-[#25D366]/20"
              >
                <WhatsAppIcon className="h-4 w-4" /> {t.listingDetail.whatsapp}
              </a>
            </div>
          </div>
        )}

        <div className="mt-6 border-t border-ink-100 pt-5">
          <div className="flex items-center gap-3">
            <Avatar name={seller.fullName} src={seller.avatarUrl} size="lg" />
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 truncate font-bold text-ink-900">
                {seller.fullName}
                {seller.idVerified && <BadgeCheck className="h-[18px] w-[18px] shrink-0 text-brand-600" aria-label={t.common.verified} />}
              </p>
              <p className="text-sm text-ink-500">{sellerTypeLabel(seller.role, t)}</p>
              {seller.createdAt && (
                <p className="text-xs text-ink-400">
                  {t.listingDetail.memberSince} {formatDate(seller.createdAt, locale)}
                </p>
              )}
            </div>
          </div>
          {(listing.agency || seller.licenseNumber) && (
            <div className="mt-4 space-y-1.5 rounded-2xl bg-ink-50 p-3.5 text-sm">
              {listing.agency && (
                <p className="flex items-center gap-1.5 font-semibold text-ink-800">
                  {listing.agency.name}
                  {listing.agency.isVerified && <ShieldCheck className="h-4 w-4 text-brand-600" />}
                </p>
              )}
              {seller.licenseNumber && (
                <p className="text-ink-500">
                  License <span className="font-mono font-semibold text-ink-700">{seller.licenseNumber}</span>
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Phones: always-visible contact bar */}
      {!isOwner && (
        <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-2 border-t border-ink-100 bg-white/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden">
          <div className="mr-auto min-w-0">
            <p className="truncate text-base font-extrabold text-ink-900">
              {formatPrice(listing.price, listing.currency)}
              {rental && <span className="text-xs font-medium text-ink-500"> {t.common.perMonth}</span>}
            </p>
            <p className="truncate text-xs text-ink-500">{seller.fullName}</p>
          </div>
          <a href={`tel:${phone}`} className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-100 text-ink-900" aria-label={t.listingDetail.callNow}>
            <Phone className="h-5 w-5" />
          </a>
          <a
            href={whatsappLink(phone, waText)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#25D366]/10 text-[#128C7E]"
            aria-label="WhatsApp"
          >
            <WhatsAppIcon className="h-5 w-5" />
          </a>
          <Button onClick={() => setMode('INQUIRY')} className="h-11">
            <MessageCircle className="h-4 w-4" /> {t.contact.messageShort}
          </Button>
        </div>
      )}

      {mode && <ContactModal listing={listing} mode={mode} isOpen onClose={() => setMode(null)} />}
    </>
  );
}
