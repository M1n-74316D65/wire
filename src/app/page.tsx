import { FeedList } from "@/components/FeedList";
import { PageChrome } from "@/components/PageChrome";
import { getFeed, lastUpdatedLabel } from "@/lib/queries";
import { getTheme } from "@/lib/theme";
import { nowMs, parseHours, parseLimit } from "@/lib/time";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ limit?: string; hours?: string }>;
};

export default async function HomePage({ searchParams }: Props) {
  const sp = await searchParams;
  const limit = parseLimit(sp.limit);
  const hours = parseHours(sp.hours);
  const theme = await getTheme();
  const headlines = getFeed({ topic: "home", limit, hours });
  const now = nowMs();

  return (
    <PageChrome
      theme={theme}
      lastUpdated={lastUpdatedLabel()}
      activeNav="home"
      basePath="/"
      limit={limit}
      hours={hours}
      title="Desk"
    >
      <FeedList headlines={headlines} now={now} />
    </PageChrome>
  );
}
