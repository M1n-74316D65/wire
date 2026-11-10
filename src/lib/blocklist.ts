/**
 * Blocklist for promo / discount / affiliate noise.
 *
 * Applied at ingest time: matching items are not inserted into the headlines
 * table and are counted per source. Keep patterns conservative — a false
 * positive (e.g. "sale" inside a legit retail story) is cheaper to log-and-
 * release than to silently discard from an audit trail.
 *
 * Pure module: no I/O, easy to unit test from a plain bun script.
 */

export type BlockReason = "promo-keyword" | "affiliate-url" | "promo-domain";

/**
 * Promo / deal copy that typically only appears in sales posts. Intentionally
 * conservative: broad single words like "sale" or "deal" alone are NOT matched
 * to avoid catching legitimate business coverage.
 */
export const PROMO_KEYWORDS: RegExp =
  /\b(black ?friday|cyber ?monday|flash ?sale|limited ?time( ?(offer|deal))?\b|(\d{1,2})% ?off\b|percent ?off\b|use ?code\b|promo ?code\b|coupon ?code\b|free ?shipping\b|deal of the (day|week)\b|prime ?day\b|best ?seller\b)/i;

/** Affiliate / tracking params that indicate a promotional outbound link. */
export const AFFILIATE_URL: RegExp =
  /[?&](aff|affiliate|ref|ref_id|tag|icid|campaign|utm_content|utm_term|deal|code)=[^&]+/i;

/**
 * Domains / host fragments that belong to coupon, affiliate, or deal-aggregator
 * networks. Matched as a substring of the hostname so subdomains are covered.
 */
export const PROMO_DOMAINS: string[] = [
  "slickdeals.net",
  "dealnews.com",
  "retailmenot.com",
  "coupon",
  "codes.com",
  "groupon.com",
  "tradedoubler",
  "impact.com",
  "shareasale",
  "cj.com",
];

function safeHost(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

/**
 * Classify a feed item. Returns the first matching reason, or null if the
 * item should be kept.
 */
export function classifyItem(title: string, url: string): BlockReason | null {
  if (PROMO_KEYWORDS.test(title)) return "promo-keyword";
  if (AFFILIATE_URL.test(url)) return "affiliate-url";
  const host = safeHost(url);
  if (PROMO_DOMAINS.some((d) => host.includes(d))) return "promo-domain";
  return null;
}
