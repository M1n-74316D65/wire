import Link from "next/link";
import { Filters } from "@/components/Filters";
import { Shell } from "@/components/Shell";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteNav } from "@/components/SiteNav";
import { SourceNav } from "@/components/SourceNav";
import { TabBar } from "@/components/TabBar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getSourceHealth, type SourceHealth } from "@/lib/queries";
import type { Theme } from "@/lib/theme";
import { formatLastUpdated, nowMs } from "@/lib/time";

export function PageChrome({
  theme,
  lastUpdated,
  activeNav,
  basePath,
  limit,
  hours,
  children,
  showFilters = true,
  showLimit = true,
  title,
  summary,
  health: healthProp,
}: {
  theme: Theme;
  lastUpdated: number | null;
  activeNav?: string;
  basePath?: string;
  limit?: number;
  hours?: number;
  children: React.ReactNode;
  showFilters?: boolean;
  showLimit?: boolean;
  title?: string;
  summary?: string;
  /** Injected in tests so rendering never opens the SQLite file. */
  health?: SourceHealth[];
}) {
  const health = healthProp ?? getSourceHealth();
  const hasFilters = basePath != null && limit != null && hours != null;

  return (
    <Shell>
      <div className="desk">
        <aside className="desk__rail">
          <SiteHeader />
          <div className="desk__index">
            <SiteNav active={activeNav} />
            <SourceNav active={activeNav} health={health} />
          </div>
          <footer className="desk__rail-foot">
            <p className="desk__pulled">
              Pulled{" "}
              <time dateTime={new Date(lastUpdated ?? nowMs()).toISOString()}>
                {formatLastUpdated(lastUpdated)}
              </time>
              .
            </p>
            <ThemeToggle theme={theme} />
          </footer>
        </aside>

        <div className="desk__workspace">
          <header className="mobile-header">
            <Link className="mobile-header__brand" href="/">
              wire
            </Link>
            <details className="browse-disclosure">
              <summary>Browse</summary>
              <div className="browse-sheet">
                <div className="browse-sheet__scroll">
                  <SiteNav active={activeNav} />
                  <SourceNav active={activeNav} health={health} />
                  <ThemeToggle theme={theme} />
                </div>
              </div>
            </details>
          </header>

          <main id="content" className="desk__main" tabIndex={-1}>
            <div className="desk__bar">
              <div className="desk__heading">
                {title ? <h1 className="desk__title">{title}</h1> : null}
                {showFilters && hasFilters ? (
                  <p className="desk__summary">
                    {summary ?? `Up to ${limit} headlines from the last ${hours} hours.`}
                  </p>
                ) : null}
              </div>
              {showFilters && hasFilters ? (
                <Filters
                  basePath={basePath}
                  limit={limit}
                  hours={hours}
                  showLimit={showLimit}
                />
              ) : null}
            </div>
            {children}
          </main>
        </div>
      </div>
      <TabBar active={activeNav} />
    </Shell>
  );
}
