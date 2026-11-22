# Wire reading desk redesign

## Intent

Rebuild wire as a durable personal reading surface. The owner should be able to see the current section, understand the time window, scan source and headline order, and move to any section or source without fighting the chrome.

The redesign is visual and structural. It does not change feed ordering, ingest, summarization, authentication, routes, or data storage.

## Direction

Use the Design Taste `achromatic-ledger` direction, seed `1285664368`, with its Open Plane shell. The existing cool paper, graphite, Georgia, Outfit, and teal accent remain. The existing zero-radius, no-shadow, no-gradient, no-card system remains binding where the generic direction differs.

Three alternatives were considered:

- **Open reading plane, selected.** A labelled source column and fluid reading canvas fit repeated scanning and preserve chronology.
- **Magazine lead story.** Rejected because a featured story would imply editorial ranking that the product does not have.
- **Analytics dashboard.** Rejected because counts, stat tiles, and chart chrome would turn a reading tool into an engagement surface.

The subject-specific idea is: the current feed window becomes a sheet on a quiet reading desk. The persistent index is the shelving; the chronological stream is the reading plane. No decorative illustration is needed.

## Reference evidence

FreshRSS's [main stream reader workspace](https://uizze.com/packs/8b436f3a-7232-4a32-a850-ade625ade24e) shows a persistent feed index beside chronological source/title/date rows. Retain that structural relationship, with wire's typography, spacing, and lack of reader-management chrome.

The Slack release archive and BBC headline portal were inspected as related examples. Neither is an exact RSS-reader match; their marketing hero and image-led lead-story hierarchy are not adopted.

The authorized image generator returned `Invalid credential`. There is no generated visual target. Implementation therefore proceeds from this contract, the existing design system, and the structural FreshRSS comparison. No pixel-perfect or 1:1 target claim is permitted.

## Layout contract

### Desktop

- Center a shell no wider than 1440px with equal responsive outer margins.
- Use a 240–256px sticky browse column at the left, full viewport height, with a 32px top offset.
- Put the wire wordmark and existing tagline at the top of that column. Put Sections and Sources in an independently scrollable middle. Put the factual pulled timestamp and existing three-state theme forms at the bottom.
- Do not add a desktop top bar. The reading canvas starts level with the browse column.
- Give the canvas a fluid width, a 24–64px gutter from the index, and a readable maximum measure.
- Use a 32px page title, a factual window summary, and compact filter groups as the reading-plane header.
- Use a neutral background and heavier type for active navigation, never color alone.

### Feed

- Preserve the supplied headline order exactly.
- Use three desktop columns: approximately 140px source, fluid Georgia headline, and a fixed right-aligned time/meta column.
- Set headlines at 19px with comfortable line height and 16px row padding. Long titles wrap naturally; the layout must not truncate them.
- Keep source links, external headline links, HN discussions, and optional AI links as separate native links.
- At intermediate widths, let source and time share a narrow column beside the headline rather than squeezing the headline.
- Empty states say what happened and offer a possible next action. At the maximum 24-hour window, do not recommend a wider range that does not exist.

### Mobile and tablet

- Below the existing 760px breakpoint, remove the desktop column and horizontal topic strip.
- Use a 48px mobile header with the wire wordmark and a native `details`/`summary` Browse disclosure. Its panel contains the same Sections, Sources, and theme controls as desktop and scrolls within the dynamic viewport.
- Keep the existing five-item bottom quick-navigation bar. Browse is for the complete index; the tab bar is for peer shortcuts.
- Feed rows become two lines: source and time above the full headline. Controls meet minimum target sizes and do not clip.
- Preserve one `main` landmark and one skip link. Repeated navigation exists only for responsive presentation; inactive versions are removed from layout and accessibility with `display: none`.

### Secondary views

- Words keeps its data-driven type sizes. Its filter row omits the unused headline-count control, and its summary explains that size follows title frequency.
- Brief and Summary retain all form, password, cache, configuration, and error behavior. Their reading column, body type, metadata, and actions use the same plane and spacing rules as the feed.
- Loading, empty, alert, focus, and unconfigured states remain plain and visible without adding cards or banners.

## Color, type, and interaction

- Preserve the documented light and dark token values and teal accent. Accent use remains limited to hover, focus, AI, and meaningful source identity.
- Preserve `color-scheme` and explicit system/day/night server forms. Add the required `light-dark()` fallback without overriding an explicit HTML theme.
- Use Outfit for interface and metadata with tabular numerals where alignment matters; use Georgia for the wordmark, headlines, and long-form reading. Do not add a third font.
- Use logical properties, Grid for the shell and rows, Flexbox for wrapping toolbars, `min-inline-size: 0`, stable scrollbar gutters, and visible `:focus-visible` outlines.
- Do not reorder interactive DOM content for visual effect. Do not add JavaScript for the Browse disclosure or theme selector.

## Product boundaries

Strict chronology; no ranking, recommendations, personalization, unread counts, thumbnails, lead stories, stat tiles, icon sidebar, marketing copy, or feature banners. No new dependencies or styling framework.

## Verification

- Add plain Bun/React static-markup checks to the existing test script; no test runner.
- Run all tests, ESLint, and a production build.
- Capture and inspect 1440px, 768px, and 390px views. Check light and dark themes, empty and populated rows, mobile Browse open/closed, secondary routes, focus, and overflow.
- Compare before and after evidence. A fresh critic names the single highest-impact remaining difference; fix and recapture for at most three rounds.
- Record only checks actually run. Save a visual-evidence receipt with real hashes; omit any nonexistent target.
