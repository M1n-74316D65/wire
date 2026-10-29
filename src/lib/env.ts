export type AiConfig = {
  apiKey: string;
  baseURL: string;
  model: string;
};

export function getSummarizePassword(): string | null {
  const v = process.env.SUMMARIZE_PASSWORD?.trim();
  return v || null;
}

export function getAiConfig(): AiConfig | null {
  const apiKey = process.env.AI_API_KEY?.trim();
  if (!apiKey) return null;
  return {
    apiKey,
    baseURL: (process.env.AI_BASE_URL?.trim() || "https://api.openai.com/v1").replace(
      /\/$/,
      "",
    ),
    model: process.env.AI_MODEL?.trim() || "gpt-4o-mini",
  };
}

export function summarizeConfigured(): boolean {
  return Boolean(getSummarizePassword() && getAiConfig());
}
