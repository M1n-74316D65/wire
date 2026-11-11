"use server";

import { redirect } from "next/navigation";
import { summarizeConfigured } from "@/lib/env";
import {
  checkPassword,
  isSummarizeUnlocked,
  unlockSummarize,
} from "@/lib/summarize-auth";
import { dayKey } from "@/lib/digest";

// Slows password guessing; a parallel flood still gets past it.
function wrongPasswordDelay() {
  return new Promise((resolve) => setTimeout(resolve, 1000));
}

/** Verify password (if needed), unlock session, redirect to run the digest. */
export async function unlockAndBriefAction(formData: FormData) {
  if (!summarizeConfigured()) {
    redirect(`/brief?error=${encodeURIComponent("not configured")}`);
  }

  const ts = Date.now();
  const today = dayKey(ts);
  const yesterday = dayKey(ts - 24 * 60 * 60 * 1000);

  const rawDay = String(formData.get("day") || "");
  const day =
    rawDay === today || rawDay === yesterday
      ? rawDay
      : today; // only today / yesterday are allowed

  const password = String(formData.get("password") || "");

  if (!(await isSummarizeUnlocked())) {
    if (!checkPassword(password)) {
      await wrongPasswordDelay();
      redirect(
        `/brief?day=${day}&error=${encodeURIComponent("wrong password")}`,
      );
    }
    await unlockSummarize();
  }

  redirect(`/brief?day=${day}&run=1`);
}
