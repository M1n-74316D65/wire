import { Filters } from "@/components/Filters";
import { Shell } from "@/components/Shell";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteNav } from "@/components/SiteNav";
import { SourceNav } from "@/components/SourceNav";
import { TabBar } from "@/components/TabBar";
import { getSourceHealth } from "@/lib/queries";
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
}) {
  const health = getSourceHealth();
  return (
    <Shell>
      <SiteHeader theme={theme} lastUpdated={lastUpdated} />
      <div className="desk">
        <aside className="desk__rail">
          <SiteNav active={activeNav} />
          <SourceNav active={activeNav} health={health} />
        </aside>
        <main id="content" className="desk__main" tabIndex={-1}>
          <div className="desk__bar">
            {title ? <h2 className="desk__title">{title}</h2> : null}
            {showFilters && basePath != null && limit != null && hours != null ? (
              <Filters basePath={basePath} limit={limit} hours={hours} />
            ) : null}
          </div>
          {children}
        </main>
      </div>
      <TabBar active={activeNav} />
    </Shell>
  );
}
