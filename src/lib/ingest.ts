import Parser from "rss-parser";
import { getDb, setLastIngestAt } from "./db";
import { SOURCES } from "./sources";

const parser = new Parser({
  timeout: 15_000,
  headers: {
    "User-Agent": "news-aggregator/0.1 (+https://localhost; RSS reader)",
    Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml",
  },
});

export type IngestResult = {
  source: string;
  inserted: number;
  error?: string;
};

function extractHnUrl(item: Parser.Item): string | null {
  const candidates = [
    item.link,
    ...(item.guid ? [item.guid] : []),
    // hnrss puts discussion in comments field sometimes
    (item as { comments?: string }).comments,
  ].filter(Boolean) as string[];
  for (const c of candidates) {
    if (c.includes("news.ycombinator.com/item")) return c;
  }
  // hnrss: link is article, comments is HN
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

export async function ingestAll(options?: {
  slugs?: string[];
}): Promise<{ results: IngestResult[]; at: number }> {
  const list = options?.slugs
    ? SOURCES.filter((s) => options.slugs!.includes(s.slug))
    : SOURCES;

  const results: IngestResult[] = [];
  // modest concurrency
  const concurrency = 6;
  for (let i = 0; i < list.length; i += concurrency) {
    const batch = list.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map((s) => ingestSource(s.slug, s.feedUrl)),
    );
    results.push(...batchResults);
  }

  const at = Date.now();
  setLastIngestAt(at);
  return { results, at };
}
