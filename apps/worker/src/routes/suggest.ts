import type { Env } from "../env";
import { httpError } from "../http";
import { suggestResourceMeta, type MetaSuggestion } from "../ai/suggest-meta";
import type { LlmConfig } from "../ai/extract-program";

interface ResourceRow {
  id: string;
  title: string;
  url: string;
  resource_type: string;
  domain_source: string | null;
  confidence: string | null;
  decision_impact: string | null;
  extracted_facts: string | null;
  content_text: string | null;
}

function llmConfigOrNull(env: Env): LlmConfig | null {
  if (!env.LLM_API_KEY) return null;
  return {
    apiKey: env.LLM_API_KEY,
    baseUrl: env.LLM_BASE_URL || "https://api.openai.com/v1",
    model: env.LLM_MODEL || "gpt-4o-mini",
  };
}

export async function suggestResourceMetaRoute(
  env: Env,
  resourceId: string,
  apply: boolean,
): Promise<MetaSuggestion & { applied: { confidence: boolean; decision_impact: boolean } }> {
  const row = await env.DB.prepare(
    `SELECT id, title, url, resource_type, domain_source, confidence, decision_impact,
            extracted_facts, content_text
     FROM intelligence_resources WHERE id = ?`,
  )
    .bind(resourceId)
    .first<ResourceRow>();

  if (!row) throw httpError(404, `Resource not found: ${resourceId}`);

  const suggestion = await suggestResourceMeta(row, llmConfigOrNull(env));

  const applied = { confidence: false, decision_impact: false };

  if (apply) {
    const now = new Date().toISOString();
    if (!row.confidence) {
      await env.DB.prepare(
        "UPDATE intelligence_resources SET confidence = ?, updated_at = ? WHERE id = ?",
      )
        .bind(suggestion.suggested_confidence, now, resourceId)
        .run();
      applied.confidence = true;
    }
    if (!row.decision_impact && suggestion.suggested_decision_impact) {
      await env.DB.prepare(
        "UPDATE intelligence_resources SET decision_impact = ?, updated_at = ? WHERE id = ?",
      )
        .bind(suggestion.suggested_decision_impact, now, resourceId)
        .run();
      applied.decision_impact = true;
    }
  }

  return { ...suggestion, applied };
}
