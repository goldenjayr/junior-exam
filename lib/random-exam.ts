import { problems, type Problem } from "./problems.ts";
import { shuffleArray } from "./shuffle.ts";

export type RandomLanguage = "javascript" | "typescript" | "all";
export type RandomDifficulty = "easy" | "medium" | "hard" | "all";

export const categoryLabels: Record<Problem["category"], string> = {
  arrays: "Arrays",
  strings: "Strings",
  objects: "Objects",
  logic: "Logic",
  react: "React",
  postgresql: "PostgreSQL",
  prisma: "Prisma",
  python: "Python",
  typescript: "TypeScript",
};

const JS_CATEGORIES: Problem["category"][] = [
  "arrays",
  "strings",
  "objects",
  "logic",
  "react",
];

export function categoriesForLanguage(
  language: RandomLanguage
): Problem["category"][] | null {
  if (language === "all") return null;
  if (language === "typescript") return ["typescript"];
  return JS_CATEGORIES;
}

export function filterProblems(opts: {
  language: RandomLanguage;
  difficulty: RandomDifficulty;
}): Problem[] {
  const cats = categoriesForLanguage(opts.language);
  return problems.filter((p) => {
    if (cats && !cats.includes(p.category)) return false;
    if (opts.difficulty !== "all" && p.difficulty !== opts.difficulty)
      return false;
    return true;
  });
}

export function drawProblems(
  pool: readonly Problem[],
  count: number
): Problem[] {
  if (pool.length === 0 || count <= 0) return [];
  const n = Math.min(count, pool.length);
  return shuffleArray(pool).slice(0, n);
}

export function buildExamPath(
  ids: number[],
  timeSeconds: number | null
): string {
  const base = `/exam?p=${ids.join(",")}`;
  return timeSeconds ? `${base}&t=${timeSeconds}` : base;
}
