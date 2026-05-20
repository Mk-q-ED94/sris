import type { LlmConfig } from "./extract-program";

export interface ResourceForSuggestion {
  id: string;
  title: string;
  url: string;
  resource_type: string;
  domain_source?: string | null;
  confidence?: string | null;
  decision_impact?: string | null;
  extracted_facts?: string | null;
  content_text?: string | null;
}

export interface MetaSuggestion {
  suggested_confidence: string;
  suggested_decision_impact: string;
  confidence_source: "rules";
  impact_source: "llm" | "rules_fallback";
}

// ── Confidence — pure rules, no LLM cost ─────────────────────────────────

const OFFICIAL_SUFFIXES = [".ac.jp", ".edu", ".go.jp", ".gov", ".gov.jp", ".ac.uk", ".edu.au"];

function isOfficialDomain(url: string, domainSource?: string | null): boolean {
  const hostname =
    domainSource ||
    (() => {
      try {
        return new URL(url).hostname;
      } catch {
        return "";
      }
    })();
  return OFFICIAL_SUFFIXES.some((s) => hostname.endsWith(s));
}

export function suggestConfidence(resource: ResourceForSuggestion): string {
  const official = isOfficialDomain(resource.url, resource.domain_source);
  switch (resource.resource_type) {
    case "official_page":
    case "admission_notice":
    case "program_page":
      return official ? "official" : "medium";
    case "professor_page":
    case "lab_page":
      return official ? "high" : "medium";
    case "paper":
      return "high";
    case "experience_post":
      return "low";
    case "video":
      return "medium";
    default:
      return official ? "medium" : "unverified";
  }
}

// ── Decision impact — LLM, 1 sentence, cheap ─────────────────────────────

const SYSTEM_PROMPT = `You are a concise admissions strategy advisor helping a student target Japanese SGU master's programs.
Given one intelligence resource, write exactly ONE sentence (max 25 words) that explains how this resource affects the student's application decisions or research priorities.
Be specific about the action or judgment it enables. Do not start with "This resource" or "The". Return only the sentence.`;

interface OpenAIResponse {
  choices?: Array<{ message?: { content?: string } }>;
  model?: string;
}

function factsPreview(raw: string | null): string {
  if (!raw) return "";
  try {
    const obj = JSON.parse(raw) as Record<string, unknown>;
    const keys: string[] = [];
    if (obj.program_name) keys.push(`program: ${obj.program_name}`);
    if (obj.full_name) keys.push(`professor: ${obj.full_name}`);
    if (obj.lab_name) keys.push(`lab: ${obj.lab_name}`);
    if (Array.isArray(obj.cycles) && obj.cycles.length)
      keys.push(`deadline: ${(obj.cycles[0] as Record<string, unknown>).application_close ?? "?"}`);
    if (Array.isArray(obj.application_periods) && obj.application_periods.length)
      keys.push(`deadline: ${(obj.application_periods[0] as Record<string, unknown>).close ?? "?"}`);
    if (Array.isArray(obj.research_interests) && obj.research_interests.length)
      keys.push(`interests: ${(obj.research_interests as string[]).slice(0, 3).join(", ")}`);
    if (Array.isArray(obj.research_themes) && obj.research_themes.length)
      keys.push(`themes: ${(obj.research_themes as string[]).slice(0, 3).join(", ")}`);
    if (obj.mext_eligible) keys.push("MEXT eligible");
    if (obj.supervisor_consent_required) keys.push("supervisor consent required");
    return keys.length ? ` [${keys.join("; ")}]` : "";
  } catch {
    return "";
  }
}

async function callLlmForImpact(config: LlmConfig, resource: ResourceForSuggestion): Promise<string> {
  const preview = factsPreview(resource.extracted_facts ?? null);
  const userMsg =
    `Type: ${resource.resource_type}\n` +
    `Title: ${resource.title}\n` +
    `URL: ${resource.url}` +
    preview;

  const response = await fetch(`${config.baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMsg },
      ],
      max_tokens: 80,
      temperature: 0.3,
    }),
    signal: AbortSignal.timeout(12_000),
  });

  if (!response.ok) throw new Error(`LLM ${response.status}`);
  const data = (await response.json()) as OpenAIResponse;
  return (data.choices?.[0]?.message?.content ?? "").trim();
}

// ── Fallback when no LLM ──────────────────────────────────────────────────

const FALLBACK_IMPACT: Record<string, string> = {
  admission_notice: "Use the extracted deadlines and document requirements to build your application checklist.",
  program_page: "Compare this program's requirements and intake windows against your other target programs.",
  professor_page: "Assess fit between this professor's research direction and your SOP narrative.",
  lab_page: "Evaluate whether this lab's themes and methods align with your target research area.",
  paper: "Cite this work in your SOP or use it to map the lab's recent output.",
  experience_post: "Cross-reference with official sources; treat as anecdotal context for expectations.",
  official_page: "Verify official requirements here before finalising application materials.",
  video: "Use as supplementary context; verify claims against official sources.",
};

export function fallbackImpact(resource: ResourceForSuggestion): string {
  return FALLBACK_IMPACT[resource.resource_type] ?? "Review and link to a target university or program.";
}

// ── Public entry point ────────────────────────────────────────────────────

export async function suggestResourceMeta(
  resource: ResourceForSuggestion,
  llmConfig: LlmConfig | null,
): Promise<MetaSuggestion> {
  const suggested_confidence = suggestConfidence(resource);

  if (llmConfig) {
    try {
      const impact = await callLlmForImpact(llmConfig, resource);
      if (impact) {
        return { suggested_confidence, suggested_decision_impact: impact, confidence_source: "rules", impact_source: "llm" };
      }
    } catch {
      // fall through to rules fallback
    }
  }

  return {
    suggested_confidence,
    suggested_decision_impact: fallbackImpact(resource),
    confidence_source: "rules",
    impact_source: "rules_fallback",
  };
}
