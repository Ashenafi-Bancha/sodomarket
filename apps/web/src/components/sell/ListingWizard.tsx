'use client';

import React, { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Car, Check, CheckCircle2, House, MapPin, ShieldCheck } from 'lucide-react';
import type {
  AssetType,
  FuelType,
  FurnishingStatus,
  ListingItem,
  PropertyType,
  TransactionType,
  TransmissionType,
  VehicleCondition,
  VehicleType,
} from '@/lib/types';
import { useTranslation } from '@/lib/i18n-context';
import { api, errorMessage } from '@/lib/api-client';
import {
  CONDITIONS,
  FUEL_TYPES,
  FURNISHING,
  PROPERTY_TYPES,
  TRANSMISSIONS,
  VEHICLE_MAKES,
  VEHICLE_TYPES,
  ZONE_NAMES,
} from '@/lib/constants';
import { formatNumber, formatPrice, listingPath } from '@/lib/formatters';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Checkbox, FormAlert, Input, Label, Select, Textarea } from '@/components/ui/Input';
import { PhotoUploader, type Photo } from './PhotoUploader';
import { cn } from '@/lib/cn';

interface FormState {
  assetType: AssetType;
  propertyType: PropertyType;
  transactionType: TransactionType;
  vehicleType: VehicleType;
  title: string;
  description: string;
  bedrooms: string;
  bathrooms: string;
  areaSqM: string;
  compoundSizeSqM: string;
  furnishing: FurnishingStatus;
  parkingSpaces: string;
  waterConnected: boolean;
  electricityConnected: boolean;
  make: string;
  model: string;
  year: string;
  mileageKm: string;
  transmission: TransmissionType;
  fuelType: FuelType;
  condition: VehicleCondition;
  plateCode: string;
  price: string;
  isNegotiable: boolean;
  zone: string;
  kebele: string;
  landmark: string;
  photos: Photo[];
  ownerDeclaration: string;
  declarationAccepted: boolean;
}

const EMPTY: FormState = {
  assetType: 'REAL_ESTATE',
  propertyType: 'HOUSE',
  transactionType: 'FOR_SALE',
  vehicleType: 'CAR',
  title: '',
  description: '',
  bedrooms: '',
  bathrooms: '',
  areaSqM: '',
  compoundSizeSqM: '',
  furnishing: 'UNFURNISHED',
  parkingSpaces: '',
  waterConnected: true,
  electricityConnected: true,
  make: 'Toyota',
  model: '',
  year: String(new Date().getFullYear() - 5),
  mileageKm: '',
  transmission: 'MANUAL',
  fuelType: 'BENZINE',
  condition: 'GOOD',
  plateCode: '',
  price: '',
  isNegotiable: true,
  zone: '',
  kebele: '',
  landmark: '',
  photos: [],
  ownerDeclaration: '',
  declarationAccepted: false,
};

const DRAFT_KEY = 'wm_listing_draft_v1';

function readDraft(): string | null {
  try {
    return localStorage.getItem(DRAFT_KEY);
  } catch {
    return null;
  }
}
const noopSubscribe = () => () => {};
const LAND_TYPES: PropertyType[] = ['RESIDENTIAL_LAND', 'COMMERCIAL_LAND'];
const NO_ROOMS: PropertyType[] = ['RESIDENTIAL_LAND', 'COMMERCIAL_LAND', 'WAREHOUSE'];

