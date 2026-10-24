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

const SYSTEM = `You write briefs for wire, a personal news desk.

Voice: neutral, factual, information-first. No hype, no clickbait, no moralizing.
Never invent facts, quotes, numbers, or outcomes that are not in the article.
Match the article language (Spanish in, Spanish out; English in, English out).

Structure exactly:
1) One short lead paragraph (1–2 sentences): what happened.
2) Three to five bullets ("- ") with the load-bearing details: who, what, when, where, numbers, decisions, consequences.
3) Optional one-line closer only if the article itself states what happens next.

Formatting:
- Plain text only. No markdown headings, no bold, no links.
- Bullets must start with "- ".
- No preamble ("Here is…", "Summary:", "En resumen:").
- Do not repeat the title as a heading.
- Keep the whole brief under ~180 words.

Facts:
- Separate the central event from background. Include background only when the event is unclear without it.
- Prioritize concrete developments, decisions, consequences, and material later updates over repeated context.
- Treat omission markers such as "[...]" as missing source text, not as claims in the article.`;

export const SUMMARY_VERSION = 2;

export function getCachedSummary(url: string): SummaryRow | null {
  const row = getDb()
    .prepare(
      "SELECT url, title, summary, model, created_at FROM summaries WHERE url = ? AND version = ?",
    )
    .get(url, SUMMARY_VERSION) as SummaryRow | undefined;
  return row ?? null;
}

export function saveSummary(row: Omit<SummaryRow, "created_at"> & { created_at?: number }) {
  getDb()
    .prepare(
      `INSERT INTO summaries (url, title, summary, model, created_at, version)
       VALUES (@url, @title, @summary, @model, @created_at, @version)
       ON CONFLICT(url) DO UPDATE SET
         title = excluded.title,
         summary = excluded.summary,
         model = excluded.model,
         created_at = excluded.created_at,
         version = excluded.version`,
    )
    .run({
      url: row.url,
      title: row.title,
      summary: row.summary,
      model: row.model,
      created_at: row.created_at ?? Date.now(),
      version: SUMMARY_VERSION,
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
    name: "wire-ai",
    apiKey: ai.apiKey,
    baseURL: ai.baseURL,
  });

  const { text } = await generateText({
    model: provider.chatModel(ai.model),
    system: SYSTEM,
    prompt:
      `Title: ${opts.title?.trim() || "(unknown)"}\n` +
      `URL: ${opts.url}\n\n` +
      `Article text:\n${article}`,
    maxOutputTokens: 700,
    temperature: 0.2,
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
