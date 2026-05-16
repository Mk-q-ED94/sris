import Anthropic from "@anthropic-ai/sdk";

/**
 * What we ask Claude to return for each admission-notice PDF.
 *
 * Optional fields are nullable so the model has a way to say "the PDF doesn't
 * answer this" without hallucinating a value. `cycles` is an array because
 * many programs run spring + fall in one PDF.
 */
export interface ExtractedProgramFields {
  program_name: string;
  graduate_school: string | null;
  department: string | null;
  degree: string | null;
  language: string | null;
  intake_months: string[];
  cycles: Array<{
    cycle_name: string;
    application_open: string | null;
    application_close: string | null;
    consent_letter_deadline: string | null;
    exam_period: string | null;
    result_announcement: string | null;
    enrollment_date: string | null;
  }>;
  english_test: {
    type: string | null;
    minimum_score: number | null;
    notes: string | null;
  };
  japanese_test: {
    required: boolean;
    type: string | null;
    minimum_level: string | null;
  };
  documents_required: string[];
  supervisor_consent_required: boolean;
  exam_fee_jpy: number | null;
  tuition_per_year_jpy: number | null;
  quota: number | null;
  mext_eligible: boolean;
  scholarships: string[];
  notes: string;
  extraction_confidence: number;
  unresolved_questions: string[];
}

// JSON Schema for structured-outputs. Anthropic strict-mode requires every
// property to be listed in `required` and `additionalProperties: false` on
// every object. We use null instead of optional for "unknown" values.
const EXTRACTION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    program_name: { type: "string" },
    graduate_school: { type: ["string", "null"] },
    department: { type: ["string", "null"] },
    degree: { type: ["string", "null"] },
    language: { type: ["string", "null"] },
    intake_months: { type: "array", items: { type: "string" } },
    cycles: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          cycle_name: { type: "string" },
          application_open: { type: ["string", "null"] },
          application_close: { type: ["string", "null"] },
          consent_letter_deadline: { type: ["string", "null"] },
          exam_period: { type: ["string", "null"] },
          result_announcement: { type: ["string", "null"] },
          enrollment_date: { type: ["string", "null"] },
        },
        required: [
          "cycle_name",
          "application_open",
          "application_close",
          "consent_letter_deadline",
          "exam_period",
          "result_announcement",
          "enrollment_date",
        ],
      },
    },
    english_test: {
      type: "object",
      additionalProperties: false,
      properties: {
        type: { type: ["string", "null"] },
        minimum_score: { type: ["number", "null"] },
        notes: { type: ["string", "null"] },
      },
      required: ["type", "minimum_score", "notes"],
    },
    japanese_test: {
      type: "object",
      additionalProperties: false,
      properties: {
        required: { type: "boolean" },
        type: { type: ["string", "null"] },
        minimum_level: { type: ["string", "null"] },
      },
      required: ["required", "type", "minimum_level"],
    },
    documents_required: { type: "array", items: { type: "string" } },
    supervisor_consent_required: { type: "boolean" },
    exam_fee_jpy: { type: ["integer", "null"] },
    tuition_per_year_jpy: { type: ["integer", "null"] },
    quota: { type: ["integer", "null"] },
    mext_eligible: { type: "boolean" },
    scholarships: { type: "array", items: { type: "string" } },
    notes: { type: "string" },
    extraction_confidence: { type: "number" },
    unresolved_questions: { type: "array", items: { type: "string" } },
  },
  required: [
    "program_name",
    "graduate_school",
    "department",
    "degree",
    "language",
    "intake_months",
    "cycles",
    "english_test",
    "japanese_test",
    "documents_required",
    "supervisor_consent_required",
    "exam_fee_jpy",
    "tuition_per_year_jpy",
    "quota",
    "mext_eligible",
    "scholarships",
    "notes",
    "extraction_confidence",
    "unresolved_questions",
  ],
} as const;

