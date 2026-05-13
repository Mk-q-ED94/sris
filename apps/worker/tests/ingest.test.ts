import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { runIngest } from "../src/ingest";
import type { D1Database } from "@cloudflare/workers-types";

interface MockStatement {
  bind: (...params: unknown[]) => MockStatement;
  all: () => Promise<{ results: unknown[] }>;
  first: () => Promise<unknown>;
  run: () => Promise<{ meta: { changes: number } }>;
}

function makeDb(): { db: D1Database; statements: Array<{ sql: string; params: unknown[] }> } {
  const statements: Array<{ sql: string; params: unknown[] }> = [];
  const radarRow = {
    id: "src-1",
    name: "Test Source",
    source_type: "arxiv",
    url: null,
    query: "llm inference",
    keywords: '["inference"]',
    enabled: 1,
  };
  const prepare = (sql: string): MockStatement => {
    const stmt: MockStatement = {
      bind(...params: unknown[]) {
        statements.push({ sql, params });
        return stmt;
      },
      async all() {
        if (sql.includes("from radar_sources")) return { results: [radarRow] };
        return { results: [] };
      },
      async first() {
        if (sql.includes("select id from papers")) return null;
        return null;
      },
      async run() {
        return { meta: { changes: 1 } };
      },
    };
    return stmt;
  };
  const db = { prepare } as unknown as D1Database;
  return { db, statements };
}

describe("runIngest", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json("", {
          // Body is overwritten below; use text() resolver instead.
        }),
      ),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("inserts candidates whose keywords match", async () => {
    const xml = `<feed><entry>
      <id>http://arxiv.org/abs/x</id>
      <title>LLM Inference Tricks</title>
      <summary>Efficient inference at scale.</summary>
      <published>2025-01-01T00:00:00Z</published>
      <author><name>A</name></author>
      <link href="http://arxiv.org/abs/x" rel="alternate" />
    </entry></feed>`;
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(xml, { status: 200 })),
    );
    const { db, statements } = makeDb();
    const result = await runIngest(db);
    expect(result.sources_checked).toBe(1);
    expect(result.candidates_created).toBe(1);
    expect(result.candidates_skipped).toBe(0);
    expect(statements.some((s) => s.sql.startsWith("insert into paper_candidates"))).toBe(true);
  });

  it("skips entries that do not match keywords", async () => {
    const xml = `<feed><entry>
      <id>http://arxiv.org/abs/y</id>
      <title>Botany Update</title>
      <summary>Plants are green.</summary>
      <published>2025-01-01T00:00:00Z</published>
      <author><name>B</name></author>
      <link href="http://arxiv.org/abs/y" rel="alternate" />
    </entry></feed>`;
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(xml, { status: 200 })),
    );
    const { db } = makeDb();
    const result = await runIngest(db);
    expect(result.candidates_created).toBe(0);
    expect(result.candidates_skipped).toBe(1);
  });

  it("marks source as skipped on non-200 fetch", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("error", { status: 500 })),
    );
    const { db } = makeDb();
    const result = await runIngest(db);
    expect(result.candidates_created).toBe(0);
    expect(result.candidates_skipped).toBe(1);
  });
});
