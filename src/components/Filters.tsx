import { HOUR_OPTIONS, LIMIT_OPTIONS } from "@/lib/time";

function buildHref(
  basePath: string,
  current: { limit: number; hours: number },
  patch: Partial<{ limit: number; hours: number }>,
) {
  const limit = patch.limit ?? current.limit;
  const hours = patch.hours ?? current.hours;
  const params = new URLSearchParams();
  if (limit !== 50) params.set("limit", String(limit));
  if (hours !== 24) params.set("hours", String(hours));
  const q = params.toString();
  return q ? `${basePath}?${q}` : basePath;
}

export function Filters({
  basePath,
  limit,
  hours,
}: {
  basePath: string;
  limit: number;
  hours: number;
}) {
  const current = { limit, hours };

  return (
    <div className="filters">
      <div className="filter-group">
        <span className="filter-group__label">show</span>
        <div className="filter-group__opts">
          {LIMIT_OPTIONS.map((n) =>
            n === limit ? (
              <span key={n} className="is-active">
                {n}
              </span>
            ) : (
              <a key={n} href={buildHref(basePath, current, { limit: n })}>
                {n}
              </a>
            ),
          )}
        </div>
      </div>
      <div className="filter-group">
        <span className="filter-group__label">window</span>
        <div className="filter-group__opts">
          {HOUR_OPTIONS.map((n) =>
            n === hours ? (
              <span key={n} className="is-active">
                {n}h
              </span>
            ) : (
              <a key={n} href={buildHref(basePath, current, { hours: n })}>
                {n}h
              </a>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
