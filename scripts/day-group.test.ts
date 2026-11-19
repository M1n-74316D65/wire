import assert from "node:assert/strict";
import {
  absoluteTime,
  dayKey,
  dayLabel,
  groupByDay,
  SPAIN_TIME_ZONE,
} from "../src/lib/time";

// groupByDay buckets a newest-first stream into calendar days, preserving order.
const now = Date.now();
const items = [
  { ts: now - 60_000, title: "a" },
  { ts: now - 3_600_000, title: "b" },
  { ts: now - 26 * 3_600_000, title: "c" },
];
const groups = groupByDay(items, (i) => i.ts);
assert.equal(groups.length, 2, "expected two day buckets");
assert.equal(groups[0].items.length, 2, "today should hold a and b");
assert.deepEqual(
  groups[0].items.map((i) => i.title),
  ["a", "b"],
  "order inside a day must stay newest-first",
);
assert.equal(groups[1].items[0].title, "c");
assert.equal(groups[1].key, dayKey(now - 26 * 3_600_000));

// Empty input stays empty.
assert.deepEqual(groupByDay([], (i: { ts: number }) => i.ts), []);

// dayLabel names the first two days relative to now, older days as dates.
assert.equal(dayLabel(dayKey(now), now), "Today");
assert.equal(dayLabel(dayKey(now - 24 * 3_600_000), now), "Yesterday");
const older = dayLabel("2026-11-10", now);
assert.match(older, /10 Nov 2026|Nov 10, 2026|10 Nov/, "older days show a date");

// dayKey respects the requested zone (mirrors the digest test's contract).
const utcMidnight = Date.UTC(2026, 10, 10, 0, 0, 0); // 2026-11-10 00:00 UTC
assert.equal(dayKey(utcMidnight, "UTC"), "2026-11-10");
assert.equal(dayKey(utcMidnight, SPAIN_TIME_ZONE), "2026-11-10"); // 01:00 CET, same day
assert.equal(dayKey(Date.UTC(2026, 10, 9, 23, 30, 0), SPAIN_TIME_ZONE), "2026-11-10"); // 00:30 CET next day

// absoluteTime states the desk-local wall time.
assert.match(absoluteTime(utcMidnight), /10 Nov/);
assert.match(absoluteTime(utcMidnight), /0[12]:00/);

console.log("day-group: ok");
