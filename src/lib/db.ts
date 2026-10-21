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
};

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "news.sqlite");

let db: Database.Database | null = null;

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
      created_at INTEGER NOT NULL
    );
  `);
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
