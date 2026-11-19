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

export const SPAIN_TIME_ZONE = "Europe/Madrid";

/** Calendar day key ("2026-11-19") for a timestamp in a zone. */
export function dayKey(ts: number, timeZone: string = SPAIN_TIME_ZONE): string {
  const d = new Date(ts);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export type DayGroup<T> = { key: string; items: T[] };

/** Group items (already sorted newest first) into calendar-day buckets. */
export function groupByDay<T>(
  items: T[],
  publishedAt: (item: T) => number,
): DayGroup<T>[] {
  const groups: DayGroup<T>[] = [];
  const byKey = new Map<string, DayGroup<T>>();
  for (const item of items) {
    const key = dayKey(publishedAt(item));
    let group = byKey.get(key);
    if (!group) {
      group = { key, items: [] };
      byKey.set(key, group);
      groups.push(group);
    }
    group.items.push(item);
  }
  return groups;
}

/** "Today" / "Yesterday" / "Wed 19 Nov" for a day key, in desk time. */
export function dayLabel(key: string, now: number = nowMs()): string {
  if (key === dayKey(now)) return "Today";
  if (key === dayKey(now - 24 * 60 * 60 * 1000)) return "Yesterday";
  const [y, m, d] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: SPAIN_TIME_ZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(Date.UTC(y, m - 1, d, 12)));
}

/** Absolute desk time for tooltips: "Wed 19 Nov, 14:32". */
export function absoluteTime(ts: number): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: SPAIN_TIME_ZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(ts));
}

export function formatLastUpdated(ts: number | null): string {
  const d = new Date(ts ?? Date.now());
  return d.toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: SPAIN_TIME_ZONE,
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
