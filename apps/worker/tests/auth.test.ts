import { describe, expect, it } from "vitest";
import { requireApiToken, requireCron } from "../src/auth";
import { HttpError } from "../src/http";
import type { Env } from "../src/env";

const baseEnv = {
  DB: {} as Env["DB"],
  ENVIRONMENT: "test",
  APP_NAME: "SRIS",
};

function makeRequest(headers: Record<string, string> = {}): Request {
  return new Request("https://example.com/api/test", { headers });
}

describe("requireApiToken", () => {
  it("passes through when API_TOKEN is unset", () => {
    expect(() => requireApiToken(makeRequest(), { ...baseEnv })).not.toThrow();
  });

  it("rejects missing authorization header", () => {
    expect(() => requireApiToken(makeRequest(), { ...baseEnv, API_TOKEN: "secret" })).toThrow(HttpError);
  });

  it("rejects mismatched token", () => {
    expect(() =>
      requireApiToken(makeRequest({ authorization: "Bearer wrong" }), { ...baseEnv, API_TOKEN: "secret" }),
    ).toThrow(/Invalid API token/);
  });

  it("accepts correct bearer token", () => {
    expect(() =>
      requireApiToken(makeRequest({ authorization: "Bearer secret" }), { ...baseEnv, API_TOKEN: "secret" }),
    ).not.toThrow();
  });
});

describe("requireCron", () => {
  it("passes through when no secret configured", () => {
    expect(() => requireCron(makeRequest(), { ...baseEnv })).not.toThrow();
  });

  it("rejects mismatched x-cron-secret", () => {
    expect(() =>
      requireCron(makeRequest({ "x-cron-secret": "no" }), { ...baseEnv, CRON_SECRET: "yes" }),
    ).toThrow(/Invalid cron secret/);
  });

  it("falls back to API_TOKEN when CRON_SECRET is unset", () => {
    expect(() =>
      requireCron(makeRequest({ "x-cron-secret": "token" }), { ...baseEnv, API_TOKEN: "token" }),
    ).not.toThrow();
  });
});
