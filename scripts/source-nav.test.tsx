import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { JSDOM } from "jsdom";
import { PageChrome } from "../src/components/PageChrome";
import { SOURCES } from "../src/lib/sources";

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
