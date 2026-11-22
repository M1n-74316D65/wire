# Wire Reading Desk Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild wire's responsive reading shell, chronological stream, and secondary-view styling without changing routes, data, ordering, or AI behavior.

**Architecture:** Keep Next.js server components and global CSS. Recompose `PageChrome` into a sticky desktop index and fluid reading plane, reuse the same native navigation inside a mobile `details` disclosure, and express all responsive layout in the existing stylesheet.

**Tech Stack:** Next.js 16.4.6, React 19.3, TypeScript, global CSS, Bun scripts, JSDOM static-markup assertions.

**Spec:** `docs/superpowers/specs/2026-11-22-wire-reading-desk-design.md`

## Global Constraints

- Strict chronological order; no ranking, recommendations, unread counts, cards, imagery, or engagement chrome.
- Preserve all existing routes, query defaults, source links, external links, HN/AI behavior, theme forms, and summarize/brief logic.
- Existing palette, Georgia/Outfit faces, zero radius, no shadows, and no gradients override generic direction-sheet choices.
- No new dependencies, client-side navigation script, styling framework, or test runner.
- Use Bun for project commands. Do not mutate `data/news.sqlite` for visual fixtures.
- The image generator failed; do not claim a generated target or pixel-perfect fidelity.

## Review Focus

- Responsive duplicate navigation: only the active presentation may be visible/focusable; test desktop/mobile landmarks in Task 1 and computed display in Task 4.
- Maximum-window empty state: never suggest an unavailable wider range; test copy in Task 2.
- Words count filter: the existing limit does not affect word frequencies; test that it is absent in Task 2.
- Long titles and missing AI/HN links: rows must wrap and remain aligned without invented metadata; test markup in Task 2 and populated 390/768px captures in Task 4.
- Explicit theme versus system fallback: raw tokens and `light-dark()` enhancement must not override `html[data-theme]`; check both forced themes in Task 4.

---

### Task 1: Open-plane chrome and native Browse disclosure

**Files:**
- Create: `src/components/ThemeToggle.tsx`
- Create: `scripts/page-chrome.test.tsx`
- Modify: `src/components/PageChrome.tsx`
- Modify: `src/components/SiteHeader.tsx`
- Modify: `package.json`

**Interfaces:**
- Consumes: existing `SiteNav`, `SourceNav`, `TabBar`, `getSourceHealth()`, `formatLastUpdated()`, `nowMs()`, and `setThemeAction`.
- Produces: `ThemeToggle({ theme: Theme })`; `PageChrome` adds optional `summary?: string` while preserving all current props.

- [ ] **Step 1: Write the failing chrome test**

Render `PageChrome` with `title="Desk"`, `basePath="/"`, `limit={50}`, `hours={24}`, and `activeNav="home"`. Assert exactly one `main#content`, one `h1`, one `details.browse-disclosure` with a `summary` containing `Browse`, two matching Sections/Sources navigations for responsive presentation, six theme submit buttons, and a Browse panel containing direct section/source links.

- [ ] **Step 2: Run the test and confirm the missing disclosure failure**

Run: `bun run scripts/page-chrome.test.tsx`
Expected: FAIL because `.browse-disclosure` and extracted theme controls do not exist.

- [ ] **Step 3: Implement the recomposed server chrome**

Move the three unchanged theme forms into `ThemeToggle`. Reduce `SiteHeader` to the brand and existing motto. In `PageChrome`, render a `.desk__rail` containing the brand, scrollable section/source index, pulled timestamp, and theme group; render a `.mobile-header` with brand and native Browse `details`; keep one main and the existing TabBar. Reuse the same navigation components in both presentations and do not add client handlers.

- [ ] **Step 4: Run structure and regression tests**

Run: `bun run scripts/page-chrome.test.tsx && bun run scripts/source-nav.test.tsx`
Expected: PASS, including every direct source link and active source marker.

- [ ] **Step 5: Add the test to the existing chain and commit**

Add `bun run scripts/page-chrome.test.tsx` after `source-nav.test.tsx` in `package.json`, then commit the shell components and tests with `feat: recompose wire reading chrome`.

### Task 2: Truthful reading controls and chronological rows

**Files:**
- Create: `scripts/reading-views.test.tsx`
- Modify: `src/components/Filters.tsx`
- Modify: `src/components/PageChrome.tsx`
- Modify: `src/components/FeedList.tsx`
- Modify: `src/components/HeadlineList.tsx`
- Modify: `src/app/words/page.tsx`
- Modify: `package.json`

**Interfaces:**
- Consumes: `PageChrome`'s `summary` prop from Task 1.
- Produces: `Filters` and `PageChrome` add `showLimit?: boolean` (default `true`); feed markup retains `.feed`, `.feed__item`, `.feed__source`, `.feed__headline`, and `.feed__meta` for the stylesheet.

- [ ] **Step 1: Write failing reading-view tests**

