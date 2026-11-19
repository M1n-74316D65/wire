import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText } from "ai";
import { getDb } from "./db";
import { getAiConfig } from "./env";
import { DeskError } from "./errors";
import { getFeed } from "./queries";
import { dayKey } from "./time";
import type { Topic } from "./sources";

export { dayKey };

/** Leaves room under the page's 60s budget. */
const MODEL_TIMEOUT_MS = 45_000;

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
  if (!ai) throw new DeskError("AI is not configured on this desk.");

  const hours = opts.hours ?? 24;
  const limit = opts.limit ?? 60;
  const feed = getFeed({
    topic: opts.topic ?? "home",
    limit,
    hours,
  });

  if (feed.length === 0) {
    throw new DeskError("No stories in this window to brief.");
  }

  const lines = feed.map(
    (h, i) => `${i + 1}. [${h.sourceSlug}] ${h.title} — ${h.url}`,
  );

  const provider = createOpenAICompatible({
    name: "wire-ai",
    apiKey: ai.apiKey,
    baseURL: ai.baseURL,
  });

  let text: string;
  try {
    ({ text } = await generateText({
      model: provider.chatModel(ai.model),
      system: SYSTEM,
      prompt: `Today is ${opts.day}.\n\n${feed.length} recent headlines:\n${lines.join(
        "\n",
      )}`,
      maxOutputTokens: 900,
      temperature: 0.2,
      maxRetries: 1,
      abortSignal: AbortSignal.timeout(MODEL_TIMEOUT_MS),
    }));
  } catch (err) {
    if (err instanceof Error && err.name === "TimeoutError") {
      throw new DeskError("The model took too long. Try again.");
    }
    throw err;
  }

  const content = text.trim();
  if (!content) throw new DeskError("The model returned an empty brief.");

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
