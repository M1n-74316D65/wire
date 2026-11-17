"use client";

import { unlockWithPasswordAction } from "@/app/summarize/actions";
import { SUMMARIZE_PW_KEY } from "@/lib/summarize-client";

function summarizeHref(url: string, title: string, run: boolean) {
  const q = new URLSearchParams({ url });
  if (title) q.set("title", title);
  if (run) q.set("run", "1");
  return `/summarize?${q}`;
}

export function AiLink({ url, title }: { url: string; title: string }) {
  return (
    <a
      className="tag tag--ai"
      href={summarizeHref(url, title, true)}
      aria-label={`Summarize: ${title}`}
      onClick={(e) => {
        const pw = localStorage.getItem(SUMMARIZE_PW_KEY);
        if (!pw) return;

        e.preventDefault();
        void (async () => {
          try {
            const ok = await unlockWithPasswordAction(pw);
            if (!ok) {
              localStorage.removeItem(SUMMARIZE_PW_KEY);
              window.location.assign(summarizeHref(url, title, false));
              return;
            }
            window.location.assign(summarizeHref(url, title, true));
          } catch {
            // The action failed (offline, expired session): fall back to the form.
            window.location.assign(summarizeHref(url, title, false));
          }
        })();
      }}
    >
      <svg
        className="tag__mark"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M2.75 1.75h4.5l2 2v6.5h-6.5z"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <path d="M7.25 1.75v2h2" stroke="currentColor" strokeWidth="1.2" />
      </svg>
      <span className="tag__label">brief</span>
    </a>
  );
}
