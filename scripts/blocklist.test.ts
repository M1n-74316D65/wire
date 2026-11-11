import assert from "node:assert/strict";
import { classifyItem } from "../src/lib/blocklist";

// Promo keyword → block
assert.equal(
  classifyItem("Black Friday deals: up to 50% off at checkout", "https://www.theverge.com/story/1"),
  "promo-keyword",
  "Black Friday copy should be blocked",
);
assert.equal(
  classifyItem("Cyber Monday: use code SAVE20 at checkout", "https://www.engadget.com/x"),
  "promo-keyword",
  "use-code copy should be blocked",
);
assert.equal(
  classifyItem("Flash sale — 25% off, ends tonight", "https://www.arstechnica.com/a"),
  "promo-keyword",
  "flash-sale / %-off copy should be blocked",
);

// Affiliate URL → block
assert.equal(
  classifyItem("Best laptops of 2026", "https://www.example.com/story?aff=12345"),
  "affiliate-url",
  "affiliate tracking param should be blocked",
);
assert.equal(
  classifyItem("Cool gadget review", "https://shop.example.com/item?utm_content=promo"),
  "affiliate-url",
  "promo utm_content should be blocked",
);

// Promo domain → block
assert.equal(
  classifyItem("Top laptop offers this week", "https://www.slickdeals.net/deal/laptop-123"),
  "promo-domain",
  "deal-aggregator domain should be blocked",
);

// Legit items → keep (no block)
assert.equal(
  classifyItem("New kernel release ships with scheduler fixes", "https://lwn.net/Articles/123"),
  null,
  "a normal tech headline must not be blocked",
);
assert.equal(
  classifyItem("Apple earnings beat expectations; stock rises", "https://www.theverge.com/earnings"),
  null,
  "a normal business headline must not be blocked",
);
assert.equal(
  classifyItem("The Register: how the web works", "https://www.theregister.com/2026/11/10/web_explained"),
  null,
  "a normal explainer must not be blocked",
);
assert.equal(
  classifyItem("Prime Day is coming — what to expect", "https://www.theverge.com/prime-day-preview"),
  "promo-keyword",
  "Prime Day promo should be blocked",
);

assert.equal(
 classifyItem("Rebajas: liquidación temporada, hasta cupón 50% dto", "https://www.example.com/season-sale"),
 "promo-keyword",
 "Spanish promo copy should blocked",
);
assert.equal(
 classifyItem("Hoy en la tienda: ofertas y descuentos", "https://www.example.com/store"),
 "promo-keyword",
 "Spanish ofertas/descuentos should blocked",
);
assert.equal(
 classifyItem("Apple presenta su nuevo portátil para creadores de contenido", "https://www.example.com/apple-laptop"),
 null,
 "a normal Spanish tech headline must not blocked",
);
assert.equal(
 classifyItem("Rebajas de invierno: la temporada de descuentos llega", "https://www.theguardian.com/uk/rebajas"),
 "promo-keyword",
 "Spanish rebajas/descuentos should blocked",
);
console.log("blocklist.test.ts: all assertions passed");
