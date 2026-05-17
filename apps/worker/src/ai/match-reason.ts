import type { LlmConfig } from "./extract-program";

const SYSTEM_PROMPT = `You are a research advisor helping a CS / AI master's program applicant in Japan evaluate fit.
Given the applicant's research background and a professor or program profile, write a 2–3 sentence match assessment.
Be concrete: name specific overlapping research areas or requirements, and flag any gaps.
Do NOT use vague praise ("great fit", "excellent"). Focus on evidence.
Write in English. Under 80 words.`;

export async function generateMatchReason(
  config: LlmConfig,
  params: {
    entity_type: "professor" | "program";
    entity_name: string;
    entity_details: string;
    research_background: string;
    target_fields: string;
  },
): Promise<string> {
  const userBlock = [
    `Research background: ${params.research_background || "(not specified)"}`,
    params.target_fields ? `Target fields: ${params.target_fields}` : "",
  ].filter(Boolean).join("\n");

  const entityBlock = `${params.entity_type === "professor" ? "Professor" : "Program"}: ${params.entity_name}\n${params.entity_details}`;

  const response = await fetch(`${config.baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", authorization: `Bearer ${config.apiKey}` },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 200,
      temperature: 0.3,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `APPLICANT PROFILE\n${userBlock}\n\nENTITY\n${entityBlock}` },
      ],
    }),
  });

  if (!response.ok) throw new Error(`LLM error ${response.status}`);
  const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const text = data.choices?.[0]?.message?.content?.trim() ?? "";
  if (!text) throw new Error("Empty match reason from LLM");
  return text;
}
