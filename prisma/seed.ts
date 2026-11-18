/**
 * Seed data for Zamana Market (Wolaita Sodo).
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
  ListingStatus,
  LeadStage,
  AppointmentStatus,
  DealStatus,
  ReportReason,
  ReportStatus,
} from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AGENCIES, FEATURES, LISTINGS, SELLERS, imageUrl, type SellerKey } from '../apps/web/src/lib/demo/catalogue';

const prisma = new PrismaClient();

const DAY = 86_400_000;
const daysAgo = (n: number) => new Date(Date.now() - n * DAY);
const daysAhead = (n: number) => new Date(Date.now() + n * DAY);
const img = imageUrl;

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
  console.log('Seeding Zamana Market...');
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
    email: 'admin@zamanamarket.et',
    phone: '+251911000001',
    role: Role.ADMIN,
    fullName: 'Sodo Admin Team',
    businessName: 'Zamana Market Operations',
    idVerified: true,
    createdAt: daysAgo(120),
  });
  // Sellers come from the shared catalogue (also used by the site's preview mode).
  const makeSeller = (key: SellerKey) => {
    const { joinedDaysAgo, ...seller } = SELLERS[key];
    return makeUser({ ...seller, createdAt: daysAgo(joinedDaysAgo) });
  };
  const alemu = await makeSeller('alemu');
  const selam = await makeSeller('selam');
  const marta = await makeSeller('marta');
  const bekele = await makeSeller('bekele');
  const tariku = await makeUser({
    email: 'buyer.tariku@gmail.com',
    phone: '+251911000005',
    role: Role.BUYER,
    fullName: 'Tariku Girmay',
    preferredLocale: 'en',
    createdAt: daysAgo(20),
  });

  const users = { alemu, selam, marta, bekele };

  const makeAgency = (key: keyof typeof AGENCIES) => {
    const { owner, ...agency } = AGENCIES[key];
    return prisma.agency.create({
      data: { ...agency, isVerified: true, members: { create: [{ userId: users[owner].id, role: 'OWNER' }] } },
    });
  };
  const prime = await makeAgency('prime');
  const auto = await makeAgency('auto');
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
        propertyDetails: l.property ? { create: { ...l.property, features: FEATURES[l.slug] ?? [] } } : undefined,
        vehicleDetails: l.vehicle ? { create: { ...l.vehicle, features: FEATURES[l.slug] ?? [] } } : undefined,
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
    { key: 'platform_name', value: 'Zamana Market', description: 'Public platform name' },
    { key: 'default_currency', value: 'ETB', description: 'Display currency' },
    { key: 'support_phone', value: '+251900000000', description: 'Customer support phone' },
    { key: 'support_email', value: 'contact@zamanamarket.et', description: 'Support email' },
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
