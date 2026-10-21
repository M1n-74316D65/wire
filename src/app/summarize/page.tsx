import { PageChrome } from "@/components/PageChrome";
import { SummarizeForm } from "@/components/SummarizeForm";
import { SummaryBody } from "@/components/SummaryBody";
import { summarizeConfigured } from "@/lib/env";
import { lastUpdatedLabel } from "@/lib/queries";
import { getCachedSummary, summarizeUrl } from "@/lib/summarize";
import { isSummarizeUnlocked } from "@/lib/summarize-auth";
import { getTheme } from "@/lib/theme";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Props = {
  searchParams: Promise<{
    url?: string;
    title?: string;
    run?: string;
    force?: string;
    error?: string;
  }>;
};

export default async function SummarizePage({ searchParams }: Props) {
  const sp = await searchParams;
  const theme = await getTheme();
  const url = (sp.url || "").trim();
  const title = (sp.title || "").trim();
  const unlocked = await isSummarizeUnlocked();
  const configured = summarizeConfigured();
  const queryError = sp.error ? decodeURIComponent(sp.error) : null;
  const force = sp.force === "1";
  const wantRun = sp.run === "1" || force;

  let summaryText: string | null = null;
  let model: string | null = null;
  let createdAt: number | null = null;
  let runError: string | null = null;

  if (url && configured) {
    const cached = force ? null : getCachedSummary(url);

    if (cached) {
      summaryText = cached.summary;
      model = cached.model;
      createdAt = cached.created_at;
    } else if (unlocked && wantRun) {
      try {
        const row = await summarizeUrl({ url, title: title || null, force });
        summaryText = row.summary;
        model = row.model;
        createdAt = row.created_at;
      } catch (err) {
        runError = err instanceof Error ? err.message : String(err);
      }
    }
  }

  const regenerateHref = url
    ? `/summarize?url=${encodeURIComponent(url)}${title ? `&title=${encodeURIComponent(title)}` : ""}&run=1&force=1`
    : "/";

  return (
    <PageChrome
      theme={theme}
      lastUpdated={lastUpdatedLabel()}
      showFilters={false}
      title="Brief"
    >
      <div className="brief-page">
        {!configured ? (
          <p className="lede">
            Not configured. Set <code>AI_API_KEY</code>, <code>AI_MODEL</code>, and{" "}
            <code>SUMMARIZE_PASSWORD</code> in <code>.env</code>.
          </p>
        ) : null}

        {queryError ? <p className="error">Error: {queryError}</p> : null}
        {runError ? <p className="error">Error: {runError}</p> : null}

        {summaryText ? (
          <article className="brief-card">
            {title ? <h1 className="brief-card__title">{title}</h1> : null}
            {url ? (
              <p className="brief-card__source">
                <a href={url} rel="noopener noreferrer">
                  Read original · {hostname(url)}
                </a>
              </p>
            ) : null}

            <SummaryBody text={summaryText} />

            <footer className="brief-card__foot">
              <span className="meta meta--wrap">
                {model ? model : null}
                {createdAt
                  ? ` · ${new Date(createdAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}`
                  : null}
              </span>
              <nav className="brief-card__actions">
                <a href={regenerateHref}>Rewrite</a>
                <a href="/">Desk</a>
              </nav>
            </footer>
          </article>
        ) : configured ? (
          <SummarizeForm url={url} title={title} unlocked={unlocked} />
        ) : null}
      </div>
    </PageChrome>
  );
}

function hostname(raw: string): string {
  try {
    return new URL(raw).hostname.replace(/^www\./, "");
  } catch {
    return raw;
  }
}
