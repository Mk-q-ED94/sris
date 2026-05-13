import type { Env } from "./env";
import { httpError } from "./http";

export function requireApiToken(request: Request, env: Env): void {
  const configured = env.API_TOKEN;
  if (!configured) return;
  const header = request.headers.get("authorization") || "";
  if (header !== `Bearer ${configured}`) {
    throw httpError(401, "Invalid API token");
  }
}

export function requireCron(request: Request, env: Env): void {
  const configured = env.CRON_SECRET || env.API_TOKEN;
  if (!configured) return;
  const header = request.headers.get("x-cron-secret") || "";
  if (header !== configured) {
    throw httpError(401, "Invalid cron secret");
  }
}
