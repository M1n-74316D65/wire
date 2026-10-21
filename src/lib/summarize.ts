import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText } from "ai";
import { getDb } from "./db";
import { getAiConfig } from "./env";
import { fetchArticleText } from "./fetch-article";

export type SummaryRow = {
  url: string;
  title: string | null;
  summary: string;
  model: string;
  created_at: number;
};

export function getCachedSummary(url: string): SummaryRow | null {
  const row = getDb()
    .prepare("SELECT url, title, summary, model, created_at FROM summaries WHERE url = ?")
    .get(url) as SummaryRow | undefined;
  return row ?? null;
}

export function saveSummary(row: Omit<SummaryRow, "created_at"> & { created_at?: number }) {
  getDb()
    .prepare(
      `INSERT INTO summaries (url, title, summary, model, created_at)
       VALUES (@url, @title, @summary, @model, @created_at)
       ON CONFLICT(url) DO UPDATE SET
         title = excluded.title,
         summary = excluded.summary,
         model = excluded.model,
         created_at = excluded.created_at`,
    )
    .run({
      url: row.url,
      title: row.title,
      summary: row.summary,
      model: row.model,
      created_at: row.created_at ?? Date.now(),
    });
}

export function deleteSummary(url: string) {
  getDb().prepare("DELETE FROM summaries WHERE url = ?").run(url);
}

export async function summarizeUrl(opts: {
  url: string;
  title?: string | null;
  force?: boolean;
}): Promise<SummaryRow> {
  if (!opts.force) {
    const cached = getCachedSummary(opts.url);
    if (cached) return cached;
  } else {
    deleteSummary(opts.url);
  }

  const ai = getAiConfig();
  if (!ai) throw new Error("AI is not configured (AI_API_KEY)");

  const article = await fetchArticleText(opts.url);
  const provider = createOpenAICompatible({
    name: "news-ai",
    apiKey: ai.apiKey,
    baseURL: ai.baseURL,
  });

  const { text } = await generateText({
    model: provider.chatModel(ai.model),
    system:
      "You summarize news articles for a minimalist headline reader. " +
      "Write a clear, neutral summary in 3–6 short paragraphs or bullets. " +
      "No hype, no marketing tone, no invented facts. Match the article language.",
    prompt:
      `Title: ${opts.title || "(unknown)"}\n` +
      `URL: ${opts.url}\n\n` +
      `Article text:\n${article}`,
  });

  const summary = text.trim();
  if (!summary) throw new Error("Model returned an empty summary");

  const row: SummaryRow = {
    url: opts.url,
    title: opts.title || null,
    summary,
    model: ai.model,
    created_at: Date.now(),
  };
  saveSummary(row);
  return row;
}
