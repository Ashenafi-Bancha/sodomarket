'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Car,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileCheck2,
  Home,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n-context';
import { useAuth, DEMO_USERS } from '@/lib/auth-context';
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
import { PhotoUploader, type Photo } from '@/components/sell/PhotoUploader';
import { Button } from '@/components/ui/Button';
import { Checkbox, FieldError, FormAlert, Input, Label, Select, Textarea } from '@/components/ui/Input';
import { formatPrice } from '@/lib/formatters';

type AssetType = 'REAL_ESTATE' | 'VEHICLE';

interface WizardState {
  assetType: AssetType;
  // Step 2 Real Estate
  propertyType: string;
  transactionType: 'FOR_SALE' | 'FOR_RENT';
  bedrooms?: number;
  bathrooms?: number;
  areaSqM?: number;
  compoundSizeSqM?: number;
  furnishing?: string;
  waterConnected?: boolean;
  electricityConnected?: boolean;
  parkingSpaces?: number;
  // Step 2 Vehicle
  vehicleType: string;
  make: string;
  model: string;
  year: number;
  mileageKm?: number;
  transmission: string;
  fuelType: string;
  condition: string;
  plateCode?: string;
  // Step 3
  title: string;
  description: string;
  price: number | '';
  isNegotiable: boolean;
  zone: string;
  kebele: string;
  landmark: string;
  // Step 4
  photos: Photo[];
  // Step 5
  ownerDeclaration: string;
  declarationAccepted: boolean;
}

const INITIAL_STATE: WizardState = {
  assetType: 'REAL_ESTATE',
  propertyType: 'HOUSE',
  transactionType: 'FOR_SALE',
  bedrooms: 3,
  bathrooms: 2,
  areaSqM: 150,
  compoundSizeSqM: 250,
  furnishing: 'UNFURNISHED',
  waterConnected: true,
  electricityConnected: true,
  parkingSpaces: 1,

  vehicleType: 'CAR',
  make: 'Toyota',
  model: 'Vitz',
  year: 2015,
  mileageKm: 85000,
  transmission: 'AUTOMATIC',
  fuelType: 'BENZINE',
  condition: 'GOOD',
  plateCode: 'Code 2',

  title: '',
  description: '',
  price: '',
  isNegotiable: true,
  zone: ZONE_NAMES[0] || 'Mehal Ketema',
  kebele: '',
  landmark: '',

  photos: [],
  ownerDeclaration: 'I am the legal owner and have legal authority to sell/rent this asset.',
  declarationAccepted: true,
};

