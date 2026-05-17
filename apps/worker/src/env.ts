import type { D1Database } from "@cloudflare/workers-types";

export interface Env {
  DB: D1Database;
  ASSETS?: Fetcher;
  ENVIRONMENT: string;
  APP_NAME: string;
  API_TOKEN?: string;
  CRON_SECRET?: string;
  // LLM provider — any OpenAI-compatible /v1/chat/completions endpoint.
  // Tested with OpenAI, DeepSeek, OpenRouter, xAI, self-hosted LiteLLM.
  LLM_API_KEY?: string;
  LLM_BASE_URL?: string; // defaults to https://api.openai.com/v1
  LLM_MODEL?: string;    // defaults to gpt-4o-mini
}
