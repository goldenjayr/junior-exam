import { sessionChoiceOrder } from "@/lib/shuffle";
import type { QuizQuestion } from "./types.ts";

/**
 * Return a question clone with single/multi/snippet choices shuffled for this
 * session. Grading still uses option ids, so order is display-only.
 */
export function withSessionShuffledChoices(
  question: QuizQuestion,
  storage: Storage,
  sessionKey: string
): QuizQuestion {
  if (question.type === "single" || question.type === "multi") {
    const ids = question.options.map((o) => o.id);
    const order = sessionChoiceOrder(storage, sessionKey, question.id, ids, true);
    const byId = new Map(question.options.map((o) => [o.id, o]));
    return {
      ...question,
      options: order.map((id) => byId.get(id)!),
    };
  }

  if (question.type === "snippet") {
    const ids = question.snippets.map((s) => s.id);
    const order = sessionChoiceOrder(storage, sessionKey, question.id, ids, true);
    const byId = new Map(question.snippets.map((s) => [s.id, s]));
    return {
      ...question,
      snippets: order.map((id) => byId.get(id)!),
    };
  }

  return question;
}