Use two `Headline` fixtures with a long title, a known source, one HN URL, and no AI requirement. Assert input order in the ordered list, full title text, source/external/HN hrefs, and valid `time` elements. Assert the empty state contains `Nothing in this window.` and `Choose a section or source`, but not `wider time range`. Render filters at non-default values and assert current options have `aria-current="page"`, URLs preserve the other setting, and `showLimit={false}` removes only the count group. Render `PageChrome` with `showLimit={false}` and the exact summary `Word size follows frequency in headline titles.`; assert both reach the chrome. Task 4 checks the Words route itself.

- [ ] **Step 2: Run the test and identify the intended failures**

Run: `bun run scripts/reading-views.test.tsx`
Expected: FAIL on current-option semantics, truthful empty copy, or the words-specific props.

- [ ] **Step 3: Implement controls and row structure**

Add non-color active semantics to filter spans, conditionally omit the count group, use the new empty-state title/action copy, and make the source-page list chronological with an `ol`. Pass `showLimit={false}` and the fixed summary from Words; leave its frequency query and data-driven sizes unchanged.

- [ ] **Step 4: Run all unit checks**

Run: `bun run test`
Expected: all existing and new plain Bun scripts PASS.

- [ ] **Step 5: Commit**

Commit the reading components and tests with `feat: clarify chronological reading controls`.

### Task 3: Implement the visual system and update the design record

**Files:**
- Modify: `src/app/globals.css`
- Modify: `DESIGN.md`

**Interfaces:**
- Consumes: the stable chrome, filter, feed, brief, summary, words, and tab-bar class names from Tasks 1–2 and existing routes.
- Produces: the Open Plane layout, responsive feed grids, mobile Browse panel, theme-safe tokens, and all existing secondary-view states.

- [ ] **Step 1: Replace the old shell and stream geometry**

Implement raw light/dark custom properties plus `light-dark()` enhancement, explicit `html[data-theme]` overrides, equal shell margins, a 240–256px sticky rail, stable source-index scrolling, and a fluid reading canvas. Style the 32px page heading, factual summary, wrapping filters, 19px Georgia headlines, three-column desktop rows, intermediate two-column rows, and mobile source/meta-above-headline rows. Keep rules, radii, accent use, and source colors consistent with `DESIGN.md`.

- [ ] **Step 2: Style mobile navigation and every secondary state**

Below 760px, `display: none` the desktop rail and `display: block` the mobile header; use a 48px top bar, dynamic-viewport Browse panel, 16px content margins, and bottom-tab clearance. Style word frequencies, long-form brief/summary content, forms, unconfigured text, alerts, empty states, focus-visible outlines, forced colors, reduced motion, and coarse-pointer targets. Do not hide overflow to conceal layout defects.

- [ ] **Step 3: Update the design documentation**

Replace the obsolete 1080px/9.5rem/horizontal-strip layout description with the implemented geometry. Document Outfit tabular metadata rather than claiming an unloaded IBM Plex Mono font. Preserve the existing product rejections and color values.

- [ ] **Step 4: Run static verification**

Run: `bun run lint && bun run test && bun run build`
Expected: no lint errors, all tests PASS, production build succeeds. Fix CSS ordering or bundling errors rather than suppressing them.

- [ ] **Step 5: Commit**

Commit the visual system and design record with `feat: build the open reading plane`.

### Task 4: Rendered verification, independent critique, and evidence

**Files:**
- Create: `.taste-skill/after/` captures and reports (ignored)
- Create: `.taste-skill/visual-evidence.json` (ignored)
- Modify: product files only for a verified defect or the critic's single highest-impact finding

**Interfaces:**
- Consumes: the running app, real before captures, FreshRSS structural reference, and final source.
- Produces: visible before/after evidence and an honest verification receipt; no generated-target claim.

- [ ] **Step 1: Capture final responsive and themed states**

Run Design Taste `inspect.mjs --app` at 1440, 768, and 390 into `.taste-skill/after`. Capture light/dark, Browse closed/open, Words, Brief, and Summary. Open every listed image; check clipping, target sizes, focus, empty states, and secondary content. For populated rows, use an ignored temporary copy/database with clearly labeled fixture timestamps, never the real database.

- [ ] **Step 2: Exercise behavior**

Use a real browser to follow representative section/source/filter/external-link controls, toggle each theme, open and close Browse, keyboard through navigation, and verify no unwanted horizontal overflow. Re-run `bun run test`, `bun run lint`, and `bun run build` after any fix.

- [ ] **Step 3: Run the independent one-finding critique**

Give a fresh critic the contract, final captures, and FreshRSS reference. Ask for exactly one highest-impact visible difference. Fix that one issue, recapture, and repeat no more than three rounds; keep the best candidate rather than automatically keeping the last.

- [ ] **Step 4: Save and validate the evidence receipt**

Record actual source/capture hashes, comparison mode `existing-system`, FreshRSS URL, executed checks, and the failed image-generation limitation in `visual-evidence.json`. Run the bundled Uizze evidence integrity verifier. Do not add a nonexistent target hash.

- [ ] **Step 5: Commit verified fixes and report**

Commit any post-review fixes with `fix: polish reading desk verification findings`. Report routes/tests/captures actually checked, critique rounds, remaining limitations, retained reference credits, and the required Modern Web Guidance disclosures.
