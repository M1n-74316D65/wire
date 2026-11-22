---
name: wire
description: A quiet desk for the feeds you keep.
colors:
  cool-paper: "#f5f7f8"
  graphite-ink: "#12171c"
  slate-muted: "#5c6a75"
  mist-rule: "#dde3e8"
  deep-lagoon-teal: "#0e6b5c"
  brick-alert: "#b42318"
  night-harbor: "#0e1114"
  lamp-ivory: "#e8eef2"
  fog-slate: "#8a98a4"
  deep-mist-rule: "#243038"
  bright-lagoon: "#2dd4bf"
  ember-alert: "#ff7b72"
  field-line-day: "#7d8a96"
  field-line-night: "#54656f"
  active-day: "#e7ecef"
  active-night: "#1a2229"
typography:
  brand:
    fontFamily: "Georgia, 'Times New Roman', Times, serif"
    fontSize: "2.35rem"
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Georgia, 'Times New Roman', Times, serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.55
  headline:
    fontFamily: "Georgia, 'Times New Roman', Times, serif"
    fontSize: "1.1875rem"
    fontWeight: 400
    lineHeight: 1.42
  ui-label:
    fontFamily: "Outfit, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.45
  meta:
    fontFamily: "Outfit, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.5
    fontVariantNumeric: "tabular-nums"
rounded:
  none: "0px"
components:
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.graphite-ink}"
    typography: "{typography.ui-label}"
    rounded: "{rounded.none}"
    padding: "0.5rem 1rem"
  button-outline-hover:
    backgroundColor: "{colors.graphite-ink}"
    textColor: "{colors.cool-paper}"
  feed-headline:
    backgroundColor: "transparent"
    textColor: "{colors.graphite-ink}"
    typography: "{typography.headline}"
  feed-headline-hover:
    textColor: "{colors.deep-lagoon-teal}"
  navigation-active:
    backgroundColor: "{colors.active-day}"
    textColor: "{colors.graphite-ink}"
    fontWeight: 650
  tag-ai:
    backgroundColor: "transparent"
    textColor: "{colors.slate-muted}"
    border: "1px solid {colors.mist-rule}"
    typography: "{typography.meta}"
---

# Design System: wire

## Overview

**Creative North Star: "The Quiet Desk"**

wire is a reading surface, not a feed that wants attention. It looks like a sheet on a desk: a cool off-white field, graphite type set in Georgia, and hairline rules that do the work a card or a shadow would do elsewhere. Density is high on purpose. A window's headlines sit in supplied chronological order, with source, headline, and time arranged for repeated scanning.

The desk has two planes: a persistent labelled index on the left and a fluid reading canvas on the right. The index holds sections, sources, freshness, the last pull, and theme controls. The canvas holds only the current view and its factual window controls. No global desktop bar separates the reader from the content.

Confirmed rejections: this system must not look like an engagement feed (cards, badges, unread counts, glow), a news portal (hero images, lead stories, tickers, boxed sections competing for attention), or an admin dashboard (icon sidebars, pill buttons, stat tiles, heavy chrome).

**Key Characteristics:**
- Chronological rows, one per headline, separated by hairline rules.
- Serif for reading, sans for interface and aligned metadata; monospace only for literal code.
- Flat at rest. No shadows, gradients, or container radius.
- Text-first controls with a quiet neutral fill and heavier type for the current item.
- Dark theme follows the same structure with its own palette, not an inversion.

## Colors

A two-theme neutral system with a single cool accent. Day is the default; night is a parallel palette selected by the same tokens.

