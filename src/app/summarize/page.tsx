import { PageChrome } from "@/components/PageChrome";
import { summarizeConfigured } from "@/lib/env";
import { lastUpdatedLabel } from "@/lib/queries";
import { getCachedSummary, summarizeUrl } from "@/lib/summarize";
import { isSummarizeUnlocked } from "@/lib/summarize-auth";
import { getTheme } from "@/lib/theme";
import { unlockAndSummarizeAction } from "./actions";

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

  let summaryText: string | null = null;
  let model: string | null = null;
  let runError: string | null = null;

  if (url && configured && sp.run === "1") {
    if (!unlocked) {
      runError = "Password required to summarize";
    } else {
      try {
        const row = await summarizeUrl({ url, title: title || null, force });
        summaryText = row.summary;
        model = row.model;
      } catch (err) {
        runError = err instanceof Error ? err.message : String(err);
      }
    }
  } else if (url && configured) {
    const cached = getCachedSummary(url);
    if (cached) {
      summaryText = cached.summary;
      model = cached.model;
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
        ) : (
          <form action={unlockAndSummarizeAction} className="summarize-form">
            <label htmlFor="url">URL</label>
            <input id="url" type="url" name="url" required defaultValue={url} />

            <label htmlFor="title">Title (optional)</label>
            <input id="title" type="text" name="title" defaultValue={title} />

            {!unlocked ? (
              <>
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  required
                  autoComplete="current-password"
                />
              </>
            ) : (
              <p className="meta">Session unlocked — password not required.</p>
            )}

            <button type="submit">Summarize</button>
          </form>
        )}
      </div>
    </PageChrome>
  );
}
