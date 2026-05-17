import { fetchUrlContent } from "../routes/fetch";
import type { LlmConfig } from "./extract-program";

// ── Extracted shapes ──────────────────────────────────────────────────────

export interface ExtractedProfessorFields {
  full_name: string;
  title: string | null;
  affiliation: string | null;
  department: string | null;
  email: string | null;
  research_interests: string[];
  bio_snippet: string | null;
  recent_publications: Array<{
    title: string;
    year: number | null;
    venue: string | null;
  }>;
  lab_name: string | null;
  open_positions: boolean;
  contact_notes: string | null;
  extraction_confidence: number;
  unresolved_questions: string[];
}

export interface ExtractedProgramPageFields {
  program_name: string;
  degree: string | null;
  language: string | null;
  application_periods: Array<{
    label: string;
    open: string | null;
    close: string | null;
  }>;
  requirements: string[];
  quota: number | null;
  tuition_per_year_jpy: number | null;
  application_fee_jpy: number | null;
  mext_eligible: boolean;
  scholarships: string[];
  supervisor_consent_required: boolean;
  contact_email: string | null;
  notes: string;
  extraction_confidence: number;
  unresolved_questions: string[];
}

export interface ExtractedLabFields {
  lab_name: string;
  pi_name: string | null;
  university: string | null;
  department: string | null;
  research_themes: string[];
  tools_methods: string[];
  recent_publications: Array<{
    title: string;
    year: number | null;
    venue: string | null;
  }>;
  open_positions: boolean;
  contact_email: string | null;
  notes: string;
  extraction_confidence: number;
  unresolved_questions: string[];
}

export type WebpageExtractedFacts =
  | ExtractedProfessorFields
  | ExtractedProgramPageFields
  | ExtractedLabFields;

// ── JSON Schemas ───────────────────────────────────────────────────────────

const PROFESSOR_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    full_name: { type: "string" },
    title: { type: ["string", "null"] },
    affiliation: { type: ["string", "null"] },
    department: { type: ["string", "null"] },
    email: { type: ["string", "null"] },
    research_interests: { type: "array", items: { type: "string" } },
    bio_snippet: { type: ["string", "null"] },
    recent_publications: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          year: { type: ["integer", "null"] },
          venue: { type: ["string", "null"] },
        },
        required: ["title", "year", "venue"],
      },
    },
    lab_name: { type: ["string", "null"] },
    open_positions: { type: "boolean" },
    contact_notes: { type: ["string", "null"] },
    extraction_confidence: { type: "number" },
    unresolved_questions: { type: "array", items: { type: "string" } },
  },
  required: [
    "full_name", "title", "affiliation", "department", "email",
    "research_interests", "bio_snippet", "recent_publications",
    "lab_name", "open_positions", "contact_notes",
    "extraction_confidence", "unresolved_questions",
  ],
} as const;

const PROGRAM_PAGE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    program_name: { type: "string" },
    degree: { type: ["string", "null"] },
    language: { type: ["string", "null"] },
    application_periods: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          label: { type: "string" },
          open: { type: ["string", "null"] },
          close: { type: ["string", "null"] },
        },
        required: ["label", "open", "close"],
      },
    },
    requirements: { type: "array", items: { type: "string" } },
    quota: { type: ["integer", "null"] },
    tuition_per_year_jpy: { type: ["integer", "null"] },
    application_fee_jpy: { type: ["integer", "null"] },
    mext_eligible: { type: "boolean" },
    scholarships: { type: "array", items: { type: "string" } },
    supervisor_consent_required: { type: "boolean" },
    contact_email: { type: ["string", "null"] },
    notes: { type: "string" },
    extraction_confidence: { type: "number" },
    unresolved_questions: { type: "array", items: { type: "string" } },
  },
  required: [
    "program_name", "degree", "language", "application_periods",
    "requirements", "quota", "tuition_per_year_jpy", "application_fee_jpy",
    "mext_eligible", "scholarships", "supervisor_consent_required",
    "contact_email", "notes", "extraction_confidence", "unresolved_questions",
  ],
} as const;

const LAB_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    lab_name: { type: "string" },
    pi_name: { type: ["string", "null"] },
    university: { type: ["string", "null"] },
    department: { type: ["string", "null"] },
    research_themes: { type: "array", items: { type: "string" } },
    tools_methods: { type: "array", items: { type: "string" } },
    recent_publications: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          year: { type: ["integer", "null"] },
          venue: { type: ["string", "null"] },
        },
        required: ["title", "year", "venue"],
      },
    },
    open_positions: { type: "boolean" },
    contact_email: { type: ["string", "null"] },
    notes: { type: "string" },
    extraction_confidence: { type: "number" },
    unresolved_questions: { type: "array", items: { type: "string" } },
  },
  required: [
    "lab_name", "pi_name", "university", "department",
    "research_themes", "tools_methods", "recent_publications",
    "open_positions", "contact_email", "notes",
    "extraction_confidence", "unresolved_questions",
  ],
} as const;

// ── System prompts ─────────────────────────────────────────────────────────

