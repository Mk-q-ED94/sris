# SRIS Cloudflare Worker

The SRIS runtime: a single Cloudflare Worker that serves the console, the JSON API, the D1-backed data model, and the daily arXiv ingest cron.

## Module layout

```
apps/worker/
├── src/
│   ├── index.ts          # fetch + scheduled entry
│   ├── env.ts            # Env bindings (D1, secrets)
│   ├── http.ts           # json / htmlResponse / HttpError
│   ├── auth.ts           # API token + cron secret checks
│   ├── db/
│   │   ├── tables.ts     # TABLES config drives the generic CRUD router
│   │   ├── queries.ts    # listRows / countRows / createRow
│   │   ├── normalize.ts  # JSON-field parsing, enabled→boolean
│   │   └── schema.ts     # SCHEMA_SQL + SEED_SQL (used by /api/admin/init)
│   ├── routes/
│   │   ├── dashboard.ts
│   │   ├── review.ts     # acceptCandidate / ignoreCandidate
│   │   └── crud.ts       # TABLES-driven GET/POST router
│   ├── ingest/
│   │   ├── index.ts      # runIngest with adapter registry
│   │   ├── arxiv.ts      # arXiv feed adapter + parser
│   │   └── shared.ts     # PaperCandidate, keywordMatches, XML helpers
│   └── console/
│       ├── app.html      # static console (imported via wrangler Text rule)
│       └── html.d.ts
├── tests/                # vitest pure-function tests
├── migrations/           # D1 SQL migrations
├── wrangler.jsonc        # production + env.staging
├── tsconfig.json
└── vitest.config.ts
```

## Local CLI Path

```bash
cd apps/worker
npm install
npx wrangler login
npx wrangler d1 create sris-db
```

Put the returned D1 `database_id` into `wrangler.jsonc`, then:

```bash
npx wrangler d1 migrations apply sris-db --remote
npx wrangler secret put API_TOKEN
npx wrangler secret put CRON_SECRET
npm run deploy
```

Open the Worker URL, enter `API_TOKEN`, and the console will use D1-backed data.

## Scripts

| Command              | Purpose                                                    |
| -------------------- | ---------------------------------------------------------- |
| `npm run dev`        | `wrangler dev` (local with miniflare-backed D1)            |
| `npm run typecheck`  | `tsc --noEmit`                                             |
| `npm test`           | `vitest run` over `tests/**`                               |
| `npm run deploy`     | Deploy to production (default env)                         |
| `npm run deploy:staging` | Deploy to the `staging` env (separate D1 binding)      |

## Multi-environment

`wrangler.jsonc` defines a `staging` environment with its own Worker name and D1 binding. Use it to test schema changes before touching the production database. The staging env has `crons: []` so the daily ingest only fires in production.

To deploy staging:

```bash
npx wrangler d1 create sris-db-staging
# put the new id into wrangler.jsonc under env.staging.d1_databases[0].database_id
npm run deploy:staging
```

## GitHub Actions Path

Repository secrets:

- `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_D1_DATABASE_ID`
- `SRIS_API_TOKEN`, `SRIS_CRON_SECRET`

On push to `main`, `.github/workflows/cloudflare-worker.yml` patches the D1 id, applies migrations, then runs `wrangler deploy --secrets-file .secrets.json`. PRs and pushes also run `.github/workflows/ci.yml` (type-check, vitest, `wrangler deploy --dry-run`).

## Migrations

D1 migrations live in `apps/worker/migrations/`. Wrangler only supports forward `apply`; there is no automatic `down`. Before applying anything that drops or rewrites columns, back up first:

```bash
# 1. Export current production data
npx wrangler d1 export sris-db --remote --output backup-$(date -u +%Y%m%dT%H%M%SZ).sql

# 2. Apply migration to staging and verify the app still works
npx wrangler d1 migrations apply sris-db-staging --remote --env staging
npm run deploy:staging

# 3. Apply migration to production
npx wrangler d1 migrations apply sris-db --remote

# 4. If something breaks: recreate from backup
#    (D1 has no in-place restore; create a new DB and load the .sql file)
```

## Adding a new ingest source

`src/ingest/index.ts` registers adapters by `source_type`. To add a new source (e.g. OpenReview, RSS):

1. Create `src/ingest/<name>.ts` exporting a function `(source: RadarSource) => Promise<PaperCandidate[] | null>`.
2. Register it in the `ADAPTERS` record at the top of `src/ingest/index.ts`.
3. Insert rows into `radar_sources` with `source_type = '<name>'`.

The dispatcher in `runIngest` will pick them up automatically.

## API

- `GET /api/health`
- `GET /api/dashboard`
- `GET|POST /api/universities`
- `GET|POST /api/professors`
- `GET|POST /api/labs`
- `GET|POST /api/programs`
- `GET|POST /api/papers`
- `GET|POST /api/timeline`
- `GET|POST /api/radar-sources`
- `GET /api/review/papers`
- `POST /api/review/papers/:id/accept`
- `POST /api/review/papers/:id/ignore`
- `POST /api/ingest/arxiv/run` with `x-cron-secret`
- `POST /api/admin/init` with `x-cron-secret` (re-runs `SCHEMA_SQL + SEED_SQL`)

The console uses `Authorization: Bearer <API_TOKEN>`.
