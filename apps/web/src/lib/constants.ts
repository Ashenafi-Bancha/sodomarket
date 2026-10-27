import type {
  FuelType,
  PropertyType,
  TransmissionType,
  VehicleCondition,
  VehicleType,
  FurnishingStatus,
  LeadStage,
  ListingStatus,
} from './types';

/** Neighbourhoods of Wolaita Sodo used for search and listing locations. */
export const ZONES: { name: string; description: string }[] = [
  { name: 'Mehal Ketema', description: 'Town centre, banks & civic offices' },
  { name: 'Merkato', description: 'Main market & commercial hub' },
  { name: 'Arada', description: 'Heritage quarter, shops & cafés' },
  { name: 'Boditi Road', description: 'Growing asphalt corridor' },
  { name: 'Ligaba', description: 'Administration & hospital area' },
  { name: 'Otona', description: 'University & teaching hospital' },
  { name: 'Wadu', description: 'Quiet residential neighbourhood' },
  { name: 'Humbo Gate', description: 'Southern terminal & logistics' },
];

export const ZONE_NAMES = ZONES.map((z) => z.name);

export const PROPERTY_TYPES: PropertyType[] = [
  'HOUSE',
  'APARTMENT',
  'RESIDENTIAL_LAND',
  'COMMERCIAL_LAND',
  'SHOP',
  'OFFICE',
  'WAREHOUSE',
  'OTHER',
];

export const VEHICLE_TYPES: VehicleType[] = ['CAR', 'MOTORCYCLE', 'TRUCK', 'COMMERCIAL'];
export const TRANSMISSIONS: TransmissionType[] = ['AUTOMATIC', 'MANUAL'];
export const FUEL_TYPES: FuelType[] = ['BENZINE', 'DIESEL', 'HYBRID', 'ELECTRIC'];
export const CONDITIONS: VehicleCondition[] = ['BRAND_NEW', 'EXCELLENT', 'GOOD', 'FAIR'];
export const FURNISHING: FurnishingStatus[] = ['UNFURNISHED', 'SEMI_FURNISHED', 'FULLY_FURNISHED'];

export const LEAD_STAGES: LeadStage[] = [
  'NEW_INQUIRY',
  'CONTACT_ATTEMPTED',
  'CONTACTED',
  'VIEWING_SCHEDULED',
  'NEGOTIATION',
  'FOLLOW_UP_REQUIRED',
  'WON',
  'LOST',
];

/** Statuses an owner can move their own published listing between. */
export const OWNER_STATUSES: ListingStatus[] = ['PUBLISHED', 'SOLD', 'RENTED', 'UNAVAILABLE'];

export const VEHICLE_MAKES = [
  'Toyota',
  'Hyundai',
  'Suzuki',
  'Nissan',
  'Honda',
  'Mitsubishi',
  'Isuzu',
  'Volkswagen',
  'Mercedes-Benz',
  'Ford',
  'Lifan',
  'BYD',
  'Bajaj',
  'TVS',
  'Scania',
  'Sinotruk',
  'Other',
];

export const MAX_UPLOAD_BYTES = 6 * 1024 * 1024;
export const MAX_PHOTOS = 12;
