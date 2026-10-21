"use client";

import { useEffect, useRef } from "react";
import { unlockAndSummarizeAction } from "@/app/summarize/actions";
import { SUMMARIZE_PW_KEY } from "@/lib/summarize-client";

export function SummarizeForm({
  url,
  title,
  unlocked,
}: {
  url: string;
  title: string;
  unlocked: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const autoTried = useRef(false);
  const fromFeed = Boolean(url);

  useEffect(() => {
    if (unlocked || autoTried.current) return;
    const pw = localStorage.getItem(SUMMARIZE_PW_KEY);
    if (!pw || !formRef.current) return;
    autoTried.current = true;
    const input = formRef.current.querySelector<HTMLInputElement>(
      'input[name="password"]',
    );
    if (input) input.value = pw;
    formRef.current.requestSubmit();
  }, [unlocked]);

  return (
    <form
      ref={formRef}
      action={unlockAndSummarizeAction}
      className="summarize-form"
      onSubmit={(e) => {
        const fd = new FormData(e.currentTarget);
        const pw = String(fd.get("password") || "");
        if (pw) localStorage.setItem(SUMMARIZE_PW_KEY, pw);
      }}
    >
      {fromFeed ? (
        <>
          {title ? <p className="brief-context__title">{title}</p> : null}
          <p className="brief-context__url">
            <a href={url} rel="noopener noreferrer">
              {hostname(url)}
            </a>
          </p>
          <input type="hidden" name="url" value={url} />
          <input type="hidden" name="title" value={title} />
        </>
      ) : (
        <>
          <label htmlFor="url">Article URL</label>
          <input id="url" type="url" name="url" required defaultValue={url} />

          <label htmlFor="title">Title (optional)</label>
          <input id="title" type="text" name="title" defaultValue={title} />
        </>
      )}

      {!unlocked ? (
        <>
          <label htmlFor="password">Desk password</label>
          <input
            id="password"
            type="password"
            name="password"
            required
            autoComplete="current-password"
            autoFocus={fromFeed}
          />
          <p className="meta meta--wrap">
            Kept in this browser so the next ai tap skips the form.
          </p>
        </>
      ) : (
        <p className="meta meta--wrap">Unlocked — writing the brief…</p>
      )}

      <button type="submit">{unlocked ? "Write brief" : "Unlock & write"}</button>
    </form>
  );
}

function hostname(raw: string): string {
  try {
    return new URL(raw).hostname.replace(/^www\./, "");
  } catch {
    return raw;
  }
}
