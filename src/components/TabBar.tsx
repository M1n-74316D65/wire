type Glyph = { d: string; extra?: string };

function Icon({ glyph, filled }: { glyph: Glyph; filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={glyph.d} />
      {glyph.extra ? <path d={glyph.extra} /> : null}
    </svg>
  );
}

const ITEMS: { href: string; label: string; key: string; glyph: Glyph }[] = [
  {
    href: "/",
    label: "Desk",
    key: "home",
    glyph: { d: "M3 10.5 12 3l9 7.5", extra: "M5 9.8V21h14V9.8" },
  },
  {
    href: "/topic/all",
    label: "All",
    key: "all",
    glyph: { d: "m12 3 9 5-9 5-9-5 9-5Z", extra: "m3 13.5 9 5 9-5" },
  },
  {
    href: "/topic/spain",
    label: "Spain",
    key: "spain",
    glyph: {
      d: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z",
      extra: "M3 12h18M12 3c2.8 3.2 2.8 14.8 0 18M12 3c-2.8 3.2-2.8 14.8 0 18",
    },
  },
  {
    href: "/topic/tech",
    label: "Tech",
    key: "tech",
    glyph: {
      d: "M7 7h10v10H7z",
      extra: "M10.5 10.5h3v3h-3zM12 2v3M12 19v3M2 12h3M19 12h3",
    },
  },
  {
    href: "/words",
    label: "Words",
    key: "words",
    glyph: { d: "M5 7V4h14v3", extra: "M12 4v16M9 20h6" },
  },
];

export function TabBar({ active }: { active?: string }) {
  return (
    <nav className="tabbar" aria-label="Quick navigation">
      {ITEMS.map((item) =>
        active === item.key ? (
          <span key={item.key} className="is-active" aria-current="page">
            <Icon glyph={item.glyph} filled />
            {item.label}
          </span>
        ) : (
          <a key={item.key} href={item.href}>
            <Icon glyph={item.glyph} />
            {item.label}
          </a>
        ),
      )}
    </nav>
  );
}
