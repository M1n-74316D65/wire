import { notFound } from "next/navigation";
import { HeadlineList } from "@/components/HeadlineList";
import { PageChrome } from "@/components/PageChrome";
import { getSourceColumn, lastUpdatedLabel } from "@/lib/queries";
import { getTheme } from "@/lib/theme";
import { nowMs, parseHours, parseLimit } from "@/lib/time";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ limit?: string; hours?: string }>;
};

export default async function SourcePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const limit = parseLimit(sp.limit);
  const hours = parseHours(sp.hours);
  const column = getSourceColumn(slug, limit, hours);
  if (!column) notFound();

  const theme = await getTheme();
  const now = nowMs();

  return (
    <PageChrome
      theme={theme}
      lastUpdated={lastUpdatedLabel()}
      basePath={`/source/${slug}`}
      limit={limit}
      hours={hours}
      title={column.source.name}
    >
      <HeadlineList headlines={column.headlines} now={now} />
    </PageChrome>
  );
}
