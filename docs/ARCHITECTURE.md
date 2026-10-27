# System Architecture: Wolaita Marketplace

## 1. High-Level Architecture Overview

The system is organized as a modular monorepo:

```
SodoMarketHub/
├── apps/
│   ├── web/                    # Next.js 16 (App Router, React 19, Tailwind CSS, Turbopack)
│   │   ├── src/
│   │   │   ├── app/            # Public Marketplace, CRM Workspace, Admin Center, REST API v1
│   │   │   ├── components/     # UI Design System, Listings, Wizard, Dashboard, Admin
│   │   │   ├── lib/            # Types, Config, Formatters, Store, Auth & I18n Contexts
│   │   │   └── locales/        # Wolaytta (wal), Amharic (am), English (en) dictionaries
│   │
│   └── api/                    # NestJS Modular Monolith API
│       └── src/
│           ├── modules/        # Listings, Leads, Appointments, Admin
│           └── main.ts         # Swagger OpenAPI docs at /api/docs
│
├── prisma/                     # Database Schema, Migrations, Seed Fixtures
│   ├── schema.prisma           # PostgreSQL Normalized Data Model
│   └── seed.ts                 # Realistic Wolaita Sodo Fixtures
│
└── docs/                       # Architecture, Database, API, Deployment, Testing
```

## 2. Frontend Design Principles
- **Aesthetic**: Premium dark forest emerald (`#1b4332`), warm amber accents (`#d97706`), clean slate surfaces.
- **Mobile First**: Fluid responsive layouts, large touch targets, compressed images.
- **Client & Server Integration**: Next.js App Router with Server-Side Rendering (SSR) and Static Site Generation (SSG) for public SEO listing pages.

## 3. Data Flow & Lead Routing
1. Public visitor views a property or vehicle on `/properties/[slug]` or `/vehicles/[slug]`.
2. Visitor submits an inquiry via `InquiryModal`.
3. The lead is created in the database and automatically routed to the responsible broker.
4. Broker views lead in `/dashboard`, moves stage (`Contacted` -> `Viewing Scheduled`), schedules on-site viewing.
5. Once negotiated, broker records deal with agreed price and 2% standard advisory commission.
