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
      <label htmlFor="url">URL</label>
      <input id="url" type="url" name="url" required defaultValue={url} />

      <label htmlFor="title">Title (optional)</label>
      <input id="title" type="text" name="title" defaultValue={title} />

      {!unlocked ? (
        <>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            required
            autoComplete="current-password"
          />
          <p className="meta">Saved in this browser after the first unlock.</p>
        </>
      ) : (
        <p className="meta">Session unlocked — password not required.</p>
      )}

      <button type="submit">Summarize</button>
    </form>
  );
}
