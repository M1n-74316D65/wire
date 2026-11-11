import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText } from "ai";
import { getDb } from "./db";
import { getAiConfig } from "./env";
import { getFeed } from "./queries";
import type { Topic } from "./sources";

export type DigestRow = {
  day: string;
  model: string;
  content: string;
  created_at: number;
};

export type DigestResult = {
  day: string;
  content: string;
  model: string;
  createdAt: number;
  generated: boolean; // true if freshly generated, false if served from cache
  headlines: number; // number of headlines the digest drew from
};

const SYSTEM = `You write a daily briefing for wire, a personal news desk.

You are given a list of recent headlines (title, source, link). Produce a short,
calm digest of the day. Do NOT invent facts, quotes, numbers, or outcomes that
are not stated in the headlines. If a headline is ambiguous, say only what it
claims.

Voice: neutral, factual, information-first. No hype, no clickbait, no moralizing.

Structure exactly:
1) One opening line: the date's overall shape, in a single sentence.
2) Group the day into at most three short sections, each headed by a lowercase
   label on its own line, followed by one or two sentences per item. Use these
   labels only when they fit: "tech", "world", "spain", "other".
3) For each item, name the source in plain words (e.g. "ArsTechnica reports…").
   Keep each item to one or two sentences.

Formatting:
- Plain text only. No markdown headings, no bold, no links, no bullet glyphs.
- No preamble ("Here is…", "Daily brief:", "Resumen:").
- End with a single line: "N stories covered." where N is the count you were given.

Length: keep the whole briefing under ~400 words. If the list is small, be
brief; do not pad. If it is large, pick the items that matter and drop the rest.`;

export function dayKey(ts: number, timeZone: string = "Europe/Madrid"): string {
  const d = new Date(ts);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function getCachedDigest(day: string): DigestRow | null {
  const row = getDb()
    .prepare(
      "SELECT day, model, content, created_at FROM digests WHERE day = ?",
    )
    .get(day) as DigestRow | undefined;
  return row ?? null;
}

export function saveDigest(row: Omit<DigestRow, "created_at"> & {
  created_at?: number;
}) {
  getDb()
    .prepare(
      `INSERT INTO digests (day, model, content, created_at)
       VALUES (@day, @model, @content, @created_at)
       ON CONFLICT(day) DO UPDATE SET
         model = excluded.model,
         content = excluded.content,
         created_at = excluded.created_at`,
    )
    .run({
      day: row.day,
      model: row.model,
      content: row.content,
      created_at: row.created_at ?? Date.now(),
    });
}

export async function generateDigest(opts: {
  day: string;
  hours?: number;
  limit?: number;
  topic?: Topic | "all" | "home";
}): Promise<DigestResult> {
  const ai = getAiConfig();
  if (!ai) throw new Error("AI is not configured (AI_API_KEY)");

  const hours = opts.hours ?? 24;
  const limit = opts.limit ?? 60;
  const feed = getFeed({
    topic: opts.topic ?? "home",
    limit,
    hours,
  });

  if (feed.length === 0) {
    throw new Error("No stories in this window to brief.");
  }

  const lines = feed.map(
    (h, i) => `${i + 1}. [${h.sourceSlug}] ${h.title} — ${h.url}`,
  );

  const provider = createOpenAICompatible({
    name: "wire-ai",
    apiKey: ai.apiKey,
    baseURL: ai.baseURL,
  });

  const { text } = await generateText({
    model: provider.chatModel(ai.model),
    system: SYSTEM,
    prompt: `Today is ${opts.day}.\n\n${feed.length} recent headlines:\n${lines.join(
      "\n",
    )}`,
    maxOutputTokens: 900,
    temperature: 0.2,
  });

  const content = text.trim();
  if (!content) throw new Error("Model returned an empty digest");

  const row: DigestRow = {
    day: opts.day,
    model: ai.model,
    content,
    created_at: Date.now(),
  };
  saveDigest(row);

  return {
    day: opts.day,
    content,
    model: row.model,
    createdAt: row.created_at,
    generated: true,
    headlines: feed.length,
  };
}
