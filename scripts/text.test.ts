import assert from "node:assert/strict";
import { tokenize } from "../src/lib/queries";
import { decodeEntities } from "../src/lib/text";

assert.equal(decodeEntities("Here&#8217;s why"), "Here’s why");
assert.equal(decodeEntities("Tom &amp; Jerry &#x2014; &quot;x&quot;"), 'Tom & Jerry — "x"');
assert.equal(decodeEntities("AT&T &unknown; plain"), "AT&T &unknown; plain");

// Accented letters stay inside their word.
assert.deepEqual(tokenize("Víctimas en España: Sánchez está aquí"), [
  "víctimas",
  "españa",
  "sánchez",
  "está",
  "aquí",
]);

console.log("text.test.ts: all assertions passed");