export function ListingWizard() {
  const { t } = useTranslation();
  const { user, setUser } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<number>(1);
  const [data, setData] = useState<WizardState>(INITIAL_STATE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [submittedListing, setSubmittedListing] = useState<{ slug: string; title: string } | null>(null);

  const steps = [
    { num: 1, title: t.wizard.stepType },
    { num: 2, title: t.wizard.stepDetails },
    { num: 3, title: t.wizard.stepPriceLocation },
    { num: 4, title: t.wizard.stepPhotos },
    { num: 5, title: t.wizard.stepReview },
  ];

  const update = (fields: Partial<WizardState>) => {
    setData((prev) => ({ ...prev, ...fields }));
    setErrors({});
    setApiError('');
  };

  const validateStep = (s: number): boolean => {
    const errs: Record<string, string> = {};

    if (s === 2) {
      if (data.assetType === 'REAL_ESTATE') {
        if (!data.propertyType) errs.propertyType = 'Please select a property type.';
      } else {
        if (!data.make) errs.make = 'Make is required.';
        if (!data.model) errs.model = 'Model is required.';
        if (!data.year || data.year < 1960 || data.year > new Date().getFullYear() + 1) {
          errs.year = 'Enter a valid year.';
        }
      }
    }

    if (s === 3) {
      if (!data.title.trim() || data.title.trim().length < 8) {
        errs.title = 'Title must be at least 8 characters long.';
      }
      if (!data.description.trim() || data.description.trim().length < 30) {
        errs.description = 'Description must be at least 30 characters long.';
      }
      if (!data.price || Number(data.price) <= 0) {
        errs.price = 'Please enter a valid price in ETB.';
      }
      if (!data.zone) {
        errs.zone = 'Please select a zone in Wolaita Sodo.';
      }
    }

    if (s === 4) {
      if (data.photos.length === 0) {
        errs.photos = 'Please upload or paste at least one photo.';
      }
    }

    if (s === 5) {
      if (!data.ownerDeclaration.trim() || data.ownerDeclaration.trim().length < 5) {
        errs.ownerDeclaration = 'Please write a brief declaration of your right to sell or rent this asset.';
      }
      if (!data.declarationAccepted) {
        errs.declarationAccepted = 'You must confirm the ownership declaration.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((cur) => Math.min(5, cur + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setStep((cur) => Math.max(1, cur - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return;

    if (!user) {
      // Auto-sign in as seller demo user for smooth testing
      setUser(DEMO_USERS.SELLER);
    }

    setSubmitting(true);
    setApiError('');

    try {
      const payload: Record<string, unknown> = {
        assetType: data.assetType,
        title: data.title.trim(),
        description: data.description.trim(),
        price: Number(data.price),
        isNegotiable: data.isNegotiable,
        location: {
          zone: data.zone,
          kebele: data.kebele.trim() || undefined,
          landmark: data.landmark.trim() || undefined,
        },
        media: data.photos.map((p) => ({
          url: p.url,
          caption: p.caption,
        })),
        ownerDeclaration: data.ownerDeclaration.trim(),
        declarationAccepted: true,
      };

      if (data.assetType === 'REAL_ESTATE') {
        payload.propertyDetails = {
          propertyType: data.propertyType,
          transactionType: data.transactionType,
          bedrooms: data.bedrooms ? Number(data.bedrooms) : undefined,
          bathrooms: data.bathrooms ? Number(data.bathrooms) : undefined,
          areaSqM: data.areaSqM ? Number(data.areaSqM) : undefined,
          compoundSizeSqM: data.compoundSizeSqM ? Number(data.compoundSizeSqM) : undefined,
          furnishing: data.furnishing || undefined,
          waterConnected: data.waterConnected,
          electricityConnected: data.electricityConnected,
          parkingSpaces: data.parkingSpaces ? Number(data.parkingSpaces) : undefined,
        };
      } else {
        payload.vehicleDetails = {
          vehicleType: data.vehicleType,
          make: data.make.trim(),
          model: data.model.trim(),
          year: Number(data.year),
          mileageKm: data.mileageKm ? Number(data.mileageKm) : undefined,
          transmission: data.transmission,
          fuelType: data.fuelType,
          condition: data.condition,
          plateCode: data.plateCode?.trim() || undefined,
        };
      }

      const res = await api.post<{ slug: string; title: string }>('/listings', payload);
      setSubmittedListing(res);
    } catch (err) {
      setApiError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedListing) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-ink-900 tracking-tight">
            {t.wizard.submitSuccessTitle}
          </h1>
          <p className="text-sm text-ink-600 max-w-md mx-auto leading-relaxed">
            {t.wizard.submitSuccessDesc}
          </p>
        </div>

        <div className="p-4 bg-brand-50/60 rounded-2xl border border-brand-100 max-w-md mx-auto text-left space-y-1 text-sm text-ink-800">
          <p className="font-bold text-brand-900">{submittedListing.title}</p>
          <p className="text-xs text-ink-500">Status: Pending Verification by Local Team</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link href="/dashboard">
            <Button variant="primary" size="md">
              {t.wizard.goToWorkspace}
            </Button>
          </Link>
          <Button
            variant="outline"
            size="md"
            onClick={() => {
              setSubmittedListing(null);
              setData(INITIAL_STATE);
              setStep(1);
            }}
          >
            {t.wizard.listAnother}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="space-y-2 text-center sm:text-left">
        <span className="text-xs font-bold text-brand-700 uppercase tracking-wider">
          Wolaita Marketplace
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-ink-900 tracking-tight">
          {t.wizard.newTitle}
        </h1>
        <p className="text-sm text-ink-500 max-w-xl">
          {t.wizard.newSubtitle}
        </p>
      </div>

      {/* Stepper Bar */}
      <div className="bg-white rounded-2xl border border-ink-100 p-4 sm:p-5 shadow-xs">
        <div className="grid grid-cols-5 gap-2 text-center">
          {steps.map((st) => (
            <button
              key={st.num}
              type="button"
              onClick={() => {
                if (st.num < step) setStep(st.num);
              }}
              className="flex flex-col items-center gap-1.5 focus:outline-none"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  st.num === step
                    ? 'bg-brand-700 text-white ring-4 ring-brand-100 shadow-xs'
                    : st.num < step
                    ? 'bg-emerald-600 text-white'
                    : 'bg-ink-100 text-ink-400'
                }`}
              >
                {st.num < step ? '✓' : st.num}
              </div>
              <span
                className={`hidden sm:block text-xs font-semibold truncate max-w-[100px] ${
                  st.num === step ? 'text-brand-800' : 'text-ink-400'
                }`}
              >
                {st.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {apiError && <FormAlert tone="error">{apiError}</FormAlert>}

      {/* Step Contents */}
      <div className="bg-white rounded-3xl border border-ink-100/90 p-6 sm:p-10 shadow-xs space-y-8">
        {/* Step 1: Type Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-ink-900">{t.wizard.stepType}</h2>
              <p className="text-xs text-ink-500">Choose whether you are advertising real estate or a vehicle in Wolaita.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => update({ assetType: 'REAL_ESTATE' })}
                className={`p-6 rounded-2xl border-2 text-left transition-all flex flex-col justify-between space-y-4 ${
                  data.assetType === 'REAL_ESTATE'
                    ? 'border-brand-600 bg-brand-50/50 shadow-sm'
                    : 'border-ink-100 hover:border-ink-200 bg-white'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center">
                  <Home className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-ink-900">{t.wizard.property}</h3>
                  <p className="text-xs text-ink-500 mt-1">{t.wizard.propertyDesc}</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => update({ assetType: 'VEHICLE' })}
                className={`p-6 rounded-2xl border-2 text-left transition-all flex flex-col justify-between space-y-4 ${
                  data.assetType === 'VEHICLE'
                    ? 'border-brand-600 bg-brand-50/50 shadow-sm'
                    : 'border-ink-100 hover:border-ink-200 bg-white'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-gold-100 text-gold-700 flex items-center justify-center">
                  <Car className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-ink-900">{t.wizard.vehicle}</h3>
                  <p className="text-xs text-ink-500 mt-1">{t.wizard.vehicleDesc}</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Asset Details */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-ink-900">{t.wizard.stepDetails}</h2>
              <p className="text-xs text-ink-500">Provide accurate specifications to attract genuine local buyers.</p>
            </div>

            {data.assetType === 'REAL_ESTATE' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>{t.wizard.category}</Label>
                  <Select
                    value={data.propertyType}
                    onChange={(e) => update({ propertyType: e.target.value })}
                    options={PROPERTY_TYPES.map((pt) => ({
                      value: pt,
                      label: t.propertyType?.[pt] || pt,
                    }))}
                  />
                  <FieldError>{errors.propertyType}</FieldError>
                </div>

                <div>
                  <Label>{t.wizard.offer}</Label>
                  <Select
                    value={data.transactionType}
                    onChange={(e) => update({ transactionType: e.target.value as 'FOR_SALE' | 'FOR_RENT' })}
                    options={[
                      { value: 'FOR_SALE', label: t.filters.forSale },
                      { value: 'FOR_RENT', label: t.filters.forRent },
                    ]}
                  />
                </div>

                <div>
                  <Label optional="m²">Area / Floor Size</Label>
                  <Input
                    type="number"
                    min="0"
                    value={data.areaSqM ?? ''}
                    onChange={(e) => update({ areaSqM: Number(e.target.value) || undefined })}
                    placeholder="e.g. 180"
                  />
                </div>

                <div>
                  <Label optional="m²">Compound / Plot Size</Label>
                  <Input
                    type="number"
                    min="0"
                    value={data.compoundSizeSqM ?? ''}
                    onChange={(e) => update({ compoundSizeSqM: Number(e.target.value) || undefined })}
                    placeholder="e.g. 350"
                  />
                </div>

                <div>
                  <Label optional="Rooms">Bedrooms</Label>
                  <Input
                    type="number"
                    min="0"
                    value={data.bedrooms ?? ''}
                    onChange={(e) => update({ bedrooms: Number(e.target.value) || undefined })}
                  />
                </div>

                <div>
                  <Label optional="Rooms">Bathrooms</Label>
                  <Input
                    type="number"
                    min="0"
                    value={data.bathrooms ?? ''}
                    onChange={(e) => update({ bathrooms: Number(e.target.value) || undefined })}
                  />
                </div>

                <div>
                  <Label>Furnishing</Label>
                  <Select
                    value={data.furnishing}
                    onChange={(e) => update({ furnishing: e.target.value })}
                    options={FURNISHING.map((f) => ({ value: f, label: t.furnishing?.[f] || f.replace('_', ' ') }))}
                  />
                </div>

                <div>
                  <Label>Parking Spaces</Label>
                  <Input
                    type="number"
                    min="0"
                    value={data.parkingSpaces ?? ''}
                    onChange={(e) => update({ parkingSpaces: Number(e.target.value) || undefined })}
                  />
                </div>

                <div className="sm:col-span-2 flex flex-wrap gap-6 pt-2">
                  <Checkbox
                    label="Water Connected"
                    checked={data.waterConnected}
                    onChange={(e) => update({ waterConnected: e.target.checked })}
                  />
                  <Checkbox
                    label="Electricity Connected"
                    checked={data.electricityConnected}
                    onChange={(e) => update({ electricityConnected: e.target.checked })}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Vehicle Type</Label>
                  <Select
                    value={data.vehicleType}
                    onChange={(e) => update({ vehicleType: e.target.value })}
                    options={VEHICLE_TYPES.map((vt) => ({
                      value: vt,
                      label: t.vehicleType?.[vt] || vt,
                    }))}
                  />
                </div>

                <div>
                  <Label>Make / Brand</Label>
                  <Select
                    value={data.make}
                    onChange={(e) => update({ make: e.target.value })}
                    options={VEHICLE_MAKES.map((m) => ({ value: m, label: m }))}
                  />
                  <FieldError>{errors.make}</FieldError>
                </div>

                <div>
                  <Label>Model</Label>
                  <Input
                    value={data.model}
                    onChange={(e) => update({ model: e.target.value })}
                    placeholder="e.g. Corolla, RAV4, Hilux"
                  />
                  <FieldError>{errors.model}</FieldError>
                </div>

                <div>
                  <Label>Year of Manufacture</Label>
                  <Input
                    type="number"
                    value={data.year}
                    onChange={(e) => update({ year: Number(e.target.value) })}
                  />
                  <FieldError>{errors.year}</FieldError>
                </div>

                <div>
                  <Label optional="km">Mileage</Label>
                  <Input
                    type="number"
                    value={data.mileageKm ?? ''}
                    onChange={(e) => update({ mileageKm: Number(e.target.value) || undefined })}
                    placeholder="e.g. 75000"
                  />
                </div>

                <div>
                  <Label>Transmission</Label>
                  <Select
                    value={data.transmission}
                    onChange={(e) => update({ transmission: e.target.value })}
                    options={TRANSMISSIONS.map((tr) => ({
                      value: tr,
                      label: t.transmission?.[tr] || tr,
                    }))}
                  />
                </div>

                <div>
                  <Label>Fuel Type</Label>
                  <Select
                    value={data.fuelType}
                    onChange={(e) => update({ fuelType: e.target.value })}
                    options={FUEL_TYPES.map((ft) => ({
                      value: ft,
                      label: t.fuel?.[ft] || ft,
                    }))}
                  />
                </div>

                <div>
                  <Label>Condition</Label>
                  <Select
                    value={data.condition}
                    onChange={(e) => update({ condition: e.target.value })}
                    options={CONDITIONS.map((c) => ({
                      value: c,
                      label: t.condition?.[c] || c,
                    }))}
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label optional="e.g. Code 2, Code 3">Plate Code</Label>
                  <Input
                    value={data.plateCode ?? ''}
                    onChange={(e) => update({ plateCode: e.target.value })}
                    placeholder="e.g. Code 2 (Oromia/AA/South)"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Title, Price, Description, Location */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-ink-900">{t.wizard.stepPriceLocation}</h2>
              <p className="text-xs text-ink-500">Set an attractive title, your asking price, and the location in Wolaita Sodo.</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>{t.wizard.title}</Label>
                <Input
                  value={data.title}
                  onChange={(e) => update({ title: e.target.value })}
                  placeholder={t.wizard.titlePlaceholder}
                />
                <FieldError>{errors.title}</FieldError>
              </div>

              <div>
                <Label>{t.wizard.description}</Label>
                <Textarea
                  value={data.description}
                  onChange={(e) => update({ description: e.target.value })}
                  placeholder={t.wizard.descriptionPlaceholder}
                  rows={4}
                />
                <FieldError>{errors.description}</FieldError>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>{t.wizard.price}</Label>
                  <Input
                    type="number"
                    min="1"
                    value={data.price}
                    onChange={(e) => update({ price: e.target.value ? Number(e.target.value) : '' })}
                    placeholder={t.wizard.pricePlaceholder}
                  />
                  <FieldError>{errors.price}</FieldError>
                </div>

                <div className="flex items-center pt-6">
                  <Checkbox
                    label={t.wizard.negotiable}
                    checked={data.isNegotiable}
                    onChange={(e) => update({ isNegotiable: e.target.checked })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <Label>{t.wizard.zone}</Label>
                  <Select
                    value={data.zone}
                    onChange={(e) => update({ zone: e.target.value })}
                    options={ZONE_NAMES.map((z) => ({ value: z, label: z }))}
                  />
                  <FieldError>{errors.zone}</FieldError>
                </div>

                <div>
                  <Label optional="Optional">{t.wizard.kebele}</Label>
                  <Input
                    value={data.kebele}
                    onChange={(e) => update({ kebele: e.target.value })}
                    placeholder="e.g. 01, 04"
                  />
                </div>

                <div>
                  <Label optional="Optional">{t.wizard.landmark}</Label>
                  <Input
                    value={data.landmark}
                    onChange={(e) => update({ landmark: e.target.value })}
                    placeholder={t.wizard.landmarkPlaceholder}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Photos */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-ink-900">{t.wizard.stepPhotos}</h2>
              <p className="text-xs text-ink-500">{t.wizard.imageUploadHint}</p>
            </div>

            <PhotoUploader photos={data.photos} onChange={(photos) => update({ photos })} />
            <FieldError>{errors.photos}</FieldError>
          </div>
        )}

        {/* Step 5: Review & Submit */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-ink-900">{t.wizard.stepReview}</h2>
              <p className="text-xs text-ink-500">{t.wizard.reviewNote}</p>
            </div>

            {/* Summary Card */}
            <div className="p-5 rounded-2xl bg-ink-50/70 border border-ink-100 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold text-brand-700 uppercase tracking-wider">
                    {data.assetType === 'REAL_ESTATE' ? 'Property' : 'Vehicle'} • {data.zone}
                  </span>
                  <h3 className="font-bold text-base text-ink-900 mt-0.5">{data.title || 'Untitled Listing'}</h3>
                </div>
                <div className="text-right">
                  <span className="block font-black text-lg text-brand-800">
                    {data.price ? formatPrice(Number(data.price)) : 'ETB 0'}
                  </span>
                  <span className="text-[11px] text-ink-400">
                    {data.isNegotiable ? 'Negotiable' : 'Fixed Price'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-ink-600 line-clamp-3 leading-relaxed">
                {data.description}
              </p>

              <div className="flex items-center gap-2 text-xs text-ink-500 border-t border-ink-200/60 pt-3">
                <MapPin className="w-3.5 h-3.5 text-brand-600" />
                <span>Wolaita Sodo, {data.zone} {data.kebele ? `(Kebele ${data.kebele})` : ''}</span>
                <span className="ml-auto font-medium text-ink-700">{data.photos.length} photo(s) attached</span>
              </div>
            </div>

            {/* Declaration & Consent */}
            <div className="space-y-4 pt-2">
              <div>
                <Label>{t.wizard.declaration}</Label>
                <Textarea
                  value={data.ownerDeclaration}
                  onChange={(e) => update({ ownerDeclaration: e.target.value })}
                  placeholder={t.wizard.declarationPlaceholder}
                  rows={2}
                />
                <FieldError>{errors.ownerDeclaration}</FieldError>
              </div>

              <div>
                <Checkbox
                  label={t.wizard.declarationLabel}
                  checked={data.declarationAccepted}
                  onChange={(e) => update({ declarationAccepted: e.target.checked })}
                />
                <FieldError>{errors.declarationAccepted}</FieldError>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between border-t border-ink-100 pt-6">
          {step > 1 ? (
            <Button variant="outline" size="md" onClick={prevStep}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              {t.wizard.back}
            </Button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <Button variant="primary" size="md" onClick={nextStep}>
              <span>{t.wizard.next}</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              variant="accent"
              size="md"
              onClick={handleSubmit}
              isLoading={submitting}
              className="font-bold shadow-md"
            >
              <span>{submitting ? t.wizard.submitting : t.wizard.submit}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
