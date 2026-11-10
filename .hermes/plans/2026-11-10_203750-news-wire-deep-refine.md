# Deep Refine — `wire` news desk

**Goal.** Make `news.m1n.land` feel more considered and more useful: polish the UI, upgrade the
AI experience, improve ingest/data quality, and block promo/discount noise.

**Date.** 2026-11-10
**Owner.** David (executed with Hermes)
**Status.** Plan only — no code written yet.

---

## 0. Context & ground rules

- **Stack:** Next.js (App Router, `force-dynamic` everywhere), `better-sqlite3`, bun, RSS ingestion
  via `rss-parser`. Design system lives in `src/app/globals.css` (CSS `light-dark()` tokens, serif
  body / sans UI / mono meta, teal accent).
- ⚠️ **Framework caveat (AGENTS.md):** the installed Next.js version "has breaking changes."
  **Before writing any component/route code, read the relevant guide in
  `node_modules/next/dist/docs/`** and heed deprecation notices. Verify the current behavior of
  `cookies()`, server actions, `searchParams` (async), and client/server component boundaries
  against those docs, not training memory.
- **Testing convention:** tests are plain bun scripts in `scripts/*.test.ts(x)` run via
  `bun run <file>`. The `test` script in `package.json` chains three of them. New tests follow the
  same pattern (import the unit under test, assert, non-zero exit on failure).
- **Read-only safety:** DB schema changes use the existing `ensureColumn()` migration helper in
  `src/lib/db.ts` — never destructive drops.
- **Verify each task** with `bun run build` (typecheck + build) and, where behavior changes, a
  quick `bun run dev` + browser check. See §6 checklist.

**Priority order (highest value / lowest risk first):**
1. **P0 — Promo/discount blocking** (explicit ask, self-contained, big quiet-win)
2. **P1 — Per-source feed-health status + failed-feed surfacing**
3. **P1 — UI polish (source identity, AI button clarity, contrast, mobile reachability)**
4. **P2 — In-stream expandable AI summaries + batch "summarize window"**
5. **P2 — Cross-source dedupe**
6. **P3 — HN points/comments in the row; AI follow-up Q&A**
7. **P4 — Hardening (404/error pages, OG cards)** *(quick wins, low priority)*

---

## 1. P0 — Block promo / discount links

**Why:** feeds like The Verge / Engadget / Ars occasionally push sale copy ("Black Friday",
"20% off", affiliate deals). The desk should stay signal-only.

**Where:**
- New: `src/lib/blocklist.ts` — pure, testable pattern module.
- Used by: `src/lib/ingest.ts` (skip insert + count), and optionally `src/app/api/ingest/route.ts`
  to report the filtered count.
- New test: `scripts/blocklist.test.ts`.

**Design:**
```ts
// src/lib/blocklist.ts
export type BlockReason = "promo-keyword" | "affiliate-url" | "promo-domain";

export const PROMO_KEYWORDS: RegExp =
  /\b(black ?friday|cyber ?monday|flash ?sale|flash sale|limited ?time( ?offer| deal)?|
     (20|25|30|40|50|75|80|90)% ?off|percent ?off|use ?code|promo ?code|coupon|
     free ?shipping|deal of the (day|week)|sale event|best ?seller|prime ?day)\b/i;

export const AFFILIATE_URL: RegExp =
  /[?&](aff|affiliate|ref|ref_id|tag|icid|campaign|utm_content|utm_term)=[^&]*/i;

// domains that are coupon/affiliate/deal aggregator networks
export const PROMO_DOMAINS = [
  "dealnews.com","slickdeals.net","retailmenot.com","codes.com",
  "groupon.com","coupon","affiliates.","tradedoubler","commission","impact.com",
];

export function classifyItem(title: string, url: string): BlockReason | null {
  if (PROMO_KEYWORDS.test(title)) return "promo-keyword";
  if (AFFILIATE_URL.test(url)) return "affiliate-url";
  const host = safeHost(url);
  if (PROMO_DOMAINS.some((d) => host.includes(d))) return "promo-domain";
  return null;
}
```

