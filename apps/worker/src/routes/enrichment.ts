import type { D1Database } from "@cloudflare/workers-types";
import type { LlmConfig } from "../ai/extract-program";
import { fetchUrlContent } from "./fetch";
import { suggestConfidence, fallbackImpact, suggestResourceMeta, type ResourceForSuggestion } from "../ai/suggest-meta";
import { extractDomain, inferResourceType } from "../ingest/classify";

export interface EnrichmentResult {
  id: string;
  status: "succeeded" | "partial" | "failed" | "skipped";
  fields_updated: string[];
  error?: string;
}

const RESOURCE_TYPE_LABELS: Record<string, string> = {
  official_page: "Official page",
  program_page: "Program page",
  admission_notice: "Admission notice",
  professor_page: "Professor page",
  lab_page: "Lab page",
  experience_post: "Experience post",
  video: "Video",
  paper: "Paper",
  other: "Resource",
};

const TYPE_HINTS: Record<string, string> = {
  official_page: "may contain university-wide admissions and program information",
  program_page: "may contain degree requirements, deadlines, and application details",
  admission_notice: "may contain application deadlines, required documents, and quotas",
  professor_page: "may contain research direction, publications, and contact info",
  lab_page: "may contain research themes, recent papers, and open positions",
  experience_post: "anecdotal — cross-reference with official sources",
  video: "supplementary context — verify claims against official sources",
  paper: "academic work — cite or map to lab output",
  other: "review and link to a target university or program",
};

