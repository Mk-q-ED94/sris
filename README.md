# SGU Research Intelligence System (SRIS)

SRIS is a private, long-term research intelligence console for Japanese SGU / AI master's applications. It combines a dense Next.js dashboard, FastAPI data service, Supabase PostgreSQL/Auth, and semi-automated arXiv RSS ingestion with a review queue.

## Stack

- Web: Next.js 15, React, TypeScript, TailwindCSS, local shadcn-style UI primitives
- API: FastAPI, SQLAlchemy async, PostgreSQL, Supabase JWT verification
- Data: Supabase PostgreSQL migrations and seed SQL
- Automation: Cron-protected arXiv ingest endpoint, callable from GitHub Actions or Render Cron
- Deploy: Vercel for `apps/web`, Render for `apps/api`

## Deployment Paths

SRIS supports two deployment paths. **The Cloudflare path is the primary one**; the Vercel + Render + Supabase path is kept as a reference / fallback but is no longer scheduled by CI.

### Cloudflare (primary)

`apps/worker` serves the console, API, D1 storage, and cron ingest from a single Worker. Deployment is automated via `.github/workflows/cloudflare-worker.yml` on push to `main`. The daily arXiv ingest is triggered by the Worker's own cron at `15 23 * * *` (see `apps/worker/wrangler.jsonc`).

See [apps/worker/README.md](apps/worker/README.md).

### Vercel + Render + Supabase (legacy)

`apps/web` (Next.js on Vercel) + `apps/api` (FastAPI on Render) + `supabase/` (Postgres schema). No cron is scheduled for this path — if you re-activate it, add a single cron source (Render cron job or GitHub Action) and make sure the Cloudflare path is disabled to avoid duplicate ingest. The Supabase migration schema may have drifted from the D1 schema; treat D1 (`apps/worker/migrations/`) as authoritative.

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
