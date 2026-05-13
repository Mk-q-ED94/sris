import { describe, expect, it } from "vitest";
import { normalizeCandidate, normalizePaper, normalizeRow, parseJson } from "../src/db/normalize";

describe("parseJson", () => {
  it("returns fallback for null/empty/undefined", () => {
    expect(parseJson(null, [])).toEqual([]);
    expect(parseJson(undefined, [])).toEqual([]);
    expect(parseJson("", [])).toEqual([]);
  });

  it("passes through non-string values", () => {
    const obj = { a: 1 };
    expect(parseJson(obj, {})).toBe(obj);
  });

  it("parses valid JSON strings", () => {
    expect(parseJson('["a","b"]', [])).toEqual(["a", "b"]);
  });

  it("returns fallback on parse error", () => {
    expect(parseJson("not json", [] as string[])).toEqual([]);
  });
});

describe("normalizeRow", () => {
  it("parses jsonFields back to arrays", () => {
    const row = { id: "1", authors: '["A","B"]', keywords: '["k"]' };
    const result = normalizeRow(row, ["authors", "keywords"]);
    expect(result.authors).toEqual(["A", "B"]);
    expect(result.keywords).toEqual(["k"]);
  });

  it("coerces enabled to boolean", () => {
    expect(normalizeRow({ enabled: 1 }, []).enabled).toBe(true);
    expect(normalizeRow({ enabled: 0 }, []).enabled).toBe(false);
  });

  it("uses {} fallback for raw_payload jsonField", () => {
    const result = normalizeRow({ raw_payload: "" }, ["raw_payload"]);
    expect(result.raw_payload).toEqual({});
  });
});

describe("normalizePaper / normalizeCandidate", () => {
  it("normalizes papers with authors and keywords", () => {
    const row = { id: "p1", authors: '["X"]', keywords: '["ml"]' };
    expect(normalizePaper(row)).toMatchObject({ authors: ["X"], keywords: ["ml"] });
  });

  it("normalizes candidates with matched_keywords and raw_payload", () => {
    const row = {
      id: "c1",
      authors: '["Y"]',
      matched_keywords: '["llm"]',
      raw_payload: '{"k":"v"}',
    };
    expect(normalizeCandidate(row)).toMatchObject({
      authors: ["Y"],
      matched_keywords: ["llm"],
      raw_payload: { k: "v" },
    });
  });
});
