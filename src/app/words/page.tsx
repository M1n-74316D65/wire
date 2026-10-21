import { PageChrome } from "@/components/PageChrome";
import { lastUpdatedLabel, wordFrequencies } from "@/lib/queries";
import { getTheme } from "@/lib/theme";
import { parseHours, parseLimit } from "@/lib/time";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ limit?: string; hours?: string }>;
};

export default async function WordsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const limit = parseLimit(sp.limit);
  const hours = parseHours(sp.hours);
  const theme = await getTheme();
  const words = wordFrequencies(hours);
  const max = words[0]?.count || 1;

  return (
    <PageChrome
      theme={theme}
      lastUpdated={lastUpdatedLabel()}
      activeNav="words"
      basePath="/words"
      limit={limit}
      hours={hours}
      title="Words"
    >
      <p className="lede">
        Most common tokens in titles from the last {hours}h.
      </p>
      <div className="wordcloud">
        {words.map(({ word, count }) => {
          const size = 0.85 + (count / max) * 1.75;
          return (
            <span key={word} style={{ fontSize: `${size}rem` }} title={`${count}`}>
              {word}
            </span>
          );
        })}
      </div>
    </PageChrome>
  );
}
