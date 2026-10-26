import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

const MAX_CHARS = 48_000;
const LEAD_CHARS = 16_000;
const OMISSION = "\n[...]\n";
const BLOCKS = "p, h1, h2, h3, h4, h5, h6, li, blockquote, pre";

function cleanText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function htmlToBlocks(html: string): string[] {
  const document = new JSDOM(html).window.document;
  document
    .querySelectorAll("script, style, noscript, template")
    .forEach((element) => element.remove());
  const elements = Array.from(document.querySelectorAll(BLOCKS)).filter(
    (element) => !element.parentElement?.closest(BLOCKS),
  );
  const blocks = elements
    .map((element) => cleanText(element.textContent || ""))
    .filter(Boolean);
  const fallback = cleanText(document.body?.textContent || "");
  return blocks.length ? blocks : fallback ? [fallback] : [];
}

function textToBlocks(text: string): string[] {
  return text
    .replace(/\r\n?/g, "\n")
    .split(/\n+/)
    .map(cleanText)
    .filter(Boolean);
}

function truncateAtWhitespace(text: string, max: number): string {
  const excerpt = text.slice(0, max);
  const space = excerpt.lastIndexOf(" ");
  return excerpt.slice(0, space > 0 ? space : max).trim();
}

function fitArticleText(blocks: string[]): string {
  const full = blocks.join("\n");
  if (full.length <= MAX_CHARS) return full;

  const lead: string[] = [];
  let leadLength = 0;
  let next = 0;
  for (const block of blocks) {
    const added = (lead.length ? 1 : 0) + block.length;
    if (leadLength + added > LEAD_CHARS) break;
    lead.push(block);
    leadLength += added;
    next += 1;
  }
  if (lead.length === 0) {
    lead.push(truncateAtWhitespace(blocks[0], LEAD_CHARS));
    next = 1;
  }

  const leadText = lead.join("\n");
  const rest = blocks.slice(next);
  if (rest.length === 0) return markOmission(leadText, full);

  const averageLength = rest.reduce((sum, block) => sum + block.length + 1, 0) / rest.length;
  const budget = MAX_CHARS - leadText.length - OMISSION.length;
  let count = Math.min(rest.length, Math.max(1, Math.floor(budget / averageLength)));

  for (; count > 0; count -= 1) {
    const positions = Array.from({ length: count }, (_, i) =>
      count === 1 ? rest.length - 1 : Math.floor((i * (rest.length - 1)) / (count - 1)),
    );
    const middle = Math.floor(blocks.length / 2) - next;
    if (middle >= 0 && !positions.includes(middle)) positions.push(middle);
    positions.sort((a, b) => a - b);
    let text = leadText;
    let previous = next - 1;

    for (const position of positions) {
      const separator = position + next === previous + 1 ? "\n" : OMISSION;
      const available = MAX_CHARS - text.length - separator.length;
      if (available <= 0) continue;
      const block = position === rest.length - 1 ? rest[position].slice(-available) : rest[position];
      const candidate = text + separator + block;
      if (candidate.length > MAX_CHARS) continue;
      text = candidate;
      previous = position + next;
    }
    if (text !== leadText) return markOmission(text, full);
  }

  return markOmission(leadText, full);
}

function markOmission(text: string, full: string): string {
  if (text.length >= full.length || text.includes("[...]")) return text;
  const marked = `${text}${OMISSION}`;
  return marked.length <= MAX_CHARS ? marked : text;
}

export async function fetchArticleText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; wire/0.1; +https://news.m1n.land)",
      Accept: "text/html,application/xhtml+xml",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(20_000),
  });

  if (!res.ok) {
    throw new Error(`Could not fetch article (${res.status})`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (
    !contentType.includes("text/html") &&
    !contentType.includes("xhtml") &&
    !contentType.includes("text/plain") &&
    !contentType.includes("xml")
  ) {
    throw new Error("URL is not an HTML article");
  }

  const body = await res.text();
  let blocks: string[];
  if (contentType.includes("text/plain")) {
    blocks = textToBlocks(body);
  } else if (contentType.includes("html")) {
    const document = new JSDOM(body, { url: res.url }).window.document;
    const article = new Readability(document).parse();
    const extracted = article?.content ? htmlToBlocks(article.content) : [];
    blocks = extracted.join("\n").length >= 200 ? extracted : htmlToBlocks(body);
  } else {
    blocks = htmlToBlocks(body);
  }

  if (blocks.join("\n").length < 200) {
    throw new Error("Not enough readable text on the page");
  }
  return fitArticleText(blocks);
}
