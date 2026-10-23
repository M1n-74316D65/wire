import { getDecisionConfig } from "./env";

export type ChoiceQuestion = {
  type: "choice";
  instructions: string;
  criteria: Record<string, string>;
};

export type NoulQuestion = {
  type: "noul";
  instructions: string;
  criteria?: { true: string; false: string };
};

export type ScoreQuestion = {
  type: "score";
  instructions: string;
  criteria: string[];
};

export type DecisionQuestion = ChoiceQuestion | NoulQuestion | ScoreQuestion;

export type ChoiceAnswer = {
  type: "choice";
  choice: string;
  confidence: number;
  probabilities: Record<string, number>;
};

export type NoulAnswer = {
  type: "noul";
  noul: number;
};

export type ScoreAnswer = {
  type: "score";
  score: number;
  confidence: number;
  probabilities: Record<string, number>;
  legend?: Record<string, string>;
};

export type DecisionAnswer = ChoiceAnswer | NoulAnswer | ScoreAnswer;

export type DecisionResult = {
  model: string;
  answers: Record<string, DecisionAnswer>;
};

type DecisionResponseBody = {
  model?: string;
  answers?: Record<string, DecisionAnswer>;
  error?: { message?: string } | string;
};

/** Call a System One decision endpoint. Provider-agnostic; config from env. */
export async function decide(
  state: string | Record<string, unknown>,
  questions: Record<string, DecisionQuestion>,
): Promise<DecisionResult | null> {
  const cfg = getDecisionConfig();
  if (!cfg) return null;

  const res = await fetch(cfg.baseURL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: cfg.model,
      state,
      questions,
    }),
    signal: AbortSignal.timeout(30_000),
  });

  const body = (await res.json().catch(() => null)) as DecisionResponseBody | null;
  if (!res.ok) {
    const msg =
      typeof body?.error === "string"
        ? body.error
        : body?.error?.message || `Decision API ${res.status}`;
    throw new Error(msg);
  }

  if (!body?.answers) {
    throw new Error("Decision API returned no answers");
  }

  return {
    model: body.model || cfg.model,
    answers: body.answers,
  };
}
