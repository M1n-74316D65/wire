<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos, the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project
Personal RSS wire: a quiet, self-hosted feed reader (Next.js + SQLite, no
framework). 22 curated RSS sources, one-time ingest, AI summaries on demand.

## Conventions
- Bun + Next.js 16 (App Router, dynamic). Data in `data/news.sqlite` via
  `better-sqlite3`; schema in `scripts/schema.sql` (run `bun run scripts/migrate.ts`).
- Ingest is a local CLI: `bun run scripts/ingest.ts` — NOT scheduled here. The
  host (cron) drives it and pushes results to the VPS.
- The app is read-only over the DB. All writes happen in the ingest pipeline
  (`src/lib/ingest.ts`) or the summarize path (`src/app/api/summarize/*`).
- Keep the "quiet desk" voice: no marketing copy, no feature banners, no
  "trending" framing. The UI states facts in plain language.
- No auth. Summarize is behind `SUMMARIZE_PASSWORD` (env), checked client-side
  and server-side. Keep it that way.
- Tests are plain bun scripts in `scripts/*.test.ts(x)` run via `bun run test`;
  there is no test framework. Add new checks there, not in a new runner.
- TypeScript is strict-ish but pragmatic: no `any` in `src/lib`, avoid React
  event types in plain helpers.

## Roadmap
- [x] P0: ingest pipeline + DB (done)
- [x] P1: UI polish — source identity, per-source status, AI button clarity
- [x] P0: block promotional/affiliate/deal items at ingest
- [ ] P2: AI briefs (headline summaries + auto-daily digest)
