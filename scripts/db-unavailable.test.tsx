import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// Force the SQLite open to fail before any lib module loads: WIRE_DB_PATH
// points into a "data" that is a regular file, so mkdirSync/open throws.
// This mirrors the crash path seen when the native driver cannot open the DB.
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "wire-dbdown-"));
fs.writeFileSync(path.join(dir, "data"), "not a directory");
process.env.WIRE_DB_PATH = path.join(dir, "data", "news.sqlite");

const { getDb } = await import("../src/lib/db");
const queries = await import("../src/lib/queries");
const { getCachedDigest } = await import("../src/lib/digest");
const { getCachedSummary } = await import("../src/lib/summarize");

// The write path stays loud: opening the DB still throws for writers.
assert.throws(() => getDb(), "getDb must throw when the database is unavailable");

// Every read path degrades instead of throwing.
assert.deepEqual(queries.getFeed({ topic: "all", limit: 10, hours: 24 }), []);
assert.deepEqual(queries.getFeed({ topic: "home", limit: 10, hours: 24 }), []);
assert.deepEqual(queries.getFeed({ topic: "tech", limit: 10, hours: 24 }), []);
assert.deepEqual(queries.queryHeadlines({ sourceSlug: "hn", limit: 10, hours: 24 }), []);
const cols = queries.getColumns({ topic: "home", limit: 10, hours: 24 });
assert.ok(cols.length > 0, "home keeps its source columns");
assert.ok(
  cols.every((c) => c.headlines.length === 0),
  "columns degrade to empty headline lists",
);

const counts = queries.getSectionCounts(24);
assert.ok(Object.keys(counts).length > 0, "counts keep their keys");
assert.ok(
  Object.values(counts).every((n) => n === 0),
  "counts degrade to zero",
);

assert.deepEqual(queries.wordFrequencies(24), []);
assert.equal(queries.lastUpdatedLabel(), null);
assert.ok(
  queries.getSourceHealth().every((h) => h.state === "never"),
  "health degrades to never-fetched",
);

const col = queries.getSourceColumn("hn", 10, 24);
assert.ok(col, "a known source still gets its page");
assert.deepEqual(col.headlines, []);
assert.equal(queries.getSourceColumn("nope", 10, 24), null);

assert.equal(getCachedDigest("2026-01-01"), null);
assert.equal(getCachedSummary("https://example.com/a"), null);

// The chrome itself renders with the database down (no health injected),
// exercising getSourceHealth through the component.
const { renderToStaticMarkup } = await import("react-dom/server");
const { PageChrome } = await import("../src/components/PageChrome");
const html = renderToStaticMarkup(
  <PageChrome
    theme="system"
    lastUpdated={null}
    activeNav="home"
    basePath="/"
    limit={50}
    hours={24}
    title="Desk"
  >
    {null}
  </PageChrome>,
);
assert.match(html, /aria-label="Sources"/, "rail still renders");
assert.doesNotMatch(html, /topic-nav__count/, "reading chrome renders no rail counts");

fs.rmSync(dir, { recursive: true, force: true });
console.log("db-unavailable: ok");
