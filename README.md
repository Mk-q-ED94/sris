# SGU Research Intelligence System (SRIS)

A private, single-tenant research intelligence console for Japanese SGU / AI master's applications. Runs entirely on Cloudflare: one Worker serving the console UI, the JSON API, the daily arXiv ingest cron, and a D1 database.

## Architecture

```
┌──────────────────────────────────────────────┐
│ Cloudflare Worker (apps/worker)              │
│  ┌────────────────────────────────────────┐  │
│  │ fetch:     console HTML + /api/*       │  │
│  │ scheduled: daily 23:15 UTC arXiv ingest│  │
│  └────────────────────────────────────────┘  │
│                    │                         │
│              ┌─────▼──────┐                  │
│              │ D1: sris-db│                  │
│              └────────────┘                  │
└──────────────────────────────────────────────┘
```

All deployment-relevant docs live in [`apps/worker/README.md`](apps/worker/README.md).

## Quick start

```bash
cd apps/worker
npm install
npx wrangler login
npx wrangler d1 create sris-db   # → put returned id into wrangler.jsonc
npx wrangler d1 migrations apply sris-db --remote
npx wrangler secret put API_TOKEN
npx wrangler secret put CRON_SECRET
npm run deploy
```

## Repository scripts

From the repository root:

| Command            | Purpose                                  |
| ------------------ | ---------------------------------------- |
| `npm run dev`      | Local dev server (`wrangler dev`)        |
| `npm run typecheck`| TypeScript check                         |
| `npm test`         | vitest                                   |
| `npm run check`    | typecheck + tests                        |
| `npm run deploy`   | Production deploy                        |

## CI

- `.github/workflows/ci.yml` — runs on every PR and push: typecheck + vitest + `wrangler deploy --dry-run`.
- `.github/workflows/cloudflare-worker.yml` — deploys on push to `main`.
