const MAX_CHARS = 14_000;

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export async function fetchArticleText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; NewsSummarizer/0.1; +http://localhost)",
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

  const html = await res.text();
  const text = stripHtml(html);
  if (text.length < 200) {
    throw new Error("Not enough readable text on the page");
  }
  return text.slice(0, MAX_CHARS);
}
