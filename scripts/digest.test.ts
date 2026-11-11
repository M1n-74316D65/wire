import assert from "node:assert/strict";
import { dayKey } from "../src/lib/digest";

// dayKey must be deterministic: same timestamp -> same day key.
const ts = Date.UTC(2026, 10, 10, 12, 0, 0); // 2026-11-10 12:00 UTC
assert.equal(dayKey(ts, "Europe/Madrid"), "2026-11-10", "wrong day key");
assert.equal(
  dayKey(ts, "Europe/Madrid"),
  dayKey(ts, "Europe/Madrid"),
  "dayKey is not stable",
);

// dayKey must stay within the requested IANA zone, not the host zone.
const utcMidnight = Date.UTC(2026, 10, 9, 23, 0, 0); // 2026-11-09 23:00 UTC
// In Madrid (UTC+1 in November) this is 2026-11-10 00:00 -> next day.
assert.equal(
  dayKey(utcMidnight, "Europe/Madrid"),
  "2026-11-10",
  "dayKey did not respect Europe/Madrid",
);
// In UTC it is still the 9th.
assert.equal(
  dayKey(utcMidnight, "UTC"),
  "2026-11-09",
  "dayKey did not respect UTC",
);

// Output must be a strict ISO date (YYYY-MM-DD).
for (const tz of ["Europe/Madrid", "UTC", "America/New_York"]) {
  const k = dayKey(ts, tz);
  assert.match(k, /^\d{4}-\d{2}-\d{2}$/, `dayKey(${tz}) not ISO date: ${k}`);
}

console.log("digest dayKey: ok");
