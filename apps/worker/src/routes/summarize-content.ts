import type { Env } from "../env";
import type { LlmConfig } from "../ai/extract-program";
import { summarizeResourceContent } from "../ai/summarize-content";

function llmConfigOrNull(env: Env): LlmConfig | null {
  if (!env.LLM_API_KEY) return null;
  return {
    apiKey: env.LLM_API_KEY,
    baseUrl: env.LLM_BASE_URL || "https://api.openai.com/v1",
    model: env.LLM_MODEL || "gpt-4o-mini",
  };
}

interface ResourceRow {
  id: string;
  title: string;
  resource_type: string;
  content_text: string | null;
  excerpt: string | null;
}

export interface SummarizeResult {
  summary: string;
  applied: boolean;
  skipped_reason?: string;
}

export async function summarizeResourceRoute(env: Env, resourceId: string, apply = false): Promise<SummarizeResult> {
  const row = await env.DB.prepare(
    "SELECT id, title, resource_type, content_text, excerpt FROM intelligence_resources WHERE id = ?",
  )
    .bind(resourceId)
    .first<ResourceRow>();

  if (!row) throw new Error("Resource not found");

  if (!row.content_text) {
    return { summary: "", applied: false, skipped_reason: "no_content_text" };
  }

  const config = llmConfigOrNull(env);
  if (!config) {
    return { summary: "", applied: false, skipped_reason: "no_llm_config" };
  }

  const summary = await summarizeResourceContent(config, {
    title: row.title,
    resource_type: row.resource_type,
    content_text: row.content_text,
  });

  let applied = false;
  if (apply && !row.excerpt?.trim()) {
    const now = new Date().toISOString();
    await env.DB.prepare("UPDATE intelligence_resources SET excerpt = ?, updated_at = ? WHERE id = ?")
      .bind(summary, now, resourceId)
      .run();
    applied = true;
  }

  return { summary, applied };
}
