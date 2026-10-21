# wire

Personal RSS desk. Curated feeds land in SQLite; the UI is a chronological stream with a side rail for sections.

## Local setup

```bash
bun install
cp .env.example .env
bun run ingest
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment

| Variable | Required | Description |
|----------|----------|-------------|
| `AI_API_KEY` | for `ai` summaries | OpenAI-compatible API key |
| `AI_BASE_URL` | no | Default `https://api.openai.com/v1` |
| `AI_MODEL` | no | Default `gpt-4o-mini` |
| `SUMMARIZE_PASSWORD` | for `ai` summaries | Password before summarizing |
| `CRON_SECRET` | recommended in prod | Shared secret for `/api/ingest` |

Without `AI_API_KEY` and `SUMMARIZE_PASSWORD`, the app still runs; `ai` links are hidden.

## Deploy (Vercel)

This app uses **SQLite** (`better-sqlite3`). On Vercel the filesystem is ephemeral, so the DB does not survive across instances. For a durable deploy, prefer a host with a persistent disk (Fly.io, Railway, a VPS). The steps below still work for a quick Vercel preview if you re-ingest after each cold start.

### 1. Push & import

1. Push this repo to GitHub.
2. [vercel.com/new](https://vercel.com/new) → import the repo.
3. Framework preset: **Next.js**. Install / build leave as detected (`bun install` / `bun run build` if you set Bun as the install command, or npm equivalents).

### 2. Environment variables

In the Vercel project → **Settings → Environment Variables**, add for Production (and Preview if you want):

```
AI_API_KEY=
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o-mini
SUMMARIZE_PASSWORD=
CRON_SECRET=
```

Redeploy after saving.

### 3. Refresh feeds

Hit ingest once after deploy:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://YOUR_DOMAIN/api/ingest
```

Optional: Vercel Cron → path `/api/ingest`, schedule e.g. `*/30 * * * *`, and send header `Authorization: Bearer <CRON_SECRET>` (configure in `vercel.json` / project crons + protect the route with `CRON_SECRET`).

### 4. Durable alternative (recommended)

- **Fly.io / Railway / VPS**: attach a volume, point the process at `data/news.sqlite`, run `bun run ingest` on a schedule (cron or systemd timer).
- Same env vars as above.

## Routes

| Path | What |
|------|------|
| `/` | Desk (curated home feeds) |
| `/topic/{slug}` | Section stream (`all`, `spain`, `tech`, …) |
| `/source/{slug}` | Single source |
| `/words` | Title keyword cloud |
| `/summarize` | AI article summary (password-gated) |
| `/api` | JSON home snapshot |
| `/api/topic/{slug}` | JSON topic snapshot |
| `/api/ingest` | Refresh feeds |

Query params: `?limit=5|10|15|25|50`, `?hours=1|3|6|12|24`.

Theme: `auto` / `day` / `night` via cookie (form POST, no JS).
