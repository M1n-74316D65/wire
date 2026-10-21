import { NextResponse } from "next/server";
import { getColumns, lastUpdatedLabel } from "@/lib/queries";
import { TOPICS, type Topic } from "@/lib/sources";
import { parseHours, parseLimit } from "@/lib/time";

export const dynamic = "force-dynamic";

const VALID = new Set(["all", ...TOPICS.map((t) => t.slug)]);

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(request: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  if (!VALID.has(slug)) {
    return NextResponse.json({ error: "unknown topic" }, { status: 404 });
  }

  const url = new URL(request.url);
  const limit = parseLimit(url.searchParams.get("limit"));
  const hours = parseHours(url.searchParams.get("hours"));
  const columns = getColumns({
    topic: slug as Topic | "all",
    limit,
    hours,
  });

  return NextResponse.json({
    topic: slug,
    lastUpdated: lastUpdatedLabel(),
    limit,
    hours,
    sources: columns.map((c) => ({
      slug: c.source.slug,
      name: c.source.name,
      headlines: c.headlines.map((h) => ({
        title: h.title,
        url: h.url,
        publishedAt: h.publishedAt,
        hnUrl: h.hnUrl,
      })),
    })),
  });
}
