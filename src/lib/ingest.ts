import Parser from "rss-parser";
import {
  classifyHeadline,
  fallbackTopic,
  topicFromSourceAlone,
} from "./classify-topic";
import {
  countUnclassifiedForSources,
  countUnclassifiedHeadlines,
  getDb,
  listUnclassifiedForSources,
  listUnclassifiedHeadlines,
  setHeadlineTopic,
  setLastIngestAt,
} from "./db";
import { decisionConfigured } from "./env";
import { getSource, SOURCES, type Topic } from "./sources";

const parser = new Parser({
  timeout: 15_000,
  headers: {
    "User-Agent": "wire/0.1 (+https://news.m1n.land; RSS reader)",
    Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml",
  },
});

export type IngestResult = {
  source: string;
  inserted: number;
  error?: string;
};

/** Ambiguous sources (2+ topics) — only these hit the decision model. */
const MODEL_SOURCE_SLUGS = SOURCES.filter((s) => s.topics.length >= 2).map(
  (s) => s.slug,
);

function classifyBudget(): { limit: number; concurrency: number; backlog: number } {
  const base = Number(process.env.DECISION_CLASSIFY_LIMIT);
  const conc = Number(process.env.DECISION_CLASSIFY_CONCURRENCY);
  // Low defaults: conserve free-tier decision calls
  const baseLimit = Number.isFinite(base) && base > 0 ? base : 20;
  const concurrency = Number.isFinite(conc) && conc > 0 ? Math.min(conc, 4) : 2;
  const backlog = countUnclassifiedForSources(MODEL_SOURCE_SLUGS);
  // Mild catch-up only — never more than 40 model calls per ingest
  const limit = backlog > 400 ? Math.min(40, baseLimit * 2) : baseLimit;
  return { limit, concurrency, backlog };
}

function extractHnUrl(item: Parser.Item): string | null {
  const candidates = [
    item.link,
    ...(item.guid ? [item.guid] : []),
    (item as { comments?: string }).comments,
  ].filter(Boolean) as string[];
  for (const c of candidates) {
    if (c.includes("news.ycombinator.com/item")) return c;
  }
  const comments = (item as { comments?: string }).comments;
  if (comments?.includes("news.ycombinator.com")) return comments;
  return null;
}

function publishedMs(item: Parser.Item): number {
  const raw = item.isoDate || item.pubDate;
  if (!raw) return Date.now();
  const t = Date.parse(raw);
  return Number.isFinite(t) ? t : Date.now();
}

function applyTopic(
  id: number,
  topic: string,
  confidence: number,
  model: string,
) {
  setHeadlineTopic(id, topic, confidence, model);
}

/** Assign source-only topics with zero model calls. */
function assignSourceOnlyTopics(): number {
  const rows = listUnclassifiedHeadlines(500);
  let n = 0;
  for (const row of rows) {
    const source = getSource(row.source_slug);
    if (!source) continue;
    const alone = topicFromSourceAlone(source.topics);
    if (!alone) continue;
    applyTopic(row.id, alone.topic, alone.confidence, alone.model);
    n += 1;
  }
  return n;
}

async function ingestSource(slug: string, feedUrl: string): Promise<IngestResult> {
  const db = getDb();
  const source = getSource(slug);
  const alone = source ? topicFromSourceAlone(source.topics) : null;

  const insert = db.prepare(`
    INSERT INTO headlines (
      source_slug, title, url, published_at, hn_url, ingested_at,
      topic, topic_confidence, topic_model
    )
    VALUES (
      @source_slug, @title, @url, @published_at, @hn_url, @ingested_at,
      @topic, @topic_confidence, @topic_model
    )
    ON CONFLICT(source_slug, url) DO UPDATE SET
      title = excluded.title,
      published_at = excluded.published_at,
      hn_url = COALESCE(excluded.hn_url, headlines.hn_url)
  `);

  try {
    const feed = await parser.parseURL(feedUrl);
    const now = Date.now();
    let inserted = 0;
    const tx = db.transaction((items: Parser.Item[]) => {
      for (const item of items) {
        const title = (item.title || "").trim();
        const url = (item.link || "").trim();
        if (!title || !url) continue;
        const info = insert.run({
          source_slug: slug,
          title,
          url,
          published_at: publishedMs(item),
          hn_url: slug === "hn" ? extractHnUrl(item) : null,
          ingested_at: now,
          topic: alone?.topic ?? null,
          topic_confidence: alone?.confidence ?? null,
          topic_model: alone?.model ?? null,
        });
        if (info.changes > 0) inserted += 1;
      }
    });
    tx(feed.items || []);
    return { source: slug, inserted };
  } catch (err) {
    return {
      source: slug,
      inserted: 0,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

async function classifyUnclassified(): Promise<{
  classified: number;
  sourceAssigned: number;
  skipped: number;
  errors: number;
  backlog: number;
  attempted: number;
}> {
  // Always resolve single-topic sources locally (works even without DECISION_API_KEY)
  const sourceAssigned = assignSourceOnlyTopics();

  if (!decisionConfigured()) {
    return {
      classified: 0,
      sourceAssigned,
      skipped: 0,
      errors: 0,
      backlog: countUnclassifiedHeadlines(),
      attempted: 0,
    };
  }

  const { limit, concurrency, backlog } = classifyBudget();
  const rows = listUnclassifiedForSources(MODEL_SOURCE_SLUGS, limit);

  let classified = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < rows.length; i += concurrency) {
    const batch = rows.slice(i, i + concurrency);
    const outcomes = await Promise.all(
      batch.map(async (row): Promise<"ok" | "skip" | "err"> => {
        const source = getSource(row.source_slug);
        if (!source) {
          // Unknown source — park under news so we never retry forever
          applyTopic(row.id, "news", 0, "source-fallback");
          return "skip";
        }
        try {
          const result = await classifyHeadline({
            title: row.title,
            sourceName: source.name,
            sourceTopics: source.topics as Topic[],
          });
          if (result) {
            applyTopic(row.id, result.topic, result.confidence, result.model);
            return "ok";
          }
          // Low confidence → commit source fallback once (no re-burn)
          const fb = fallbackTopic(source.topics);
          if (fb) {
            applyTopic(row.id, fb.topic, fb.confidence, fb.model);
          }
          return "skip";
        } catch {
          // Transient API/network errors: leave topic NULL and retry next ingest
          return "err";
        }
      }),
    );
    for (const o of outcomes) {
      if (o === "ok") classified += 1;
      else if (o === "skip") skipped += 1;
      else errors += 1;
    }
  }

  return {
    classified,
    sourceAssigned,
    skipped,
    errors,
    backlog,
    attempted: rows.length,
  };
}

export async function ingestAll(options?: {
  slugs?: string[];
}): Promise<{
  results: IngestResult[];
  at: number;
  classification: {
    classified: number;
    sourceAssigned: number;
    skipped: number;
    errors: number;
    backlog: number;
    attempted: number;
  };
}> {
  const list = options?.slugs
    ? SOURCES.filter((s) => options.slugs!.includes(s.slug))
    : SOURCES;

  const results: IngestResult[] = [];
  const concurrency = 6;
  for (let i = 0; i < list.length; i += concurrency) {
    const batch = list.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map((s) => ingestSource(s.slug, s.feedUrl)),
    );
    results.push(...batchResults);
  }

  const classification = await classifyUnclassified();

  const at = Date.now();
  setLastIngestAt(at);
  return { results, at, classification };
}
