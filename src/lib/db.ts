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
  topic_confidence: number | null;
  topic_model: string | null;
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
      topic_confidence REAL,
      topic_model TEXT,
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
  `);

  // Existing DBs created before topic columns
  ensureColumn(db, "headlines", "topic", "topic TEXT");
  ensureColumn(db, "headlines", "topic_confidence", "topic_confidence REAL");
  ensureColumn(db, "headlines", "topic_model", "topic_model TEXT");
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

export function setHeadlineTopic(
  id: number,
  topic: string,
  confidence: number,
  model: string,
) {
  getDb()
    .prepare(
      `UPDATE headlines
       SET topic = ?, topic_confidence = ?, topic_model = ?
       WHERE id = ?`,
    )
    .run(topic, confidence, model, id);
}

export function countUnclassifiedHeadlines(): number {
  const row = getDb()
    .prepare(`SELECT COUNT(*) AS n FROM headlines WHERE topic IS NULL`)
    .get() as { n: number };
  return row.n;
}

export function countUnclassifiedForSources(sourceSlugs: string[]): number {
  if (sourceSlugs.length === 0) return 0;
  const placeholders = sourceSlugs.map(() => "?").join(",");
  const row = getDb()
    .prepare(
      `SELECT COUNT(*) AS n FROM headlines
       WHERE topic IS NULL AND source_slug IN (${placeholders})`,
    )
    .get(...sourceSlugs) as { n: number };
  return row.n;
}

export function listUnclassifiedHeadlines(limit: number): HeadlineRow[] {
  return getDb()
    .prepare(
      `SELECT * FROM headlines
       WHERE topic IS NULL
       ORDER BY ingested_at DESC
       LIMIT ?`,
    )
    .all(limit) as HeadlineRow[];
}

/** Unclassified rows from specific sources (e.g. multi-topic feeds only). */
export function listUnclassifiedForSources(
  sourceSlugs: string[],
  limit: number,
): HeadlineRow[] {
  if (sourceSlugs.length === 0 || limit <= 0) return [];
  const placeholders = sourceSlugs.map(() => "?").join(",");
  return getDb()
    .prepare(
      `SELECT * FROM headlines
       WHERE topic IS NULL AND source_slug IN (${placeholders})
       ORDER BY ingested_at DESC
       LIMIT ?`,
    )
    .all(...sourceSlugs, limit) as HeadlineRow[];
}
