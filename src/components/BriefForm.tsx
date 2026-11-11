"use client";

import { useEffect, useRef } from "react";
import { unlockAndBriefAction } from "@/app/brief/actions";
import { SUMMARIZE_PW_KEY } from "@/lib/summarize-client";

export function BriefForm({
  day,
  unlocked,
}: {
  day: string;
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
      action={unlockAndBriefAction}
      className="summarize-form brief-form"
      onSubmit={(e) => {
        const fd = new FormData(e.currentTarget);
        const pw = String(fd.get("password") || "");
        if (pw) localStorage.setItem(SUMMARIZE_PW_KEY, pw);
      }}
    >
      <input type="hidden" name="day" value={day} />
      {!unlocked ? (
        <>
          <label htmlFor="brief-password">Desk password</label>
          <input
            id="brief-password"
            type="password"
            name="password"
            required
            autoComplete="current-password"
            autoFocus
          />
          <p className="meta meta--wrap">
            Kept in this browser so the next tap skips the form.
          </p>
        </>
      ) : (
        <p className="meta meta--wrap">Unlocked — writing the brief…</p>
      )}
      <button type="submit">{unlocked ? "Write brief" : "Unlock & write"}</button>
    </form>
  );
}
