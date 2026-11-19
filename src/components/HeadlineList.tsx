import { Fragment } from "react";
import { AiLink } from "@/components/AiLink";
import { summarizeConfigured } from "@/lib/env";
import type { Headline } from "@/lib/queries";
import { absoluteTime, dayLabel, groupByDay, relativeTime } from "@/lib/time";

export function HeadlineList({
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
      <p className="meta">
        No headlines in this window.
        {emptyHref ? (
          <>
            {" "}
            <a href={emptyHref}>Widen it to the last 24 hours</a>.
          </>
        ) : null}
      </p>
    );
  }

  const days = groupByDay(headlines, (h) => h.publishedAt);

  return (
    <ul className="headline-list" role="list">
      {days.map((day) => (
        <Fragment key={day.key}>
          <li className="feed__day">
            <span className="feed__day-label">{dayLabel(day.key, now)}</span>
            <span className="feed__day-count">{day.items.length}</span>
          </li>
          {day.items.map((h) => {
            return (
              <li key={`${h.sourceSlug}:${h.url}`}>
                <a className="headline" href={h.url} rel="noopener noreferrer">
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
    </ul>
  );
}