**Ingest wiring (`src/lib/ingest.ts`):** before the `INSERT`, call `classifyItem`; if a reason
returns, do **not** insert, increment a `blocked` counter, and push
`{source, blocked: n}` into the `IngestResult`. Keep the decision server-side only — blocked rows
never reach the UI.

**Exposure:** `/api/ingest` response already lists per-source results; add `blocked` to
`IngestResult` and log `filtered N promo items`. (Optional, later: a `blocked` table + `/blocked`
page for an audit trail — skip unless it's wanted.)

**Test (`scripts/blocklist.test.ts`):** assert `classifyItem` flags a "Black Friday deals — use code
SAVE20 at checkout" title, an `?aff=123` url, a `slickdeals.net` host, and does **not** flag a
normal "New kernel release ships with scheduler fixes" item. Edge: a legit "sale" in a
business-story context is the risk — keep the keyword list conservative and log (don't hard-delete
from consideration) so a false-positive is easy to spot.

**Deliverable:** promo items never appear in any feed; ingest reports how many were filtered.

---

## 2. P1 — Per-source feed-health status + failed-feed surfacing

**Why:** today, if a feed is stale or broken, the desk just shows fewer rows with no reason.
Surfacing health makes the desk trustworthy.

**Where:**
- Schema: new table `source_status` (migrate in `src/lib/db.ts` via `ensureColumn`/`CREATE TABLE IF NOT EXISTS`).
- Writer: `src/lib/ingest.ts` (record after each source attempt).
- Reader: `src/lib/queries.ts` → new `getSourceStatus(slug)` / `getAllSourceStatus()`.
- UI: `src/components/SourceNav.tsx` (dot + relative time, or a ⚠ with error tooltip).

**Schema:**
```sql
CREATE TABLE IF NOT EXISTS source_status (
  source_slug   TEXT PRIMARY KEY,
  last_fetched_at INTEGER NOT NULL,
  ok            INTEGER NOT NULL,        -- 1 success, 0 failure
  error         TEXT,                    -- last error message (nullable)
  inserted      INTEGER NOT NULL DEFAULT 0
);
```

**Writer:** in `ingestSource()`, after the batch insert (or on catch),
`UPSERT INTO source_status ... ON CONFLICT(source_slug) DO UPDATE`.

**UI (`SourceNav.tsx`):** for each source, append a small status glyph:
- green dot if fetched < 6h ago and `ok`;
- amber "stale" if > 6h (or no record);
- red "⚠" with `title={error}` if `ok = 0`.
Style via `light-dark()` tokens so it works in both themes.

**Optional header health row:** a one-line "3 feeds stale · 1 failed" under the tagline, linking
nothing (just informational) — add to `SiteHeader` if wanted.

**Test:** extend `scripts/ingest-route.test.ts` to assert a failing source leaves
`source_status.ok = 0` with a non-null `error`.

---

## 3. P1 — UI polish

Small, high-signal changes. All CSS in `globals.css`; components named below.

### 3.1 Source identity dot (`FeedList.tsx`)
Add a deterministic colored dot before each source name so the eye can scan sources.
```tsx
// in FeedList row, before the source <a>
<span className="feed__dot" style={{ background: sourceColor(source.slug) }} aria-hidden />
```
`sourceColor(slug)` = hash slug → pick from a palette of 8–10 `light-dark()`-safe hues. Put the
palette + hash in `src/lib/sources.ts` (pure, testable). **Test** it's stable (same slug → same
color) in a new `scripts/source-color.test.ts`.

### 3.2 AI button clarity (`AiLink.tsx`)
The star+“ai” tag reads as decorative. Make it legibly an action:
- Rename label from `ai` → `brief` (or keep `ai` but add a `title="Summarize with AI"` tooltip).
- Give it a distinct outline-button style (`tag--ai` already exists) vs the plain `hn` tag so the
  two affordances don't look identical.
