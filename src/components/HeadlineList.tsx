import { AiLink } from "@/components/AiLink";
import { summarizeConfigured } from "@/lib/env";
import type { Headline } from "@/lib/queries";
import { relativeTime } from "@/lib/time";

export function HeadlineList({
  headlines,
  now,
}: {
  headlines: Headline[];
  now: number;
}) {
  const aiEnabled = summarizeConfigured();

  if (headlines.length === 0) {
    return <p className="meta">No headlines in this window.</p>;
  }

  return (
    <ul className="headline-list" role="list">
      {headlines.map((h) => {
        return (
          <li key={`${h.sourceSlug}:${h.url}`}>
            <a className="headline" href={h.url} rel="noopener noreferrer">
              {h.title}
            </a>
            <span className="feed__meta">
              <time dateTime={new Date(h.publishedAt).toISOString()}>
                {relativeTime(h.publishedAt, now)}
              </time>
              {h.hnUrl ? (
                <a
                  className="tag"
                  href={h.hnUrl}
                  rel="noopener noreferrer"
                  aria-label={`Hacker News discussion: ${h.title}`}
                >
                  hn
                </a>
              ) : null}
              {aiEnabled ? <AiLink url={h.url} title={h.title} /> : null}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
