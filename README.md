# Wolaita Marketplace — Sodo Market Hub

The digital marketplace for homes, land, shops, offices and vehicles in **Wolaita Sodo, Ethiopia**.
Every listing is reviewed before it goes live, buyers contact verified owners and licensed brokers directly,
and the whole site works in **Wolaytta, Amharic and English**.

## What's inside

| For | Features |
| --- | --- |
| Buyers & tenants | Search with filters (zone, price, bedrooms, year, fuel…), sort, save favourites, call / WhatsApp / message sellers, book viewings — no account needed to contact a seller |
| Owners, brokers & dealers | 5-step listing wizard with photo upload (photos are shrunk in the browser to save data), draft saved on the device, edit & resubmit, mark as sold / rented / hidden |
| Workspace | Inquiry pipeline with stages and private notes, viewing calendar (confirm / complete / cancel buyer requests), deals & commission tracking, saved listings, sent messages, profile & password |
| Admins | Review queue (approve / request changes / reject, duplicate warnings), reports (resolve, take listing down), user verification / suspension / roles, audit trail |
| Everyone | Phone-first design with bottom navigation, SEO (metadata, sitemap, structured data), 3 languages |

## Tech

- **Next.js 16** (App Router) + React 19 + Tailwind CSS 4 — in `apps/web`
- **PostgreSQL** via **Prisma 6** — schema, migrations and seed in `prisma/`
- REST API at `/api/v1/*` (route handlers in `apps/web/src/app/api/v1`)
- Secure sessions: signed, http-only cookies; passwords hashed with bcrypt; rate limiting on login, sign-up, inquiries and reports

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for how it fits together.

## Run it locally

Requirements: Node.js 20.9+.

```bash
npm install
```

**1. Database.** Either use your own PostgreSQL, or start the built-in local one (no install, no password):

```bash
npm run db:local
```

Keep that terminal open. It prints a `DATABASE_URL` (normally `postgres://postgres:postgres@localhost:51218/template1?...`).

**2. Environment.** Copy `.env.example` to **both** `.env` (repo root) and `apps/web/.env.local`, then set `DATABASE_URL` and `SESSION_SECRET`.

**3. Create tables and demo data:**

```bash
npm run db:migrate
```

```bash
npm run db:seed
```

**4. Start the app** at http://localhost:3000:

```bash
npm run dev
```

### Demo accounts

All use the password `DemoPass123!` (and appear as one-click buttons on the sign-in page while `NEXT_PUBLIC_DEMO_MODE=true`).

| Role | Email |
| --- | --- |
| Admin | admin@wolaitamarketplace.et |
| Broker | broker.alemu@wolaitamarketplace.et |
| Broker | broker.selam@wolaitamarketplace.et |
| Car dealer | dealer.marta@wolaitamarketplace.et |
| Private owner | seller.bekele@wolaitamarketplace.et |
| Buyer | buyer.tariku@gmail.com |

## Useful scripts (repo root)

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the web app in development |
| `npm run build` / `npm start` | Production build / serve |
| `npm run db:local` | Start the zero-setup local Postgres |
| `npm run db:migrate` | Apply database migrations |
| `npm run db:seed` | Reset marketplace data to the demo catalogue |
| `npm run db:studio` | Browse the database in Prisma Studio |

## Going to production

1. Use a managed PostgreSQL and set `DATABASE_URL`.
2. Set a long random `SESSION_SECRET` and `NEXT_PUBLIC_APP_URL` (your real domain).
3. Set `NEXT_PUBLIC_DEMO_MODE=false`, and don't run the seed (or change the demo passwords).
4. Photos: set `BLOB_READ_WRITE_TOKEN` to store them in Vercel Blob, or point `UPLOAD_DIR` at a persistent disk.
5. `npm run db:migrate`, then `npm run build` and `npm start`.

### Deploy on Vercel

`vercel.json` deploys one service, `web` (`apps/web`), which serves the whole site including the `/api/v1` API.

1. Import the repo in Vercel (keep the project's root directory as the repo root — `vercel.json` points at `apps/web`).
2. Create a managed Postgres (for example Neon or Prisma Postgres from the Vercel Marketplace) and a **Blob** store under Storage. These set `DATABASE_URL` and `BLOB_READ_WRITE_TOKEN`.
3. Add environment variables: `SESSION_SECRET` (long random string), `NEXT_PUBLIC_APP_URL` (your domain), `NEXT_PUBLIC_DEMO_MODE=false`, and the branding variables from `.env.example`.
4. Create the tables once from your computer, with `DATABASE_URL` in `.env` pointing at the production database: `npm run db:migrate`.
5. Deploy. Use `vercel dev` to run it locally the same way Vercel does.

## Notes

- `apps/api` (NestJS) is an earlier placeholder and is **not used** or deployed — the Next.js app serves the API.
- Wolaytta translations for newer screens are partial and fall back to English; they should be reviewed by a native speaker (`apps/web/src/locales/wal-extra.ts`).
- The demo catalogue uses stock photos; replace them with real listings before launch.
