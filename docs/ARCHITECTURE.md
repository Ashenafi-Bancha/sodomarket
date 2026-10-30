# Architecture: Wolaita Marketplace

## Overview

One Next.js 16 app (`apps/web`) serves both the website and the REST API, backed by PostgreSQL through Prisma.

```
SodoMarketHub/
├── apps/web/src/
│   ├── app/                 Pages (App Router) and the REST API under app/api/v1
│   ├── components/          UI kit (ui/), layout, listing, sell wizard, workspace, admin, auth
│   ├── lib/
│   │   ├── server/          Server-only code: db client, session, data queries, validation
│   │   ├── i18n-*.ts        Language: cookie on the server, context on the client
│   │   └── types.ts         Shared types used by server and client
│   └── locales/             en (base), am, wal — missing keys fall back to English
├── prisma/                  schema.prisma, migrations/, seed.ts
├── apps/api/                Earlier NestJS placeholder — not used
└── docs/
```

## How a page is built

- Pages are **server components**. They read the visitor's session (`lib/server/session.ts`) and language cookie, then query the database directly through `lib/server/listings.ts` and `lib/server/workspace.ts`.
- Interactive parts (filters, gallery, contact forms, wizard, workspace tabs) are **client components**. They change data by calling the REST API (`lib/api-client.ts`) and then `router.refresh()` so server data re-renders.
- Browse filters live in the URL (`?zone=Arada&category=HOUSE&sort=price_asc`), so searches can be shared and the back button works.

## Data model (Prisma)

`User` → `UserProfile`; `Listing` → `Asset` → `Location` + `PropertyDetails` | `VehicleDetails`; `ListingMedia`;
`Lead` (inquiries, linked to the seller and optionally the buyer's account); `Appointment` (viewings, status `REQUESTED` → `CONFIRMED` → `COMPLETED`);
`Deal`; `Report`; `Favorite`; `Agency` / `AgencyMember`; `AuditLog`.

## Listing lifecycle

1. Seller submits → `PENDING_REVIEW` (a buyer account becomes a seller automatically).
2. Admin approves → `PUBLISHED` (or `CHANGES_REQUESTED` / `REJECTED` with a note the seller sees).
3. Editing a listing sends it back to review.
4. Owner can switch between `PUBLISHED`, `SOLD`, `RENTED` and `UNAVAILABLE`; completing a deal marks it sold/rented.

## Inquiry flow

Visitor sends a message or viewing request (no account needed) → a `Lead` is created for the listing's author
(plus a `REQUESTED` appointment for viewings) → it appears in the seller's workspace → seller moves it through stages,
confirms the viewing, and records a deal with commission.

## Security

- Sessions: HMAC-signed, http-only, same-site cookies (`SESSION_SECRET`); bcrypt password hashes.
- Every write endpoint checks ownership or the admin role on the server.
- Input validated with Zod; Ethiopian phone numbers normalised to `+2519…` / `+2517…`.
- Rate limits on login, sign-up, inquiries, reports and uploads (in-memory, per server).
- Uploads: type checked from file bytes (JPG/PNG/WebP only), 6 MB limit, random file names. Stored in Vercel Blob when `BLOB_READ_WRITE_TOKEN` is set, otherwise on disk in `UPLOAD_DIR`.
- Unpublished listings are visible only to their owner and admins.

## API (all under `/api/v1`)

| Endpoint | Purpose |
| --- | --- |
| `POST auth/register`, `auth/login`, `auth/logout`, `GET auth/me` | Accounts and sessions |
| `PATCH account` | Profile, phone, password |
| `GET/POST listings`, `GET/PATCH/DELETE listings/:id` | Search, create, edit, change status, delete |
| `POST listings/:id/favorite` | Save / unsave |
| `POST uploads`, `GET uploads/:file` | Photo upload and serving |
| `GET/POST leads`, `PATCH leads/:id` | Inquiries |
| `GET/POST appointments`, `PATCH appointments/:id` | Viewings |
| `GET/POST deals`, `PATCH deals/:id` | Deals and commission |
| `GET/POST reports`, `PATCH reports/:id` | Listing reports |
| `POST admin/listings/:id`, `PATCH admin/users/:id` | Moderation and user management |
