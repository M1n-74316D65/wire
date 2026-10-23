import { decide, type ChoiceAnswer } from "./decision";
import { getDecisionConfig } from "./env";
import { TOPICS, type Topic } from "./sources";

/** Short criteria — keeps prompt tokens low. */
const TOPIC_CRITERIA: Record<Topic, string> = {
  tech: "Software, AI, gadgets, internet, startups.",
  news: "General current events / wire stories.",
  spain: "Spain as the main subject (not just a Spanish outlet).",
  business: "Markets, companies, finance, economy.",
  science: "Research, space, medicine, discoveries.",
  gaming: "Video games, esports, game industry.",
  culture: "Arts, film, music, books, TV.",
  politics: "Government, elections, policy, parties.",
};

export type TopicClassification = {
  topic: Topic;
  confidence: number;
  model: string;
};

const VALID = new Set<string>(TOPICS.map((t) => t.slug));

/** Sources with a single topic never need the model. */
export function topicFromSourceAlone(topics: Topic[]): TopicClassification | null {
  if (topics.length !== 1) return null;
  return { topic: topics[0], confidence: 1, model: "source" };
}

export function fallbackTopic(topics: Topic[]): TopicClassification | null {
  if (topics.length === 0) return null;
  // Prefer a specific section over the catch-all "news"
  const preferred = topics.find((t) => t !== "news") ?? topics[0];
  return { topic: preferred, confidence: 0, model: "source-fallback" };
}

/**
 * Classify via decision model. Only call when the source has 2+ topics
 * (ambiguous routing). Criteria are limited to those topics to save tokens.
 */
export async function classifyHeadline(opts: {
  title: string;
  sourceName: string;
  sourceTopics: Topic[];
}): Promise<TopicClassification | null> {
  const cfg = getDecisionConfig();
  if (!cfg) return null;

  const fromSource = topicFromSourceAlone(opts.sourceTopics);
  if (fromSource) return fromSource;

  const options =
    opts.sourceTopics.length >= 2
      ? opts.sourceTopics
      : (TOPICS.map((t) => t.slug) as Topic[]);

  const criteria: Record<string, string> = {};
  for (const slug of options) {
    criteria[slug] = TOPIC_CRITERIA[slug];
  }

  // Compact state — title is enough; source name is a light hint
  const state = `${opts.sourceName}: ${opts.title}`;

  const result = await decide(state, {
    topic: {
      type: "choice",
      instructions: "Best desk section for this headline. Prefer subject over outlet country.",
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
