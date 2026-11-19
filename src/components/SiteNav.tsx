import { TOPICS } from "@/lib/sources";

type Item = { href: string; label: string; key: string; count?: number };

function Row({
  item,
  active,
}: {
  item: Item;
  active?: string;
}) {
  const count =
    item.count != null ? (
      <span className="topic-nav__count">{item.count}</span>
    ) : null;
  if (active === item.key) {
    return (
      <span className="is-active" aria-current="page">
        <span className="topic-nav__label">{item.label}</span>
        {count}
      </span>
    );
  }
  return (
    <a href={item.href}>
      <span className="topic-nav__label">{item.label}</span>
      {count}
    </a>
  );
}

export function SiteNav({
  active,
  counts,
}: {
  active?: string;
  counts?: Record<string, number>;
}) {
  const withCount = (item: { href: string; label: string; key: string }): Item => ({
    ...item,
    count: counts?.[item.key],
  });

  const primary = [
    { href: "/", label: "Desk", key: "home" },
    { href: "/topic/all", label: "Everything", key: "all" },
    { href: "/topic/spain", label: "Spain", key: "spain" },
    { href: "/topic/tech", label: "Tech", key: "tech" },
  ].map(withCount);

  const rest = TOPICS.filter(
    (t) => t.slug !== "spain" && t.slug !== "tech",
  ).map((t) => ({
    href: `/topic/${t.slug}`,
    label: t.label,
    key: t.slug,
  })).map(withCount);

  const footer: Item[] = [
    { href: "/brief", label: "Brief", key: "brief" },
    { href: "/words", label: "Words", key: "words" },
  ];

  return (
    <nav className="topic-nav" aria-label="Sections">
      <span className="source-nav__title">Sections</span>
      <div className="topic-nav__group">
        {primary.map((item) => (
          <Row key={item.key} item={item} active={active} />
        ))}
      </div>
      <div className="topic-nav__group">
        {rest.map((item) => (
          <Row key={item.key} item={item} active={active} />
        ))}
      </div>
      <div className="topic-nav__group topic-nav__group--foot">
        {footer.map((item) => (
          <Row key={item.key} item={item} active={active} />
        ))}
      </div>
    </nav>
  );
}
