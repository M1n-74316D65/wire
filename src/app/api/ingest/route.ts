import { NextResponse } from "next/server";
import { ingestAll } from "@/lib/ingest";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  const header = req.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

async function run(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { results, at, classification } = await ingestAll();
  const ok = results.filter((r) => !r.error).length;
  const fail = results.filter((r) => r.error);
  return NextResponse.json({
    at,
    sourcesOk: ok,
    sourcesFailed: fail.length,
    inserted: results.reduce((sum, r) => sum + r.inserted, 0),
    classification,
    failures: fail,
  });
}

export async function GET(req: Request) {
  return run(req);
}

export async function POST(req: Request) {
  return run(req);
}
