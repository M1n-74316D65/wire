import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <p className="brand">
        <Link href="/">wire</Link>
      </p>
      <p className="tagline">A quiet desk for the feeds you keep.</p>
    </header>
  );
}
