/**
 * The sample catalogue for Zamana Market: sellers, agencies and listings.
 *
 * Used by `prisma/seed.ts` to fill the database, and by the site's preview mode
 * (lib/demo) to show sample listings when the database is not connected yet.
 * Keep it plain data with no imports beyond types, so both can load it.
 */
import type {
  FuelType,
  FurnishingStatus,
  ListingStatus,
  PropertyType,
  Role,
  TransactionType,
  TransmissionType,
  VehicleCondition,
  VehicleType,
} from '../types';

export const imageUrl = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80`;

export type SellerKey = 'alemu' | 'selam' | 'marta' | 'bekele';

export interface DemoSeller {
  email: string;
  phone: string;
  role: Role;
  fullName: string;
  businessName?: string;
  bio?: string;
  licenseNumber?: string;
  idVerified: boolean;
  preferredLocale: string;
  joinedDaysAgo: number;
}

export const SELLERS: Record<SellerKey, DemoSeller> = {
  alemu: {
    email: 'broker.alemu@zamanamarket.et',
    phone: '+251911000002',
    role: 'BROKER',
    fullName: 'Alemu Tadesse',
    businessName: 'Sodo Prime Properties',
    bio: 'Licensed real estate broker with 7 years serving Wolaita Sodo families, investors and businesses.',
    licenseNumber: 'WOL-RE-2023-441',
    idVerified: true,
    preferredLocale: 'wal',
    joinedDaysAgo: 110,
  },
  selam: {
    email: 'broker.selam@zamanamarket.et',
    phone: '+251911000006',
    role: 'BROKER',
    fullName: 'Selam Ayele',
    businessName: 'Selam Homes & Lettings',
    bio: 'Independent broker specialising in family homes, rentals and warehouses across Sodo.',
    licenseNumber: 'WOL-RE-2024-087',
    idVerified: true,
    preferredLocale: 'am',
    joinedDaysAgo: 80,
  },
  marta: {
    email: 'dealer.marta@zamanamarket.et',
    phone: '+251911000003',
    role: 'AGENCY_ADMIN',
    fullName: 'Marta Haile',
    businessName: 'Wolaita Sodo Auto Hub',
    bio: 'Vehicle dealer connecting buyers with inspected cars, SUVs and commercial trucks.',
    licenseNumber: 'WOL-AUTO-2022-108',
    idVerified: true,
    preferredLocale: 'am',
    joinedDaysAgo: 100,
  },
  bekele: {
    email: 'seller.bekele@zamanamarket.et',
    phone: '+251911000004',
    role: 'SELLER',
    fullName: 'Bekele Wolde',
    bio: 'Private owner selling property and vehicles in Wolaita Sodo.',
    idVerified: true,
    preferredLocale: 'wal',
    joinedDaysAgo: 60,
  },
};

export type AgencyKey = 'prime' | 'auto';

export const AGENCIES: Record<AgencyKey, { name: string; slug: string; phone: string; email: string; address: string; owner: SellerKey }> = {
  prime: {
    name: 'Sodo Prime Properties',
    slug: 'sodo-prime-properties',
    phone: '+251911000002',
    email: 'info@sodoprime.et',
    address: 'Commercial Center Bldg, 3rd floor, Mehal Ketema, Wolaita Sodo',
    owner: 'alemu',
  },
  auto: {
    name: 'Wolaita Sodo Auto Hub',
    slug: 'wolaita-sodo-auto-hub',
    phone: '+251911000003',
    email: 'sales@sodoautohub.et',
    address: 'Main road showroom, Mehal Ketema, Wolaita Sodo',
    owner: 'marta',
  },
};

export type PropertySpec = {
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
};

export type VehicleSpec = {
  vehicleType: VehicleType;
  make: string;
  model: string;
  year: number;
  mileageKm?: number;
  transmission: TransmissionType;
  fuelType: FuelType;
  condition: VehicleCondition;
  plateCode?: string;
};

export type ListingSeed = {
  slug: string;
  title: string;
  description: string;
  price: number;
  isNegotiable?: boolean;
  status?: ListingStatus;
  isFeatured?: boolean;
  viewCount?: number;
  publishedDaysAgo?: number;
  author: 'alemu' | 'selam' | 'marta' | 'bekele';
  agency?: 'prime' | 'auto';
  zone: string;
  kebele?: string;
  landmark?: string;
  ownerDeclaration: string;
  moderationNotes?: string;
  images: { id: string; caption: string }[];
  property?: PropertySpec;
  vehicle?: VehicleSpec;
};

/** Feature checklists for the demo listings, by slug. */
export const FEATURES: Record<string, string[]> = {
  'modern-g1-family-home-mehal-ketema': ['TITLE_DEED', 'WATER_TANK', 'THREE_PHASE_POWER', 'FENCED_COMPOUND', 'ASPHALT_ACCESS', 'GARDEN'],
  'elegant-3-bedroom-villa-otona': ['TITLE_DEED', 'WATER_TANK', 'FENCED_COMPOUND', 'GARDEN', 'SERVICE_QUARTER'],
  'luxury-contemporary-villa-pool-mehal-ketema': ['TITLE_DEED', 'WATER_TANK', 'GENERATOR', 'SOLAR', 'FENCED_COMPOUND', 'SECURITY_GUARD', 'ASPHALT_ACCESS', 'GARDEN', 'INTERNET'],
  'modern-townhouse-arada': ['TITLE_DEED', 'WATER_TANK', 'BALCONY', 'FENCED_COMPOUND'],
  'brick-family-home-double-garage-wadu': ['TITLE_DEED', 'FENCED_COMPOUND', 'GARDEN', 'SERVICE_QUARTER'],
  'family-house-for-rent-ligaba': ['WATER_TANK', 'FENCED_COMPOUND', 'GARDEN'],
  'cozy-1-bedroom-apartment-merkato': ['WATER_TANK', 'BALCONY', 'INTERNET'],
  'commercial-retail-shop-arada-market': ['ASPHALT_ACCESS', 'THREE_PHASE_POWER'],
  'cafe-restaurant-space-merkato': ['ASPHALT_ACCESS', 'THREE_PHASE_POWER', 'WATER_TANK'],
  'modern-office-floor-boditi-road': ['ASPHALT_ACCESS', 'GENERATOR', 'INTERNET', 'SECURITY_GUARD'],
  'warehouse-humbo-gate': ['THREE_PHASE_POWER', 'FENCED_COMPOUND', 'SECURITY_GUARD', 'ASPHALT_ACCESS'],
  'boutique-guest-house-pool-arada': ['TITLE_DEED', 'WATER_TANK', 'GENERATOR', 'FENCED_COMPOUND', 'SECURITY_GUARD', 'GARDEN', 'INTERNET'],
  '250m2-residential-plot-boditi-road': ['TITLE_DEED', 'THREE_PHASE_POWER'],
  '2-bedroom-condominium-otona': ['TITLE_DEED', 'WATER_TANK', 'SECURITY_GUARD', 'BALCONY'],
  'service-room-for-rent-ligaba': ['WATER_TANK', 'FENCED_COMPOUND'],
  'student-hostel-beds-otona': ['WATER_TANK', 'SECURITY_GUARD', 'INTERNET', 'FENCED_COMPOUND'],
  'coffee-enset-farm-land-damota': ['TITLE_DEED'],
  'g3-mixed-use-building-merkato': ['TITLE_DEED', 'WATER_TANK', 'THREE_PHASE_POWER', 'ASPHALT_ACCESS', 'GENERATOR'],
  'event-wedding-hall-boditi-road': ['GENERATOR', 'FENCED_COMPOUND', 'ASPHALT_ACCESS', 'SECURITY_GUARD'],
  'furnished-2-bedroom-apartment-ligaba': ['WATER_TANK', 'BALCONY', 'INTERNET'],
  'red-brick-house-wadu': ['TITLE_DEED', 'FENCED_COMPOUND', 'GARDEN'],
  'toyota-camry-2019-hybrid': ['DUTY_PAID', 'LIBRE_READY', 'BOLO_VALID', 'INSURED', 'ONE_OWNER', 'SERVICE_HISTORY', 'AIR_CONDITIONING', 'REVERSE_CAMERA', 'LEATHER_SEATS'],
  'toyota-hilux-double-cabin-2018-diesel': ['DUTY_PAID', 'LIBRE_READY', 'BOLO_VALID', 'INSURED', 'FOUR_WHEEL_DRIVE', 'AIR_CONDITIONING'],
  'mercedes-benz-gle-coupe-2018': ['DUTY_PAID', 'LIBRE_READY', 'BOLO_VALID', 'INSURED', 'SERVICE_HISTORY', 'AIR_CONDITIONING', 'FOUR_WHEEL_DRIVE', 'REVERSE_CAMERA', 'LEATHER_SEATS'],
  'honda-crv-2017-awd': ['DUTY_PAID', 'LIBRE_READY', 'BOLO_VALID', 'FOUR_WHEEL_DRIVE', 'AIR_CONDITIONING', 'REVERSE_CAMERA'],
  'ford-expedition-7-seater-2016': ['DUTY_PAID', 'LIBRE_READY', 'AIR_CONDITIONING', 'FOUR_WHEEL_DRIVE', 'LEATHER_SEATS'],
  'nissan-juke-2016': ['DUTY_PAID', 'LIBRE_READY', 'BOLO_VALID', 'ONE_OWNER', 'AIR_CONDITIONING'],
  'scania-cargo-truck-2016': ['DUTY_PAID', 'LIBRE_READY', 'BOLO_VALID', 'INSURED', 'SERVICE_HISTORY'],
  '150cc-motorcycle-merkato': ['DUTY_PAID', 'LIBRE_READY', 'BOLO_VALID'],
};

export const LISTINGS: ListingSeed[] = [
  {
    slug: 'modern-g1-family-home-mehal-ketema',
    title: 'Modern G+1 Family Home with Garden in Mehal Ketema',
    description:
      'Well-built G+1 house in a quiet, accessible street of Mehal Ketema. Four bright bedrooms (master en-suite), a spacious living room, fitted kitchen, a 5,000 L reserve water tank, 3-phase electricity, a secure compound wall and paved parking for two cars.\n\nTitle deed verified and ready for transfer. Walking distance to Commercial Bank, schools and the town centre.',
    price: 7_800_000,
    isFeatured: true,
    viewCount: 412,
    publishedDaysAgo: 4,
    author: 'alemu',
    agency: 'prime',
    zone: 'Mehal Ketema',
    kebele: '01',
    landmark: 'Behind the Commercial Bank of Ethiopia main branch',
    ownerDeclaration: 'Listed by Sodo Prime on behalf of the owner, with a verified title certificate.',
    images: [
      { id: 'photo-1600585154340-be6161a56a0c', caption: 'Front of the house and compound' },
      { id: 'photo-1600566753190-17f0baa2a6c3', caption: 'Side view' },
      { id: 'photo-1600566752355-35792bedcfea', caption: 'Master bathroom' },
    ],
    property: {
      propertyType: 'HOUSE',
      transactionType: 'FOR_SALE',
      bedrooms: 4,
      bathrooms: 3,
      areaSqM: 280,
      compoundSizeSqM: 350,
      furnishing: 'SEMI_FURNISHED',
      parkingSpaces: 2,
    },
  },
  {
    slug: 'elegant-3-bedroom-villa-otona',
    title: 'Elegant 3-Bedroom Villa near Wolaita Sodo University',
    description:
      'Contemporary villa on a corner plot in Otona, five minutes from the university and the teaching hospital. Open-plan living and dining, a modern kitchen with island, three bedrooms with built-in wardrobes, and a covered terrace with views towards Mount Damota.\n\nSolar water heater, borehole connection and a separate service quarter.',
    price: 12_500_000,
    isFeatured: true,
    viewCount: 368,
    publishedDaysAgo: 2,
    author: 'selam',
    zone: 'Otona',
    kebele: '08',
    landmark: 'Near Otona Teaching Hospital',
    ownerDeclaration: 'Exclusive mandate signed with the owner. Title deed copy available on request.',
    images: [
      { id: 'photo-1600596542815-ffad4c1539a9', caption: 'Villa front elevation' },
      { id: 'photo-1600607687939-ce8a6c25118c', caption: 'Open-plan living area' },
      { id: 'photo-1493809842364-78817add7ffb', caption: 'Second sitting room' },
    ],
    property: {
      propertyType: 'HOUSE',
      transactionType: 'FOR_SALE',
      bedrooms: 3,
      bathrooms: 2,
      areaSqM: 240,
      compoundSizeSqM: 420,
      furnishing: 'UNFURNISHED',
      parkingSpaces: 2,
    },
  },
  {
    slug: 'luxury-contemporary-villa-pool-mehal-ketema',
    title: 'Luxury Contemporary Villa with Pool',
    description:
      'A rare architect-designed residence for executives and returning diaspora families. Five en-suite bedrooms, double-height living room, home office, landscaped garden and a private swimming pool. Backup generator, CCTV and 24/7 guard house.',
    price: 24_000_000,
    isFeatured: true,
    viewCount: 905,
    publishedDaysAgo: 6,
    author: 'selam',
    zone: 'Mehal Ketema',
    kebele: '02',
    landmark: 'Upper Mehal Ketema residential area',
    ownerDeclaration: 'Exclusive mandate signed with the owner.',
    images: [
      { id: 'photo-1613490493576-7fde63acd811', caption: 'Villa and pool' },
      { id: 'photo-1580587771525-78b9dba3b914', caption: 'Garden side' },
    ],
    property: {
      propertyType: 'HOUSE',
      transactionType: 'FOR_SALE',
      bedrooms: 5,
      bathrooms: 5,
      areaSqM: 520,
      compoundSizeSqM: 900,
      furnishing: 'SEMI_FURNISHED',
      parkingSpaces: 4,
    },
  },
  {
    slug: 'modern-townhouse-arada',
    title: 'Modern Townhouse in Arada',
    description:
      'Bright three-storey townhouse with a rooftop terrace in the heart of Arada. Three bedrooms, a guest toilet, a fitted kitchen and a small private yard. Ideal for young families who want to walk to shops, cafés and churches.',
    price: 8_500_000,
    viewCount: 221,
    publishedDaysAgo: 9,
    author: 'alemu',
    agency: 'prime',
    zone: 'Arada',
    kebele: '03',
    landmark: 'Two blocks from the Wolaita Heritage Center',
    ownerDeclaration: 'Listed by Sodo Prime on behalf of the owner.',
    images: [{ id: 'photo-1512917774080-9991f1c4c750', caption: 'Townhouse exterior' }],
    property: {
      propertyType: 'HOUSE',
      transactionType: 'FOR_SALE',
      bedrooms: 3,
      bathrooms: 2,
      areaSqM: 190,
      compoundSizeSqM: 160,
      furnishing: 'UNFURNISHED',
      parkingSpaces: 1,
    },
  },
  {
    slug: 'brick-family-home-double-garage-wadu',
    title: 'Brick Family Home with Double Garage in Wadu',
    description:
      'Solid brick house on a 500 m² compound in Wadu. Four bedrooms, two bathrooms, a large living room with fireplace, a double garage and a mature garden with avocado and mango trees. Sold directly by the owner.',
    price: 9_200_000,
    viewCount: 187,
    publishedDaysAgo: 12,
    author: 'bekele',
    zone: 'Wadu',
    kebele: '07',
    landmark: 'Off the Wadu main road, near the Catholic church',
    ownerDeclaration: 'I am the registered owner and hold the municipal title book.',
    images: [{ id: 'photo-1605276374104-dee2a0ed3cd6', caption: 'House and double garage' }],
    property: {
      propertyType: 'HOUSE',
      transactionType: 'FOR_SALE',
      bedrooms: 4,
      bathrooms: 2,
      areaSqM: 260,
      compoundSizeSqM: 500,
      furnishing: 'UNFURNISHED',
      parkingSpaces: 2,
    },
  },
  {
    slug: 'family-house-for-rent-ligaba',
    title: 'Spacious Family House for Rent in Ligaba',
    description:
      'Calm three-bedroom house with a large lawn, close to government offices and the hospital. Furnished living room, a separate servant quarter, reliable water and a secure gate. Minimum lease of one year.',
    price: 22_000,
    viewCount: 296,
    publishedDaysAgo: 3,
    author: 'selam',
    zone: 'Ligaba',
    kebele: '04',
    landmark: 'Near the zonal administration offices',
    ownerDeclaration: 'Authorised by the landlord to market and show the property.',
    images: [
      { id: 'photo-1570129477492-45c003edd2be', caption: 'House and lawn' },
      { id: 'photo-1586023492125-27b2c045efd7', caption: 'Living room' },
    ],
    property: {
      propertyType: 'HOUSE',
      transactionType: 'FOR_RENT',
      bedrooms: 3,
      bathrooms: 2,
      areaSqM: 180,
      compoundSizeSqM: 400,
      furnishing: 'SEMI_FURNISHED',
      parkingSpaces: 2,
    },
  },
  {
    slug: 'cozy-1-bedroom-apartment-merkato',
    title: 'Cozy 1-Bedroom Apartment near Merkato',
    description:
      'Fully furnished one-bedroom apartment on the second floor, a short walk from the main market. Bright living room, kitchenette, hot shower and Wi-Fi ready. Suits a young professional or a couple.',
    price: 9_500,
    isNegotiable: false,
    viewCount: 341,
    publishedDaysAgo: 1,
    author: 'bekele',
    zone: 'Merkato',
    kebele: '02',
    landmark: 'Behind the Merkato bus stop',
    ownerDeclaration: 'I am the owner of the building.',
    images: [{ id: 'photo-1502672260266-1c1ef2d93688', caption: 'Living room' }],
    property: {
      propertyType: 'APARTMENT',
      transactionType: 'FOR_RENT',
      bedrooms: 1,
      bathrooms: 1,
      areaSqM: 55,
      furnishing: 'FULLY_FURNISHED',
      parkingSpaces: 0,
    },
  },
  {
    slug: 'commercial-retail-shop-arada-market',
    title: 'High-Traffic Retail Shop on the Arada Market Strip',
    description:
      'Ground-floor shop facing the main Arada avenue with excellent visibility for retail, a pharmacy, hardware or a bank agent. Glass shopfront, roller shutter, its own electricity meter and customer parking in front.',
    price: 28_000,
    viewCount: 254,
    publishedDaysAgo: 5,
    author: 'alemu',
    agency: 'prime',
    zone: 'Arada',
    kebele: '03',
    landmark: 'Main Arada avenue',
    ownerDeclaration: 'Lease authorised by the building administration.',
    images: [
      { id: 'photo-1441986300917-64674bd600d8', caption: 'Shop interior' },
      { id: 'photo-1497366216548-37526070297c', caption: 'Open layout' },
    ],
    property: {
      propertyType: 'SHOP',
      transactionType: 'FOR_RENT',
      areaSqM: 65,
      furnishing: 'UNFURNISHED',
      parkingSpaces: 1,
    },
  },
  {
    slug: 'cafe-restaurant-space-merkato',
    title: 'Fitted Café & Restaurant Space in Merkato',
    description:
      'Turn-key café space with a fitted bar counter, kitchen extraction, seating for 60 and a mezzanine. Previously a busy coffee house. Equipment can be included by negotiation.',
    price: 45_000,
    viewCount: 198,
    publishedDaysAgo: 8,
    author: 'alemu',
    agency: 'prime',
    zone: 'Merkato',
    kebele: '02',
    landmark: 'Corner of the Merkato roundabout',
    ownerDeclaration: 'Lease authorised by the owner.',
    images: [{ id: 'photo-1555396273-367ea4eb4db5', caption: 'Café interior' }],
    property: {
      propertyType: 'RESTAURANT',
      transactionType: 'FOR_RENT',
      areaSqM: 210,
      furnishing: 'FULLY_FURNISHED',
      parkingSpaces: 3,
    },
  },
  {
    slug: 'modern-office-floor-boditi-road',
    title: 'Modern Office Floor on Boditi Road',
    description:
      'Full open-plan office floor in a new commercial building on the Boditi corridor. Lift access, fibre internet, meeting room, kitchenette and backup power. Great for NGOs, banks and tech teams.',
    price: 60_000,
    viewCount: 143,
    publishedDaysAgo: 10,
    author: 'alemu',
    agency: 'prime',
    zone: 'Boditi Road',
    kebele: '05',
    landmark: 'New commercial complex on the Boditi road',
    ownerDeclaration: 'Lease authorised by the building owner.',
    images: [
      { id: 'photo-1497366811353-6870744d04b2', caption: 'Open-plan office' },
      { id: 'photo-1497366216548-37526070297c', caption: 'Work area' },
    ],
    property: {
      propertyType: 'OFFICE',
      transactionType: 'FOR_RENT',
      areaSqM: 320,
      furnishing: 'SEMI_FURNISHED',
      parkingSpaces: 6,
    },
  },
  {
    slug: 'warehouse-humbo-gate',
    title: '1,200 m² Warehouse at Humbo Gate',
    description:
      'Large steel-frame warehouse at the southern exit of the town, with truck access, a loading bay, a guard house and an office block. Ideal for grain, coffee, construction materials or distribution.',
    price: 85_000,
    viewCount: 97,
    publishedDaysAgo: 14,
    author: 'selam',
    zone: 'Humbo Gate',
    kebele: '06',
    landmark: 'Next to the southern transport terminal',
    ownerDeclaration: 'Authorised by the owner company.',
    images: [{ id: 'photo-1586528116311-ad8dd3c8310d', caption: 'Warehouse interior' }],
    property: {
      propertyType: 'WAREHOUSE',
      transactionType: 'FOR_RENT',
      areaSqM: 1200,
      compoundSizeSqM: 2500,
      furnishing: 'UNFURNISHED',
      parkingSpaces: 10,
    },
  },
  {
    slug: 'boutique-guest-house-pool-arada',
    title: 'Boutique Guest House with Pool',
    description:
      'Operating 12-room guest house with a swimming pool, restaurant and garden bar. Strong occupancy from visitors, NGOs and university guests. Sold as a going concern with staff and furniture.',
    price: 32_000_000,
    viewCount: 512,
    publishedDaysAgo: 7,
    author: 'alemu',
    agency: 'prime',
    zone: 'Arada',
    kebele: '03',
    landmark: 'Quiet street off the Arada main road',
    ownerDeclaration: 'Listed by Sodo Prime with the written consent of the owners.',
    images: [{ id: 'photo-1416331108676-a22ccb276e35', caption: 'Pool and guest rooms' }],
    property: {
      propertyType: 'HOTEL',
      transactionType: 'FOR_SALE',
      bedrooms: 12,
      bathrooms: 13,
      areaSqM: 900,
      compoundSizeSqM: 1600,
      furnishing: 'FULLY_FURNISHED',
      parkingSpaces: 8,
    },
  },
  {
    slug: '250m2-residential-plot-boditi-road',
    title: '250 m² Titled Residential Plot on the Boditi Corridor',
    description:
      'Dry, slightly elevated plot 120 m off the Sodo–Boditi asphalt road in a fast-growing neighbourhood. Electricity poles at the boundary and the water main nearby. Lease title registered with the municipal land office.',
    price: 2_400_000,
    viewCount: 276,
    publishedDaysAgo: 3,
    author: 'bekele',
    zone: 'Boditi Road',
    kebele: '05',
    landmark: '120 m from the Boditi asphalt road',
    ownerDeclaration: 'Private owner with a municipal leasehold title book.',
    images: [{ id: 'photo-1500382017468-9049fed747ef', caption: 'The plot with road access' }],
    property: {
      propertyType: 'RESIDENTIAL_LAND',
      transactionType: 'FOR_SALE',
      areaSqM: 250,
      compoundSizeSqM: 250,
      waterConnected: false,
      electricityConnected: true,
    },
  },
  {
    slug: '2-bedroom-condominium-otona',
    title: '2-Bedroom Condominium Near Wolaita Sodo University',
    description:
      'Third-floor condominium unit in the Otona condominium site, a 5-minute walk from Wolaita Sodo University and the teaching hospital. Two bedrooms, a living room with balcony, kitchen and a shower room. Shared water reservoir and guarded compound.\n\nOwnership certificate ready for transfer through the housing office.',
    price: 2_950_000,
    isFeatured: true,
    viewCount: 341,
    publishedDaysAgo: 2,
    author: 'selam',
    zone: 'Otona',
    kebele: '02',
    landmark: 'Otona condominium site, block 7',
    ownerDeclaration: 'Marketed by a licensed broker with the owner’s written consent.',
    images: [
      { id: 'photo-1502672260266-1c1ef2d93688', caption: 'Living room' },
      { id: 'photo-1522708323590-d24dbb6b0267', caption: 'Balcony side' },
    ],
    property: {
      propertyType: 'CONDOMINIUM',
      transactionType: 'FOR_SALE',
      bedrooms: 2,
      bathrooms: 1,
      areaSqM: 68,
      furnishing: 'UNFURNISHED',
      parkingSpaces: 0,
    },
  },
  {
    slug: 'service-room-for-rent-ligaba',
    title: 'Clean Service Room for Rent in a Family Compound',
    description:
      'Single room with its own entrance in a quiet family compound in Ligaba. Shared shower and kitchen area, 24-hour water from the reserve tank, prepaid electricity meter. Suits a civil servant, nurse or student.',
    price: 3_500,
    isNegotiable: false,
    viewCount: 158,
    publishedDaysAgo: 1,
    author: 'bekele',
    zone: 'Ligaba',
    kebele: '04',
    landmark: '3 minutes from Sodo Christian Hospital',
    ownerDeclaration: 'I am the owner and live in the same compound.',
    images: [{ id: 'photo-1586023492125-27b2c045efd7', caption: 'The room' }],
    property: {
      propertyType: 'ROOM',
      transactionType: 'FOR_RENT',
      bedrooms: 1,
      bathrooms: 1,
      areaSqM: 16,
      furnishing: 'SEMI_FURNISHED',
    },
  },
  {
    slug: 'student-hostel-beds-otona',
    title: 'Student Hostel Beds Next to the University Main Gate',
    description:
      'Furnished shared rooms for students, 2 per room, with study desks, Wi-Fi, a shared kitchen, laundry area and a guard at night. Monthly price is per bed and includes water and electricity.',
    price: 2_200,
    isNegotiable: false,
    viewCount: 287,
    publishedDaysAgo: 5,
    author: 'selam',
    zone: 'Otona',
    kebele: '01',
    landmark: 'Opposite Wolaita Sodo University main gate',
    ownerDeclaration: 'Managed by a licensed broker on behalf of the hostel owner.',
    images: [{ id: 'photo-1493809842364-78817add7ffb', caption: 'Shared study and sitting area' }],
    property: {
      propertyType: 'STUDENT_HOSTEL',
      transactionType: 'FOR_RENT',
      bedrooms: 10,
      bathrooms: 4,
      areaSqM: 320,
      furnishing: 'FULLY_FURNISHED',
    },
  },
  {
    slug: 'coffee-enset-farm-land-damota',
    title: '1 Hectare Coffee & Enset Farm Land on the Damota Foothills',
    description:
      'Fertile, well-drained farm land with mature coffee trees, an enset grove and a seasonal stream at the boundary. Holding certificate (landholding book) in the owner’s name. 25 minutes from Sodo town on a gravel road.',
    price: 1_800_000,
    viewCount: 119,
    publishedDaysAgo: 6,
    author: 'bekele',
    zone: 'Wadu',
    landmark: 'Damota foothills, 25 min from Sodo town',
    ownerDeclaration: 'Private owner with a rural landholding certificate.',
    images: [{ id: 'photo-1500382017468-9049fed747ef', caption: 'View over the farm' }],
    property: {
      propertyType: 'FARM_LAND',
      transactionType: 'FOR_SALE',
      areaSqM: 10_000,
      compoundSizeSqM: 10_000,
      waterConnected: false,
      electricityConnected: false,
    },
  },
  {
    slug: 'g3-mixed-use-building-merkato',
    title: 'G+3 Mixed-Use Building with Shops in Merkato',
    description:
      'Income-generating G+3 building on a busy Merkato street: 6 shops on the ground floor, offices on the first floor and 4 apartments above. Fully let, with a lift shaft prepared and a 10,000 L water tank. Title deed and building permit available.',
    price: 48_000_000,
    isFeatured: true,
    viewCount: 466,
    publishedDaysAgo: 3,
    author: 'alemu',
    agency: 'prime',
    zone: 'Merkato',
    kebele: '02',
    landmark: 'Main Merkato street, near the bus station',
    ownerDeclaration: 'Listed by Sodo Prime with the owner’s signed authorisation.',
    images: [
      { id: 'photo-1497366811353-6870744d04b2', caption: 'First-floor offices' },
      { id: 'photo-1441986300917-64674bd600d8', caption: 'Ground-floor shop' },
    ],
    property: {
      propertyType: 'BUILDING',
      transactionType: 'FOR_SALE',
      bedrooms: 8,
      bathrooms: 10,
      areaSqM: 1_150,
      compoundSizeSqM: 400,
      parkingSpaces: 4,
    },
  },
  {
    slug: 'event-wedding-hall-boditi-road',
    title: 'Event & Wedding Hall for 400 Guests on Boditi Road',
    description:
      'Spacious hall for weddings, graduations and conferences with a stage, sound system, catering kitchen, generator backup and a large parking area. Rent per month for operators; daily bookings can be discussed.',
    price: 120_000,
    viewCount: 204,
    publishedDaysAgo: 9,
    author: 'alemu',
    agency: 'prime',
    zone: 'Boditi Road',
    kebele: '05',
    landmark: 'Next to the Boditi Road fuel station',
    ownerDeclaration: 'Lease authorised by the owner.',
    images: [{ id: 'photo-1497366216548-37526070297c', caption: 'Main hall' }],
    property: {
      propertyType: 'EVENT_HALL',
      transactionType: 'FOR_RENT',
      areaSqM: 700,
      compoundSizeSqM: 1_500,
      parkingSpaces: 40,
    },
  },
  // ─── Vehicles ───────────────────────────────────────────────
  {
    slug: 'toyota-camry-2019-hybrid',
    title: 'Toyota Camry 2019 Hybrid – One Owner',
    description:
      'Very clean Camry Hybrid with low fuel consumption, ideal for long trips to Hawassa and Addis. Leather seats, reversing camera, cruise control and full service history at the Toyota dealer.',
    price: 5_900_000,
    isFeatured: true,
    viewCount: 633,
    publishedDaysAgo: 2,
    author: 'marta',
    agency: 'auto',
    zone: 'Mehal Ketema',
    landmark: 'Wolaita Sodo Auto Hub showroom',
    ownerDeclaration: 'Inspected and certified by Wolaita Sodo Auto Hub mechanics.',
    images: [
      { id: 'photo-1621007947382-bb3c3994e3fb', caption: 'Front three-quarter view' },
      { id: 'photo-1449965408869-eaa3f722e40d', caption: 'Driver cockpit' },
    ],
    vehicle: {
      vehicleType: 'CAR',
      make: 'Toyota',
      model: 'Camry Hybrid',
      year: 2019,
      mileageKm: 58_000,
      transmission: 'AUTOMATIC',
      fuelType: 'HYBRID',
      condition: 'EXCELLENT',
      plateCode: 'Code 2',
    },
  },
  {
    slug: 'toyota-hilux-double-cabin-2018-diesel',
    title: 'Toyota Hilux Double Cabin 4x4 2018 Diesel',
    description:
      'Strong 2018 Hilux 4WD double cabin with the D-4D turbo diesel engine. Reinforced suspension for Wolaita roads and regional travel, bull bar, bed liner and complete maintenance history. Ownership papers ready for transfer.',
    price: 6_200_000,
    viewCount: 488,
    publishedDaysAgo: 1,
    author: 'marta',
    agency: 'auto',
    zone: 'Humbo Gate',
    landmark: 'Southern transport terminal',
    ownerDeclaration: 'Company vehicle maintained on a strict service schedule.',
    images: [{ id: 'photo-1559416523-140ddc3d238c', caption: 'Hilux exterior' }],
    vehicle: {
      vehicleType: 'TRUCK',
      make: 'Toyota',
      model: 'Hilux Double Cabin 4x4',
      year: 2018,
      mileageKm: 94_000,
      transmission: 'MANUAL',
      fuelType: 'DIESEL',
      condition: 'GOOD',
      plateCode: 'Code 3',
    },
  },
  {
    slug: 'mercedes-benz-gle-coupe-2018',
    title: 'Mercedes-Benz GLE Coupé 2018',
    description:
      'Premium SUV coupé in pearl white with panoramic roof, AMG styling pack, ambient lighting and 360° camera. Imported in 2022, garage kept and serviced locally.',
    price: 14_500_000,
    isFeatured: true,
    viewCount: 721,
    publishedDaysAgo: 5,
    author: 'marta',
    agency: 'auto',
    zone: 'Mehal Ketema',
    landmark: 'Wolaita Sodo Auto Hub showroom',
    ownerDeclaration: 'Inspected and certified by Wolaita Sodo Auto Hub mechanics.',
    images: [{ id: 'photo-1590362891991-f776e747a588', caption: 'GLE Coupé front' }],
    vehicle: {
      vehicleType: 'CAR',
      make: 'Mercedes-Benz',
      model: 'GLE Coupé',
      year: 2018,
      mileageKm: 71_000,
      transmission: 'AUTOMATIC',
      fuelType: 'BENZINE',
      condition: 'EXCELLENT',
      plateCode: 'Code 2',
    },
  },
  {
    slug: 'honda-crv-2017-awd',
    title: 'Honda CR-V 2017 AWD',
    description:
      'Reliable family SUV with all-wheel drive, roomy boot, Apple CarPlay and new tyres. Comfortable on the Damota and Shone roads in the rainy season.',
    price: 4_900_000,
    viewCount: 302,
    publishedDaysAgo: 6,
    author: 'marta',
    agency: 'auto',
    zone: 'Boditi Road',
    landmark: 'Auto Hub branch, Boditi road',
    ownerDeclaration: 'Inspected and certified by Wolaita Sodo Auto Hub mechanics.',
    images: [{ id: 'photo-1519641471654-76ce0107ad1b', caption: 'CR-V exterior' }],
    vehicle: {
      vehicleType: 'CAR',
      make: 'Honda',
      model: 'CR-V AWD',
      year: 2017,
      mileageKm: 83_000,
      transmission: 'AUTOMATIC',
      fuelType: 'BENZINE',
      condition: 'GOOD',
    },
  },
  {
    slug: 'ford-expedition-7-seater-2016',
    title: 'Ford Expedition 7-Seater 2016',
    description:
      'Full-size eight-seat SUV, perfect for tour operators, churches and large families. Three-row seating, rear air conditioning and a towing package.',
    price: 6_500_000,
    viewCount: 164,
    publishedDaysAgo: 11,
    author: 'marta',
    agency: 'auto',
    zone: 'Humbo Gate',
    ownerDeclaration: 'Inspected and certified by Wolaita Sodo Auto Hub mechanics.',
    images: [{ id: 'photo-1533473359331-0135ef1b58bf', caption: 'Expedition exterior' }],
    vehicle: {
      vehicleType: 'CAR',
      make: 'Ford',
      model: 'Expedition',
      year: 2016,
      mileageKm: 120_000,
      transmission: 'AUTOMATIC',
      fuelType: 'BENZINE',
      condition: 'GOOD',
    },
  },
  {
    slug: 'nissan-juke-2016',
    title: 'Nissan Juke 2016 – Economical City SUV',
    description:
      'Compact crossover that is easy to park in Merkato and light on fuel. Recently serviced, new battery and brake pads. Selling because I am moving to Addis.',
    price: 3_200_000,
    viewCount: 119,
    publishedDaysAgo: 4,
    author: 'bekele',
    zone: 'Ligaba',
    ownerDeclaration: 'I am the registered owner (libre in my name).',
    images: [{ id: 'photo-1609521263047-f8f205293f24', caption: 'Juke exterior' }],
    vehicle: {
      vehicleType: 'CAR',
      make: 'Nissan',
      model: 'Juke',
      year: 2016,
      mileageKm: 98_000,
      transmission: 'AUTOMATIC',
      fuelType: 'BENZINE',
      condition: 'GOOD',
    },
  },
  {
    slug: 'scania-cargo-truck-2016',
    title: 'Scania R-Series Cargo Truck 2016',
    description:
      'Heavy-duty tractor head with sleeper cab, ready for Djibouti corridor work. Engine overhauled in 2025, new tyres and documented service history. Trailer available separately.',
    price: 9_500_000,
    viewCount: 88,
    publishedDaysAgo: 13,
    author: 'marta',
    agency: 'auto',
    zone: 'Humbo Gate',
    landmark: 'Truck yard behind the southern terminal',
    ownerDeclaration: 'Company-owned vehicle, documents verified by Auto Hub.',
    images: [{ id: 'photo-1601584115197-04ecc0da31d7', caption: 'Scania truck' }],
    vehicle: {
      vehicleType: 'TRUCK',
      make: 'Scania',
      model: 'R-Series',
      year: 2016,
      mileageKm: 410_000,
      transmission: 'MANUAL',
      fuelType: 'DIESEL',
      condition: 'GOOD',
      plateCode: 'Code 3',
    },
  },
  {
    slug: '150cc-motorcycle-merkato',
    title: '150cc Motorcycle – Low Mileage',
    description:
      'Comfortable 150cc motorcycle in great condition. Starts first time, new chain and sprockets. Ideal for daily commuting or delivery work around Sodo.',
    price: 185_000,
    viewCount: 233,
    publishedDaysAgo: 2,
    author: 'bekele',
    zone: 'Merkato',
    ownerDeclaration: 'I am the registered owner.',
    images: [{ id: 'photo-1558981806-ec527fa84c39', caption: 'Motorcycle on the road' }],
    vehicle: {
      vehicleType: 'MOTORCYCLE',
      make: 'Bajaj',
      model: 'Boxer 150',
      year: 2022,
      mileageKm: 14_000,
      transmission: 'MANUAL',
      fuelType: 'BENZINE',
      condition: 'EXCELLENT',
    },
  },
  // ─── Moderation examples ───────────────────────────────────
  {
    slug: 'furnished-2-bedroom-apartment-ligaba',
    title: 'Furnished 2-Bedroom Apartment in Ligaba',
    description:
      'Quiet, fully furnished two-bedroom apartment near government offices and the hospital. Solar water heater, backup water reservoir, modern furniture and a balcony.',
    price: 16_000,
    isNegotiable: false,
    status: 'PENDING_REVIEW',
    author: 'bekele',
    zone: 'Ligaba',
    kebele: '04',
    ownerDeclaration: 'Submitted by the owner; title copy awaiting verification.',
    images: [{ id: 'photo-1522708323590-d24dbb6b0267', caption: 'Living area with balcony access' }],
    property: {
      propertyType: 'APARTMENT',
      transactionType: 'FOR_RENT',
      bedrooms: 2,
      bathrooms: 1,
      areaSqM: 85,
      furnishing: 'FULLY_FURNISHED',
      parkingSpaces: 1,
    },
  },
  {
    slug: 'red-brick-house-wadu',
    title: 'Red Brick Family House in Wadu',
    description:
      'Two-storey family house with four bedrooms, a front porch and a small garden. Close to schools and a minibus stop.',
    price: 6_900_000,
    status: 'PENDING_REVIEW',
    author: 'selam',
    zone: 'Wadu',
    kebele: '07',
    ownerDeclaration: 'Authorised by the owner to market the property.',
    images: [{ id: 'photo-1628624747186-a941c476b7ef', caption: 'Front of the house' }],
    property: {
      propertyType: 'HOUSE',
      transactionType: 'FOR_SALE',
      bedrooms: 4,
      bathrooms: 2,
      areaSqM: 210,
      compoundSizeSqM: 300,
      parkingSpaces: 1,
    },
  },
  {
    slug: 'mountain-view-cottage-damota',
    title: 'Mountain-View Cottage on the Damota Slopes',
    description: 'Small cottage with views of Mount Damota.',
    price: 4_200_000,
    status: 'CHANGES_REQUESTED',
    author: 'bekele',
    zone: 'Otona',
    ownerDeclaration: 'I am the owner.',
    moderationNotes:
      'Please add the plot size, the number of rooms and at least two more photos (including the inside) before we can publish.',
    images: [{ id: 'photo-1568605114967-8130f3a36994', caption: 'Cottage at dusk' }],
    property: {
      propertyType: 'HOUSE',
      transactionType: 'FOR_SALE',
    },
  },
];
