import { NextResponse } from "next/server";
import { getColumns, lastUpdatedLabel } from "@/lib/queries";
import { parseHours, parseLimit } from "@/lib/time";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = parseLimit(url.searchParams.get("limit"));
  const hours = parseHours(url.searchParams.get("hours"));
  const columns = getColumns({ topic: "home", limit, hours });

  return NextResponse.json({
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
