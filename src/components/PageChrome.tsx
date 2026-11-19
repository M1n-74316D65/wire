import { Filters } from "@/components/Filters";
import { Shell } from "@/components/Shell";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteNav } from "@/components/SiteNav";
import { SourceNav } from "@/components/SourceNav";
import { TabBar } from "@/components/TabBar";
import {
  getSectionCounts,
  getSourceHealth,
  type SourceHealth,
} from "@/lib/queries";
import type { Theme } from "@/lib/theme";

export function PageChrome({
  theme,
  lastUpdated,
  activeNav,
  basePath,
  limit,
  hours,
  children,
  showFilters = true,
  title,
  streamMeta,
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
  title?: string;
  streamMeta?: string;
  /** Injected in tests so rendering never opens the SQLite file. */
  health?: SourceHealth[];
}) {
  const health = healthProp ?? getSourceHealth();
  const counts = hours != null ? getSectionCounts(hours) : undefined;
  return (
    <Shell>
      <SiteHeader theme={theme} lastUpdated={lastUpdated} />
      <div className="desk">
        <aside className="desk__rail">
          <SiteNav active={activeNav} counts={counts} />
          <SourceNav active={activeNav} health={health} />
        </aside>
        <main id="content" className="desk__main" tabIndex={-1}>
          <div className="desk__bar">
            {title ? <h1 className="desk__title">{title}</h1> : null}
            {showFilters && basePath != null && limit != null && hours != null ? (
              <Filters basePath={basePath} limit={limit} hours={hours} />
            ) : null}
          </div>
          {streamMeta ? <p className="desk__meta">{streamMeta}</p> : null}
          {children}
        </main>
      </div>
      <TabBar active={activeNav} />
    </Shell>
  );
}