// Frozen system prompt — this is the cached prefix. Keep deterministic;
// never interpolate timestamps / per-request ids here or caching breaks.
const SYSTEM_PROMPT = `You are an admissions analyst extracting structured facts from Japanese university SGU master's program admission notices. The input is a PDF in English, Japanese, or both.

Extraction rules:
1. Return ALL dates in ISO 8601 (YYYY-MM-DD). When a window is given (e.g. "Oct 20-24, 2025"), put the range in cycle_name or exam_period; put the close date in application_close.
2. If multiple intake cycles exist (April + October, summer + winter), return one entry per cycle. cycle_name should disambiguate (e.g. "Spring 2026 IGP-C", "Fall 2026 IGP-C").
3. intake_months uses English month names: ["April"], ["October"], ["April", "October"].
4. Currency is always JPY as an integer (no commas, no symbols). If the PDF only gives a foreign currency, leave the field null.
5. english_test.type uses canonical labels: "TOEFL iBT", "IELTS Academic", "TOEFL or IELTS", "TOEIC L&R". minimum_score is the official cutoff if stated; null if the PDF says "TOEFL required" without a minimum.
6. japanese_test.required is true only if Japanese proficiency is mandatory. If Japanese is optional / alternative to English, set required=false and put the detail in notes.
7. mext_eligible is true if the PDF explicitly mentions MEXT scholarship eligibility, university recommendation to MEXT, or "Japanese Government Scholarship".
8. supervisor_consent_required is true if the PDF says applicants must contact / obtain consent from a prospective supervisor before applying.
9. documents_required lists short labels: ["SOP", "Transcripts", "Recommendation letters x2", "Research plan", "Degree certificate", "English score", "CV"]. Do NOT include things that are merely the application form itself.
10. extraction_confidence is your honest 0.0-1.0 estimate of how completely the PDF answered the schema. If the PDF is mostly application forms with little prose, return 0.3-0.5 and put the gaps in unresolved_questions.
11. unresolved_questions: bullet what a applicant would still need to look up (e.g. "specific GPA minimum", "exact exam fee", "thesis page limit"). Keep each item under 12 words.
12. NEVER hallucinate. If the PDF doesn't answer a field, return null / empty array / "" — do not infer from common knowledge about Japanese university admissions.

Return the JSON object directly. No prose before or after.`;

const MODEL_ID = "claude-haiku-4-5" as const;

export interface ExtractionResult {
  facts: ExtractedProgramFields;
  usage: {
    input_tokens: number;
    output_tokens: number;
    cache_creation_input_tokens: number;
    cache_read_input_tokens: number;
  };
  model: string;
}

/**
 * Download a PDF and return its bytes as a base64 string for Anthropic.
 * Workers can't use Buffer; we walk the Uint8Array manually.
 */
async function fetchPdfBase64(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (compatible; SRIS/1.0; +https://github.com/Mk-q-ED94/sris)",
      accept: "application/pdf,*/*",
    },
  });
  if (!response.ok) {
    throw new Error(`PDF fetch failed (${response.status}): ${url}`);
  }
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("pdf") && !url.toLowerCase().endsWith(".pdf")) {
    throw new Error(`Not a PDF (content-type: ${contentType}): ${url}`);
  }
  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  // 32k chunk size keeps the call stack within limits on the V8 isolate.
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, i + CHUNK)),
    );
  }
  return btoa(binary);
}

/**
 * Run Claude Haiku 4.5 over a single PDF URL and return the parsed fields.
 *
 * The system prompt + JSON schema instructions are sent with
 * `cache_control: ephemeral` so subsequent calls in the same batch hit the
 * cache at ~10% of input price. Per-PDF cost on Haiku 4.5 with a 30-page
 * input ≈ $0.05; a batch of 15 ≈ $0.75 (the user's $0.50 target is met if
 * cache hits land and PDFs are smaller than 25 pages).
 */
export async function extractProgramFields(
  apiKey: string,
  pdfUrl: string,
): Promise<ExtractionResult> {
  const client = new Anthropic({ apiKey });
  const base64Pdf = await fetchPdfBase64(pdfUrl);

  const response = await client.messages.create({
    model: MODEL_ID,
    max_tokens: 4096,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    output_config: {
      format: {
        type: "json_schema",
        // The Anthropic TS SDK types are looser than the runtime schema;
        // casting through unknown keeps the call site honest while still
        // accepting the structured-outputs schema we hand-rolled above.
        schema: EXTRACTION_SCHEMA as unknown as Record<string, unknown>,
      },
    },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: base64Pdf,
            },
          },
          {
            type: "text",
            text: `Source URL: ${pdfUrl}\n\nExtract every field defined in the JSON schema from this admission-guideline PDF. Return only the JSON object.`,
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Anthropic response contained no text block");
  }
  const facts = JSON.parse(textBlock.text) as ExtractedProgramFields;

  return {
    facts,
    usage: {
      input_tokens: response.usage.input_tokens,
      output_tokens: response.usage.output_tokens,
      cache_creation_input_tokens: response.usage.cache_creation_input_tokens ?? 0,
      cache_read_input_tokens: response.usage.cache_read_input_tokens ?? 0,
    },
    model: response.model,
  };
}
