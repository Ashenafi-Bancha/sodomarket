import 'server-only';
import { prisma } from './db';
import {
  appointmentInclude,
  auditInclude,
  dealInclude,
  leadInclude,
  listingInclude,
  mapAppointment,
  mapAudit,
  mapDeal,
  mapLead,
  mapListing,
  mapReport,
  mapUser,
  reportInclude,
  userInclude,
} from './mappers';
import type { User } from '@/lib/types';

export async function audit(
  actorId: string | null,
  action: string,
  entityType: string,
  entityId: string | undefined,
  metadata?: Record<string, unknown>
) {
  await prisma.auditLog.create({
    data: {
      actorId,
      action,
      entityType,
      entityId,
      metadataJson: metadata ? JSON.stringify(metadata) : undefined,
    },
  });
}

/** Everything the signed-in user's workspace needs, in one round of queries. */
export async function getWorkspaceData(user: User) {
  const [listings, leads, appointments, deals, favorites, inquiries] = await Promise.all([
    prisma.listing.findMany({
      where: { authorId: user.id },
      include: listingInclude,
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.lead.findMany({
      where: { assignedUserId: user.id },
      include: leadInclude,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.appointment.findMany({
      where: { brokerId: user.id },
      include: appointmentInclude,
      orderBy: { scheduledAt: 'asc' },
    }),
    prisma.deal.findMany({ where: { brokerId: user.id }, include: dealInclude, orderBy: { createdAt: 'desc' } }),
    prisma.favorite.findMany({
      where: { userId: user.id },
      include: { listing: { include: listingInclude } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.lead.findMany({ where: { buyerId: user.id }, include: leadInclude, orderBy: { createdAt: 'desc' } }),
  ]);

  return {
    listings: listings.map(mapListing),
    leads: leads.map(mapLead),
    appointments: appointments.map(mapAppointment),
    deals: deals.map(mapDeal),
    favorites: favorites.filter((f) => f.listing.status === 'PUBLISHED').map((f) => mapListing(f.listing)),
    inquiries: inquiries.map(mapLead),
  };
}

export async function getAdminData() {
  const [pending, reports, users, auditLogs, counts] = await Promise.all([
    prisma.listing.findMany({
      where: { status: 'PENDING_REVIEW' },
      include: listingInclude,
      orderBy: { createdAt: 'asc' },
    }),
    prisma.report.findMany({ include: reportInclude, orderBy: [{ status: 'asc' }, { createdAt: 'desc' }], take: 100 }),
    prisma.user.findMany({
      include: { ...userInclude, _count: { select: { listings: true } } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    }),
    prisma.auditLog.findMany({ include: auditInclude, orderBy: { createdAt: 'desc' }, take: 60 }),
    Promise.all([
      prisma.listing.count({ where: { status: 'PUBLISHED' } }),
      prisma.listing.count({ where: { status: 'PENDING_REVIEW' } }),
      prisma.report.count({ where: { status: { in: ['OPEN', 'UNDER_REVIEW'] } } }),
      prisma.user.count(),
      prisma.lead.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 86_400_000) } } }),
    ]),
  ]);

  // Flag possible duplicates: other listings with the same title.
  const titles = pending.map((p) => p.title);
  const sameTitle = titles.length
    ? await prisma.listing.findMany({
        where: { title: { in: titles }, status: { not: 'PENDING_REVIEW' } },
        select: { title: true },
      })
    : [];
  const duplicateTitles = new Set(sameTitle.map((s) => s.title));

  const [published, pendingCount, openReports, userCount, leadsThisWeek] = counts;
  return {
    pending: pending.map((p) => ({ ...mapListing(p), possibleDuplicate: duplicateTitles.has(p.title) })),
    reports: reports.map(mapReport),
    users: users.map((u) => ({ ...mapUser(u), listingCount: u._count.listings })),
    auditLogs: auditLogs.map(mapAudit),
    stats: { published, pending: pendingCount, openReports, userCount, leadsThisWeek },
  };
}
