import {
  getAllSourceStatus,
  getDb,
  getLastIngestAt,
  type HeadlineRow,
  type SourceStatus,
} from "./db";
import {
  getSource,
  SOURCES,
  sourcesForTopic,
  TOPICS,
  type Source,
  type Topic,
} from "./sources";
import { relativeTime } from "./time";

export type Headline = {
  title: string;
  url: string;
  publishedAt: number;
  hnUrl: string | null;
  sourceSlug: string;
  topic: string | null;
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
    topic: row.topic ?? null,
  };
}

/** Read paths degrade to the fallback when the database cannot be opened;
 *  write paths (ingest, summaries) still throw so failures stay loud. */
function safe<T>(fallback: T, fn: () => T): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

export function queryHeadlines(opts: {
  sourceSlug: string;
  limit: number;
  hours: number;
}): Headline[] {
  return safe([], () => {
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
  });
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
  return safe([], () => getFeedRows(opts));
}

function getFeedRows(opts: {
  topic: Topic | "all" | "home";
  limit: number;
  hours: number;
}): Headline[] {
  const since = Date.now() - opts.hours * 60 * 60 * 1000;

  if (opts.topic === "all") {
    const rows = getDb()
      .prepare(
        `SELECT * FROM headlines
         WHERE published_at >= ?
         ORDER BY published_at DESC
         LIMIT ?`,
      )
      .all(since, opts.limit) as HeadlineRow[];
    return rows.map(mapRow);
  }

  if (opts.topic === "home") {
    const sources = sourcesForTopic("home");
    if (sources.length === 0) return [];
    const slugs = sources.map((s) => s.slug);
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

  // In section T: the headline's source is tagged with T
  // (so Xataka → tech still shows under Spain; El País → politics still under Spain)
  const sources = sourcesForTopic(opts.topic);
  const slugs = sources.map((s) => s.slug);
  if (slugs.length === 0) return [];

  const placeholders = slugs.map(() => "?").join(",");
  const rows = getDb()
    .prepare(
      `SELECT * FROM headlines
       WHERE published_at >= ?
         AND source_slug IN (${placeholders})
       ORDER BY published_at DESC
       LIMIT ?`,
    )
    .all(since, ...slugs, opts.limit) as HeadlineRow[];
  return rows.map(mapRow);
}

/** Headline count per section key ("home", "all", topic slugs) in a window,
 *  mirroring getFeed's source-based routing exactly. */
export function getSectionCounts(hours: number): Record<string, number> {
  return safe(emptySectionCounts(), () => {
    const since = Date.now() - hours * 60 * 60 * 1000;
    const rows = getDb()
      .prepare(
        `SELECT source_slug, COUNT(*) AS n FROM headlines
         WHERE published_at >= ? GROUP BY source_slug`,
      )
      .all(since) as { source_slug: string; n: number }[];
    const perSource = new Map(rows.map((r) => [r.source_slug, r.n]));
    const counts: Record<string, number> = {};
    const add = (key: string, sources: Source[]) => {
      counts[key] = sources.reduce(
        (acc, s) => acc + (perSource.get(s.slug) ?? 0),
        0,
      );
    };
    add("home", sourcesForTopic("home"));
    add("all", sourcesForTopic("all"));
    for (const t of TOPICS) add(t.slug, sourcesForTopic(t.slug));
    return counts;
  });
}

function emptySectionCounts(): Record<string, number> {
  const counts: Record<string, number> = { home: 0, all: 0 };
  for (const t of TOPICS) counts[t.slug] = 0;
  return counts;
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
  return safe([], () => wordFrequenciesRows(hours, top));
}

function wordFrequenciesRows(hours: number, top = 80): { word: string; count: number }[] {
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
     how what when where who why which more most some any all also just than then
     your have has now first one two back last`.split(
      /\s+/,
    ),
  );
  for (const w of SPANISH_STOP) stop.add(w);

  const counts = new Map<string, number>();
  for (const { title } of rows) {
    for (const w of tokenize(title)) {
      if (stop.has(w)) continue;
      counts.set(w, (counts.get(w) || 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, top);
}

const SPANISH_STOP = `el la los las un una unos unas y o pero de del al a en con por para sin sobre
  entre hasta desde tras ante como que qué es son fue ser está están este esta estos estas
  ese esa eso su sus se lo le les me te nos mas más muy ya no sí tras tras año años`.split(/\s+/);

/** Lowercase letter/number tokens, keeping accented letters whole. */
export function tokenize(title: string): string[] {
  return title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s'-]/gu, " ")
    .split(/\s+/)
    .map((w) => w.replace(/^['-]+|['-]+$/g, ""))
    .filter((w) => w.length > 2 && !/^\d+$/.test(w));
}

export function lastUpdatedLabel(): number | null {
  return safe(null, () => getLastIngestAt());
}

export type SourceHealth = {
  slug: string;
  state: "fresh" | "stale" | "failed" | "never";
  detail: string | null;
};

const STALE_MS = 6 * 60 * 60 * 1000;

function healthFor(slug: string, s: SourceStatus | null): SourceHealth {
  if (!s) return { slug, state: "never", detail: null };
  if (!s.ok)
    return {
      slug,
      state: "failed",
      detail: s.error ?? "last fetch failed",
    };
  const age = Date.now() - s.last_fetched_at;
  if (age <= STALE_MS) {
    return { slug, state: "fresh", detail: relativeTime(s.last_fetched_at) };
  }
  return {
    slug,
    state: "stale",
    detail: `last fetched ${relativeTime(s.last_fetched_at)} ago`,
  };
}

/** Health of every source (fresh / stale / failed / never-fetched). */
export function getSourceHealth(): SourceHealth[] {
  return safe(
    SOURCES.map((src) => ({
      slug: src.slug,
      state: "never" as const,
      detail: null,
    })),
    () => {
      const map = new Map<string, SourceStatus>();
      for (const s of getAllSourceStatus()) map.set(s.source_slug, s);
      return SOURCES.map((src) => healthFor(src.slug, map.get(src.slug) ?? null));
    },
  );
}
