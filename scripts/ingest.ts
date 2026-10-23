import { ingestAll } from "../src/lib/ingest";

const { results, at, classification } = await ingestAll();
const fail = results.filter((r) => r.error);
console.log(
  JSON.stringify(
    {
      at: new Date(at).toISOString(),
      inserted: results.reduce((s, r) => s + r.inserted, 0),
      ok: results.length - fail.length,
      fail: fail.length,
      classification,
      failures: fail,
    },
    null,
    2,
  ),
);
