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
      ai
    </a>
  );
}
