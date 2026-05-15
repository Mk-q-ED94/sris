export function parseJson<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value !== "string") return value as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function normalizeRow<R extends Record<string, unknown>>(
  row: R,
  jsonFields: readonly string[],
): Record<string, unknown> {
  const normalized: Record<string, unknown> = { ...row };
  for (const field of jsonFields) {
    normalized[field] = parseJson(normalized[field], field === "raw_payload" ? {} : []);
  }
  if ("enabled" in normalized) normalized.enabled = Boolean(normalized.enabled);
  return normalized;
}

export function normalizePaper(row: Record<string, unknown>): Record<string, unknown> {
  return normalizeRow(row, ["authors", "keywords"]);
}

export function normalizeCandidate(row: Record<string, unknown>): Record<string, unknown> {
  return normalizeRow(row, ["authors", "matched_keywords", "raw_payload"]);
}

export function normalizeIntelligenceCandidate(row: Record<string, unknown>): Record<string, unknown> {
  return normalizeRow(row, ["authors", "matched_keywords", "raw_payload"]);
}
