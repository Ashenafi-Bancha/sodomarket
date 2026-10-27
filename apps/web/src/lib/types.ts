export type Role = 'BUYER' | 'SELLER' | 'BROKER' | 'AGENCY_ADMIN' | 'ADMIN';

export type AssetType = 'REAL_ESTATE' | 'VEHICLE';

export type PropertyType =
  | 'HOUSE'
  | 'APARTMENT'
  | 'RESIDENTIAL_LAND'
  | 'COMMERCIAL_LAND'
  | 'SHOP'
  | 'OFFICE'
  | 'WAREHOUSE'
  | 'OTHER';

export type TransactionType = 'FOR_SALE' | 'FOR_RENT';

export type FurnishingStatus = 'UNFURNISHED' | 'SEMI_FURNISHED' | 'FULLY_FURNISHED';

export type VehicleType = 'CAR' | 'MOTORCYCLE' | 'TRUCK' | 'COMMERCIAL';

export type TransmissionType = 'MANUAL' | 'AUTOMATIC';

export type FuelType = 'BENZINE' | 'DIESEL' | 'HYBRID' | 'ELECTRIC';

export type VehicleCondition = 'BRAND_NEW' | 'EXCELLENT' | 'GOOD' | 'FAIR';

export type ListingStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'REJECTED'
  | 'SOLD'
  | 'RENTED'
  | 'UNAVAILABLE'
  | 'EXPIRED';

export type LeadStage =
  | 'NEW_INQUIRY'
  | 'CONTACT_ATTEMPTED'
  | 'CONTACTED'
  | 'VIEWING_SCHEDULED'
  | 'NEGOTIATION'
  | 'WON'
  | 'LOST'
  | 'FOLLOW_UP_REQUIRED';

export type AppointmentStatus = 'REQUESTED' | 'CONFIRMED' | 'RESCHEDULED' | 'COMPLETED' | 'CANCELLED';

export type DealStatus = 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  phone: string;
  role: Role;
  fullName: string;
  businessName?: string;
  bio?: string;
  licenseNumber?: string;
  idVerified: boolean;
  avatarUrl?: string;
  preferredLocale?: string;
  isActive?: boolean;
  createdAt?: string;
  listingCount?: number;
}

export interface LocationItem {
  id: string;
  city: string;
  zone: string; // e.g. Merkato, Arada, Mehal Ketema, Boditi Road, Ligaba
  kebele?: string;
  landmark?: string;
}

export interface PropertyDetails {
  propertyType: PropertyType;
  transactionType: TransactionType;
  bedrooms?: number;
  bathrooms?: number;
  areaSqM?: number;
  compoundSizeSqM?: number;
  furnishing?: FurnishingStatus;
  waterConnected?: boolean;
  electricityConnected?: boolean;
  parkingSpaces?: number;
}

export interface VehicleDetails {
  vehicleType: VehicleType;
  make: string;
  model: string;
  year: number;
  mileageKm?: number;
  transmission: TransmissionType;
  fuelType: FuelType;
  condition: VehicleCondition;
  plateCode?: string;
}

export interface ListingMedia {
  id: string;
  url: string;
  caption?: string;
  isPrimary: boolean;
  order: number;
}

export interface ListingItem {
  id: string;
  assetType: AssetType;
  title: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  isNegotiable: boolean;
  status: ListingStatus;
  location: LocationItem;
  propertyDetails?: PropertyDetails;
  vehicleDetails?: VehicleDetails;
  media: ListingMedia[];
  author: User;
  agency?: {
    id: string;
    name: string;
    isVerified: boolean;
  };
  ownerDeclaration?: string;
  rejectionReason?: string;
  moderationNotes?: string;
  isFeatured?: boolean;
  viewCount?: number;
  favoriteCount?: number;
  leadCount?: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadItem {
  id: string;
  listingId?: string;
  listingTitle?: string;
  listingSlug?: string;
  listingAssetType?: AssetType;
  listingImage?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  budgetMin?: number;
  budgetMax?: number;
  message: string;
  source: string;
  stage: LeadStage;
  notes?: string;
  nextFollowUpAt?: string;
  assignedBrokerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentItem {
  id: string;
  leadId?: string;
  listingId?: string;
  listingTitle?: string;
  listingSlug?: string;
  listingAssetType?: AssetType;
  brokerId: string;
  title: string;
  scheduledAt: string;
  status: AppointmentStatus;
  locationNotes?: string;
  outcomeNotes?: string;
  createdAt: string;
}

export interface DealItem {
  id: string;
  listingId: string;
  listingTitle: string;
  leadId?: string;
  brokerId: string;
  agreedPrice: number;
  currency: string;
  commissionExpected?: number;
  commissionPaid?: number;
  status: DealStatus;
  notes?: string;
  createdAt: string;
}

export interface ReportItem {
  id: string;
  listingId: string;
  listingTitle: string;
  reporterEmail: string;
  reporterPhone?: string;
  reason: string;
  details: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';
  adminNotes?: string;
  listingSlug?: string;
  listingAssetType?: AssetType;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: string;
  createdAt: string;
}

export type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'popular';

export interface ListingSearchParams {
  assetType?: AssetType;
  category?: string; // PropertyType or VehicleType
  zone?: string;
  q?: string;
  transactionType?: TransactionType;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  transmission?: TransmissionType;
  fuelType?: FuelType;
  minYear?: number;
  sort?: SortOption;
  page?: number;
  pageSize?: number;
}

export interface ListingSearchResult {
  items: ListingItem[];
  total: number;
  page: number;
  pageCount: number;
}

export interface MarketStats {
  totalListings: number;
  propertyCount: number;
  vehicleCount: number;
  verifiedSellers: number;
  byCategory: Record<string, number>;
  byZone: Record<string, number>;
}
