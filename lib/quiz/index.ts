import { htmlQuestions } from "./bank/html.ts";
import { javascriptQuestions } from "./bank/javascript.ts";
import { nodejsQuestions } from "./bank/nodejs.ts";
import { reactQuestions } from "./bank/react.ts";
import { tailwindQuestions } from "./bank/tailwind.ts";
import { typescriptQuestions } from "./bank/typescript.ts";
import type { QuizQuestion, QuizTopic } from "./types.ts";

export const quizTopics = [
  "javascript",
  "typescript",
  "tailwind",
  "react",
  "html",
  "nodejs",
] as const satisfies readonly QuizTopic[];

export const quizQuestions: QuizQuestion[] = [
  ...javascriptQuestions,
  ...typescriptQuestions,
  ...tailwindQuestions,
  ...reactQuestions,
  ...htmlQuestions,
  ...nodejsQuestions,
];

const byId = new Map(quizQuestions.map((q) => [q.id, q]));

/** Parse `q` query param: comma-separated ids present in the bank (order preserved). */
export function parseQuizIds(raw: string | null): number[] {
  if (!raw || !raw.trim()) return [];
  const seen = new Set<number>();
  const ids: number[] = [];
  for (const part of raw.split(",")) {
    const n = Number(part.trim());
    if (!Number.isInteger(n) || n <= 0 || seen.has(n) || !byId.has(n)) continue;
    seen.add(n);
    ids.push(n);
  }
  return ids;
}

export function getQuizById(id: number): QuizQuestion | undefined {
  return byId.get(id);
}
