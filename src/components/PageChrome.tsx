import { Filters } from "@/components/Filters";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteNav } from "@/components/SiteNav";
import { Shell } from "@/components/Shell";
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
  return (
    <Shell>
      <SiteHeader theme={theme} lastUpdated={lastUpdated} />
      <div className="desk">
        <aside className="desk__rail">
          <SiteNav active={activeNav} />
        </aside>
        <div className="desk__main">
          {title ? <h2 className="desk__title">{title}</h2> : null}
          {showFilters && basePath != null && limit != null && hours != null ? (
            <Filters basePath={basePath} limit={limit} hours={hours} />
          ) : null}
          {children}
        </div>
      </div>
    </Shell>
  );
}
