import assert from "node:assert/strict";
import { safeArticleUrl } from "../src/lib/summarize";

// The guard runs inside summarizeUrl, so every caller (action and page) is
// covered. These are the hosts the server must never fetch.
const blocked = [
  "http://localhost/admin",
  "http://127.0.0.1:8080/",
  "http://10.0.0.5/",
  "http://192.168.1.1/",
  "http://169.254.169.254/latest/meta-data/",
  "http://172.16.0.1/",
  "http://172.31.255.255/",
  "http://0.0.0.0/",
  "http://[::1]/",
  "http://[fd00::1]/",
  "file:///etc/passwd",
  "javascript:alert(1)",
  "not a url",
];

for (const raw of blocked) {
  assert.equal(safeArticleUrl(raw), null, `${raw} should be refused`);
}

// Public http(s) links pass through normalized.
assert.equal(
  safeArticleUrl("https://example.com/story"),
  "https://example.com/story",
);
assert.equal(
  safeArticleUrl("  https://example.com/story?utm=1  "),
  "https://example.com/story?utm=1",
);
// 172.32 is outside the private range.
assert.equal(
  safeArticleUrl("http://172.32.0.1/"),
  "http://172.32.0.1/",
);

console.log("summarize-url.test.ts: all assertions passed");
