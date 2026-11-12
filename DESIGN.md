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
typography:
  brand:
    fontFamily: "Georgia, 'Times New Roman', Times, serif"
    fontSize: "clamp(2rem, 4vw, 2.5rem)"
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Georgia, 'Times New Roman', Times, serif"
    fontSize: "1.05rem"
    fontWeight: 400
    lineHeight: 1.55
  headline:
    fontFamily: "Georgia, 'Times New Roman', Times, serif"
    fontSize: "1.05rem"
    fontWeight: 400
    lineHeight: 1.4
  ui-label:
    fontFamily: "Outfit, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 600
    lineHeight: 1.45
    letterSpacing: "0.08em"
  meta:
    fontFamily: "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "0.72rem"
    fontWeight: 400
    lineHeight: 1.55
rounded:
  none: "0px"
components:
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.graphite-ink}"
    typography: "{typography.ui-label}"
    rounded: "{rounded.none}"
    padding: "0.45rem 0.9rem"
  button-outline-hover:
    backgroundColor: "{colors.graphite-ink}"
    textColor: "{colors.cool-paper}"
  feed-headline:
    backgroundColor: "transparent"
    textColor: "{colors.graphite-ink}"
    typography: "{typography.headline}"
  feed-headline-hover:
    textColor: "{colors.deep-lagoon-teal}"
  tag-ai:
    backgroundColor: "{colors.deep-lagoon-teal}"
    textColor: "{colors.cool-paper}"
    typography: "{typography.meta}"
---

# Design System: wire

## Overview

**Creative North Star: "The Quiet Desk"**

wire is a reading surface, not a feed that wants attention. It looks like paper on a desk: a cool off-white field, graphite type set in Georgia, and hairline rules that do the work a card or a shadow would do elsewhere. Density is high on purpose. A day's headlines sit in one time-ordered column, each row a single line of source, headline, and time, so the eye can scan a whole morning without interruption.

Structure comes from position and rules, never from boxes. The sections rail sits left and stays put while the stream scrolls. Accent teal is rare: it marks hover, focus, and AI-generated links, so when it appears it means something changed or something was produced for you. The night theme keeps the same grammar on a dark harbor background, with brighter teal for the accent so it still reads at low light.

Confirmed rejections: this system must not look like an engagement feed (cards, badges, unread counts, glow), a news portal (hero images, tickers, boxed sections competing for attention), or an admin dashboard (icon sidebars, pill buttons, stat tiles, heavy chrome).

**Key Characteristics:**
- Chronological rows, one per headline, separated by hairline rules.
- Serif for reading, sans for chrome labels, mono for timestamps and filters.
- Flat at rest. No shadows, no gradients, no radius.
- Text-first controls: links underline on hover; buttons are outlined rectangles.
- Dark theme follows the same structure with its own palette, not an inversion.

## Colors

A two-theme neutral system with a single cool accent. Day is the default; night is a parallel palette selected by the same tokens.

