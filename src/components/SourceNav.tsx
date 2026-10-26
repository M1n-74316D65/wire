import { SOURCES } from "@/lib/sources";

export function SourceNav({ active }: { active?: string }) {
  return (
    <div className="topic-nav source-nav">
      <span className="source-nav__title">Sources</span>
      <nav className="topic-nav__group" aria-label="Sources">
        {SOURCES.map((source) =>
          active === source.slug ? (
            <span key={source.slug} className="is-active" aria-current="page">
              {source.name}
            </span>
          ) : (
            <a key={source.slug} href={`/source/${source.slug}`}>
              {source.name}
            </a>
          ),
        )}
      </nav>
    </div>
  );
}
