import { PageChrome } from "@/components/PageChrome";
import { SummarizeForm } from "@/components/SummarizeForm";
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
  let runError: string | null = null;

  if (url && configured) {
    const cached = force ? null : getCachedSummary(url);

    if (cached) {
      summaryText = cached.summary;
      model = cached.model;
    } else if (unlocked && wantRun) {
      try {
        const row = await summarizeUrl({ url, title: title || null, force });
        summaryText = row.summary;
        model = row.model;
      } catch (err) {
        runError = err instanceof Error ? err.message : String(err);
      }
    }
  }

  return (
    <PageChrome
      theme={theme}
      lastUpdated={lastUpdatedLabel()}
      showFilters={false}
      title="Summarize"
    >
      <div className="prose">
        {!configured ? (
          <p>
            Not configured. Set <code>AI_API_KEY</code>, <code>AI_MODEL</code>, and{" "}
            <code>SUMMARIZE_PASSWORD</code> in <code>.env</code>.
          </p>
        ) : null}

        {queryError ? <p className="error">Error: {queryError}</p> : null}
        {runError ? <p className="error">Error: {runError}</p> : null}

        {summaryText ? (
          <>
            {title ? <h3>{title}</h3> : null}
            <p>
              <a href={url} rel="noopener noreferrer">
                {url}
              </a>
            </p>
            <div className="summary">{summaryText}</div>
            {model ? (
              <p className="meta">
                model: {model}
                {unlocked ? " · unlocked" : null}
              </p>
            ) : null}
            <p>
              <a
                href={
                  url
                    ? `/summarize?url=${encodeURIComponent(url)}${title ? `&title=${encodeURIComponent(title)}` : ""}&run=1&force=1`
                    : "/"
                }
              >
                Regenerate
              </a>
              {" · "}
              <a href="/">Back</a>
            </p>
          </>
        ) : configured ? (
          <SummarizeForm url={url} title={title} unlocked={unlocked} />
        ) : null}
      </div>
    </PageChrome>
  );
}
