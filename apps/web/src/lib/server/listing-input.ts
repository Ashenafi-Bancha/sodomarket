import 'server-only';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import {
  CONDITIONS,
  FUEL_TYPES,
  FURNISHING,
  MAX_PHOTOS,
  PROPERTY_TYPES,
  TRANSMISSIONS,
  VEHICLE_TYPES,
  ZONE_NAMES,
} from '@/lib/constants';

const optionalNumber = (max: number) => z.coerce.number().min(0).max(max).optional();
const optionalInt = (max: number) => z.coerce.number().int().min(0).max(max).optional();

const mediaUrl = z
  .string()
  .trim()
  .refine((u) => u.startsWith('/api/v1/uploads/') || /^https:\/\/[^\s]+$/.test(u), 'Photo link is not valid');

export const listingInputSchema = z
  .object({
    assetType: z.enum(['REAL_ESTATE', 'VEHICLE']),
    title: z.string().trim().min(8, 'Title must be at least 8 characters').max(120),
    description: z.string().trim().min(30, 'Description must be at least 30 characters').max(5000),
    price: z.coerce.number().positive('Price must be greater than zero').max(100_000_000_000),
    isNegotiable: z.boolean().default(true),
    location: z.object({
      zone: z.string().refine((z) => ZONE_NAMES.includes(z), 'Choose a zone in Wolaita Sodo'),
      kebele: z.string().trim().max(20).optional(),
      landmark: z.string().trim().max(160).optional(),
    }),
    propertyDetails: z
      .object({
        propertyType: z.enum(PROPERTY_TYPES as [string, ...string[]]),
        transactionType: z.enum(['FOR_SALE', 'FOR_RENT']),
        bedrooms: optionalInt(100),
        bathrooms: optionalInt(100),
        areaSqM: optionalNumber(10_000_000),
        compoundSizeSqM: optionalNumber(10_000_000),
        furnishing: z.enum(FURNISHING as [string, ...string[]]).optional(),
        waterConnected: z.boolean().optional(),
        electricityConnected: z.boolean().optional(),
        parkingSpaces: optionalInt(500),
      })
      .optional(),
    vehicleDetails: z
      .object({
        vehicleType: z.enum(VEHICLE_TYPES as [string, ...string[]]),
        make: z.string().trim().min(2).max(40),
        model: z.string().trim().min(1).max(60),
        year: z.coerce.number().int().min(1960).max(new Date().getFullYear() + 1),
        mileageKm: optionalInt(5_000_000),
        transmission: z.enum(TRANSMISSIONS as [string, ...string[]]),
        fuelType: z.enum(FUEL_TYPES as [string, ...string[]]),
        condition: z.enum(CONDITIONS as [string, ...string[]]),
        plateCode: z.string().trim().max(20).optional(),
      })
      .optional(),
    media: z
      .array(z.object({ url: mediaUrl, caption: z.string().trim().max(120).optional() }))
      .min(1, 'Add at least one photo')
      .max(MAX_PHOTOS, `You can add up to ${MAX_PHOTOS} photos`),
    ownerDeclaration: z.string().trim().min(5, 'Please describe your right to sell or rent this asset').max(500),
    declarationAccepted: z.literal(true, { error: 'You must confirm the ownership declaration' }),
  })
  .refine((v) => (v.assetType === 'REAL_ESTATE' ? !!v.propertyDetails : !!v.vehicleDetails), {
    message: 'Please fill in the property or vehicle details',
    path: ['details'],
  });

export type ListingInput = z.infer<typeof listingInputSchema>;

export function assetDetailsData(input: ListingInput) {
  const property = input.assetType === 'REAL_ESTATE' ? input.propertyDetails : undefined;
  const vehicle = input.assetType === 'VEHICLE' ? input.vehicleDetails : undefined;
  return {
    property: property as Prisma.PropertyDetailsCreateWithoutAssetInput | undefined,
    vehicle: vehicle as Prisma.VehicleDetailsCreateWithoutAssetInput | undefined,
  };
}

export function mediaData(input: ListingInput) {
  return input.media.map((m, i) => ({ url: m.url, caption: m.caption || undefined, isPrimary: i === 0, order: i }));
}
