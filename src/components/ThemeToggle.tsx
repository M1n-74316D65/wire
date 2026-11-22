import { setThemeAction } from "@/app/actions";
import type { Theme } from "@/lib/theme";

function ThemeOption({
  current,
  value,
  label,
}: {
  current: Theme;
  value: Theme;
  label: string;
}) {
  return (
    <form action={setThemeAction}>
      <input type="hidden" name="theme" value={value} />
      <button type="submit" aria-pressed={current === value}>
        {label}
      </button>
    </form>
  );
}

export function ThemeToggle({ theme }: { theme: Theme }) {
  return (
    <div className="theme-toggle" role="group" aria-label="Color theme">
      <ThemeOption current={theme} value="system" label="auto" />
      <span className="sep" aria-hidden="true">
        ·
      </span>
      <ThemeOption current={theme} value="light" label="day" />
      <span className="sep" aria-hidden="true">
        ·
      </span>
      <ThemeOption current={theme} value="dark" label="night" />
    </div>
  );
}
