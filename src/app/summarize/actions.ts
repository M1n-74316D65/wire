"use server";

import { redirect } from "next/navigation";
import { summarizeConfigured } from "@/lib/env";
import {
  checkPassword,
  isSummarizeUnlocked,
  unlockSummarize,
} from "@/lib/summarize-auth";

// Localhost, private and link-local addresses: the server must not fetch these.
const PRIVATE_HOST =
  /^(localhost$|.*\.localhost$|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|0\.|\[::1\]$|\[f[cd])/;

function safeUrl(raw: string): string | null {
  try {
    const u = new URL(raw);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    if (PRIVATE_HOST.test(u.hostname)) return null;
    return u.toString();
  } catch {
    return null;
  }
}

// Slows password guessing; a parallel flood still gets past it.
function wrongPasswordDelay() {
  return new Promise((resolve) => setTimeout(resolve, 1000));
}

/** Unlock session with password. Returns false if wrong. */
export async function unlockWithPasswordAction(
  password: string,
): Promise<boolean> {
  if (!summarizeConfigured()) return false;
  if (!checkPassword(password)) {
    await wrongPasswordDelay();
    return false;
  }
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
      await wrongPasswordDelay();
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
