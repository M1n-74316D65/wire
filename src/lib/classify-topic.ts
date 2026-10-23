import { decide, type ChoiceAnswer } from "./decision";
import { getDecisionConfig } from "./env";
import { TOPICS, type Topic } from "./sources";

const TOPIC_CRITERIA: Record<Topic, string> = {
  tech: "Software, hardware, internet, startups, AI, gadgets, cybersecurity.",
  news: "General current events that do not fit a tighter section; world wire stories.",
  spain: "Spain or Spanish politics/society/economy as the main subject (not merely a Spanish outlet).",
  business: "Markets, companies, finance, trade, economy, labor as the main subject.",
  science: "Research, space, climate science, medicine, biology, physics discoveries.",
  gaming: "Video games, esports, game industry, consoles, game studios.",
  culture: "Arts, film, music, books, TV, design, cultural criticism.",
  politics: "Government, elections, policy, diplomacy, political parties (any country).",
};

export type TopicClassification = {
  topic: Topic;
  confidence: number;
  model: string;
};

const VALID = new Set<string>(TOPICS.map((t) => t.slug));

/** Classify a headline into one Topic via decision-model choice. */
export async function classifyHeadline(opts: {
  title: string;
  sourceName: string;
  sourceTopics: Topic[];
}): Promise<TopicClassification | null> {
  const cfg = getDecisionConfig();
  if (!cfg) return null;

  const criteria: Record<string, string> = {};
  for (const t of TOPICS) {
    criteria[t.slug] = TOPIC_CRITERIA[t.slug];
  }

  const state = {
    title: opts.title,
    source: opts.sourceName,
    source_topics: opts.sourceTopics,
  };

  const result = await decide(state, {
    topic: {
      type: "choice",
      instructions:
        "Pick the single best section for this headline on a personal news desk. Prefer the article subject over the outlet's country.",
      criteria,
    },
  });

  if (!result) return null;

  const answer = result.answers.topic;
  if (!answer || answer.type !== "choice") return null;

  const choice = answer as ChoiceAnswer;
  if (!VALID.has(choice.choice)) return null;
  if (choice.confidence < cfg.minConfidence) return null;

  return {
    topic: choice.choice as Topic,
    confidence: choice.confidence,
    model: result.model,
  };
}