const PROFESSOR_PROMPT = `You are an academic intelligence analyst. Extract structured facts from a professor's profile page at a Japanese university (SGU / graduate school).

Rules:
1. full_name: full name as written on the page. Prefer English if both languages appear.
2. research_interests: short keyword phrases (3-8 words max each). Capture 3-10 of the most specific themes.
3. recent_publications: up to 8 publications listed on the page. Each entry needs at minimum a title. year is 4-digit integer. venue is journal/conference abbreviation or full name.
4. bio_snippet: 1-3 sentence summary of the professor's research direction, drawn verbatim or paraphrased from the page. Null if no bio text found.
5. open_positions: true only if the page explicitly mentions recruiting students / open positions.
6. email: extract only if explicitly written as an email address; null if obfuscated or missing.
7. lab_name: the lab or group name if mentioned. Null if no lab is named.
8. extraction_confidence: 0.0-1.0 estimate of how completely the page answered the schema.
9. unresolved_questions: what an applicant would still need to find out (e.g. "current research projects", "thesis supervision policy"). Max 12 words each.
10. NEVER hallucinate. If a field is not on the page, return null / empty array.

Return only the JSON object.`;

const PROGRAM_PAGE_PROMPT = `You are an admissions intelligence analyst. Extract structured facts from a graduate program page at a Japanese SGU university.

Rules:
1. program_name: full official name of the program.
2. language: "English", "Japanese", "English / Japanese", or null.
3. application_periods: each known intake window. label disambiguates (e.g. "Spring 2026", "Fall 2026 Screening A"). open / close are ISO 8601 dates or null.
4. requirements: short labels for required documents/scores (e.g. "TOEFL iBT 79+", "Research plan", "2 recommendation letters").
5. mext_eligible: true only if MEXT or Japanese Government Scholarship is explicitly mentioned.
6. supervisor_consent_required: true if the page says applicants must contact a professor before applying.
7. tuition_per_year_jpy / application_fee_jpy: integers in JPY; null if not stated or in a foreign currency.
8. extraction_confidence: 0.0-1.0.
9. unresolved_questions: gaps an applicant would still need to fill. Max 12 words each.
10. NEVER hallucinate. Return null / empty arrays for missing fields.

Return only the JSON object.`;

const LAB_PROMPT = `You are an academic intelligence analyst. Extract structured facts from a research lab page at a Japanese graduate school.

Rules:
1. lab_name: official or commonly used lab/group name.
2. pi_name: principal investigator's name. Prefer English; null if unclear.
3. research_themes: 3-10 specific research topic phrases (3-8 words each).
4. tools_methods: specific tools, frameworks, models, or experimental methods the lab uses (e.g. "Transformer fine-tuning", "FPGA prototyping", "fMRI").
5. recent_publications: up to 8 publications listed on the page. title is required; year is 4-digit integer; venue is journal/conference.
6. open_positions: true only if the page explicitly advertises for new students or collaborators.
7. contact_email: extract only if an email address is explicitly written.
8. notes: 1-2 sentences of anything important not captured above (e.g. joint affiliation, industry partners).
9. extraction_confidence: 0.0-1.0.
10. unresolved_questions: what an applicant still needs to research. Max 12 words each.
11. NEVER hallucinate.

Return only the JSON object.`;

// ── Type routing ───────────────────────────────────────────────────────────

type ResourceType = "professor_page" | "program_page" | "lab_page";

function schemaForType(type: ResourceType) {
  if (type === "professor_page") return { schema: PROFESSOR_SCHEMA, name: "professor_extraction", prompt: PROFESSOR_PROMPT };
  if (type === "lab_page") return { schema: LAB_SCHEMA, name: "lab_extraction", prompt: LAB_PROMPT };
  return { schema: PROGRAM_PAGE_SCHEMA, name: "program_page_extraction", prompt: PROGRAM_PAGE_PROMPT };
}

// ── OpenAI-compatible call ─────────────────────────────────────────────────

interface OpenAIResponse {
  choices?: Array<{ message?: { content?: string } }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    prompt_tokens_details?: { cached_tokens?: number };
  };
  model?: string;
}

interface Usage {
  input_tokens: number;
  output_tokens: number;
  cache_read_input_tokens: number;
  cache_creation_input_tokens: number;
}

export interface WebpageExtractionResult {
  facts: WebpageExtractedFacts;
  usage: Usage;
  model: string;
}

const MAX_CONTENT_CHARS = 120_000;

export async function extractWebpageFields(
  config: LlmConfig,
  url: string,
  resourceType: ResourceType,
): Promise<WebpageExtractionResult> {
  const fetched = await fetchUrlContent(url);
  if (!fetched) {
    throw new Error(`Failed to fetch URL or not an HTML page: ${url}`);
  }

  const text =
    fetched.content_text.length > MAX_CONTENT_CHARS
      ? fetched.content_text.slice(0, MAX_CONTENT_CHARS) + "\n\n[... content truncated ...]"
      : fetched.content_text;

  const { schema, name, prompt } = schemaForType(resourceType);

  const response = await fetch(`${config.baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: "system", content: prompt },
        {
          role: "user",
          content: `Source URL: ${url}\nPage title: ${fetched.title}\n\n---BEGIN PAGE TEXT---\n${text}\n---END PAGE TEXT---\n\nExtract every field defined in the JSON schema. Return only the JSON object.`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name, strict: true, schema },
      },
      max_tokens: 2048,
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

  const facts = JSON.parse(content) as WebpageExtractedFacts;
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
