"use client";

import { useEffect, useRef, useState } from "react";
import { unlockAndSummarizeAction } from "@/app/summarize/actions";
import { SUMMARIZE_PW_KEY } from "@/lib/summarize-client";

export function SummarizeForm({
  url,
  title,
  unlocked,
  autoUnlock = true,
}: {
  url: string;
  title: string;
  unlocked: boolean;
  /** False once the page has reported an error: a stored password that failed
   *  must not be retried, or the redirect lands back here and submits again. */
  autoUnlock?: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const autoTried = useRef(false);
  const [pending, setPending] = useState(false);
  const fromFeed = Boolean(url);

  useEffect(() => {
    if (unlocked || autoTried.current) return;
    const pw = localStorage.getItem(SUMMARIZE_PW_KEY);
    if (!pw) return;
    if (!autoUnlock) {
      localStorage.removeItem(SUMMARIZE_PW_KEY);
      return;
    }
    if (!formRef.current) return;
    autoTried.current = true;
    const input = formRef.current.querySelector<HTMLInputElement>(
      'input[name="password"]',
    );
    if (input) input.value = pw;
    formRef.current.requestSubmit();
  }, [unlocked, autoUnlock]);

  return (
    <form
      ref={formRef}
      action={unlockAndSummarizeAction}
      className="summarize-form"
      onSubmit={(e) => {
        const fd = new FormData(e.currentTarget);
        const pw = String(fd.get("password") || "");
        if (pw) localStorage.setItem(SUMMARIZE_PW_KEY, pw);
        setPending(true);
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
            aria-describedby="password-hint"
            autoFocus={fromFeed}
          />
          <p className="meta meta--wrap" id="password-hint">
            Kept in this browser so the next tap skips the form.
          </p>
        </>
      ) : (
        <p className="meta meta--wrap">Unlocked — writing the brief…</p>
      )}

      <button type="submit" disabled={pending}>
        {pending ? "Writing…" : "Write the brief"}
      </button>
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