function fromListing(l: ListingItem): FormState {
  const p = l.propertyDetails;
  const v = l.vehicleDetails;
  const str = (n?: number) => (n == null ? '' : String(n));
  return {
    ...EMPTY,
    assetType: l.assetType,
    propertyType: p?.propertyType ?? 'HOUSE',
    transactionType: p?.transactionType ?? 'FOR_SALE',
    vehicleType: v?.vehicleType ?? 'CAR',
    title: l.title,
    description: l.description,
    bedrooms: str(p?.bedrooms),
    bathrooms: str(p?.bathrooms),
    areaSqM: str(p?.areaSqM),
    compoundSizeSqM: str(p?.compoundSizeSqM),
    furnishing: p?.furnishing ?? 'UNFURNISHED',
    parkingSpaces: str(p?.parkingSpaces),
    waterConnected: p?.waterConnected ?? true,
    electricityConnected: p?.electricityConnected ?? true,
    make: v?.make ?? 'Toyota',
    model: v?.model ?? '',
    year: str(v?.year) || EMPTY.year,
    mileageKm: str(v?.mileageKm),
    transmission: v?.transmission ?? 'MANUAL',
    fuelType: v?.fuelType ?? 'BENZINE',
    condition: v?.condition ?? 'GOOD',
    plateCode: v?.plateCode ?? '',
    price: String(l.price),
    isNegotiable: l.isNegotiable,
    zone: l.location.zone,
    kebele: l.location.kebele ?? '',
    landmark: l.location.landmark ?? '',
    photos: l.media.map((m) => ({ url: m.url, caption: m.caption })),
    ownerDeclaration: l.ownerDeclaration ?? '',
    declarationAccepted: false,
  };
}

const num = (s: string) => (s.trim() === '' ? undefined : Number(s.replace(/[, ]/g, '')));

function OptionCard({
  active,
  onClick,
  icon,
  title,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'relative flex items-start gap-4 rounded-2xl p-5 text-left ring-2 transition-all',
        active ? 'bg-brand-50 ring-brand-600' : 'bg-white ring-ink-100 hover:ring-ink-200'
      )}
    >
      <span className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', active ? 'bg-brand-700 text-white' : 'bg-ink-100 text-ink-600')}>
        {icon}
      </span>
      <span>
        <span className="block text-base font-bold text-ink-900">{title}</span>
        <span className="mt-0.5 block text-sm text-ink-500">{desc}</span>
      </span>
      {active && <Check className="absolute right-4 top-4 h-5 w-5 text-brand-700" />}
    </button>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-inset transition-colors',
        active ? 'bg-brand-700 text-white ring-brand-700' : 'bg-white text-ink-700 ring-ink-200 hover:ring-ink-300'
      )}
    >
      {children}
    </button>
  );
}

