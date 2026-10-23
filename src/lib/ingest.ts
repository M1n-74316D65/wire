import Parser from "rss-parser";
import { classifyHeadline } from "./classify-topic";
import {
  getDb,
  listUnclassifiedHeadlines,
  setHeadlineTopic,
  setLastIngestAt,
} from "./db";
import { decisionConfigured } from "./env";
import { getSource, SOURCES } from "./sources";

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

const CLASSIFY_LIMIT = 40;
const CLASSIFY_CONCURRENCY = 3;

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

async function ingestSource(slug: string, feedUrl: string): Promise<IngestResult> {
  const db = getDb();
  const insert = db.prepare(`
    INSERT INTO headlines (source_slug, title, url, published_at, hn_url, ingested_at)
    VALUES (@source_slug, @title, @url, @published_at, @hn_url, @ingested_at)
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
  skipped: number;
  errors: number;
}> {
  if (!decisionConfigured()) {
    return { classified: 0, skipped: 0, errors: 0 };
  }

  const rows = listUnclassifiedHeadlines(CLASSIFY_LIMIT);
  let classified = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < rows.length; i += CLASSIFY_CONCURRENCY) {
    const batch = rows.slice(i, i + CLASSIFY_CONCURRENCY);
    const outcomes = await Promise.all(
      batch.map(async (row): Promise<"ok" | "skip" | "err"> => {
        const source = getSource(row.source_slug);
        if (!source) return "skip";
        try {
          const result = await classifyHeadline({
            title: row.title,
            sourceName: source.name,
            sourceTopics: source.topics,
          });
          if (!result) return "skip";
          setHeadlineTopic(
            row.id,
            result.topic,
            result.confidence,
            result.model,
          );
          return "ok";
        } catch {
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

  return { classified, skipped, errors };
}

export async function ingestAll(options?: {
  slugs?: string[];
}): Promise<{
  results: IngestResult[];
  at: number;
  classification: { classified: number; skipped: number; errors: number };
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
