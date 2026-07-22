import type { AnswerValue, QuizQuestion } from "./types.ts";

export function normalizeText(s: string): string {
  return s.trim().replace(/\s+/g, " ").toLowerCase();
}

function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sb = new Set(b);
  return a.every((x) => sb.has(x));
}

export function gradeAnswer(
  q: QuizQuestion,
  answer: AnswerValue | null | undefined
): boolean {
  if (!answer || answer.type !== q.type) return false;

  switch (q.type) {
    case "single":
      return answer.type === "single" && answer.id === q.correctId;
    case "multi":
      return answer.type === "multi" && sameSet(answer.ids, q.correctIds);
    case "boolean":
      return answer.type === "boolean" && answer.value === q.correct;
    case "fill":
      return (
        answer.type === "fill" &&
        q.accept.some((a) => normalizeText(a) === normalizeText(answer.text))
      );
    case "order":
      return (
        answer.type === "order" &&
        answer.order.length === q.correctOrder.length &&
        answer.order.every((id, i) => id === q.correctOrder[i])
      );
    case "snippet":
      return answer.type === "snippet" && answer.id === q.correctId;
    case "match": {
      if (answer.type !== "match") return false;
      const keys = Object.keys(q.pairs);
      return (
        keys.length === Object.keys(answer.pairs).length &&
        keys.every((k) => answer.pairs[k] === q.pairs[k])
      );
    }
    case "hotspot":
      return (
        answer.type === "hotspot" && answer.regionId === q.correctRegionId
      );
    case "output":
      return (
        answer.type === "output" &&
        q.accept.some((a) => normalizeText(a) === normalizeText(answer.text))
      );
    default:
      return false;
  }
}

export function summarizeAnswer(
  q: QuizQuestion,
  answer: AnswerValue | null | undefined
): string {
  if (!answer) return "(no answer)";
  switch (answer.type) {
    case "single":
    case "snippet":
      return answer.id;
    case "multi":
      return answer.ids.join(", ");
    case "boolean":
      return answer.value ? "true" : "false";
    case "fill":
    case "output":
      return answer.text;
    case "order":
      return answer.order.join(" → ");
    case "match":
      return Object.entries(answer.pairs)
        .map(([l, r]) => `${l}→${r}`)
        .join(", ");
    case "hotspot":
      return answer.regionId;
  }
}
