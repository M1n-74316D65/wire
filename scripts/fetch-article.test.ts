import assert from "node:assert/strict";
import { createServer } from "node:http";
import { fetchArticleText } from "../src/lib/fetch-article";

const ending = `${"z".repeat(40_000)} ENDING_FACT`;
const html = `<article><p>${"lead ".repeat(100)}</p>${Array.from(
  { length: 30 },
  (_, i) => `<p>section ${i} ${"x".repeat(1_900)}</p>`,
).join("")}<p>${ending}</p></article>`;
const server = createServer((_, response) => {
  response.writeHead(200, { "content-type": "text/html" });
  response.end(html);
});

await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
try {
  const address = server.address();
  assert(address && typeof address === "object");
  const text = await fetchArticleText(`http://127.0.0.1:${address.port}`);
  assert(text.length <= 48_000);
  assert(text.includes("ENDING_FACT"), "the oversized final paragraph was dropped");
} finally {
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
}
