# SRIS Cloudflare Worker Deployment

This is the Cloudflare-first SRIS runtime:

- Worker serves the SRIS console and JSON API.
- D1 stores universities, programs, professors, labs, papers, review candidates, timeline tasks, and radar sources.
- Cron trigger runs arXiv ingest daily.
- A browser-local API token protects the private console.

## Local CLI Path

```bash
cd apps/worker
npm install -D wrangler
npx wrangler login
npx wrangler d1 create sris-db
```

Put the returned D1 `database_id` into `wrangler.jsonc`, then run:

```bash
npx wrangler d1 migrations apply sris-db --remote
npx wrangler secret put API_TOKEN
npx wrangler secret put CRON_SECRET
npx wrangler deploy
```

Open the Worker URL, enter `API_TOKEN`, and the console will use D1-backed data.

## GitHub Actions Path

Create a private GitHub repository and add these repository secrets:

- `CLOUDFLARE_API_TOKEN`: Cloudflare API token with Workers edit and D1 edit permissions.
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare account ID.
- `CLOUDFLARE_D1_DATABASE_ID`: the D1 database id returned by `wrangler d1 create sris-db` or shown in the D1 dashboard.
- `SRIS_API_TOKEN`: private token you will enter in the SRIS browser console.
- `SRIS_CRON_SECRET`: private token for cron/manual ingest calls.

Then push to `main`. `.github/workflows/cloudflare-worker.yml` will:

1. Patch `wrangler.toml` / `wrangler.jsonc` with `CLOUDFLARE_D1_DATABASE_ID`.
2. Apply D1 migrations.
3. Generate a temporary `.secrets.json` inside the GitHub runner.
4. Deploy the Worker with `wrangler deploy --secrets-file .secrets.json`.

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
- `POST /api/admin/init` with `x-cron-secret`, useful if migrations were not applied by CLI

The console uses `Authorization: Bearer <API_TOKEN>`.
