import { dayKey, generateDigest } from "../src/lib/digest";

export type DigestCliResult = {
  at: string;
  day: string;
  status: "generated" | "empty-window" | "error";
  model?: string;
  headlines?: number;
  words?: number;
  error?: string;
};

/**
 * Pre-generate today's digest so /brief serves it from cache on first open.
 * The host cron drives this daily (same pattern as scripts/ingest.ts); the
 * on-demand path in /brief remains the fallback when this has not run yet.
 */
export async function runDigestCli(): Promise<DigestCliResult> {
  const at = new Date().toISOString();
  const day = dayKey(Date.now());

  try {
    const result = await generateDigest({ day, topic: "home" });
    return {
      at,
      day,
      status: "generated",
      model: result.model,
      headlines: result.headlines,
      words: result.content.trim().split(/\s+/).length,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.startsWith("No stories")) {
      return { at, day, status: "empty-window" };
    }
    return { at, day, status: "error", error: message };
  }
}

const result = await runDigestCli();
console.log(JSON.stringify(result, null, 2));
if (result.status === "error") {
  process.exitCode = 1;
}
