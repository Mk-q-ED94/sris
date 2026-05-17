import type { LlmConfig } from "./extract-program";

interface OpenAIResponse {
  choices?: Array<{ message?: { content?: string } }>;
}

const SYSTEM_PROMPT = `You are a research assistant for a Japanese SGU master's program applicant.
Summarize this webpage in 2-3 sentences (under 80 words).
Focus on the most decision-relevant facts: key dates, admission requirements, professor research focus, lab themes, program language/quota, or application conditions.
Do not repeat the page title. Write in English.`;

export async function summarizeResourceContent(
  config: LlmConfig,
  params: {
    title: string;
    resource_type: string;
    content_text: string;
  },
): Promise<string> {
  const snippet = params.content_text.slice(0, 3000);
  const userMsg = `Resource type: ${params.resource_type}\nTitle: ${params.title}\n\n${snippet}`;

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
      max_tokens: 180,
      temperature: 0,
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) throw new Error(`LLM ${response.status}`);
  const data = (await response.json()) as OpenAIResponse;
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("LLM returned no content");
  return content;
}
