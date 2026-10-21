"use server";

import { setTheme, type Theme } from "@/lib/theme";

export async function setThemeAction(formData: FormData) {
  const theme = String(formData.get("theme") || "system") as Theme;
  if (theme === "system" || theme === "light" || theme === "dark") {
    await setTheme(theme);
  }
}
