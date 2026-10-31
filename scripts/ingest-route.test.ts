import assert from "node:assert/strict";

process.env.CRON_SECRET = "test-secret";
const { GET } = await import("../src/app/api/ingest/route");

const missing = await GET(new Request("http://localhost/api/ingest"));
assert.equal(missing.status, 401, "ingest ran without the cron secret");

const wrong = await GET(
  new Request("http://localhost/api/ingest", {
    headers: { authorization: "Bearer nope" },
  }),
);
assert.equal(wrong.status, 401, "ingest ran with the wrong cron secret");