- Keep `aria-label`. No behavior change yet (in-stream expansion is §4).

### 3.3 Metadata contrast
Verify `--ink-muted` (#5c6a75 on #f5f7f8 light) meets ~4.5:1 for the small meta text. If not,
darken the light-mode muted token slightly (e.g. `#515f6a`). Keep dark-mode as-is. Confirm with the
browser.

### 3.4 Mobile reachability of sources/topics
The left rail (all topics + all sources) may be hidden on small screens where only the 5-item
`TabBar` shows. Confirm the responsive breakpoint in `globals.css`; if sources/topics are
unreachable on mobile, add a compact “menu” affordance in `SiteHeader` that opens the rail as a
drawer (a `use client` button toggling a class on `.desk__rail`). Keep it dependency-free.

### 3.5 Hover affordance on feed rows
Add `feed__item:hover { background: <subtle tint>; }` (very light, theme-aware) so rows read as
interactive without changing the quiet aesthetic.

### 3.6 Consistent empty states + refresh CTA
`FeedList` and `HeadlineList` empty states should match in tone and both include a **Refresh**
link (`/api/ingest`) and a “widen the window” hint (currently only `FeedList` has the ingest link).
Extract a shared `EmptyState` component if the copy diverges.

### 3.7 Refresh affordance in header
Next to “Pulled <time>” in `SiteHeader`, add a small “Refresh” button/link → `/api/ingest` so the
user doesn't have to find the raw URL. (Server action or plain link, per §0 doc check.)

### 3.8 Nav section labels
`SourceNav` has a “Sources” title; `SiteNav` doesn't. Add a matching small-caps “Sections” label to
`SiteNav` for symmetry.

**Deliverable:** calmer, more scannable desk; consistent affordances; sources reachable on mobile.

---

## 4. P2 — AI upgrades

### 4.1 In-stream expandable summaries
Today, clicking “ai” navigates to `/summarize?…` (full page change). Refine to **expand inline**
below the row, staying in the stream.

- New client component: `src/components/AiBrief.tsx` (`"use client"`). Wraps the current `AiLink`
  trigger; on click it calls a server action `summarizeForRow(url, title)` (reusing
  `lib/summarize.ts` + the existing unlock flow from `lib/summarize-client.ts` /
  `app/summarize/actions.ts`) and, when a result arrives, renders `<SummaryBody text={...}/>` in an
  `<details>`-style collapse.
- Keep the cached path fast: if `getCachedSummary(url)` exists, show it immediately (no unlock
  prompt). If not, run the unlock/summarize flow exactly as `/summarize` does today.
- Persist the unlocked password in `localStorage` as it already does (`SUMMARIZE_PW_KEY`).
- The `/summarize` page stays (used for manual URL entry); inline expansion is additive.

**Files touched:** new `AiBrief.tsx`; `FeedList.tsx` + `HeadlineList.tsx` swap `AiLink`→`AiBrief`
for the trigger; new server action in `src/app/actions.ts` (or `src/app/summarize/actions.ts`);
`lib/summarize.ts` unchanged or minimal.

**Why it matters:** the biggest UX win — briefs without leaving the desk.

### 4.2 Batch “summarize window”
Add a **“Summarize this window”** button in the `Filters` bar (`Filters.tsx`) that synthesizes a
single brief across the current view (topic + hours + limit).
- New server action `summarizeWindow({ topic, hours, limit })` → reads the same rows `getFeed`
  would, then calls the AI with a prompt enumerating the top N titles (+ sources) and asks for a
  synthesized “what's going on” brief.
- Render result in a new route `/brief` (reusing `PageChrome` + `SummaryBody`), or expand inline at
  the top of the feed. A dedicated `/brief?topic=&hours=` route is cleaner and shareable.
- Reuse `lib/summarize.ts` + auth; cache keyed by a hash of (topic, hours, window-start) to avoid
  re-billing the same window.

### 4.3 Better brief formatting
Tighten the summarize prompt (in `lib/summarize.ts`) to emit a light structure:
`TL;DR` line, 3–5 bullets, then “Why it matters” (optional). `SummaryBody.tsx` already renders
paragraphs + bullets; add a `TL;DR` label style (`.brief__tldr`) so the first line is visually
distinct. Show model + created-at (already stored) and a **Copy** button.

**Deliverable:** briefs expand inline in the stream; one-tap “summarize this window”; briefs are
better structured.

---

## 5. P2 — Cross-source dedupe

**Why:** the same story often lands on 3+ feeds; the desk shows it 3x.

**Approach (conservative, low-risk):**
- `src/lib/dedupe.ts`: `normalizeTitle(t)` = lowercase, strip punctuation/extra whitespace.
- In `getFeed()` (and `getColumns` for consistency), after fetching rows, group by normalized
  title. For groups of size > 1, keep the **earliest** (or highest-signal: prefer a
  non-`home:false` editorial source) as primary; collapse the rest into an `alsoOn: string[]`
  (source slugs).
- `Headline` type gains optional `alsoOn?: string[]`.
- `FeedList.tsx` renders “· also on: The Verge, Ars” as small muted text on the primary row; the
  duplicates are **not** rendered as separate rows.

**Test:** `scripts/dedupe.test.ts` — two rows with identical normalized titles collapse to one with
`alsoOn` of length 1; two distinct titles are untouched.

**Trade-off note:** this is exact-normalized-title dedupe (catches syndicated/wire copy). Fuzzy
dedupe (Token-Set similarity) is a possible follow-up but risks hiding genuinely similar-but-
different stories; keep it out unless requested.

**Deliverable:** repeated stories appear once, with “also on” attribution.

---

## 6. P3 — HN points/comments + AI follow-up (optional, higher complexity)

### 6.1 HN points/comments in the row
- New columns `hn_points INTEGER`, `hn_comments INTEGER` on `headlines` (migrate via
  `ensureColumn`).
- At ingest, for items whose `hnUrl` contains `/item?id=N`, fetch
  `https://hn.algolia.com/api/v1/items/N` and store `points` + `descendants`. Run **bounded
  concurrent** (e.g. `Promise.all` over the batch, ~30 items on the HN front page) with a short
  timeout; on failure leave `null`.
- `FeedList.tsx`: when present, show a small `▲ 123 · 45 comments` mono chip next to the `hn` tag.
- **Trade-off:** ~30 extra HTTP calls per HN ingest. Acceptable for a personal desk; if ingest
  latency becomes an issue, move enrichment to a separate post-ingest step or lazy-on-view.

### 6.2 AI follow-up Q&A
- After an inline brief (§4.1) is shown, add a small input “Ask about this…”.
- New action `followUp({ url, question })` reuses the cached brief as context and the AI to answer
  the follow-up. Render the answer below the brief.
- Keep it scoped to the already-fetched article (don't re-fetch the web for follow-ups).

---

## 7. P4 — Hardening (quick wins)

- **404 + error pages:** add `src/app/not-found.tsx` and `src/app/error.tsx` styled to the design
  system (currently `notFound()` works but the fallback page is default).
- **OG cards:** add `openGraph` metadata in `layout.tsx` + a static `public/og-image.png` branded
  card; add `openGraph`/`description` per topic page.
- **robots.txt / sitemap:** minor; add `src/app/robots.ts` and a `sitemap.ts` if desired.
- **Profile `wordFrequencies`:** confirm the `words` page stays fast at 24h windows; if it full-
  scans, add a covering index or a small materialized token count. (Index on `published_at`
  already exists, so this is likely fine — verify, don't assume.)

---

## 8. Files likely to change (roll-up)

| Area | New | Modified |
|---|---|---|
| Promo block | `src/lib/blocklist.ts`, `scripts/blocklist.test.ts` | `src/lib/ingest.ts`, `src/app/api/ingest/route.ts` |
| Feed health | — | `src/lib/db.ts`, `src/lib/ingest.ts`, `src/lib/queries.ts`, `src/components/SourceNav.tsx` |
| UI polish | `src/components/EmptyState.tsx` (opt.), `scripts/source-color.test.ts` | `FeedList.tsx`, `HeadlineList.tsx`, `AiLink.tsx`, `SiteNav.tsx`, `SiteHeader.tsx`, `Filters.tsx`, `globals.css` |
| AI inline | `src/components/AiBrief.tsx` | `FeedList.tsx`, `HeadlineList.tsx`, `app/actions.ts` (or `app/summarize/actions.ts`), `lib/summarize.ts`, `SummaryBody.tsx` |
| AI batch | `src/app/brief/page.tsx` | `Filters.tsx`, `lib/summarize.ts` |
| Dedupe | `src/lib/dedupe.ts`, `scripts/dedupe.test.ts` | `src/lib/queries.ts`, `FeedList.tsx` |
| HN pts (P3) | — | `src/lib/db.ts`, `src/lib/ingest.ts`, `FeedList.tsx`, `Headline` type |
| Hardening | `src/app/not-found.tsx`, `src/app/error.tsx`, `public/og-image.png` | `src/app/layout.tsx`, topic pages |

---

## 9. Risks / tradeoffs / open questions

- **Next.js breaking changes (§0):** every route/action edit should be validated against
  `node_modules/next/dist/docs/` before building — this is the #1 risk to build breaks.
- **Promo false-positives:** keyword blocking can catch a legit business story ("sale" in a
  retail piece). Mitigation: conservative list + log-only (never silently discard from audit);
  make patterns trivially tunable in `blocklist.ts`.
- **In-stream AI cost/latency:** expandable summaries trigger model calls on click; keep the
  cached path immediate and the unlock flow identical to today so we don't change billing or
  auth semantics.
- **HN enrichment:** extra HTTP at ingest; bounded + nullable so a failure never blocks ingest.
- **Dedupe aggressiveness:** exact-normalized-title only; fuzzy is explicitly deferred to avoid
  hiding distinct stories.

**Open questions to confirm before execution:**
1. Promo blocking — **skip at ingest** (my recommendation) vs. **store + hide in UI** (lets you audit)?
2. Feed-health status — do you want just the rail glyph, or also a header “3 stale · 1 failed” row?
3. AI inline — expand **in the row** (recommended) or a slide-in **side panel**?
4. HN points/comments — enrich at ingest (recommended) or lazy on view?
5. Scope cut: is P3 (HN pts + follow-up Q&A) in for this pass, or hold for a follow-up?

---

## 10. Execution order & verification

**Order (each step = its own commit + green build):**
1. §1 promo block (P0) → 2. §2 feed health (P1) → 3. §3 UI polish (P1, split into dot / AI button /
   contrast / mobile / hover / empty / refresh as small commits) → 4. §4.1 inline AI → 5. §5 dedupe
   → 6. §4.2 batch + §4.3 formatting → 7. §6 (if in scope) → 8. §7 hardening.

**Per-step verification:**
- `bun run build` (typecheck + build) — must be clean before the next step.
- `bun run test` — all chained tests + any new `scripts/*.test.ts` pass.
- Targeted: `bun run scripts/blocklist.test.ts`, `scripts/dedupe.test.ts`,
  `scripts/source-color.test.ts`, `scripts/ingest-route.test.ts`.
- Manual: `bun run dev` → open `/`, `/topic/tech`, a `/source/*`, `/words`; toggle theme; check
  mobile breakpoint; exercise an inline AI brief and a window brief.

**Definition of done:** all P0+P1 shipped and verified; promo items never reach the feed; per-source
health visible; AI briefs expand in-stream; repeated stories collapsed. P2–P4 as scoped in
§10.5.
