export function nowMs(): number {
  return Date.now();
}

export function relativeTime(publishedAtMs: number, now = nowMs()): string {
  const diff = Math.max(0, now - publishedAtMs);
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${Math.max(1, mins)}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export function formatLastUpdated(ts: number | null): string {
  const d = new Date(ts ?? Date.now());
  return d.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Los_Angeles",
    timeZoneName: "short",
  });
}

export const LIMIT_OPTIONS = [5, 10, 15, 25, 50] as const;
export const HOUR_OPTIONS = [1, 3, 6, 12, 24] as const;

export function parseLimit(raw: string | undefined | null): number {
  const n = Number(raw);
  if (LIMIT_OPTIONS.includes(n as (typeof LIMIT_OPTIONS)[number])) return n;
  return 50;
}

export function parseHours(raw: string | undefined | null): number {
  const n = Number(raw);
  if (HOUR_OPTIONS.includes(n as (typeof HOUR_OPTIONS)[number])) return n;
  return 24;
}
