import { notFound } from "next/navigation";
import { FeedList } from "@/components/FeedList";
import { PageChrome } from "@/components/PageChrome";
import { getFeed, lastUpdatedLabel } from "@/lib/queries";
import { TOPICS, type Topic } from "@/lib/sources";
import { getTheme } from "@/lib/theme";
import { parseHours, parseLimit } from "@/lib/time";

export const dynamic = "force-dynamic";

const VALID = new Set(["all", ...TOPICS.map((t) => t.slug)]);

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
  const now = Date.now();
  const title =
    slug === "all"
      ? "Everything"
      : (TOPICS.find((t) => t.slug === slug)?.label ?? slug);

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
