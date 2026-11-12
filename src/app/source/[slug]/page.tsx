import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { HeadlineList } from "@/components/HeadlineList";
import { PageChrome } from "@/components/PageChrome";
import { getSourceColumn, lastUpdatedLabel } from "@/lib/queries";
import { getSource } from "@/lib/sources";
import { getTheme } from "@/lib/theme";
import { nowMs, parseHours, parseLimit } from "@/lib/time";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const source = getSource(slug);
  return { title: source ? `${source.name} · wire` : "wire" };
}

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
      activeNav={slug}
      basePath={`/source/${slug}`}
      limit={limit}
      hours={hours}
      title={column.source.name}
    >
      <HeadlineList headlines={column.headlines} now={now} />
    </PageChrome>
  );
}
