import { extractText, getDocumentProxy } from "unpdf";

/**
 * Structured facts we ask the LLM to return per admission-notice PDF.
 *
 * Nullable fields are how the model says "the PDF doesn't answer this"
 * without hallucinating. `cycles` is an array because many programs run
 * spring + fall in one PDF.
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

// OpenAI structured-outputs strict-mode JSON Schema:
//   - additionalProperties: false on every object
//   - every property in `required`
//   - nullability via type array: ["string", "null"]
//   - allowed types: string / number / boolean / integer / object / array / null
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

const SYSTEM_PROMPT = `You are an admissions analyst extracting structured facts from Japanese university SGU master's program admission notices. The input is plain text extracted from a PDF — text in English, Japanese, or both.

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
10. extraction_confidence is your honest 0.0-1.0 estimate of how completely the PDF answered the schema. If the PDF text seems truncated or is mostly form fields with little prose, return 0.3-0.5 and put the gaps in unresolved_questions.
11. unresolved_questions: bullet what an applicant would still need to look up (e.g. "specific GPA minimum", "exact exam fee", "thesis page limit"). Keep each item under 12 words.
12. NEVER hallucinate. If the PDF doesn't answer a field, return null / empty array / "" — do not infer from common knowledge about Japanese university admissions.

Return the JSON object directly. No prose before or after.`;

export interface ExtractionResult {
  facts: ExtractedProgramFields;
  usage: {
    input_tokens: number;
    output_tokens: number;
    cache_read_input_tokens: number;
    cache_creation_input_tokens: number;
  };
  model: string;
}

export interface LlmConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

/**
 * Fetch a PDF and extract its plain text.
 *
 * unpdf is a serverless-optimized wrapper around pdf.js. It does the text
 * extraction synchronously in the Worker isolate without needing a separate
 * worker thread or canvas. Image-only PDFs come back empty; if you see
 * empty text from an admission PDF that's clearly text-bearing, the
 * upstream site is probably serving a scan.
 *
 * `MAX_CHARS` caps the prompt size at ~60k tokens for safety on
 * 128k-context models. Each admission PDF is typically 30k-80k chars.
 */
const MAX_CHARS = 250_000;

async function fetchPdfText(url: string): Promise<{ text: string; totalPages: number }> {
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
  const buffer = new Uint8Array(await response.arrayBuffer());
  const pdf = await getDocumentProxy(buffer);
  const result = await extractText(pdf, { mergePages: true });
  const text = Array.isArray(result.text) ? result.text.join("\n") : result.text;
  if (text.length === 0) {
    throw new Error(`PDF parsed but contained no text (probably an image scan): ${url}`);
  }
  const trimmed =
    text.length > MAX_CHARS
      ? text.slice(0, MAX_CHARS) + "\n\n[... PDF truncated to fit context window ...]"
      : text;
  return { text: trimmed, totalPages: result.totalPages };
}

interface OpenAIResponse {
  choices?: Array<{ message?: { content?: string } }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    prompt_tokens_details?: { cached_tokens?: number };
  };
  model?: string;
  error?: { message?: string };
}

/**
 * Extract structured program fields from a single admission-notice PDF.
 *
 * Provider-agnostic — works with any OpenAI-compatible /v1/chat/completions
 * endpoint that supports `response_format: json_schema` with strict mode.
 * Tested targets: OpenAI (gpt-4o-mini, gpt-4.1-mini), DeepSeek (deepseek-chat),
 * OpenRouter (any model with structured-outputs support), self-hosted
 * LiteLLM proxies.
 *
 * Cost depends entirely on the chosen provider/model. The `usage` returned
 * lets the caller convert to dollars at whatever rate they're paying.
 */
export async function extractProgramFields(
  config: LlmConfig,
  pdfUrl: string,
): Promise<ExtractionResult> {
  const { text, totalPages } = await fetchPdfText(pdfUrl);

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
        {
          role: "user",
          content: `Source URL: ${pdfUrl}\nExtracted PDF text (${totalPages} pages):\n\n---BEGIN PDF TEXT---\n${text}\n---END PDF TEXT---\n\nExtract every field defined in the JSON schema. Return only the JSON object.`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "program_extraction",
          strict: true,
          schema: EXTRACTION_SCHEMA,
        },
      },
      max_tokens: 4096,
      temperature: 0,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`LLM API ${response.status}: ${body.slice(0, 500)}`);
  }

  const data = (await response.json()) as OpenAIResponse;
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error(`LLM returned no content: ${JSON.stringify(data).slice(0, 300)}`);
  }
  const facts = JSON.parse(content) as ExtractedProgramFields;

  return {
    facts,
    usage: {
      input_tokens: data.usage?.prompt_tokens ?? 0,
      output_tokens: data.usage?.completion_tokens ?? 0,
      cache_read_input_tokens: data.usage?.prompt_tokens_details?.cached_tokens ?? 0,
      cache_creation_input_tokens: 0,
    },
    model: data.model ?? config.model,
  };
}
