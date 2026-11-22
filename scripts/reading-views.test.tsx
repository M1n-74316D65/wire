import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { renderToStaticMarkup } from "react-dom/server";
import { FeedList } from "../src/components/FeedList";
import { Filters } from "../src/components/Filters";
import { HeadlineList } from "../src/components/HeadlineList";
import { PageChrome } from "../src/components/PageChrome";
import type { Headline } from "../src/lib/queries";

function render(element: React.ReactNode): Document {
  return new JSDOM(renderToStaticMarkup(<>{element}</>)).window.document;
}

const publishedAt = Date.parse("2026-11-22T10:00:00.000Z");
const headlines: Headline[] = [
  {
    title:
      "A deliberately long headline remains complete and readable when the reading column becomes narrow",
    url: "https://example.com/long-story?from=wire&ref=reading",
    publishedAt,
    hnUrl: "https://news.ycombinator.com/item?id=12345",
    sourceSlug: "wired",
    topic: "tech",
  },
  {
    title: "The second story stays second",
    url: "https://example.com/second-story",
    publishedAt: publishedAt - 60 * 60 * 1000,
    hnUrl: null,
    sourceSlug: "arstechnica",
    topic: "tech",
  },
];

const feedDocument = render(<FeedList headlines={headlines} now={publishedAt} />);
const feedItems = [...feedDocument.querySelectorAll("ol.feed > li")];
assert.equal(feedItems.length, 2, "the feed must render both stories");
assert(
  feedItems[0]?.textContent?.includes(headlines[0].title),
  "the first full headline must remain in the first row",
);
assert(
  feedItems[1]?.textContent?.includes(headlines[1].title),
  "input chronology must not be rearranged",
);
assert.equal(
  feedItems[0]?.querySelector(".feed__source")?.getAttribute("href"),
  "/source/wired",
  "the source name must link to its source page",
);
assert.equal(
  feedItems[0]?.querySelector(".feed__headline")?.getAttribute("href"),
  headlines[0].url,
  "the headline must preserve its external destination",
);
assert.equal(
  feedItems[0]?.querySelector('a[aria-label^="Hacker News discussion"]')?.getAttribute("href"),
  headlines[0].hnUrl,
  "the HN discussion link must be preserved",
);
assert.equal(
  feedItems[0]?.querySelector("time")?.getAttribute("datetime"),
  "2026-11-22T10:00:00.000Z",
  "the headline time must retain its machine-readable timestamp",
);
assert.equal(
  feedItems[1]?.querySelector('a[aria-label^="Hacker News discussion"]'),
  null,
  "a story without a discussion must not invent an HN link",
);

const sourceDocument = render(
  <HeadlineList headlines={headlines} now={publishedAt} />,
);
assert(
  sourceDocument.querySelector("ol.headline-list"),
  "source-page headlines must use an ordered list for chronological order",
);

const emptyDocument = render(<FeedList headlines={[]} now={publishedAt} />);
const emptyText = emptyDocument.querySelector(".empty-state")?.textContent ?? "";
assert.match(emptyText, /Nothing in this window\./);
assert.match(emptyText, /Choose a section or source/);
assert.doesNotMatch(
  emptyText,
  /wider time range/,
  "the maximum window must not suggest an unavailable wider range",
);

const filterDocument = render(
  <Filters basePath="/words" limit={25} hours={6} />,
);
assert.equal(
  filterDocument.querySelector("#filter-show")?.parentElement?.querySelector(".is-active")?.getAttribute("aria-current"),
  "page",
  "the selected headline count needs non-color current-page semantics",
);
assert.equal(
  filterDocument.querySelector("#filter-window")?.parentElement?.querySelector(".is-active")?.getAttribute("aria-current"),
  "page",
  "the selected time window needs non-color current-page semantics",
);
assert.equal(
  filterDocument.querySelector('a[href="/words?limit=10&hours=6"]')?.textContent,
  "10",
  "changing the count must preserve the current window",
);
assert.equal(
  filterDocument.querySelector('a[href="/words?limit=25&hours=3"]')?.textContent,
  "3h",
  "changing the window must preserve the current count",
);

const wordsFilters = render(
  <Filters basePath="/words" limit={25} hours={6} showLimit={false} />,
);
assert.equal(
  wordsFilters.querySelector("#filter-show"),
  null,
  "Words must not show a count control that does not affect word frequencies",
);
assert(wordsFilters.querySelector("#filter-window"), "the useful time-window control must remain");

const wordsChrome = render(
  <PageChrome
    theme="system"
    lastUpdated={publishedAt}
    activeNav="words"
    basePath="/words"
    limit={25}
    hours={6}
    showLimit={false}
    title="Words"
    summary="Word size follows frequency in headline titles."
  >
    <p>Frequencies</p>
  </PageChrome>,
);
assert.equal(
  wordsChrome.querySelector("#filter-show"),
  null,
  "PageChrome must forward the Words count-control setting",
);
assert.equal(
  wordsChrome.querySelector(".desk__summary")?.textContent,
  "Word size follows frequency in headline titles.",
  "Words must explain its own visualization rather than promise a headline count",
);
