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

/** Property groups, like Jiji's "Houses & Apartments / Land & Plots / Commercial Property". */
export type PropertyGroup = 'RESIDENTIAL' | 'LAND' | 'COMMERCIAL';

export const PROPERTY_GROUPS: { key: PropertyGroup; types: PropertyType[] }[] = [
  { key: 'RESIDENTIAL', types: ['HOUSE', 'APARTMENT', 'CONDOMINIUM', 'ROOM', 'STUDENT_HOSTEL'] },
  { key: 'LAND', types: ['RESIDENTIAL_LAND', 'COMMERCIAL_LAND', 'FARM_LAND'] },
  {
    key: 'COMMERCIAL',
    types: ['SHOP', 'OFFICE', 'BUILDING', 'WAREHOUSE', 'HOTEL', 'RESTAURANT', 'EVENT_HALL', 'OTHER'],
  },
];

export const PROPERTY_GROUP_KEYS = PROPERTY_GROUPS.map((g) => g.key);

export const PROPERTY_TYPES: PropertyType[] = PROPERTY_GROUPS.flatMap((g) => g.types);

/** Plots with no building: no rooms, furnishing or parking. */
export const LAND_TYPES: PropertyType[] = ['RESIDENTIAL_LAND', 'COMMERCIAL_LAND', 'FARM_LAND'];

/** Types where bedrooms/bathrooms don't apply. */
export const NO_ROOM_TYPES: PropertyType[] = [...LAND_TYPES, 'WAREHOUSE', 'EVENT_HALL'];

export function propertyGroupOf(type: PropertyType): PropertyGroup {
  return PROPERTY_GROUPS.find((g) => g.types.includes(type))?.key ?? 'COMMERCIAL';
}

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
