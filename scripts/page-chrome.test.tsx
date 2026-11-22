import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { JSDOM } from "jsdom";
import { PageChrome } from "../src/components/PageChrome";

const html = renderToStaticMarkup(
  <PageChrome
    theme="system"
    lastUpdated={0}
    activeNav="home"
    basePath="/"
    limit={50}
    hours={24}
    title="Desk"
  >
    <p>Reading plane</p>
  </PageChrome>,
);
const document = new JSDOM(html).window.document;

assert.equal(document.querySelectorAll("main#content").length, 1);
assert.equal(document.querySelectorAll("h1").length, 1);
assert.equal(document.querySelector("h1")?.textContent, "Desk");
assert.equal(document.querySelector("main")?.textContent?.includes("Reading plane"), true);

const browse = document.querySelector("details.browse-disclosure");
assert(browse, "mobile navigation needs a native disclosure");
assert.equal(browse.querySelector("summary")?.textContent?.trim(), "Browse");
assert(browse.querySelector('a[href="/topic/spain"]'), "Browse omits a section");
assert(browse.querySelector('a[href="/source/hn"]'), "Browse omits a source");

assert.equal(document.querySelectorAll('nav[aria-label="Sections"]').length, 2);
assert.equal(document.querySelectorAll('nav[aria-label="Sources"]').length, 2);
assert.deepEqual(
  Array.from(document.querySelectorAll(".theme-toggle button[type='submit']")).map(
    (button) => button.textContent,
  ),
  ["auto", "day", "night", "auto", "day", "night"],
);

console.log("page-chrome.test.tsx: all assertions passed");
