"use server";

import { redirect } from "next/navigation";
import { summarizeConfigured } from "@/lib/env";
import {
  checkPassword,
  isSummarizeUnlocked,
  unlockSummarize,
} from "@/lib/summarize-auth";

function safeUrl(raw: string): string | null {
  try {
    const u = new URL(raw);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.toString();
  } catch {
    return null;
  }
}

/** Unlock session with password. Returns false if wrong. */
export async function unlockWithPasswordAction(
  password: string,
): Promise<boolean> {
  if (!summarizeConfigured()) return false;
  if (!checkPassword(password)) return false;
  await unlockSummarize();
  return true;
}

/** Verify password (if needed), unlock session, redirect to run summarize. */
export async function unlockAndSummarizeAction(formData: FormData) {
  const rawUrl = String(formData.get("url") || "");
  const title = String(formData.get("title") || "");
  const password = String(formData.get("password") || "");
  const url = safeUrl(rawUrl);

  if (!summarizeConfigured()) {
    redirect(`/summarize?error=${encodeURIComponent("not configured")}`);
  }

  if (!url) {
    redirect(`/summarize?error=${encodeURIComponent("invalid url")}`);
  }

  if (!(await isSummarizeUnlocked())) {
    if (!checkPassword(password)) {
      const q = new URLSearchParams({
        url,
        ...(title ? { title } : {}),
        error: "wrong password",
      });
      redirect(`/summarize?${q}`);
    }
    await unlockSummarize();
  }

  const q = new URLSearchParams({ url, ...(title ? { title } : {}), run: "1" });
  redirect(`/summarize?${q}`);
}
