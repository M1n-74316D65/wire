import { Fragment } from "react";
import { AiLink } from "@/components/AiLink";
import { summarizeConfigured } from "@/lib/env";
import type { Headline } from "@/lib/queries";
import { getSource, sourceColor } from "@/lib/sources";
import { absoluteTime, dayLabel, groupByDay, relativeTime } from "@/lib/time";

export function FeedList({
  headlines,
  now,
  emptyHref,
}: {
  headlines: Headline[];
  now: number;
  emptyHref?: string;
}) {
  const aiEnabled = summarizeConfigured();

  if (headlines.length === 0) {
    return (
      <div className="empty-state">
        <p>
          Nothing in this window.{" "}
          {emptyHref ? (
            <a href={emptyHref}>Widen it to the last 24 hours</a>
          ) : null}
          .
        </p>
      </div>
    );
  }

  const days = groupByDay(headlines, (h) => h.publishedAt);

  return (
    <ol className="feed" role="list">
      {days.map((day) => (
        <Fragment key={day.key}>
          <li className="feed__day">
            <span className="feed__day-label">{dayLabel(day.key, now)}</span>
            <span className="feed__day-count">{day.items.length}</span>
          </li>
          {day.items.map((h) => {
            const source = getSource(h.sourceSlug);
            return (
              <li key={`${h.sourceSlug}:${h.url}`} className="feed__item">
                {source ? (
                  <a
                    className="feed__source"
                    href={`/source/${source.slug}`}
                    style={{
                      ["--source-color" as string]: sourceColor(source.slug),
                    }}
                  >
                    <span className="feed__source-dot" aria-hidden="true" />
                    <span className="feed__source-name">{source.name}</span>
                  </a>
                ) : (
                  <span
                    className="feed__source"
                    style={{
                      ["--source-color" as string]: sourceColor(h.sourceSlug),
                    }}
                  >
                    <span className="feed__source-dot" aria-hidden="true" />
                    <span className="feed__source-name">{h.sourceSlug}</span>
                  </span>
                )}
                <a
                  className="feed__headline"
                  href={h.url}
                  rel="noopener noreferrer"
                >
                  {h.title}
                </a>
                <span className="feed__meta">
                  <time
                    dateTime={new Date(h.publishedAt).toISOString()}
                    title={absoluteTime(h.publishedAt)}
                  >
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
        </Fragment>
      ))}
    </ol>
  );
}
