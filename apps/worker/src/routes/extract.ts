import type { D1Database } from "@cloudflare/workers-types";
import type { Env } from "../env";
import { httpError } from "../http";
import { extractProgramFields, type LlmConfig } from "../ai/extract-program";
import { extractWebpageFields } from "../ai/extract-webpage";

const WEBPAGE_TYPES = new Set(["professor_page", "program_page", "lab_page"]);

interface ResourceRow {
  id: string;
  url: string;
  resource_type: string;
  title: string;
  extraction_status: string;
}

interface ExtractOptions {
  force?: boolean;
}

interface Usage {
  input_tokens: number;
  output_tokens: number;
  cache_read_input_tokens: number;
  cache_creation_input_tokens: number;
}

function llmConfigFromEnv(env: Env): LlmConfig {
  if (!env.LLM_API_KEY) {
    throw httpError(500, "LLM_API_KEY secret is not configured");
  }
  return {
    apiKey: env.LLM_API_KEY,
    baseUrl: env.LLM_BASE_URL || "https://api.openai.com/v1",
    model: env.LLM_MODEL || "gpt-4o-mini",
  };
}

async function loadResource(db: D1Database, id: string): Promise<ResourceRow> {
  const row = await db
    .prepare(
      "SELECT id, url, resource_type, title, extraction_status FROM intelligence_resources WHERE id = ?",
    )
    .bind(id)
    .first<ResourceRow>();
  if (!row) throw httpError(404, `Resource not found: ${id}`);
  return row;
}

async function runExtraction(
  env: Env,
  resource: ResourceRow,
): Promise<{ ok: true; usage: Usage; model: string }> {
  const isAdmission = resource.resource_type === "admission_notice";
  const isWebpage = WEBPAGE_TYPES.has(resource.resource_type);
  if (!isAdmission && !isWebpage) {
    throw httpError(
      400,
      `Resource ${resource.id} has type '${resource.resource_type}'; extraction supports: admission_notice, professor_page, program_page, lab_page`,
    );
  }

  const config = llmConfigFromEnv(env);

  await env.DB.prepare(
    "UPDATE intelligence_resources SET extraction_status = 'running', extraction_error = NULL, updated_at = ? WHERE id = ?",
  )
    .bind(new Date().toISOString(), resource.id)
    .run();

  try {
    const result = isAdmission
      ? await extractProgramFields(config, resource.url)
      : await extractWebpageFields(
          config,
          resource.url,
          resource.resource_type as "professor_page" | "program_page" | "lab_page",
        );
    const now = new Date().toISOString();
    await env.DB.prepare(
      `UPDATE intelligence_resources
       SET extracted_facts = ?,
           extraction_status = 'succeeded',
           extracted_at = ?,
           extraction_model = ?,
           extraction_error = NULL,
           extraction_input_tokens = ?,
           extraction_output_tokens = ?,
           extraction_cache_read_tokens = ?,
           updated_at = ?
       WHERE id = ?`,
    )
      .bind(
        JSON.stringify(result.facts),
        now,
        result.model,
        result.usage.input_tokens,
        result.usage.output_tokens,
        result.usage.cache_read_input_tokens,
        now,
        resource.id,
      )
      .run();
    return { ok: true, usage: result.usage, model: result.model };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await env.DB.prepare(
      "UPDATE intelligence_resources SET extraction_status = 'failed', extraction_error = ?, updated_at = ? WHERE id = ?",
    )
      .bind(message, new Date().toISOString(), resource.id)
      .run();
    throw err;
  }
}

export async function extractOneResource(
  env: Env,
  id: string,
  options: ExtractOptions = {},
): Promise<unknown> {
  const resource = await loadResource(env.DB, id);
  if (!options.force && resource.extraction_status === "succeeded") {
    return {
      id: resource.id,
      status: "skipped",
      reason: "already extracted (pass ?force=1 to re-run)",
    };
  }
  const { usage, model } = await runExtraction(env, resource);
  return { id: resource.id, status: "succeeded", model, usage };
}

export async function extractAllResources(
  env: Env,
  options: ExtractOptions = {},
): Promise<unknown> {
  const extractableTypes = "'admission_notice','professor_page','program_page','lab_page'";
  const filter = options.force
    ? `resource_type IN (${extractableTypes})`
    : `resource_type IN (${extractableTypes}) AND (extraction_status IS NULL OR extraction_status IN ('pending', 'failed'))`;
  const rows =
    (
      await env.DB.prepare(
        `SELECT id, url, resource_type, title, extraction_status FROM intelligence_resources WHERE ${filter}`,
      ).all<ResourceRow>()
    ).results || [];

  const results: Array<{ id: string; status: string; error?: string; usage?: Usage; model?: string }> = [];
  let totalIn = 0;
  let totalOut = 0;
  let totalCached = 0;
  for (const row of rows) {
    try {
      const { usage, model } = await runExtraction(env, row);
      results.push({ id: row.id, status: "succeeded", usage, model });
      totalIn += usage.input_tokens;
      totalOut += usage.output_tokens;
      totalCached += usage.cache_read_input_tokens;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      results.push({ id: row.id, status: "failed", error: message });
    }
  }

  return {
    processed: results.length,
    succeeded: results.filter((r) => r.status === "succeeded").length,
    failed: results.filter((r) => r.status === "failed").length,
    usage_total: {
      input_tokens: totalIn,
      output_tokens: totalOut,
      cache_read_input_tokens: totalCached,
    },
    results,
  };
}
