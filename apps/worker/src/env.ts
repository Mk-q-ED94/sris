import type { D1Database } from "@cloudflare/workers-types";

export interface Env {
  DB: D1Database;
  ENVIRONMENT: string;
  APP_NAME: string;
  API_TOKEN?: string;
  CRON_SECRET?: string;
}
