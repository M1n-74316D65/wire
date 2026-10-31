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
          const ok = await unlockWithPasswordAction(pw);
          if (!ok) {
            localStorage.removeItem(SUMMARIZE_PW_KEY);
            window.location.assign(summarizeHref(url, title, false));
            return;
          }
          window.location.assign(summarizeHref(url, title, true));
        })();
      }}
    >
      <svg
        className="tag__icon"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 2.5 13.9 8.6 20 10.5 13.9 12.4 12 18.5 10.1 12.4 4 10.5 10.1 8.6 12 2.5Z" />
        <path d="M19 15.5 19.9 18.1 22.5 19 19.9 19.9 19 22.5 18.1 19.9 15.5 19 18.1 18.1 19 15.5Z" />
      </svg>
      <span className="tag__label">ai</span>
    </a>
  );
}
