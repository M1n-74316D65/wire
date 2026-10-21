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
    <ul className="headline-list">
      {headlines.map((h) => {
        const summarizeHref = `/summarize?url=${encodeURIComponent(h.url)}&title=${encodeURIComponent(h.title)}`;
        return (
          <li key={h.url}>
            <a className="headline" href={h.url} rel="noopener noreferrer">
              {h.title}
            </a>{" "}
            <span className="meta">{relativeTime(h.publishedAt, now)}</span>
            {h.hnUrl ? (
              <>
                {" "}
                <a className="tag" href={h.hnUrl} rel="noopener noreferrer">
                  hn
                </a>
              </>
            ) : null}
            {aiEnabled ? (
              <>
                {" "}
                <a className="tag tag--ai" href={summarizeHref}>
                  ai
                </a>
              </>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
