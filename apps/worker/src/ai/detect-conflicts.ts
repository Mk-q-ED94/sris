import type { LlmConfig } from "./extract-program";

export interface ConflictFinding {
  field: string;
  value_a: string;
  value_b: string;
  description: string;
}

export interface ConflictCheckResult {
  has_conflict: boolean;
  findings: ConflictFinding[];
}

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    has_conflict: { type: "boolean" },
    findings: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          field: { type: "string" },
          value_a: { type: "string" },
          value_b: { type: "string" },
          description: { type: "string" },
        },
        required: ["field", "value_a", "value_b", "description"],
      },
    },
  },
  required: ["has_conflict", "findings"],
} as const;

const SYSTEM_PROMPT = `You are a fact-checker comparing two intelligence resources about the same Japanese SGU academic entity (program, professor, or lab).
Identify fields where the two sources give CONTRADICTORY or INCOMPATIBLE information.

Rules:
1. Only flag genuine contradictions: different deadline dates, different quota numbers, conflicting fees, contradictory requirements, opposite boolean values (e.g. one says supervisor consent required, one says not).
2. Do NOT flag: a field that is null in one source but present in the other, minor wording differences, abbreviations vs full names, or ranges where one source gives a more specific value.
3. field: short snake_case label (e.g. "application_deadline", "tuition_per_year", "supervisor_consent_required").
4. value_a / value_b: the literal values as they appear in each source. Keep under 60 chars each.
5. description: one sentence max 20 words.
6. Return has_conflict: false and empty findings array when no genuine contradiction exists.

Return only the JSON object.`;

// ── Field serialiser ────────────────────────────────────────────────────────

function serializeFacts(raw: string, resourceType: string): string {
  let facts: Record<string, unknown>;
  try {
    facts = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return "(unparseable)";
  }

  const parts: string[] = [];

  if (resourceType === "admission_notice" || resourceType === "program_page") {
    if (facts.program_name) parts.push(`program_name: ${facts.program_name}`);
    if (facts.degree) parts.push(`degree: ${facts.degree}`);
    if (facts.language) parts.push(`language: ${facts.language}`);
    if (facts.quota != null) parts.push(`quota: ${facts.quota}`);
    if (facts.tuition_per_year_jpy != null) parts.push(`tuition_per_year_jpy: ${facts.tuition_per_year_jpy}`);
    const fee = (facts.exam_fee_jpy ?? facts.application_fee_jpy) as number | null;
    if (fee != null) parts.push(`application_fee_jpy: ${fee}`);
    if (facts.mext_eligible != null) parts.push(`mext_eligible: ${facts.mext_eligible}`);
    if (facts.supervisor_consent_required != null) parts.push(`supervisor_consent_required: ${facts.supervisor_consent_required}`);
    if (Array.isArray(facts.cycles)) {
      for (const c of facts.cycles as Record<string, unknown>[]) {
        if (c.application_close) parts.push(`deadline(${c.cycle_name ?? "?"}): ${c.application_close}`);
      }
    }
    if (Array.isArray(facts.application_periods)) {
      for (const p of facts.application_periods as Record<string, unknown>[]) {
        if (p.close) parts.push(`deadline(${p.label ?? "?"}): ${p.close}`);
      }
    }
    if (facts.english_test && typeof facts.english_test === "object") {
      const et = facts.english_test as Record<string, unknown>;
      parts.push(`english_test: ${et.type ?? "required"}${et.minimum_score != null ? ` min ${et.minimum_score}` : ""}`);
    }
    if (facts.japanese_test && typeof facts.japanese_test === "object") {
      const jt = facts.japanese_test as Record<string, unknown>;
      parts.push(`japanese_required: ${jt.required}${jt.type ? ` (${jt.type})` : ""}`);
    }
  } else if (resourceType === "professor_page") {
    if (facts.full_name) parts.push(`name: ${facts.full_name}`);
    if (facts.title) parts.push(`title: ${facts.title}`);
    if (facts.affiliation) parts.push(`affiliation: ${facts.affiliation}`);
    if (facts.department) parts.push(`department: ${facts.department}`);
    if (Array.isArray(facts.research_interests))
      parts.push(`research_interests: ${(facts.research_interests as string[]).join(", ")}`);
    if (facts.lab_name) parts.push(`lab_name: ${facts.lab_name}`);
    if (facts.open_positions != null) parts.push(`open_positions: ${facts.open_positions}`);
  } else if (resourceType === "lab_page") {
    if (facts.lab_name) parts.push(`lab_name: ${facts.lab_name}`);
    if (facts.pi_name) parts.push(`pi_name: ${facts.pi_name}`);
    if (facts.university) parts.push(`university: ${facts.university}`);
    if (facts.department) parts.push(`department: ${facts.department}`);
    if (Array.isArray(facts.research_themes))
      parts.push(`research_themes: ${(facts.research_themes as string[]).join(", ")}`);
    if (facts.open_positions != null) parts.push(`open_positions: ${facts.open_positions}`);
  }

  return parts.length ? parts.join("\n") : "(no relevant fields)";
}

// ── LLM call ────────────────────────────────────────────────────────────────

interface OpenAIResponse {
  choices?: Array<{ message?: { content?: string } }>;
}

export async function compareResourceFacts(
  config: LlmConfig,
  params: {
    title_a: string;
    type_a: string;
    facts_a: string;
    title_b: string;
    type_b: string;
    facts_b: string;
    entity_type: string;
  },
): Promise<ConflictCheckResult> {
  const summaryA = serializeFacts(params.facts_a, params.type_a);
  const summaryB = serializeFacts(params.facts_b, params.type_b);

  const userMsg =
    `Entity type: ${params.entity_type}\n\n` +
    `=== Source A: ${params.title_a} (${params.type_a}) ===\n${summaryA}\n\n` +
    `=== Source B: ${params.title_b} (${params.type_b}) ===\n${summaryB}`;

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
      response_format: {
        type: "json_schema",
        json_schema: { name: "conflict_check", strict: true, schema: SCHEMA },
      },
      max_tokens: 512,
      temperature: 0,
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) throw new Error(`LLM ${response.status}`);
  const data = (await response.json()) as OpenAIResponse;
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("LLM returned no content");
  return JSON.parse(content) as ConflictCheckResult;
}