export async function enrichCandidate(
  db: D1Database,
  candidateId: string,
  llmConfig?: LlmConfig | null,
): Promise<EnrichmentResult> {
  const candidate = await db
    .prepare("select * from paper_candidates where id = ?")
    .bind(candidateId)
    .first<Record<string, unknown>>();
  if (!candidate) return { id: candidateId, status: "failed", fields_updated: [], error: "Candidate not found" };
  if (candidate.status === "ignored") return { id: candidateId, status: "skipped", fields_updated: [], error: "Candidate is ignored" };

  const now = new Date().toISOString();
  const updated: string[] = [];
  let partialError: string | undefined;

  // Mark as running
  await db
    .prepare("update paper_candidates set enrichment_status = 'running', updated_at = ? where id = ?")
    .bind(now, candidateId)
    .run();

  try {
    // 1. URL fetch — if no content_text
    if (!candidate.content_text && candidate.url) {
      try {
        const fetched = await fetchUrlContent(String(candidate.url));
        if (fetched) {
          const excerpt = fetched.content_text.slice(0, 500);
          await db
            .prepare("update paper_candidates set content_text = ?, excerpt = ?, raw_snapshot = ?, snapshot_at = ?, updated_at = ? where id = ?")
            .bind(fetched.content_text, excerpt, fetched.raw_snapshot, now, now, candidateId)
            .run();
          updated.push("content_text", "excerpt", "raw_snapshot");
          candidate.content_text = fetched.content_text;
          candidate.excerpt = excerpt;
        }
      } catch (e) {
        partialError = `URL fetch failed: ${e instanceof Error ? e.message : String(e)}`;
      }
    }

    // 2. Resource type inference — only override "paper" (arXiv default) or "other"
    const currentType = String(candidate.resource_type || "paper");
    if (currentType === "paper" || currentType === "other") {
      const sourceRow = candidate.source_id
        ? await db.prepare("select source_type from radar_sources where id = ?").bind(String(candidate.source_id)).first<{ source_type: string }>()
        : null;
      const inferred = inferResourceType(
        sourceRow?.source_type ?? null,
        String(candidate.url || ""),
        String(candidate.title || ""),
        candidate.content_text ? String(candidate.content_text) : null,
      );
      if (inferred !== currentType) {
        await db
          .prepare("update paper_candidates set resource_type = ?, updated_at = ? where id = ?")
          .bind(inferred, now, candidateId)
          .run();
        updated.push("resource_type");
        candidate.resource_type = inferred;
      }
    }

    // 3. Domain source
    if (!candidate.domain_source && candidate.url) {
      const domain = extractDomain(String(candidate.url));
      if (domain) {
        await db
          .prepare("update paper_candidates set domain_source = ?, updated_at = ? where id = ?")
          .bind(domain, now, candidateId)
          .run();
        updated.push("domain_source");
        candidate.domain_source = domain;
      }
    }

    // 4. Confidence — pure rules, no LLM cost
    if (!candidate.confidence) {
      const resourceForSuggestion: ResourceForSuggestion = {
        id: candidateId,
        title: String(candidate.title || ""),
        url: String(candidate.url || ""),
        resource_type: String(candidate.resource_type || "other"),
        domain_source: candidate.domain_source ? String(candidate.domain_source) : null,
      };
      const confidence = suggestConfidence(resourceForSuggestion);
      await db
        .prepare("update paper_candidates set confidence = ?, updated_at = ? where id = ?")
        .bind(confidence, now, candidateId)
        .run();
      updated.push("confidence");
    }

    // 5. Relevance note
    if (!candidate.relevance_note) {
      const resourceType = String(candidate.resource_type || "other");
      const domain = candidate.domain_source ? String(candidate.domain_source) : "unknown source";
      const label = RESOURCE_TYPE_LABELS[resourceType] ?? "Resource";
      const hint = TYPE_HINTS[resourceType] ?? "review and assess relevance";
      const relevanceNote = `${label} from ${domain} — ${hint}`;

      await db
        .prepare("update paper_candidates set relevance_note = ?, updated_at = ? where id = ?")
        .bind(relevanceNote, now, candidateId)
        .run();
      updated.push("relevance_note");
    }

    // 6. Decision impact
    if (!candidate.decision_impact) {
      let impact: string;
      if (llmConfig) {
        try {
          const resourceForSuggestion: ResourceForSuggestion = {
            id: candidateId,
            title: String(candidate.title || ""),
            url: String(candidate.url || ""),
            resource_type: String(candidate.resource_type || "other"),
            domain_source: candidate.domain_source ? String(candidate.domain_source) : null,
            content_text: candidate.content_text ? String(candidate.content_text).slice(0, 2000) : null,
          };
          const result = await suggestResourceMeta(resourceForSuggestion, llmConfig);
          impact = result.suggested_decision_impact;
        } catch {
          impact = fallbackImpact({
            id: candidateId,
            title: String(candidate.title || ""),
            url: String(candidate.url || ""),
            resource_type: String(candidate.resource_type || "other"),
          });
        }
      } else {
        impact = fallbackImpact({
          id: candidateId,
          title: String(candidate.title || ""),
          url: String(candidate.url || ""),
          resource_type: String(candidate.resource_type || "other"),
        });
      }
      await db
        .prepare("update paper_candidates set decision_impact = ?, updated_at = ? where id = ?")
        .bind(impact, now, candidateId)
        .run();
      updated.push("decision_impact");
    }

    // 7. Auto-association
    if (!candidate.university_id) {
      let uniId: string | null = null;

      // From source
      if (candidate.source_id) {
        const source = await db
          .prepare("select university_id from radar_sources where id = ?")
          .bind(String(candidate.source_id))
          .first<{ university_id: string | null }>();
        uniId = source?.university_id ?? null;
      }

      // Domain matching against university websites
      if (!uniId && candidate.domain_source) {
        const domain = String(candidate.domain_source);
        const uni = await db
          .prepare("select id from universities where website like ? limit 1")
          .bind(`%${domain}%`)
          .first<{ id: string }>();
        uniId = uni?.id ?? null;
      }

      if (uniId) {
        await db
          .prepare("update paper_candidates set university_id = ?, updated_at = ? where id = ?")
          .bind(uniId, now, candidateId)
          .run();
        updated.push("university_id");
      }
    }

    // 8. URL dedup
    const candidateUrl = String(candidate.url || "");
    if (candidateUrl) {
      const dupCandidate = await db
        .prepare("select id from paper_candidates where url = ? and id != ? and status != 'ignored' limit 1")
        .bind(candidateUrl, candidateId)
        .first();
      const dupResource = await db
        .prepare("select id from intelligence_resources where url = ? limit 1")
        .bind(candidateUrl)
        .first();

      if (dupCandidate || dupResource) {
        await db
          .prepare("update paper_candidates set status = 'ignored', ignore_reason = 'duplicate_url', enrichment_status = 'succeeded', enriched_at = ?, updated_at = ? where id = ?")
          .bind(now, now, candidateId)
          .run();
        return { id: candidateId, status: "succeeded", fields_updated: [...updated, "status"], error: "Marked as duplicate URL" };
      }
    }

    // Finalize
    const finalStatus = partialError ? "partial" : "succeeded";
    await db
      .prepare("update paper_candidates set enrichment_status = ?, enriched_at = ?, enrichment_error = ?, updated_at = ? where id = ?")
      .bind(finalStatus, now, partialError || null, now, candidateId)
      .run();

    return { id: candidateId, status: finalStatus, fields_updated: updated, error: partialError };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    await db
      .prepare("update paper_candidates set enrichment_status = 'failed', enriched_at = ?, enrichment_error = ?, updated_at = ? where id = ?")
      .bind(now, msg, now, candidateId)
      .run();
    return { id: candidateId, status: "failed", fields_updated: updated, error: msg };
  }
}

export async function enrichPendingCandidates(
  db: D1Database,
  llmConfig?: LlmConfig | null,
  runId?: string,
): Promise<{ enriched: number; failed: number; llm_input: number; llm_output: number }> {
  const candidates = await db
    .prepare("select id from paper_candidates where status = 'pending' and enrichment_status = 'pending' order by created_at desc")
    .all<{ id: string }>();

  let enriched = 0;
  let failed = 0;

  for (const { id } of candidates.results) {
    const result = await enrichCandidate(db, id, llmConfig);

    // Track in run items if runId provided
    if (runId) {
      const itemId = crypto.randomUUID();
      await db
        .prepare("insert into automation_run_items (id, run_id, item_type, item_id, step, status, finished_at, error_message, created_at) values (?,?,?,?,?,?,?,?,?)")
        .bind(itemId, runId, "candidate", id, "enrich", result.status === "failed" ? "failed" : "succeeded", new Date().toISOString(), result.error ?? null, new Date().toISOString())
        .run();
    }

    if (result.status === "succeeded" || result.status === "partial") enriched++;
    else if (result.status === "failed") failed++;
    // "skipped" doesn't count
  }

  return { enriched, failed, llm_input: 0, llm_output: 0 };
}
