import { prisma } from '@/lib/server/db';
import { handle, ok, parseBody, requireUser } from '@/lib/server/api';
import { parseSearchParams, searchListings, uniqueSlug } from '@/lib/server/listings';
import { assetDetailsData, listingInputSchema, mediaData } from '@/lib/server/listing-input';
import { listingInclude, mapListing } from '@/lib/server/mappers';
import { audit } from '@/lib/server/workspace';

/** Public search of published listings. Accepts the same query params as the browse pages. */
export const GET = handle(async (request: Request) => {
  const url = new URL(request.url);
  const params = parseSearchParams(Object.fromEntries(url.searchParams));
  const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get('pageSize')) || 12));
  return ok(await searchListings({ ...params, pageSize }));
});

/** Creates a listing. Every listing goes through moderation before it is public. */
export const POST = handle(async (request: Request) => {
  const user = await requireUser();
  const input = await parseBody(request, listingInputSchema);
  const { property, vehicle } = assetDetailsData(input);

  const agency = await prisma.agencyMember.findFirst({ where: { userId: user.id }, select: { agencyId: true } });

  const listing = await prisma.listing.create({
    data: {
      title: input.title,
      slug: await uniqueSlug(input.title),
      description: input.description,
      price: input.price,
      isNegotiable: input.isNegotiable,
      status: 'PENDING_REVIEW',
      author: { connect: { id: user.id } },
      agency: agency ? { connect: { id: agency.agencyId } } : undefined,
      asset: {
        create: {
          assetType: input.assetType,
          ownerDeclaration: input.ownerDeclaration,
          location: { create: { city: 'Wolaita Sodo', ...input.location } },
          propertyDetails: property ? { create: property } : undefined,
          vehicleDetails: vehicle ? { create: vehicle } : undefined,
        },
      },
      media: { create: mediaData(input) },
    },
    include: listingInclude,
  });

  // A buyer who lists something becomes a seller.
  if (user.role === 'BUYER') {
    await prisma.user.update({ where: { id: user.id }, data: { role: 'SELLER' } });
  }
  await audit(user.id, 'LISTING_SUBMITTED', 'Listing', listing.id, { title: listing.title });
  return ok(mapListing(listing), { status: 201 });
});
