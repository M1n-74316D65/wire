export type AiConfig = {
  apiKey: string;
  baseURL: string;
  model: string;
};

export type DecisionConfig = {
  apiKey: string;
  baseURL: string;
  model: string;
  minConfidence: number;
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

export function getDecisionConfig(): DecisionConfig | null {
  const apiKey = process.env.DECISION_API_KEY?.trim();
  if (!apiKey) return null;
  const minRaw = Number(process.env.DECISION_MIN_CONFIDENCE);
  return {
    apiKey,
    baseURL: (
      process.env.DECISION_BASE_URL?.trim() ||
      "https://openrouter.ai/api/alpha/decisions"
    ).replace(/\/$/, ""),
    model: process.env.DECISION_MODEL?.trim() || "inception/mercury-decide:free",
    minConfidence: Number.isFinite(minRaw) && minRaw > 0 ? minRaw : 0.45,
  };
}

export function decisionConfigured(): boolean {
  return Boolean(getDecisionConfig());
}
