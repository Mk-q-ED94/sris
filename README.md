# SGU Research Intelligence System (SRIS)

SRIS is a private, long-term research intelligence console for Japanese SGU / AI master's applications. It combines a dense Next.js dashboard, FastAPI data service, Supabase PostgreSQL/Auth, and semi-automated arXiv RSS ingestion with a review queue.

## Stack

- Web: Next.js 15, React, TypeScript, TailwindCSS, local shadcn-style UI primitives
- API: FastAPI, SQLAlchemy async, PostgreSQL, Supabase JWT verification
- Data: Supabase PostgreSQL migrations and seed SQL
- Automation: Cron-protected arXiv ingest endpoint, callable from GitHub Actions or Render Cron
- Deploy: Vercel for `apps/web`, Render for `apps/api`

## Cloudflare Option

`apps/worker` contains a Cloudflare-first deployment that serves the console, API, D1 storage, and cron ingest from one Worker. This is the recommended low-cost path for the personal SRIS deployment.

See [apps/worker/README.md](apps/worker/README.md).

## Local Setup

```bash
npm install
uv sync --project apps/api
cp .env.example .env
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
```

Run the services:

```bash
npm run dev:web
npm run dev:api
```

Apply database migrations with Supabase CLI or your SQL editor:

```bash
supabase db push
```

Then run `supabase/seed/001_initial_seed.sql` once for the target universities, timeline examples, and arXiv radar sources.

## Environment

The API expects `DATABASE_URL`, `SUPABASE_JWT_SECRET`, `ALLOWED_USER_EMAIL`, and `CRON_SECRET`. The web app expects `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_API_URL`.

If Supabase or API env vars are missing locally, the web app falls back to read-only demo data so the UI can still be inspected.
