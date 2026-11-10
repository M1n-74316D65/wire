import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { JSDOM } from "jsdom";
import { PageChrome } from "../src/components/PageChrome";
import { SOURCES, sourceColor } from "../src/lib/sources";

const html = renderToStaticMarkup(
  <PageChrome theme="system" lastUpdated={0} activeNav="hn" showFilters={false}>
    {null}
  </PageChrome>,
);
const document = new JSDOM(html).window.document;
const nav = document.querySelector('nav[aria-label="Sources"]');
assert(nav, "the sources navigation is missing");

for (const source of SOURCES.filter((source) => source.slug !== "hn")) {
  const link: Element | null = nav.querySelector(`a[href="/source/${source.slug}"]`);
  assert.equal(link?.textContent, source.name, `${source.name} has no direct link`);
}
assert.equal(nav.querySelector('[aria-current="page"]')?.textContent, "Hacker News");

// sourceColor is deterministic: same slug always maps to the same palette entry.
for (const source of SOURCES) {
  const a = sourceColor(source.slug);
  const b = sourceColor(source.slug);
  assert.equal(a, b, `${source.slug} source color is not stable`);
  assert.match(a, /^#[0-9a-f]{6}$/i, `${source.slug} source color is not a hex color`);
}
assert.notEqual(
  sourceColor("hn"),
  sourceColor("verge"),
  "distinct sources should not collide on a single call (same slug hashed differently)",
);