### Primary
- **Deep Lagoon Teal** (#0e6b5c): the only chromatic interface accent in day theme. Used for headline and source hover, focus outlines, and the `ai` mark. Keep it rare.

### Secondary
- **Graphite Ink** (#12171c): all primary text and the outline of buttons. Also the link color.
- **Slate Muted** (#5c6a75): secondary text, sources, timestamps, inactive navigation, and visited links.

### Neutral
- **Cool Paper** (#f5f7f8): the page background. Slightly blue-tinted so it never reads as yellowed paper.
- **Mist Rule** (#dde3e8): dividers, the index edge, and feed row borders.
- **Active Wash** (#e7ecef day, #1a2229 night): the small neutral field behind the current navigation item, filter, or mobile tab. It carries no semantic hue.
- **Field Line** (#7d8a96 day, #54656f night): the underline that identifies a form field. It is stronger than Mist Rule because a field boundary must reach 3:1 against the page.
- **Brick Alert** (#b42318): error text and failed source state.

### Night Theme
- **Night Harbor** (#0e1114): page background in night theme.
- **Lamp Ivory** (#e8eef2): primary text and links.
- **Fog Slate** (#8a98a4): muted text and visited links.
- **Deep Mist Rule** (#243038): dividers in night theme.
- **Bright Lagoon** (#2dd4bf): accent in night theme.
- **Ember Alert** (#ff7b72): error text in night theme.

Source identity squares and source-health states retain their data colors. They are information, not decoration, and always have text or an accessible state label alongside them.

### Named Rules
**The One Accent Rule.** Interface teal appears on hover, focus, the fresh-source indicator, and the AI mark. A teal headline at rest breaks the desk.

**The Ink Not Black Rule.** Text is Graphite Ink, never pure black. Pure black on Cool Paper reads harsh over a long column.

## Typography

**Reading Font:** Georgia (with Times New Roman, Times, serif)
**Interface and Meta Font:** Outfit (with ui-sans-serif, system-ui, sans-serif), loaded via `next/font`
**Code Font:** ui-monospace (with SFMono-Regular, Menlo, Consolas, monospace), only inside `code`

The pairing is deliberately limited to two faces. Outfit's tabular numerals align timestamps and counts without loading a third font.

### Hierarchy
- **Brand** (400 italic, 2.35rem desktop / 1.65rem mobile, line-height 0.95, Georgia): the masthead "wire" only.
- **Page Title** (500, 2rem desktop / 1.75rem mobile, Outfit): one noun naming the screen.
- **Headline in Feed** (400, 1.1875rem / 1.42, Georgia): every headline, wrapping naturally rather than truncating.
- **Body** (400, 1.0625rem / 1.55, Georgia): base reading text. Summary prose steps to 1.125rem / 1.7.
- **Navigation / Chrome** (450–650, 0.8125–1rem, Outfit): index items, controls, tagline, and form labels.
- **Meta** (400, 0.75rem, Outfit, tabular numerals): timestamps, counts, and tags.

### Named Rules
**The Tabular Time Rule.** Timestamps and counts always use tabular numerals so time and filter values align without a mono face.

## Layout

The centered shell is at most 90rem wide with equal responsive outer margins (`clamp(1rem, 3vw, 3rem)` per side). The desktop desk is a two-column grid: a 15rem sticky index and a fluid reading canvas separated by a 2–4rem responsive gutter. Both start 2rem from the viewport top. There is no desktop top bar.

The index is one dynamic-viewport-height column. Its middle scrolls independently with a stable scrollbar gutter and contained overscroll; the brand and rail footer stay in place. The reading canvas is capped at 68rem, with long-form reading capped at 40rem.

The page header combines a 2rem title, a factual summary of the current window, and wrapping filter links above one rule. Desktop feed rows use an 8.75rem source column, fluid headline, and automatic meta column with 1rem vertical padding. Between 761px and 1100px, source and meta share a 7.5rem column beside the headline; long source names wrap instead of ellipsizing.

Responsive behavior:
- At 760px and below, the desktop index is `display: none`. A 48px mobile header shows the wordmark and a native `details` / `summary` Browse disclosure.
- The Browse panel contains the same Sections, Sources, and theme controls as desktop. It fills the remaining dynamic viewport, scrolls independently, and leaves the bottom quick-navigation bar available behind it.
- Feed rows stack into source and meta above a full-width headline. Source-page lists keep headline then meta without visually reordering their DOM.
- The existing five-item bottom tab bar provides peer shortcuts. The shell adds safe-area and bottom-tab clearance.
- Content margins are 16px on phones. No horizontal topic strip or clipped source list remains.

Spacing uses small gaps of 0.35–0.75rem inside rows, 1–1.5rem between controls and content, 1.5–2rem around major groups, and a 2–4rem gutter between the index and stream.

## Elevation & Depth

Flat. No `box-shadow` appears anywhere in the system. Depth is conveyed by hairline rules in Mist Rule or Deep Mist Rule, and by the one-pixel outline on action buttons. The neutral Active Wash identifies the current item; it is not a raised surface.

### Named Rules
**The Hairline Rule.** Structure is drawn with 1px rules, never shadows, glow, glass, or heavier container borders.

## Shapes

Controls and containers have zero radius: buttons, inputs, filters, active navigation, and the Browse disclosure are square. Forms are underline-only. Source-health dots are small drawn status marks, not containers. No pills, chips, rounded avatars, or floating rounded navigation.

## Components

Each component is text-first. Hover and focus are color changes, not motion.

### Buttons
- **Shape:** rectangle, 0 radius, 1px solid Graphite Ink outline.
- **Default:** transparent background, Graphite Ink text, Outfit 0.9rem weight 500, minimum height 2.75rem.
- **Hover:** Graphite Ink fill with Cool Paper text.
- **Focus:** the global 2px Deep Lagoon Teal outline, offset 3px.

### Inputs / Fields
- **Style:** transparent background, 1px bottom border in Field Line, no other edges, 0 radius, minimum height 2.75rem, Outfit 1rem.
- **Focus:** the bottom border shifts to Deep Lagoon Teal and the global focus ring remains visible.
- **Label:** Outfit 0.8125rem in Slate Muted, above the field.

### Feed Row
- **Source:** Outfit 0.875rem, Slate Muted, source identity square, teal on hover.
- **Headline:** Georgia 1.1875rem, Graphite Ink, teal and underline on hover, Slate Muted once visited.
- **Meta:** Outfit 0.75rem, Slate Muted, tabular numerals, right aligned on the wide canvas.
- **Divider:** 1px Mist Rule below each row.
- **Order:** source, headline, meta in the DOM and wide layout; source and meta above the headline on phones. Headline input order is never changed.

### Navigation (Sections and Sources)
- **Style:** Outfit 0.8125–0.875rem, Slate Muted links, 34px desktop row pitch, no underline.
- **Hover:** Deep Lagoon Teal text.
- **Active:** a non-link span in Graphite Ink at weight 650 on Active Wash, with `aria-current="page"`; color is never the only signal.
- **Mobile:** full native Browse disclosure with 44px rows, not an overflow strip.

### Filters
- **Style:** Outfit 0.8125rem in Slate Muted with tabular numerals; each option is a text link.
- **Active:** Graphite Ink at weight 650 on Active Wash, with `aria-current="page"`.
- **Hover:** Deep Lagoon Teal with underline.
- **Words:** the unused headline-count group is omitted; only the time window remains.

### Theme Toggle
- **Style:** three Outfit text options (`auto`, `day`, `night`) separated by faint dots. All three are submit buttons that post the existing server form.
- **Selected:** `aria-pressed="true"`, Graphite Ink at weight 650, and an underline. No localStorage or client script replaces the form.

### AI Brief Control
- **Style:** a hairline label, not a badge. 1px Mist Rule box, 0 radius, Outfit 0.75rem in Slate Muted, holding a drawn three-rule mark in Deep Lagoon Teal and the word `brief`.
- **Hover / focus:** the box and word take the accent. No fill, no underline.

### Empty and Loading States
- **Empty:** a 1.5rem Georgia statement and one plain next action, with generous vertical space and a bottom rule. Never recommend an unavailable wider window.
- **Loading:** static neutral paragraph-shaped fields at real body size. No shimmer or invented content.
- **Alerts:** plain Outfit error text in Brick Alert or Ember Alert; no marketing-style banner.

### Skip Link
- **Style:** off-screen until focused, then a Graphite Ink outlined control at the top-left in Outfit 0.9rem, targeting the one main landmark.

## Do's and Don'ts

### Do:
- **Do** keep every feed item as source, headline, meta in that order and let long titles wrap.
- **Do** use Mist Rule 1px dividers and Active Wash for current items.
- **Do** use the accent only for interaction, fresh-source state, and the AI mark.
- **Do** keep timestamps and counts in Outfit with tabular numerals.
- **Do** keep text controls as text; use the outlined button only for actions that submit a form.
- **Do** check both day and night palettes and forced colors whenever a state changes.

### Don't:
- **Don't** add shadows, gradients, or glow to any surface.
- **Don't** round controls or containers.
- **Don't** use cards, badges, unread counts, or engagement affordances in the feed.
- **Don't** put images in the header or stream as decoration.
- **Don't** use teal for body text, headlines at rest, or large fills.
- **Don't** invert the night theme by flipping colors. It has its own palette.
- **Don't** reorder the supplied headline sequence or turn the stream into a ranked list.
