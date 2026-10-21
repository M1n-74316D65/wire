import { cookies } from "next/headers";

export type Theme = "system" | "light" | "dark";

export async function getTheme(): Promise<Theme> {
  const store = await cookies();
  const v = store.get("theme")?.value;
  if (v === "light" || v === "dark" || v === "system") return v;
  return "system";
}

export async function setTheme(theme: Theme) {
  const store = await cookies();
  store.set("theme", theme, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
