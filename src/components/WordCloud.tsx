type WordFrequency = { word: string; count: number };

export function WordCloud({
  words,
  hours,
}: {
  words: WordFrequency[];
  hours: number;
}) {
  if (words.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-state__title">No words in this window.</p>
        <p>
          {hours >= 24
            ? "Choose a section or source to keep reading."
            : "Try a wider window."}
        </p>
      </div>
    );
  }

  const max = words[0]?.count || 1;
  return (
    <div className="wordcloud">
      {words.map(({ word, count }) => {
        const size = 0.95 + (count / max) * 1.85;
        return (
          <span key={word} style={{ fontSize: `${size}rem` }} title={`${count}`}>
            {word}
          </span>
        );
      })}
    </div>
  );
}
