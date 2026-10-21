import { TOPICS } from "@/lib/sources";

export function SiteNav({ active }: { active?: string }) {
  const primary: { href: string; label: string; key: string }[] = [
    { href: "/", label: "Desk", key: "home" },
    { href: "/topic/all", label: "Everything", key: "all" },
    { href: "/topic/spain", label: "Spain", key: "spain" },
    { href: "/topic/tech", label: "Tech", key: "tech" },
  ];

  const rest = TOPICS.filter(
    (t) => t.slug !== "spain" && t.slug !== "tech",
  ).map((t) => ({
    href: `/topic/${t.slug}`,
    label: t.label,
    key: t.slug,
  }));

  const footer: { href: string; label: string; key: string }[] = [
    { href: "/words", label: "Words", key: "words" },
  ];

  return (
    <nav className="topic-nav" aria-label="Sections">
      <div className="topic-nav__group">
        {primary.map((item) =>
          active === item.key ? (
            <span key={item.key} className="is-active">
              {item.label}
            </span>
          ) : (
            <a key={item.key} href={item.href}>
              {item.label}
            </a>
          ),
        )}
      </div>
      <div className="topic-nav__group">
        {rest.map((item) =>
          active === item.key ? (
            <span key={item.key} className="is-active">
              {item.label}
            </span>
          ) : (
            <a key={item.key} href={item.href}>
              {item.label}
            </a>
          ),
        )}
      </div>
      <div className="topic-nav__group topic-nav__group--foot">
        {footer.map((item) =>
          active === item.key ? (
            <span key={item.key} className="is-active">
              {item.label}
            </span>
          ) : (
            <a key={item.key} href={item.href}>
              {item.label}
            </a>
          ),
        )}
      </div>
    </nav>
  );
}
