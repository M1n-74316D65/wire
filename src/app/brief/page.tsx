import Link from "next/link";
import type { Metadata } from "next";
import { PageChrome } from "@/components/PageChrome";
import { BriefForm } from "@/components/BriefForm";
import { DigestBody } from "@/components/DigestBody";
import { summarizeConfigured } from "@/lib/env";
import {
  generateDigest,
  getCachedDigest,
  dayKey,
  type DigestResult,
} from "@/lib/digest";
import { isSummarizeUnlocked } from "@/lib/summarize-auth";
import { getTheme } from "@/lib/theme";
import { SPAIN_TIME_ZONE } from "@/lib/time";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export const metadata: Metadata = {
  title: "Daily brief · wire",
};

type Props = {
  searchParams: Promise<{
    run?: string;
    force?: string;
    error?: string;
    day?: string;
  }>;
};

export default async function DigestPage({ searchParams }: Props) {
  const sp = await searchParams;
  const theme = await getTheme();
  const configured = summarizeConfigured();
  const unlocked = await isSummarizeUnlocked();
  const force = sp.force === "1";
  const wantRun = sp.run === "1" || force;

  const ts = Date.now();
  const today = dayKey(ts);
  const yesterday = dayKey(ts - 24 * 60 * 60 * 1000);
  const requestedDay =
    sp.day === today || sp.day === yesterday ? sp.day ?? today : today;

  let digest: DigestResult | null = null;
  let runError: string | null = sp.error || null;

  if (configured) {
    const cached =
      force || requestedDay !== today ? null : getCachedDigest(requestedDay);

    if (cached) {
      digest = {
        day: cached.day,
        content: cached.content,
        model: cached.model,
        createdAt: cached.created_at,
        generated: false,
        headlines: 0,
      };
    } else if (unlocked && wantRun) {
      try {
        digest = await generateDigest({ day: requestedDay, topic: "home" });
      } catch (e) {
        runError = e instanceof Error ? e.message : String(e);
      }
    }
  }

  const switchHref = `/brief?day=${
    requestedDay === today ? yesterday : today
  }&run=1`;

  return (
    <PageChrome
      theme={theme}
      lastUpdated={digest?.createdAt ?? null}
      activeNav="brief"
      showFilters={false}
      title="Daily brief"
    >
      <div className="brief-page">
        {!configured ? (
          <p className="lede">
            Not configured. Set <code>AI_API_KEY</code>, <code>AI_MODEL</code>,
            and <code>SUMMARIZE_PASSWORD</code> in <code>.env</code>.
          </p>
        ) : null}

        {sp.error ? (
          <p className="error" role="alert">
            Error: {sp.error}
          </p>
        ) : null}
        {runError ? (
          <p className="error" role="alert">
            Error: {runError}
          </p>
        ) : null}

        {digest ? (
          <article className="brief-card">
            <h2 className="brief-card__title">
              {requestedDay === today ? "Today" : "Yesterday"}
            </h2>
            <DigestBody text={digest.content} />
            <footer className="brief-card__foot">
              <span className="meta meta--wrap">
                {digest.generated ? "Generated" : "Cached"}
                {digest.model ? ` · ${digest.model}` : null}
                {` · ${new Date(digest.createdAt).toLocaleString("es-ES", {
                  dateStyle: "medium",
                  timeStyle: "short",
                  timeZone: SPAIN_TIME_ZONE,
                })}`}
              </span>
              <nav className="brief-card__actions">
                <a href={`/brief?day=${requestedDay}&run=1&force=1`}>
                  Rewrite
                </a>
                <a href={switchHref}>
                  {requestedDay === today ? "Yesterday" : "Today"}
                </a>
                <Link href="/">Desk</Link>
              </nav>
            </footer>
          </article>
        ) : configured ? (
          <BriefForm day={requestedDay} unlocked={unlocked} />
        ) : null}
      </div>
    </PageChrome>
  );
}