### Primary
- **Deep Lagoon Teal** (#0e6b5c): the only accent in day theme. Used for headline and source hover, focus outlines, and the `ai` tag. Keep it under roughly 5% of any screen.

### Secondary
- **Graphite Ink** (#12171c): all primary text and the outline of buttons. Also the link color.
- **Slate Muted** (#5c6a75): secondary text: sources, timestamps, inactive navigation, visited links.

### Neutral
- **Cool Paper** (#f5f7f8): the page background. Slightly blue-tinted so it never reads as yellowed paper.
- **Mist Rule** (#dde3e8): every divider and feed row border. The only "line" in the system.
- **Field Line** (#7d8a96 day, #54656f night): the underline that identifies a form field. It is stronger than Mist Rule because a field boundary must reach 3:1 against the page.
- **Brick Alert** (#b42318): error text only.

### Night Theme
- **Night Harbor** (#0e1114): page background in night theme.
- **Lamp Ivory** (#e8eef2): primary text and links.
- **Fog Slate** (#8a98a4): muted text and visited links.
- **Deep Mist Rule** (#243038): dividers in night theme.
- **Bright Lagoon** (#2dd4bf): accent in night theme.
- **Ember Alert** (#ff7b72): error text in night theme.

### Named Rules
**The One Accent Rule.** Deep Lagoon Teal appears only on hover, focus, and AI-produced labels. Its rarity is the point; a teal headline at rest breaks the desk. The AI tag is the single exception: it is a filled accent block, the one place accent fills a surface.

**The Ink Not Black Rule.** Text is Graphite Ink, never pure black. Pure black on Cool Paper reads harsh over a long column.

## Typography

**Display Font:** Georgia (with Times New Roman, Times, serif)
**Body Font:** Georgia (with Times New Roman, Times, serif)
**Label Font:** Outfit (with ui-sans-serif, system-ui, sans-serif), loaded via `next/font`
**Meta/Mono Font:** IBM Plex Mono (weights 400 and 500), loaded via `next/font`

**Character:** A bookish serif carries the reading, while a geometric sans and a monospace take the small, functional text. The pairing reads as a printed index with a clean label system, not a magazine.

### Hierarchy
- **Brand** (400, clamp(2.5rem, 6vw, 3.4rem), line-height 0.95, letter-spacing -0.03em, italic): the masthead "wire" only.
- **Headline in Feed** (400, 1.05rem, line-height 1.4): every headline in the stream.
- **Body** (400, 1.05rem, line-height 1.55): base text. Article summary prose steps up to 1.15rem / 1.6 and is capped at 40rem.
- **Section Title** (600, 0.78rem, letter-spacing 0.08em, uppercase, Outfit): the section heading in the main column.
- **Source / Chrome Label** (Outfit, 0.78rem to 0.92rem): feed source names, tagline, and navigation.
- **Meta** (IBM Plex Mono, 0.72rem, tabular numerals): timestamps, filters, tags.

### Named Rules
**The Tabular Time Rule.** Timestamps and counts always use tabular numerals in mono, so a column of times aligns down the stream.

## Layout

A single centered shell, `min(1080px, 100% - 2rem)`, with 1.75rem top padding and 4rem bottom. Below the header, a two-column desk: a 9.5rem rail on the left and a fluid main column, separated by a 2.5rem gap, top-aligned.

The feed is a three-part grid per row: a 7.5rem source column, a fluid headline column, and an auto meta column, with 0.65rem vertical padding and a 1px rule between rows. Long-form summary text stops at 40rem; the brief page at 36rem.

Responsive behavior:
- At 760px and below, the desk collapses to one column. The section rail becomes a horizontal scroll row with a bottom rule, the sources list and the section label are hidden, and the theme becomes a five-item bottom tab bar.
- Feed rows stack into two lines: source and meta on top, the headline full width below.
- The shell pads its top and bottom by the safe-area insets, so the masthead clears notches and the tab bar clears the home indicator.

Spacing is not a token scale. Use the observed rhythm: small gaps of 0.4 to 0.75rem inside rows, 1rem to 1.75rem between blocks, and 2.5rem between the rail and the stream.

## Elevation & Depth

Flat. No `box-shadow` appears anywhere in the system. Depth is conveyed by hairline rules in Mist Rule (day) or Deep Mist Rule (night), and by the one-pixel outline on buttons. Surfaces do not lift.

### Named Rules
**The Hairline Rule.** Structure is drawn with 1px rules in the line token, never with shadows, fills, or borders heavier than 1px.

## Shapes

Zero radius everywhere: buttons, inputs, and the summarize form all use `border-radius: 0`. Forms are underline-only. Shapes come from alignment and rules, not from containers. No pills, no chips, no rounded avatars.

## Components

Each component is text-first. Hover and focus are color changes, not motion.

### Buttons
- **Shape:** rectangle, 0 radius, 1px solid Graphite Ink outline.
- **Default:** transparent background, Graphite Ink text, Outfit 0.9rem weight 500, padding 0.45rem 0.9rem, margin-top 0.5rem.
- **Hover:** Graphite Ink fill with Cool Paper text. This is the only inversion in the system.
- **Focus:** the global 2px Deep Lagoon Teal outline, offset 2px.

### Inputs / Fields
- **Style:** transparent background, 1px bottom border in Field Line, no other edges, 0 radius, padding 0.4rem 0.
- **Focus:** the bottom border shifts to Deep Lagoon Teal and the global focus ring stays visible around the field.
- **Label:** IBM Plex Mono 0.72rem in Slate Muted, above the field.

### Feed Row
- **Source:** Outfit 0.82rem, Slate Muted, truncates with ellipsis, teal on hover.
- **Headline:** Georgia 1.05rem, Graphite Ink, teal on hover, Slate Muted once visited.
- **Meta:** Plex Mono 0.72rem, Slate Muted, tabular numerals, no wrap.
- **Divider:** 1px Mist Rule below each row.

### Navigation (Sections Rail)
- **Style:** Outfit 0.9rem, Slate Muted links, 0.2rem vertical padding, no underline.
- **Hover:** Graphite Ink text.
- **Active:** the current section is a non-link span in Graphite Ink at weight 600.
- **Mobile:** single horizontal scroll row, no wrap, with a bottom rule.

### Filters
- **Style:** Plex Mono 0.75rem in Slate Muted; each option is a text link.
- **Active:** Graphite Ink at weight 500, not underlined.
- **Hover:** Graphite Ink with underline.

### Theme Toggle
- **Style:** three mono text options (`auto`, `day`, `night`) separated by faint dots. All three are submit buttons that post a form; the selected one is marked `aria-pressed="true"` and renders in Graphite Ink at weight 500.

### AI Tag
- **Style:** Outfit 0.72rem weight 600 in Cool Paper on a Deep Lagoon Teal fill (Night Harbor on Bright Lagoon in night theme), with a small spark glyph. It is the only place accent fills a surface in a list row.

### Skip Link
- **Style:** off-screen until focused, then a Graphite Ink outlined chip at the top-left in Outfit 0.9rem, targeting the main column.

## Do's and Don'ts

### Do:
- **Do** keep every row in the stream as one headline line: source, headline, meta, in that order.
- **Do** use Mist Rule 1px dividers to separate rows and sections.
- **Do** use the accent only for hover, focus, and AI-produced labels.
- **Do** keep timestamps and counts in Plex Mono with tabular numerals.
- **Do** keep text controls as text; use the outlined button only for actions that submit a form.
- **Do** check both day and night palettes whenever a color is touched.

### Don't:
- **Don't** add shadows, gradients, or glow to any surface.
- **Don't** round corners. Radius is 0.
- **Don't** use cards, badges, unread counts, or engagement affordances in the feed.
- **Don't** put images in the header or stream as decoration.
- **Don't** use teal for body text, headlines at rest, or large fills.
- **Don't** invert the night theme by flipping colors. It has its own palette.
- **Don't** reorder the feed row columns or change the time-ordered stream into a ranked list.
