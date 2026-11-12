import { SOURCES } from "@/lib/sources";
import type { SourceHealth } from "@/lib/queries";

const STATE_LABEL: Record<SourceHealth["state"], string | null> = {
  fresh: "fresh",
  stale: "stale",
  failed: "failed",
  never: null,
};

export function SourceNav({
  active,
  health,
}: {
  active?: string;
  health?: SourceHealth[];
}) {
  const bySlug = new Map((health ?? []).map((h) => [h.slug, h]));

  return (
    <div className="topic-nav source-nav">
      <span className="source-nav__title">Sources</span>
      <nav className="topic-nav__group" aria-label="Sources">
        {SOURCES.map((source) => {
          const h = bySlug.get(source.slug);
          const state = h ? STATE_LABEL[h.state] : null;
          const dot =
            h && h.state !== "never" ? (
              <span
                className={`source-nav__dot source-nav__dot--${h.state}`}
                aria-hidden="true"
                title={h.detail ?? h.state}
              />
            ) : null;
          const label = (
            <>
              {source.name}
              {dot}
              {state ? (
                <span className="visually-hidden"> ({state})</span>
              ) : null}
            </>
          );
          return active === source.slug ? (
            <span key={source.slug} className="is-active" aria-current="page">
              {label}
            </span>
          ) : (
            <a
              key={source.slug}
              href={`/source/${source.slug}`}
              title={
                h && h.state === "failed" ? h.detail ?? undefined : undefined
              }
            >
              {label}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
