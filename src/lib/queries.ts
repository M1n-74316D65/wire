import { getDb, getLastIngestAt, type HeadlineRow } from "./db";
import {
  getSource,
  sourcesForTopic,
  type Source,
  type Topic,
} from "./sources";

export type Headline = {
  title: string;
  url: string;
  publishedAt: number;
  hnUrl: string | null;
  sourceSlug: string;
};

export type SourceColumn = {
  source: Source;
  headlines: Headline[];
};

function mapRow(row: HeadlineRow): Headline {
  return {
    title: row.title,
    url: row.url,
    publishedAt: row.published_at,
    hnUrl: row.hn_url,
    sourceSlug: row.source_slug,
  };
}

export function queryHeadlines(opts: {
  sourceSlug: string;
  limit: number;
  hours: number;
}): Headline[] {
  const since = Date.now() - opts.hours * 60 * 60 * 1000;
  const rows = getDb()
    .prepare(
      `SELECT * FROM headlines
       WHERE source_slug = ? AND published_at >= ?
       ORDER BY published_at DESC
       LIMIT ?`,
    )
    .all(opts.sourceSlug, since, opts.limit) as HeadlineRow[];
  return rows.map(mapRow);
}

export function getColumns(opts: {
  topic: Topic | "all" | "home";
  limit: number;
  hours: number;
}): SourceColumn[] {
  const sources = sourcesForTopic(opts.topic);
  return sources
    .map((source) => ({
      source,
      headlines: queryHeadlines({
        sourceSlug: source.slug,
        limit: opts.limit,
        hours: opts.hours,
      }),
    }))
    .filter((col) => col.headlines.length > 0 || opts.topic === "home");
}

/** Chronological stream across sources for a topic. */
export function getFeed(opts: {
  topic: Topic | "all" | "home";
  limit: number;
  hours: number;
}): Headline[] {
  const sources = sourcesForTopic(opts.topic);
  if (sources.length === 0) return [];
  const slugs = sources.map((s) => s.slug);
  const since = Date.now() - opts.hours * 60 * 60 * 1000;
  const placeholders = slugs.map(() => "?").join(",");
  const rows = getDb()
    .prepare(
      `SELECT * FROM headlines
       WHERE source_slug IN (${placeholders}) AND published_at >= ?
       ORDER BY published_at DESC
       LIMIT ?`,
    )
    .all(...slugs, since, opts.limit) as HeadlineRow[];
  return rows.map(mapRow);
}

export function getSourceColumn(
  slug: string,
  limit: number,
  hours: number,
): SourceColumn | null {
  const source = getSource(slug);
  if (!source) return null;
  return {
    source,
    headlines: queryHeadlines({ sourceSlug: slug, limit, hours }),
  };
}

export function wordFrequencies(hours: number, top = 80): { word: string; count: number }[] {
  const since = Date.now() - hours * 60 * 60 * 1000;
  const rows = getDb()
    .prepare(
      `SELECT title FROM headlines WHERE published_at >= ? ORDER BY published_at DESC LIMIT 2000`,
    )
    .all(since) as { title: string }[];

  const stop = new Set(
    `a an the and or but of to in on for with from by as at is are was were be been being
     it this that these those i you he she we they his her its our their not no yes
     new says say said will can could would should about after into over under out up
     how what when where who why which more most some any all also just than then`.split(
      /\s+/,
    ),
  );

  const counts = new Map<string, number>();
  for (const { title } of rows) {
    const words = title
      .toLowerCase()
      .replace(/[^a-z0-9\s'-]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stop.has(w) && !/^\d+$/.test(w));
    for (const w of words) counts.set(w, (counts.get(w) || 0) + 1);
  }

  return [...counts.entries()]
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, top);
}

export function lastUpdatedLabel(): number | null {
  return getLastIngestAt();
}
