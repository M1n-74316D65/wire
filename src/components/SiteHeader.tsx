import Link from "next/link";
import { setThemeAction } from "@/app/actions";
import { formatLastUpdated, nowMs } from "@/lib/time";
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
  if (current === value) {
    return <span className="is-active">{label}</span>;
  }
  return (
    <form action={setThemeAction}>
      <input type="hidden" name="theme" value={value} />
      <button type="submit">{label}</button>
    </form>
  );
}

export function SiteHeader({
  theme,
  lastUpdated,
}: {
  theme: Theme;
  lastUpdated: number | null;
}) {
  return (
    <header className="site-header">
      <div className="site-header__top">
        <div>
          <h1 className="brand">
            <Link href="/">wire</Link>
          </h1>
          <p className="tagline">
            A quiet desk for the feeds you keep. Pulled{" "}
            <time dateTime={new Date(lastUpdated ?? nowMs()).toISOString()}>
              {formatLastUpdated(lastUpdated)}
            </time>
            .
          </p>
        </div>
        <div className="theme-toggle" aria-label="Color theme">
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
      </div>
    </header>
  );
}
