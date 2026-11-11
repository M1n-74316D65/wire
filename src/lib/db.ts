import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

export type HeadlineRow = {
  id: number;
  source_slug: string;
  title: string;
  url: string;
  published_at: number;
  hn_url: string | null;
  ingested_at: number;
  topic: string | null;
};

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "news.sqlite");

let db: Database.Database | null = null;

function ensureColumn(
  database: Database.Database,
  table: string,
  column: string,
  ddl: string,
) {
  const cols = database.prepare(`PRAGMA table_info(${table})`).all() as {
    name: string;
  }[];
  if (!cols.some((c) => c.name === column)) {
    database.exec(`ALTER TABLE ${table} ADD COLUMN ${ddl}`);
  }
}

export function getDb(): Database.Database {
  if (db) return db;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS headlines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_slug TEXT NOT NULL,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      published_at INTEGER NOT NULL,
      hn_url TEXT,
      ingested_at INTEGER NOT NULL,
      topic TEXT,
      UNIQUE(source_slug, url)
    );
    CREATE INDEX IF NOT EXISTS idx_headlines_source_pub
      ON headlines(source_slug, published_at DESC);
    CREATE INDEX IF NOT EXISTS idx_headlines_pub
      ON headlines(published_at DESC);
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS summaries (
      url TEXT PRIMARY KEY,
      title TEXT,
      summary TEXT NOT NULL,
      model TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      version INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS source_status (
      source_slug     TEXT PRIMARY KEY,
      last_fetched_at INTEGER NOT NULL,
      ok              INTEGER NOT NULL,
      error           TEXT,
      inserted        INTEGER NOT NULL DEFAULT 0,
      blocked         INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS digests (
      day        TEXT PRIMARY KEY,
      model      TEXT NOT NULL,
      content    TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);

  // Existing DBs created before topic columns
  ensureColumn(db, "headlines", "topic", "topic TEXT");
  ensureColumn(db, "summaries", "version", "version INTEGER NOT NULL DEFAULT 1");
  db.exec(
    `CREATE INDEX IF NOT EXISTS idx_headlines_topic_pub
     ON headlines(topic, published_at DESC)`,
  );

  return db;
}

export function getLastIngestAt(): number | null {
  const row = getDb()
    .prepare("SELECT value FROM meta WHERE key = 'last_ingest_at'")
    .get() as { value: string } | undefined;
  return row ? Number(row.value) : null;
}

export function setLastIngestAt(ts: number) {
  getDb()
    .prepare(
      `INSERT INTO meta(key, value) VALUES('last_ingest_at', ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    )
    .run(String(ts));
}

export type SourceStatus = {
  source_slug: string;
  last_fetched_at: number;
  ok: boolean;
  error: string | null;
  inserted: number;
  blocked: number;
};

/** Record the outcome of one source's ingest attempt. */
export function setSourceStatus(
  source_slug: string,
  outcome: {
    at: number;
    ok: boolean;
    error?: string | null;
    inserted?: number;
    blocked?: number;
  },
) {
  getDb()
    .prepare(
      `INSERT INTO source_status
         (source_slug, last_fetched_at, ok, error, inserted, blocked)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(source_slug) DO UPDATE SET
         last_fetched_at = excluded.last_fetched_at,
         ok = excluded.ok,
         error = excluded.error,
         inserted = excluded.inserted,
         blocked = excluded.blocked`,
    )
    .run(
      source_slug,
      outcome.at,
      outcome.ok ? 1 : 0,
      outcome.error ?? null,
      outcome.inserted ?? 0,
      outcome.blocked ?? 0,
    );
}

export function getSourceStatus(
  source_slug: string,
): SourceStatus | null {
  const row = getDb()
    .prepare(
      `SELECT source_slug, last_fetched_at, ok, error, inserted, blocked
       FROM source_status WHERE source_slug = ?`,
    )
    .get(source_slug) as
    | {
        source_slug: string;
        last_fetched_at: number;
        ok: number;
        error: string | null;
        inserted: number;
        blocked: number;
      }
    | undefined;
  if (!row) return null;
  return {
    source_slug: row.source_slug,
    last_fetched_at: row.last_fetched_at,
    ok: !!row.ok,
    error: row.error,
    inserted: row.inserted,
    blocked: row.blocked,
  };
}

export function getAllSourceStatus(): SourceStatus[] {
  const rows = getDb()
    .prepare(
      `SELECT source_slug, last_fetched_at, ok, error, inserted, blocked
       FROM source_status`,
    )
    .all() as {
    source_slug: string;
    last_fetched_at: number;
    ok: number;
    error: string | null;
    inserted: number;
    blocked: number;
  }[];
  return rows.map((r) => ({
    source_slug: r.source_slug,
    last_fetched_at: r.last_fetched_at,
    ok: !!r.ok,
    error: r.error,
    inserted: r.inserted,
    blocked: r.blocked,
  }));
}


