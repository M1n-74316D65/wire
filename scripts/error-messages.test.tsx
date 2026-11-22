import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { JSDOM } from "jsdom";

const { ErrorMessages } = await import("../src/components/ErrorMessages").catch(
  () => assert.fail("shared error messages component is missing"),
);

const duplicate = new JSDOM(
  renderToStaticMarkup(
    <ErrorMessages
      messages={["The brief could not be written.", "The brief could not be written.", null]}
    />,
  ),
).window.document;
assert.equal(
  duplicate.querySelectorAll('[role="alert"]').length,
  1,
  "the same error must not be announced twice",
);
assert.match(duplicate.body.textContent ?? "", /Error: The brief could not be written\./);

const distinct = new JSDOM(
  renderToStaticMarkup(
    <ErrorMessages messages={["Request failed.", null, "Generation failed."]} />,
  ),
).window.document;
const alerts = [...distinct.querySelectorAll('[role="alert"]')];
assert.equal(alerts.length, 2, "different errors remain visible");
assert.match(alerts[0]?.textContent ?? "", /Request failed\./);
assert.match(alerts[1]?.textContent ?? "", /Generation failed\./);

assert.equal(
  renderToStaticMarkup(<ErrorMessages messages={[null, null]} />),
  "",
  "an empty error state renders nothing",
);
