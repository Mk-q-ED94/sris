import { describe, expect, it, vi } from "vitest";
import type { D1Database, ExecutionContext } from "@cloudflare/workers-types";
import worker from "../src/index";
import type { Env } from "../src/env";
import { enrichCandidate } from "../src/routes/enrichment";

interface MockStatement {
  bind: (...params: unknown[]) => MockStatement;
  all: () => Promise<{ results: unknown[] }>;
  first: () => Promise<unknown>;
  run: () => Promise<{ meta: { changes: number } }>;
}

interface MockDbOptions {
  candidate?: Record<string, unknown>;
  pendingEnrichmentCount?: number;
}

function countPlaceholders(sql: string): number {
  return (sql.match(/\?/g) || []).length;
}

function makeDb(options: MockDbOptions = {}): {
  db: D1Database;
  statements: Array<{ sql: string; params: unknown[] }>;
} {
  const statements: Array<{ sql: string; params: unknown[] }> = [];

  const prepare = (sql: string): MockStatement => {
    let bound: unknown[] = [];
    const stmt: MockStatement = {
      bind(...params: unknown[]) {
        const expected = countPlaceholders(sql);
        if (params.length !== expected) {
          throw new Error(`Bind mismatch: expected ${expected}, got ${params.length} for SQL: ${sql}`);
        }
        bound = params;
        statements.push({ sql, params });
        return stmt;
      },
      async all() {
        return { results: [] };
      },
      async first() {
        if (sql.includes("from automation_runs where status = 'running'")) return null;
        if (sql.includes("count(*) as cnt from paper_candidates")) {
          return { cnt: options.pendingEnrichmentCount ?? 0 };
        }
        if (sql.includes("select * from paper_candidates where id = ?")) {
          return options.candidate ?? null;
        }
        return null;
      },
      async run() {
        statements.push({ sql, params: bound });
        return { meta: { changes: 1 } };
      },
    };
    return stmt;
  };

  return { db: { prepare } as unknown as D1Database, statements };
}

function makeEnv(db: D1Database): Env {
  return {
    DB: db,
    ENVIRONMENT: "test",
    APP_NAME: "SRIS",
    API_TOKEN: "token",
  };
}

function makeCtx(): ExecutionContext {
  return {
    waitUntil: vi.fn(),
    passThroughOnException: vi.fn(),
  } as unknown as ExecutionContext;
}

describe("automation routes", () => {
  it("rejects /api/automation/run without an API token", async () => {
    const { db } = makeDb();
    const response = await worker.fetch(
      new Request("https://sris.test/api/automation/run?scope=candidates&dry_run=1", { method: "POST" }),
      makeEnv(db),
      makeCtx(),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({ error: "Invalid API token" });
  });

  it("runs /api/automation/run dry-run with an API token", async () => {
    const { db } = makeDb({ pendingEnrichmentCount: 2 });
    const response = await worker.fetch(
      new Request("https://sris.test/api/automation/run?scope=candidates&dry_run=1", {
        method: "POST",
        headers: { authorization: "Bearer token" },
      }),
      makeEnv(db),
      makeCtx(),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      run_type: "candidates",
      status: "succeeded",
      candidates_enriched: 2,
    });
  });

  it("keeps /api/conflicts/detect response compatible", async () => {
    const { db } = makeDb();
    const response = await worker.fetch(
      new Request("https://sris.test/api/conflicts/detect", {
        method: "POST",
        headers: { authorization: "Bearer token" },
      }),
      makeEnv(db),
      makeCtx(),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ detected: 0 });
  });
});

describe("candidate enrichment", () => {
  it("updates enrichment status without D1 bind mismatches", async () => {
    const { db } = makeDb({
      candidate: {
        id: "cand-1",
        status: "pending",
        title: "Official admission page",
        url: "",
        resource_type: "official_page",
        domain_source: "example.ac.jp",
        confidence: "official",
        relevance_note: "Official page",
        decision_impact: "Use as source evidence",
        university_id: "utokyo",
      },
    });

    await expect(enrichCandidate(db, "cand-1", null)).resolves.toMatchObject({
      id: "cand-1",
      status: "succeeded",
    });
  });
});
