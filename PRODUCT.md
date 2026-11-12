# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The owner, alone. A personal reader who keeps a curated set of RSS feeds and reads them as one chronological desk. Public visitors at news.m1n.land are not a design target; they are a deploy consequence.

## Product Purpose

A personal RSS desk. Curated feeds land in a local SQLite database; the UI shows them as one chronological stream with a side rail of sections. Success: the owner opens it, scans what changed since last time, and reads the few articles worth reading without an algorithm deciding for them.

## Positioning

The owner chooses every source. Nothing is ranked, recommended, or personalized. Articles are shown in the order they were published.

## Operating Context

- Opened in a browser on a desktop or phone, typically at a scheduled reading moment.
- Feeds refresh through `bun run ingest` locally, or `/api/ingest` on a cron (weekdays, 07:00–16:59 UTC) in production.
- Production runs on Vercel with the SQLite file; the README notes that a durable host (Fly.io, Railway, VPS) is the recommended option.
- AI summaries are used occasionally, behind a password gate.

## Brand Commitments

- Name: "wire". Tagline in site metadata: "A quiet desk for the feeds you keep."

## Capabilities and Constraints

- Sections: Tech, News, Spain, Business, Science, Gaming, Culture, Politics, plus `all`.
- Routes: `/` desk, `/topic/{slug}`, `/source/{slug}`, `/words` keyword cloud, `/summarize` AI summary (password-gated), `/api` and `/api/topic/{slug}` JSON snapshots, `/api/ingest` refresh.
- Query params: `?limit=5|10|15|25|50`, `?hours=1|3|6|12|24`.
- Topic routing: multi-topic sources may be routed by a decision model (`DECISION_*`), capped per ingest. Single-topic sources are labeled for free. This is an implementation detail, not a differentiator.
- Theme: `auto` / `day` / `night`, set by cookie through a form POST, works without client JS.
- Keyless degradation: without `AI_API_KEY` and `SUMMARIZE_PASSWORD`, the app runs and `ai` links are hidden. Without `DECISION_API_KEY`, the app runs with source-based topics.
- Stack already decided: Next.js 16, React 19, `better-sqlite3`, Bun.
- Open: whether the site stays private or opens to a wider audience. Not decided; do not design for public readers yet.

## Product Principles

- Time order is the feed. No ranking, engagement, or personalization.
- The owner curates the sources. Models route and summarize; they never add or drop sources.
- Missing keys or services hide features; they never break a page.
- Reading first. Surfaces exist to help a person read, not to keep them scrolling.