export function ListingWizard({ initial }: { initial?: ListingItem }) {
  const { t } = useTranslation();
  const router = useRouter();
  const editing = !!initial;
  const [form, setForm] = useState<FormState>(() => (initial ? fromListing(initial) : EMPTY));
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<ListingItem | null>(null);
  // An unfinished draft saved on this device (new listings only).
  const savedDraft = useSyncExternalStore(noopSubscribe, readDraft, () => null);
  const [draftDecided, setDraftDecided] = useState(editing);
  const [touched, setTouched] = useState(false);
  const offerDraft = !editing && !draftDecided && !touched && !!savedDraft;

  // Save progress on this device while the user fills in the form.
  useEffect(() => {
    if (editing || done || !touched) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    } catch {
      // Storage may be unavailable.
    }
  }, [form, editing, done, touched]);

  const restoreDraft = () => {
    try {
      if (savedDraft) setForm({ ...EMPTY, ...JSON.parse(savedDraft), declarationAccepted: false });
    } catch {
      // Ignore broken drafts.
    }
    setDraftDecided(true);
  };
  const discardDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      // ignore
    }
    setDraftDecided(true);
  };

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setTouched(true);
    setForm((f) => ({ ...f, [key]: value }));
  };
  const isProperty = form.assetType === 'REAL_ESTATE';
  const isRent = isProperty && form.transactionType === 'FOR_RENT';
  const hasRooms = isProperty && !NO_ROOMS.includes(form.propertyType);
  const isLand = isProperty && LAND_TYPES.includes(form.propertyType);

  const steps = [t.wizard.stepType, t.wizard.stepDetails, t.wizard.stepPriceLocation, t.wizard.stepPhotos, t.wizard.stepReview];

  const validate = (s: number): string => {
    if (s === 1) {
      if (form.title.trim().length < 8) return 'Please write a title of at least 8 characters.';
      if (form.description.trim().length < 30) return 'Please write a description of at least 30 characters.';
      if (!isProperty) {
        if (!form.model.trim()) return 'Please enter the vehicle model.';
        const y = Number(form.year);
        if (!y || y < 1960 || y > new Date().getFullYear() + 1) return 'Please enter a valid year.';
      }
    }
    if (s === 2) {
      if (!num(form.price) || (num(form.price) ?? 0) <= 0) return 'Please enter a price.';
      if (!form.zone) return 'Please choose the zone.';
    }
    if (s === 3 && form.photos.length === 0) return 'Please add at least one photo.';
    if (s === 4) {
      if (form.ownerDeclaration.trim().length < 5) return 'Please describe your right to sell or rent this asset.';
      if (!form.declarationAccepted) return 'Please confirm the ownership declaration.';
    }
    return '';
  };

  const next = () => {
    const msg = validate(step);
    setError(msg);
    if (!msg) {
      setStep((s) => Math.min(s + 1, steps.length - 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  const back = () => {
    setError('');
    setStep((s) => Math.max(0, s - 1));
  };

  const payload = useMemo(
    () => ({
      assetType: form.assetType,
      title: form.title.trim(),
      description: form.description.trim(),
      price: num(form.price),
      isNegotiable: form.isNegotiable,
      location: { zone: form.zone, kebele: form.kebele.trim() || undefined, landmark: form.landmark.trim() || undefined },
      propertyDetails: isProperty
        ? {
            propertyType: form.propertyType,
            transactionType: form.transactionType,
            bedrooms: hasRooms ? num(form.bedrooms) : undefined,
            bathrooms: hasRooms ? num(form.bathrooms) : undefined,
            areaSqM: num(form.areaSqM),
            compoundSizeSqM: num(form.compoundSizeSqM),
            furnishing: isLand ? undefined : form.furnishing,
            waterConnected: form.waterConnected,
            electricityConnected: form.electricityConnected,
            parkingSpaces: isLand ? undefined : num(form.parkingSpaces),
          }
        : undefined,
      vehicleDetails: !isProperty
        ? {
            vehicleType: form.vehicleType,
            make: form.make.trim(),
            model: form.model.trim(),
            year: num(form.year),
            mileageKm: num(form.mileageKm),
            transmission: form.transmission,
            fuelType: form.fuelType,
            condition: form.condition,
            plateCode: form.plateCode.trim() || undefined,
          }
        : undefined,
      media: form.photos,
      ownerDeclaration: form.ownerDeclaration.trim(),
      declarationAccepted: form.declarationAccepted,
    }),
    [form, isProperty, hasRooms, isLand]
  );

  const submit = async () => {
    for (let s = 1; s <= 4; s++) {
      const msg = validate(s);
      if (msg) {
        setError(msg);
        setStep(s);
        return;
      }
    }
    setBusy(true);
    setError('');
    try {
      const saved = editing
        ? await api.patch<ListingItem>(`/listings/${initial!.id}`, payload)
        : await api.post<ListingItem>('/listings', payload);
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        // ignore
      }
      setDone(saved);
      router.refresh();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="mx-auto max-w-xl py-10 text-center">
        <div className="mx-auto flex h-20 w-20 animate-scale-in items-center justify-center rounded-full bg-brand-50">
          <CheckCircle2 className="h-10 w-10 text-brand-600" />
        </div>
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-ink-900">{t.wizard.submitSuccessTitle}</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-500">{t.wizard.submitSuccessDesc}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/dashboard?tab=listings" size="lg">
            {t.wizard.goToWorkspace}
          </ButtonLink>
          <ButtonLink href={listingPath(done)} variant="outline" size="lg">
            {t.common.view}
          </ButtonLink>
          {!editing && (
            <Button
              variant="ghost"
              size="lg"
              onClick={() => {
                setForm(EMPTY);
                setStep(0);
                setDone(null);
              }}
            >
              {t.wizard.listAnother}
            </Button>
          )}
        </div>
      </div>
    );
  }

  const cover = form.photos[0]?.url;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
          {editing ? t.wizard.editingTitle : t.wizard.newTitle}
        </h1>
        {!editing && <p className="mt-2 text-[15px] text-ink-500">{t.wizard.newSubtitle}</p>}
      </div>

      {offerDraft && (
        <div className="mb-6 flex flex-col gap-3 rounded-2xl bg-brand-50 p-4 ring-1 ring-brand-200 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-brand-900">You have an unfinished listing saved on this device.</p>
          <div className="flex gap-2">
            <Button size="sm" onClick={restoreDraft}>
              {t.common.continue}
            </Button>
            <Button size="sm" variant="ghost" onClick={discardDraft}>
              {t.wizard.listAnother}
            </Button>
          </div>
        </div>
      )}

      {/* Progress */}
      <ol className="mb-8 grid grid-cols-5 gap-2" aria-label="Progress">
        {steps.map((label, i) => (
          <li key={label}>
            <button
              type="button"
              onClick={() => i < step && setStep(i)}
              disabled={i > step}
              className="group w-full text-left disabled:cursor-default"
              aria-current={i === step ? 'step' : undefined}
            >
              <span className={cn('block h-1.5 rounded-full transition-colors', i <= step ? 'bg-brand-600' : 'bg-ink-200')} />
              <span
                className={cn(
                  'mt-2 hidden text-xs font-semibold sm:block',
                  i === step ? 'text-brand-800' : i < step ? 'text-ink-600 group-hover:text-ink-900' : 'text-ink-400'
                )}
              >
                {label}
              </span>
            </button>
          </li>
        ))}
      </ol>
      <p className="-mt-5 mb-6 text-sm font-semibold text-brand-800 sm:hidden">
        {step + 1}/5 · {steps[step]}
      </p>

      <div className="rounded-3xl bg-white p-5 ring-1 ring-ink-100 sm:p-8">
        {step === 0 && (
          <div className="space-y-8">
            <div className="grid gap-3 sm:grid-cols-2">
              <OptionCard
                active={isProperty}
                onClick={() => set('assetType', 'REAL_ESTATE')}
                icon={<House className="h-6 w-6" />}
                title={t.wizard.property}
                desc={t.wizard.propertyDesc}
              />
              <OptionCard
                active={!isProperty}
                onClick={() => set('assetType', 'VEHICLE')}
                icon={<Car className="h-6 w-6" />}
                title={t.wizard.vehicle}
                desc={t.wizard.vehicleDesc}
              />
            </div>
            <div>
              <Label>{t.wizard.category}</Label>
              <div className="flex flex-wrap gap-2">
                {isProperty
                  ? PROPERTY_TYPES.map((c) => (
                      <Pill key={c} active={form.propertyType === c} onClick={() => set('propertyType', c)}>
                        {t.propertyType[c]}
                      </Pill>
                    ))
                  : VEHICLE_TYPES.map((c) => (
                      <Pill key={c} active={form.vehicleType === c} onClick={() => set('vehicleType', c)}>
                        {t.vehicleType[c]}
                      </Pill>
                    ))}
              </div>
            </div>
            {isProperty && (
              <div>
                <Label>{t.wizard.offer}</Label>
                <div className="flex gap-2">
                  <Pill active={form.transactionType === 'FOR_SALE'} onClick={() => set('transactionType', 'FOR_SALE')}>
                    {t.filters.forSale}
                  </Pill>
                  <Pill active={form.transactionType === 'FOR_RENT'} onClick={() => set('transactionType', 'FOR_RENT')}>
                    {t.filters.forRent}
                  </Pill>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <Label htmlFor="w-title">{t.wizard.title}</Label>
              <Input id="w-title" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder={t.wizard.titlePlaceholder} maxLength={120} />
              <p className="mt-1 text-right text-xs text-ink-400">{form.title.length}/120</p>
            </div>
            <div>
              <Label htmlFor="w-desc">{t.wizard.description}</Label>
              <Textarea id="w-desc" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder={t.wizard.descriptionPlaceholder} rows={6} maxLength={5000} />
            </div>

            {isProperty ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {hasRooms && (
                  <>
                    <div>
                      <Label htmlFor="w-bed">{t.listingDetail.bedrooms}</Label>
                      <Input id="w-bed" inputMode="numeric" value={form.bedrooms} onChange={(e) => set('bedrooms', e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="w-bath">{t.listingDetail.bathrooms}</Label>
                      <Input id="w-bath" inputMode="numeric" value={form.bathrooms} onChange={(e) => set('bathrooms', e.target.value)} />
                    </div>
                  </>
                )}
                <div>
                  <Label htmlFor="w-area" optional={t.common.optional}>
                    {isLand ? t.listingDetail.compound : t.listingDetail.area} (m²)
                  </Label>
                  <Input id="w-area" inputMode="numeric" value={form.areaSqM} onChange={(e) => set('areaSqM', e.target.value)} />
                </div>
                {!isLand && (
                  <div>
                    <Label htmlFor="w-compound" optional={t.common.optional}>
                      {t.listingDetail.compound} (m²)
                    </Label>
                    <Input id="w-compound" inputMode="numeric" value={form.compoundSizeSqM} onChange={(e) => set('compoundSizeSqM', e.target.value)} />
                  </div>
                )}
                {!isLand && (
                  <>
                    <div>
                      <Label htmlFor="w-furn">{t.listingDetail.furnishing}</Label>
                      <Select id="w-furn" value={form.furnishing} onChange={(e) => set('furnishing', e.target.value as FurnishingStatus)} options={FURNISHING.map((f) => ({ value: f, label: t.furnishing[f] }))} />
                    </div>
                    <div>
                      <Label htmlFor="w-park" optional={t.common.optional}>
                        {t.listingDetail.parking}
                      </Label>
                      <Input id="w-park" inputMode="numeric" value={form.parkingSpaces} onChange={(e) => set('parkingSpaces', e.target.value)} />
                    </div>
                  </>
                )}
                <div className="space-y-3 sm:col-span-2">
                  <Checkbox label={t.listingDetail.water} checked={form.waterConnected} onChange={(e) => set('waterConnected', e.target.checked)} />
                  <Checkbox label={t.listingDetail.electricity} checked={form.electricityConnected} onChange={(e) => set('electricityConnected', e.target.checked)} />
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="w-make">{t.listingDetail.make}</Label>
                  <Input id="w-make" list="makes" value={form.make} onChange={(e) => set('make', e.target.value)} />
                  <datalist id="makes">
                    {VEHICLE_MAKES.map((m) => (
                      <option key={m} value={m} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <Label htmlFor="w-model">Model</Label>
                  <Input id="w-model" value={form.model} onChange={(e) => set('model', e.target.value)} placeholder="e.g. Corolla, Hilux, Boxer 150" />
                </div>
                <div>
                  <Label htmlFor="w-year">{t.listingDetail.year}</Label>
                  <Input id="w-year" inputMode="numeric" value={form.year} onChange={(e) => set('year', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="w-km" optional={t.common.optional}>
                    {t.listingDetail.mileage} (km)
                  </Label>
                  <Input id="w-km" inputMode="numeric" value={form.mileageKm} onChange={(e) => set('mileageKm', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="w-trans">{t.listingDetail.transmission}</Label>
                  <Select id="w-trans" value={form.transmission} onChange={(e) => set('transmission', e.target.value as TransmissionType)} options={TRANSMISSIONS.map((x) => ({ value: x, label: t.transmission[x] }))} />
                </div>
                <div>
                  <Label htmlFor="w-fuel">{t.listingDetail.fuel}</Label>
                  <Select id="w-fuel" value={form.fuelType} onChange={(e) => set('fuelType', e.target.value as FuelType)} options={FUEL_TYPES.map((x) => ({ value: x, label: t.fuel[x] }))} />
                </div>
                <div>
                  <Label htmlFor="w-cond">{t.listingDetail.condition}</Label>
                  <Select id="w-cond" value={form.condition} onChange={(e) => set('condition', e.target.value as VehicleCondition)} options={CONDITIONS.map((x) => ({ value: x, label: t.condition[x] }))} />
                </div>
                <div>
                  <Label htmlFor="w-plate" optional={t.common.optional}>
                    {t.listingDetail.plate}
                  </Label>
                  <Input id="w-plate" value={form.plateCode} onChange={(e) => set('plateCode', e.target.value)} placeholder="Code 2, Code 3…" />
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <Label htmlFor="w-price">{isRent ? t.wizard.priceRentHint : t.wizard.price}</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-ink-400">ETB</span>
                <Input
                  id="w-price"
                  inputMode="numeric"
                  value={form.price ? formatNumber(Number(form.price.replace(/\D/g, '')) || 0) : ''}
                  onChange={(e) => set('price', e.target.value.replace(/\D/g, ''))}
                  placeholder={t.wizard.pricePlaceholder}
                  className="h-14 pl-14 text-lg font-bold"
                />
              </div>
            </div>
            <Checkbox label={t.wizard.negotiable} checked={form.isNegotiable} onChange={(e) => set('isNegotiable', e.target.checked)} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="w-zone">{t.wizard.zone}</Label>
                <Select id="w-zone" value={form.zone} onChange={(e) => set('zone', e.target.value)} placeholder="—" options={ZONE_NAMES.map((z) => ({ value: z, label: z }))} />
              </div>
              <div>
                <Label htmlFor="w-kebele" optional={t.common.optional}>
                  {t.wizard.kebele}
                </Label>
                <Input id="w-kebele" value={form.kebele} onChange={(e) => set('kebele', e.target.value)} maxLength={20} />
              </div>
            </div>
            <div>
              <Label htmlFor="w-landmark" optional={t.common.optional}>
                {t.wizard.landmark}
              </Label>
              <Input id="w-landmark" value={form.landmark} onChange={(e) => set('landmark', e.target.value)} placeholder={t.wizard.landmarkPlaceholder} maxLength={160} />
            </div>
          </div>
        )}

        {step === 3 && <PhotoUploader photos={form.photos} onChange={(photos) => set('photos', photos)} />}

        {step === 4 && (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 overflow-hidden rounded-2xl bg-ink-50 p-4 sm:flex-row">
              {cover && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cover} alt="" className="aspect-[4/3] w-full rounded-xl object-cover sm:w-48" />
              )}
              <div className="min-w-0">
                <p className="text-xl font-extrabold text-ink-900">
                  {formatPrice(num(form.price) ?? 0)}
                  {isRent && <span className="text-sm font-medium text-ink-500"> {t.common.perMonth}</span>}
                </p>
                <p className="mt-1 font-semibold text-ink-800">{form.title}</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-500">
                  <MapPin className="h-4 w-4 text-brand-600" /> {form.zone}, Wolaita Sodo
                </p>
                <p className="mt-2 text-sm text-ink-500">
                  {isProperty ? `${t.propertyType[form.propertyType]} · ${isRent ? t.filters.forRent : t.filters.forSale}` : `${form.make} ${form.model} · ${form.year}`}
                  {' · '}
                  {form.photos.length} 📷
                </p>
              </div>
            </div>
            <div>
              <Label htmlFor="w-decl">{t.wizard.declaration}</Label>
              <Textarea id="w-decl" value={form.ownerDeclaration} onChange={(e) => set('ownerDeclaration', e.target.value)} placeholder={t.wizard.declarationPlaceholder} rows={3} maxLength={500} />
            </div>
            <Checkbox label={t.wizard.declarationLabel} checked={form.declarationAccepted} onChange={(e) => set('declarationAccepted', e.target.checked)} />
            <p className="flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-800">
              <ShieldCheck className="h-4 w-4 shrink-0" /> {t.wizard.reviewNote}
            </p>
          </div>
        )}

        {error && (
          <div className="mt-6">
            <FormAlert>{error}</FormAlert>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-ink-100 pt-6">
          {step > 0 ? (
            <Button variant="ghost" onClick={back}>
              <ArrowLeft className="h-4 w-4" /> {t.wizard.back}
            </Button>
          ) : (
            <Link href={editing ? '/dashboard?tab=listings' : '/'} className="text-sm font-semibold text-ink-500 hover:text-ink-900">
              {t.common.cancel}
            </Link>
          )}
          {step < steps.length - 1 ? (
            <Button onClick={next} size="lg">
              {t.wizard.next} <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={submit} size="lg" isLoading={busy}>
              {busy ? t.wizard.submitting : editing ? t.wizard.saveChanges : t.wizard.submit}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
