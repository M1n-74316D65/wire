export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell">
      <a className="skip-link" href="#content">
        Skip to content
      </a>
      {children}
    </div>
  );
}
