import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getSummarizePassword } from "./env";

const COOKIE = "summarize_ok";
const MAX_AGE = 60 * 60 * 24 * 7;

function tokenFor(password: string): string {
  return createHmac("sha256", password).update("news-summarize-v1").digest("hex");
}

export function checkPassword(input: string): boolean {
  const expected = getSummarizePassword();
  if (!expected) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function isSummarizeUnlocked(): Promise<boolean> {
  const password = getSummarizePassword();
  if (!password) return false;
  const store = await cookies();
  const got = store.get(COOKIE)?.value;
  if (!got) return false;
  const expected = tokenFor(password);
  try {
    const a = Buffer.from(got);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function unlockSummarize() {
  const password = getSummarizePassword();
  if (!password) return;
  const store = await cookies();
  store.set(COOKIE, tokenFor(password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}
