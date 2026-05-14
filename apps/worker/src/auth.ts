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

/**
 * Same as requireApiToken but also accepts the token from a URL query parameter.
 * Used by feeds (iCal) that calendar clients fetch without a custom Authorization
 * header. Trade-off: the URL ends up in calendar server logs, so this is meant
 * for personal single-user deployments only.
 */
export function requireApiTokenOrQuery(request: Request, env: Env): void {
  const configured = env.API_TOKEN;
  if (!configured) return;
  const header = request.headers.get("authorization") || "";
  if (header === `Bearer ${configured}`) return;
  const url = new URL(request.url);
  const queryToken = url.searchParams.get("token");
  if (queryToken === configured) return;
  throw httpError(401, "Invalid API token");
}
