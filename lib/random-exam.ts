import { problems, type Problem } from "./problems.ts";
import { shuffleArray } from "./shuffle.ts";

export type RandomLanguageFilter = "javascript" | "typescript";
export type RandomDifficultyFilter = "easy" | "medium" | "hard";

/** @deprecated Prefer RandomLanguageFilter[]; kept for call-site clarity in older tests. */
export type RandomLanguage = RandomLanguageFilter | "all";
/** @deprecated Prefer RandomDifficultyFilter[]; kept for call-site clarity in older tests. */
export type RandomDifficulty = RandomDifficultyFilter | "all";

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

export function categoriesForLanguages(
  languages: readonly RandomLanguageFilter[]
): Problem["category"][] | null {
  if (languages.length === 0) return null;
  const cats = new Set<Problem["category"]>();
  for (const language of languages) {
    if (language === "typescript") cats.add("typescript");
    else for (const c of JS_CATEGORIES) cats.add(c);
  }
  return [...cats];
}

/** Single-language helper used by older call sites / tests. */
export function categoriesForLanguage(
  language: RandomLanguage
): Problem["category"][] | null {
  if (language === "all") return null;
  return categoriesForLanguages([language]);
}

export function filterProblems(opts: {
  languages?: readonly RandomLanguageFilter[];
  difficulties?: readonly RandomDifficultyFilter[];
  /** @deprecated Use `languages` (empty = all). */
  language?: RandomLanguage;
  /** @deprecated Use `difficulties` (empty = all). */
  difficulty?: RandomDifficulty;
}): Problem[] {
  const languages =
    opts.languages ??
    (opts.language && opts.language !== "all" ? [opts.language] : []);
  const difficulties =
    opts.difficulties ??
    (opts.difficulty && opts.difficulty !== "all" ? [opts.difficulty] : []);

  const cats = categoriesForLanguages(languages);
  const difficultySet = new Set(difficulties);

  return problems.filter((p) => {
    if (cats && !cats.includes(p.category)) return false;
    if (difficultySet.size > 0 && !difficultySet.has(p.difficulty)) return false;
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

export function toggleFilterValue<T extends string>(
  current: readonly T[],
  value: T
): T[] {
  return current.includes(value)
    ? current.filter((v) => v !== value)
    : [...current, value];
}
