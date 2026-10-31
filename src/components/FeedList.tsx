import { AiLink } from "@/components/AiLink";
import { summarizeConfigured } from "@/lib/env";
import type { Headline } from "@/lib/queries";
import { getSource } from "@/lib/sources";
import { relativeTime } from "@/lib/time";

export function FeedList({
  headlines,
  now,
}: {
  headlines: Headline[];
  now: number;
}) {
  const aiEnabled = summarizeConfigured();

  if (headlines.length === 0) {
    return (
      <div className="empty-state">
        <p>
          Nothing in this window. Try a wider time range, or refresh feeds at{" "}
          <a href="/api/ingest">
            <code>/api/ingest</code>
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <ol className="feed">
      {headlines.map((h) => {
        const source = getSource(h.sourceSlug);
        return (
          <li key={`${h.sourceSlug}:${h.url}`} className="feed__item">
            {source ? (
              <a className="feed__source" href={`/source/${source.slug}`}>
                {source.name}
              </a>
            ) : (
              <span className="feed__source">{h.sourceSlug}</span>
            )}
            <a
              className="feed__headline"
              href={h.url}
              rel="noopener noreferrer"
            >
              {h.title}
            </a>
            <span className="feed__meta">
              <time dateTime={new Date(h.publishedAt).toISOString()}>
                {relativeTime(h.publishedAt, now)}
              </time>
              {h.hnUrl ? (
                <a className="tag" href={h.hnUrl} rel="noopener noreferrer">
                  hn
                </a>
              ) : null}
              {aiEnabled ? <AiLink url={h.url} title={h.title} /> : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
