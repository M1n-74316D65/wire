import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FeedList } from "@/components/FeedList";
import { PageChrome } from "@/components/PageChrome";
import { getFeed, lastUpdatedLabel } from "@/lib/queries";
import { TOPICS, type Topic } from "@/lib/sources";
import { getTheme } from "@/lib/theme";
import { nowMs, parseHours, parseLimit } from "@/lib/time";

export const dynamic = "force-dynamic";

const VALID = new Set(["all", ...TOPICS.map((t) => t.slug)]);

function topicLabel(slug: string): string {
  return slug === "all"
    ? "Everything"
    : (TOPICS.find((t) => t.slug === slug)?.label ?? slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!VALID.has(slug)) return {};
  return { title: `${topicLabel(slug)} · wire` };
}

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ limit?: string; hours?: string }>;
};

export default async function TopicPage({ params, searchParams }: Props) {
  const { slug } = await params;
  if (!VALID.has(slug)) notFound();

  const sp = await searchParams;
  const limit = parseLimit(sp.limit);
  const hours = parseHours(sp.hours);
  const topic = slug as Topic | "all";
  const theme = await getTheme();
  const headlines = getFeed({ topic, limit, hours });
  const now = nowMs();
  const title = topicLabel(slug);

  return (
    <PageChrome
      theme={theme}
      lastUpdated={lastUpdatedLabel()}
      activeNav={slug}
      basePath={`/topic/${slug}`}
      limit={limit}
      hours={hours}
      title={title}
    >
      <FeedList headlines={headlines} now={now} />
    </PageChrome>
  );
}
