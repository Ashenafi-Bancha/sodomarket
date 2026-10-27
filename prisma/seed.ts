/**
 * Seed data for Wolaita Marketplace (Sodo Market Hub).
 *
 * Safe to re-run: it clears existing marketplace data first.
 * Run with: npm run db:seed
 *
 * All demo accounts use the password: DemoPass123!
 */
import {
  PrismaClient,
  Role,
  AssetType,
  PropertyType,
  TransactionType,
  FurnishingStatus,
  VehicleType,
  TransmissionType,
  FuelType,
  VehicleCondition,
  ListingStatus,
  LeadStage,
  AppointmentStatus,
  DealStatus,
  ReportReason,
  ReportStatus,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DAY = 86_400_000;
const daysAgo = (n: number) => new Date(Date.now() - n * DAY);
const daysAhead = (n: number) => new Date(Date.now() + n * DAY);
const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80`;

type PropertySpec = {
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

type VehicleSpec = {
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

type ListingSeed = {
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

const LISTINGS: ListingSeed[] = [
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
      { id: 'photo-1600566753190-17f0baa2a6c3', caption: 'Living room' },
      { id: 'photo-1600566752355-35792bedcfea', caption: 'Kitchen' },
    ],
    property: {
      propertyType: PropertyType.HOUSE,
      transactionType: TransactionType.FOR_SALE,
      bedrooms: 4,
      bathrooms: 3,
      areaSqM: 280,
      compoundSizeSqM: 350,
      furnishing: FurnishingStatus.SEMI_FURNISHED,
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
      propertyType: PropertyType.HOUSE,
      transactionType: TransactionType.FOR_SALE,
      bedrooms: 3,
      bathrooms: 2,
      areaSqM: 240,
      compoundSizeSqM: 420,
      furnishing: FurnishingStatus.UNFURNISHED,
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
      propertyType: PropertyType.HOUSE,
      transactionType: TransactionType.FOR_SALE,
      bedrooms: 5,
      bathrooms: 5,
      areaSqM: 520,
      compoundSizeSqM: 900,
      furnishing: FurnishingStatus.SEMI_FURNISHED,
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
      propertyType: PropertyType.HOUSE,
      transactionType: TransactionType.FOR_SALE,
      bedrooms: 3,
      bathrooms: 2,
      areaSqM: 190,
      compoundSizeSqM: 160,
      furnishing: FurnishingStatus.UNFURNISHED,
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
      propertyType: PropertyType.HOUSE,
      transactionType: TransactionType.FOR_SALE,
      bedrooms: 4,
      bathrooms: 2,
      areaSqM: 260,
      compoundSizeSqM: 500,
      furnishing: FurnishingStatus.UNFURNISHED,
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
      propertyType: PropertyType.HOUSE,
      transactionType: TransactionType.FOR_RENT,
      bedrooms: 3,
      bathrooms: 2,
      areaSqM: 180,
      compoundSizeSqM: 400,
      furnishing: FurnishingStatus.SEMI_FURNISHED,
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
      propertyType: PropertyType.APARTMENT,
      transactionType: TransactionType.FOR_RENT,
      bedrooms: 1,
      bathrooms: 1,
      areaSqM: 55,
      furnishing: FurnishingStatus.FULLY_FURNISHED,
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
      propertyType: PropertyType.SHOP,
      transactionType: TransactionType.FOR_RENT,
      areaSqM: 65,
      furnishing: FurnishingStatus.UNFURNISHED,
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
      propertyType: PropertyType.SHOP,
      transactionType: TransactionType.FOR_RENT,
      areaSqM: 210,
      furnishing: FurnishingStatus.FULLY_FURNISHED,
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
      propertyType: PropertyType.OFFICE,
      transactionType: TransactionType.FOR_RENT,
      areaSqM: 320,
      furnishing: FurnishingStatus.SEMI_FURNISHED,
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
      propertyType: PropertyType.WAREHOUSE,
      transactionType: TransactionType.FOR_RENT,
      areaSqM: 1200,
      compoundSizeSqM: 2500,
      furnishing: FurnishingStatus.UNFURNISHED,
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
      propertyType: PropertyType.OTHER,
      transactionType: TransactionType.FOR_SALE,
      bedrooms: 12,
      bathrooms: 13,
      areaSqM: 900,
      compoundSizeSqM: 1600,
      furnishing: FurnishingStatus.FULLY_FURNISHED,
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
      propertyType: PropertyType.RESIDENTIAL_LAND,
      transactionType: TransactionType.FOR_SALE,
      areaSqM: 250,
      compoundSizeSqM: 250,
      waterConnected: false,
      electricityConnected: true,
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
      vehicleType: VehicleType.CAR,
      make: 'Toyota',
      model: 'Camry Hybrid',
      year: 2019,
      mileageKm: 58_000,
      transmission: TransmissionType.AUTOMATIC,
      fuelType: FuelType.HYBRID,
      condition: VehicleCondition.EXCELLENT,
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
      vehicleType: VehicleType.TRUCK,
      make: 'Toyota',
      model: 'Hilux Double Cabin 4x4',
      year: 2018,
      mileageKm: 94_000,
      transmission: TransmissionType.MANUAL,
      fuelType: FuelType.DIESEL,
      condition: VehicleCondition.GOOD,
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
      vehicleType: VehicleType.CAR,
      make: 'Mercedes-Benz',
      model: 'GLE Coupé',
      year: 2018,
      mileageKm: 71_000,
      transmission: TransmissionType.AUTOMATIC,
      fuelType: FuelType.BENZINE,
      condition: VehicleCondition.EXCELLENT,
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
      vehicleType: VehicleType.CAR,
      make: 'Honda',
      model: 'CR-V AWD',
      year: 2017,
      mileageKm: 83_000,
      transmission: TransmissionType.AUTOMATIC,
      fuelType: FuelType.BENZINE,
      condition: VehicleCondition.GOOD,
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
      vehicleType: VehicleType.CAR,
      make: 'Ford',
      model: 'Expedition',
      year: 2016,
      mileageKm: 120_000,
      transmission: TransmissionType.AUTOMATIC,
      fuelType: FuelType.BENZINE,
      condition: VehicleCondition.GOOD,
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
      vehicleType: VehicleType.CAR,
      make: 'Nissan',
      model: 'Juke',
      year: 2016,
      mileageKm: 98_000,
      transmission: TransmissionType.AUTOMATIC,
      fuelType: FuelType.BENZINE,
      condition: VehicleCondition.GOOD,
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
      vehicleType: VehicleType.TRUCK,
      make: 'Scania',
      model: 'R-Series',
      year: 2016,
      mileageKm: 410_000,
      transmission: TransmissionType.MANUAL,
      fuelType: FuelType.DIESEL,
      condition: VehicleCondition.GOOD,
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
      vehicleType: VehicleType.MOTORCYCLE,
      make: 'Bajaj',
      model: 'Boxer 150',
      year: 2022,
      mileageKm: 14_000,
      transmission: TransmissionType.MANUAL,
      fuelType: FuelType.BENZINE,
      condition: VehicleCondition.EXCELLENT,
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
    status: ListingStatus.PENDING_REVIEW,
    author: 'bekele',
    zone: 'Ligaba',
    kebele: '04',
    ownerDeclaration: 'Submitted by the owner; title copy awaiting verification.',
    images: [{ id: 'photo-1522708323590-d24dbb6b0267', caption: 'Living area with balcony access' }],
    property: {
      propertyType: PropertyType.APARTMENT,
      transactionType: TransactionType.FOR_RENT,
      bedrooms: 2,
      bathrooms: 1,
      areaSqM: 85,
      furnishing: FurnishingStatus.FULLY_FURNISHED,
      parkingSpaces: 1,
    },
  },
  {
    slug: 'red-brick-house-wadu',
    title: 'Red Brick Family House in Wadu',
    description:
      'Two-storey family house with four bedrooms, a front porch and a small garden. Close to schools and a minibus stop.',
    price: 6_900_000,
    status: ListingStatus.PENDING_REVIEW,
    author: 'selam',
    zone: 'Wadu',
    kebele: '07',
    ownerDeclaration: 'Authorised by the owner to market the property.',
    images: [{ id: 'photo-1628624747186-a941c476b7ef', caption: 'Front of the house' }],
    property: {
      propertyType: PropertyType.HOUSE,
      transactionType: TransactionType.FOR_SALE,
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
    status: ListingStatus.CHANGES_REQUESTED,
    author: 'bekele',
    zone: 'Otona',
    ownerDeclaration: 'I am the owner.',
    moderationNotes:
      'Please add the plot size, the number of rooms and at least two more photos (including the inside) before we can publish.',
    images: [{ id: 'photo-1568605114967-8130f3a36994', caption: 'Cottage at dusk' }],
    property: {
      propertyType: PropertyType.HOUSE,
      transactionType: TransactionType.FOR_SALE,
    },
  },
];

async function clearDatabase() {
  // Order matters because of foreign keys.
  await prisma.favorite.deleteMany();
  await prisma.report.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.listingMedia.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.propertyDetails.deleteMany();
  await prisma.vehicleDetails.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.location.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.agencyMember.deleteMany();
  await prisma.agency.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  console.log('Seeding Wolaita Marketplace...');
  await clearDatabase();

  const passwordHash = await bcrypt.hash('DemoPass123!', 10);

  const makeUser = (data: {
    email: string;
    phone: string;
    role: Role;
    fullName: string;
    businessName?: string;
    bio?: string;
    licenseNumber?: string;
    idVerified?: boolean;
    preferredLocale?: string;
    createdAt?: Date;
  }) =>
    prisma.user.create({
      data: {
        email: data.email,
        phone: data.phone,
        passwordHash,
        role: data.role,
        createdAt: data.createdAt,
        profile: {
          create: {
            fullName: data.fullName,
            businessName: data.businessName,
            bio: data.bio,
            licenseNumber: data.licenseNumber,
            idVerified: data.idVerified ?? false,
            preferredLocale: data.preferredLocale ?? 'wal',
          },
        },
      },
    });

  const admin = await makeUser({
    email: 'admin@wolaitamarketplace.et',
    phone: '+251911000001',
    role: Role.ADMIN,
    fullName: 'Sodo Admin Team',
    businessName: 'Wolaita Marketplace Operations',
    idVerified: true,
    createdAt: daysAgo(120),
  });
  const alemu = await makeUser({
    email: 'broker.alemu@wolaitamarketplace.et',
    phone: '+251911000002',
    role: Role.BROKER,
    fullName: 'Alemu Tadesse',
    businessName: 'Sodo Prime Properties',
    bio: 'Licensed real estate broker with 7 years serving Wolaita Sodo families, investors and businesses.',
    licenseNumber: 'WOL-RE-2023-441',
    idVerified: true,
    createdAt: daysAgo(110),
  });
  const selam = await makeUser({
    email: 'broker.selam@wolaitamarketplace.et',
    phone: '+251911000006',
    role: Role.BROKER,
    fullName: 'Selam Ayele',
    businessName: 'Selam Homes & Lettings',
    bio: 'Independent broker specialising in family homes, rentals and warehouses across Sodo.',
    licenseNumber: 'WOL-RE-2024-087',
    idVerified: true,
    preferredLocale: 'am',
    createdAt: daysAgo(80),
  });
  const marta = await makeUser({
    email: 'dealer.marta@wolaitamarketplace.et',
    phone: '+251911000003',
    role: Role.AGENCY_ADMIN,
    fullName: 'Marta Haile',
    businessName: 'Wolaita Sodo Auto Hub',
    bio: 'Vehicle dealer connecting buyers with inspected cars, SUVs and commercial trucks.',
    licenseNumber: 'WOL-AUTO-2022-108',
    idVerified: true,
    preferredLocale: 'am',
    createdAt: daysAgo(100),
  });
  const bekele = await makeUser({
    email: 'seller.bekele@wolaitamarketplace.et',
    phone: '+251911000004',
    role: Role.SELLER,
    fullName: 'Bekele Wolde',
    bio: 'Private owner selling property and vehicles in Wolaita Sodo.',
    idVerified: true,
    createdAt: daysAgo(60),
  });
  const tariku = await makeUser({
    email: 'buyer.tariku@gmail.com',
    phone: '+251911000005',
    role: Role.BUYER,
    fullName: 'Tariku Girmay',
    preferredLocale: 'en',
    createdAt: daysAgo(20),
  });

  const users = { alemu, selam, marta, bekele };

  const prime = await prisma.agency.create({
    data: {
      name: 'Sodo Prime Properties',
      slug: 'sodo-prime-properties',
      phone: '+251911000002',
      email: 'info@sodoprime.et',
      address: 'Commercial Center Bldg, 3rd floor, Mehal Ketema, Wolaita Sodo',
      isVerified: true,
      members: { create: [{ userId: alemu.id, role: 'OWNER' }] },
    },
  });
  const auto = await prisma.agency.create({
    data: {
      name: 'Wolaita Sodo Auto Hub',
      slug: 'wolaita-sodo-auto-hub',
      phone: '+251911000003',
      email: 'sales@sodoautohub.et',
      address: 'Main road showroom, Mehal Ketema, Wolaita Sodo',
      isVerified: true,
      members: { create: [{ userId: marta.id, role: 'OWNER' }] },
    },
  });
  const agencies = { prime, auto };

  const created: Record<string, { id: string; title: string; authorId: string }> = {};

  for (const l of LISTINGS) {
    const status = l.status ?? ListingStatus.PUBLISHED;
    const asset = await prisma.asset.create({
      data: {
        assetType: l.vehicle ? AssetType.VEHICLE : AssetType.REAL_ESTATE,
        ownerDeclaration: l.ownerDeclaration,
        location: {
          create: { city: 'Wolaita Sodo', zone: l.zone, kebele: l.kebele, landmark: l.landmark },
        },
        propertyDetails: l.property ? { create: l.property } : undefined,
        vehicleDetails: l.vehicle ? { create: l.vehicle } : undefined,
      },
    });

    const createdAt = daysAgo((l.publishedDaysAgo ?? 0) + 1);
    const listing = await prisma.listing.create({
      data: {
        assetId: asset.id,
        authorId: users[l.author].id,
        agencyId: l.agency ? agencies[l.agency].id : undefined,
        title: l.title,
        slug: l.slug,
        description: l.description,
        price: l.price,
        currency: 'ETB',
        isNegotiable: l.isNegotiable ?? true,
        status,
        isFeatured: l.isFeatured ?? false,
        viewCount: l.viewCount ?? 0,
        moderationNotes: l.moderationNotes,
        publishedAt: status === ListingStatus.PUBLISHED ? daysAgo(l.publishedDaysAgo ?? 0) : null,
        createdAt,
        media: {
          create: l.images.map((im, i) => ({
            url: img(im.id),
            caption: im.caption,
            isPrimary: i === 0,
            order: i,
          })),
        },
      },
    });
    created[l.slug] = { id: listing.id, title: listing.title, authorId: listing.authorId };
  }
  console.log(`Created ${LISTINGS.length} listings.`);

  // ─── Leads, viewings and deals ─────────────────────────────
  const home = created['modern-g1-family-home-mehal-ketema'];
  const camry = created['toyota-camry-2019-hybrid'];
  const villa = created['elegant-3-bedroom-villa-otona'];
  const shop = created['commercial-retail-shop-arada-market'];
  const plot = created['250m2-residential-plot-boditi-road'];

  const lead1 = await prisma.lead.create({
    data: {
      listingId: home.id,
      assignedUserId: alemu.id,
      customerName: 'Ato Solomon Mengistu',
      customerPhone: '+251912883344',
      customerEmail: 'solomon.m@gmail.com',
      budgetMin: 7_000_000,
      budgetMax: 7_600_000,
      message: 'I am very interested in the G+1 home. Can we arrange a viewing this Saturday afternoon?',
      stage: LeadStage.VIEWING_SCHEDULED,
      notes: 'Works at Wolaita Sodo University. Bank financing pre-approved.',
      nextFollowUpAt: daysAhead(2),
      createdAt: daysAgo(3),
    },
  });
  await prisma.lead.create({
    data: {
      listingId: shop.id,
      assignedUserId: alemu.id,
      customerName: 'Hirut Bekele',
      customerPhone: '+251916220011',
      message: 'Is the Arada shop suitable for a pharmacy? What is the minimum lease term?',
      stage: LeadStage.NEW_INQUIRY,
      createdAt: daysAgo(0.3),
    },
  });
  await prisma.lead.create({
    data: {
      listingId: home.id,
      assignedUserId: alemu.id,
      customerName: 'Dawit Lemma',
      customerPhone: '+251917556677',
      budgetMax: 7_200_000,
      message: 'Would the owner accept 7.2M with a quick cash payment?',
      stage: LeadStage.NEGOTIATION,
      notes: 'Diaspora buyer, wants a video call walkthrough.',
      createdAt: daysAgo(5),
    },
  });
  await prisma.lead.create({
    data: {
      listingId: camry.id,
      assignedUserId: marta.id,
      customerName: 'W/ro Aster Kebede',
      customerPhone: '+251913445566',
      customerEmail: 'aster.k@outlook.com',
      budgetMin: 5_500_000,
      budgetMax: 5_900_000,
      message: 'Is the Camry still available for a test drive this week?',
      stage: LeadStage.NEW_INQUIRY,
      createdAt: daysAgo(0.5),
    },
  });
  await prisma.lead.create({
    data: {
      listingId: villa.id,
      assignedUserId: selam.id,
      buyerId: tariku.id,
      customerName: 'Tariku Girmay',
      customerPhone: '+251911000005',
      customerEmail: 'buyer.tariku@gmail.com',
      budgetMax: 12_000_000,
      message: 'Hello Selam, does the villa have a title deed in the owner’s name? I would like to visit.',
      stage: LeadStage.CONTACTED,
      createdAt: daysAgo(1),
    },
  });
  await prisma.lead.create({
    data: {
      listingId: plot.id,
      assignedUserId: bekele.id,
      customerName: 'Mesfin Abebe',
      customerPhone: '+251918909090',
      message: 'Can I see the land documents before visiting the plot?',
      stage: LeadStage.NEW_INQUIRY,
      createdAt: daysAgo(0.8),
    },
  });

  await prisma.appointment.create({
    data: {
      leadId: lead1.id,
      listingId: home.id,
      brokerId: alemu.id,
      title: 'Viewing: G+1 house with Ato Solomon',
      scheduledAt: daysAhead(2),
      status: AppointmentStatus.CONFIRMED,
      locationNotes: 'Meet at the Commercial Bank entrance, then walk to the compound.',
    },
  });
  await prisma.appointment.create({
    data: {
      listingId: shop.id,
      brokerId: alemu.id,
      title: 'Viewing: Arada shop with Hirut',
      scheduledAt: daysAhead(4),
      status: AppointmentStatus.CONFIRMED,
      locationNotes: 'Meet in front of the shop.',
    },
  });

  await prisma.deal.create({
    data: {
      listingId: home.id,
      leadId: lead1.id,
      brokerId: alemu.id,
      agreedPrice: 7_500_000,
      commissionExpected: 150_000,
      commissionPaid: 0,
      status: DealStatus.IN_PROGRESS,
      notes: 'Contract draft prepared; notary appointment pending.',
    },
  });
  await prisma.deal.create({
    data: {
      listingId: shop.id,
      brokerId: alemu.id,
      agreedPrice: 336_000,
      commissionExpected: 28_000,
      commissionPaid: 28_000,
      status: DealStatus.COMPLETED,
      notes: 'One-year lease signed (one month commission).',
      createdAt: daysAgo(30),
    },
  });

  // ─── Saved listings for the demo buyer ─────────────────────
  for (const slug of ['elegant-3-bedroom-villa-otona', 'toyota-camry-2019-hybrid', 'family-house-for-rent-ligaba']) {
    await prisma.favorite.create({ data: { userId: tariku.id, listingId: created[slug].id } });
  }

  // ─── Reports ───────────────────────────────────────────────
  await prisma.report.create({
    data: {
      listingId: plot.id,
      reporterEmail: 'buyer.tariku@gmail.com',
      reporterPhone: '+251911000005',
      reason: ReportReason.INCORRECT_PRICE,
      details: 'The listing says 2.4M ETB but the seller quoted 2.5M ETB on the phone. Please check.',
      status: ReportStatus.OPEN,
    },
  });

  // ─── Platform settings ─────────────────────────────────────
  const settings = [
    { key: 'platform_name', value: 'Wolaita Marketplace', description: 'Public platform name' },
    { key: 'default_currency', value: 'ETB', description: 'Display currency' },
    { key: 'support_phone', value: '+251900000000', description: 'Customer support phone' },
    { key: 'support_email', value: 'contact@wolaitamarketplace.et', description: 'Support email' },
    { key: 'sodo_commission_rate', value: '2.0', description: 'Standard commission rate (%)' },
  ];
  for (const s of settings) {
    await prisma.platformSetting.upsert({ where: { key: s.key }, update: s, create: s });
  }

  // ─── Audit trail ───────────────────────────────────────────
  await prisma.auditLog.createMany({
    data: [
      {
        actorId: admin.id,
        action: 'BROKER_VERIFIED',
        entityType: 'User',
        entityId: alemu.id,
        metadataJson: JSON.stringify({ note: 'License WOL-RE-2023-441 verified.' }),
        createdAt: daysAgo(100),
      },
      {
        actorId: admin.id,
        action: 'LISTING_APPROVED',
        entityType: 'Listing',
        entityId: home.id,
        metadataJson: JSON.stringify({ title: home.title, note: 'Title deed checked with the municipal desk.' }),
        createdAt: daysAgo(4),
      },
      {
        actorId: admin.id,
        action: 'LISTING_CHANGES_REQUESTED',
        entityType: 'Listing',
        entityId: created['mountain-view-cottage-damota'].id,
        metadataJson: JSON.stringify({ title: 'Mountain-View Cottage on the Damota Slopes', note: 'Needs more details and photos.' }),
        createdAt: daysAgo(1),
      },
    ],
  });

  console.log('Seed complete. Demo password for every account: DemoPass123!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
