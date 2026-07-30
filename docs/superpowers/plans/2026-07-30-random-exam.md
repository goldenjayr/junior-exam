# Random Exam Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `/random-exam` that filters the coding problem bank, draws N problems with a cascading-deal animation, then navigates to `/exam?p=…[&t=…]`.

**Architecture:** Pure helpers in `lib/random-exam.ts` (filter + draw) unit-tested with `node:test`. A client page at `app/random-exam/page.tsx` owns UI, Time Attack config, deal animation, and `router.push`. Home gets a fifth entry card. Reuse `shuffleArray`, `clampMinutes`, and `minutesToSeconds`.

**Tech Stack:** Next.js App Router, React 19 client components, Tailwind 4, existing `animate-pop` / `animate-fade-up`, `node:test`.

## Global Constraints

- Language JavaScript = categories `arrays | strings | objects | logic | react` only
- Language TypeScript = `typescript` only
- Language All = every category
- No examiner param; no `s=` shuffle flag
- Time Attack optional via `t=` seconds when not Off
- Cascading deal animation; honor `prefers-reduced-motion`
- Match admin slate/blue visual language
- Do not modify `/exam` behavior

---

### Task 1: Sampling helpers + unit tests

**Files:**
- Create: `lib/random-exam.ts`
- Create: `lib/random-exam.test.ts`
- Modify: `package.json` (add test file to `test` script)

**Interfaces:**
- Consumes: `problems`, `Problem` from `lib/problems.ts`; `shuffleArray` from `lib/shuffle.ts`
- Produces:
  - `export type RandomLanguage = "javascript" | "typescript" | "all"`
  - `export type RandomDifficulty = "easy" | "medium" | "hard" | "all"`
  - `export function categoriesForLanguage(language: RandomLanguage): Problem["category"][] | null`
  - `export function filterProblems(opts: { language: RandomLanguage; difficulty: RandomDifficulty }): Problem[]`
  - `export function drawProblems(pool: readonly Problem[], count: number): Problem[]`
  - `export function buildExamPath(ids: number[], timeSeconds: number | null): string`
  - `export const categoryLabels: Record<Problem["category"], string>` (for UI badges)

- [ ] **Step 1: Write the failing tests**

Create `lib/random-exam.test.ts`:

```ts
// Run with: npm test
import assert from "node:assert";
import test from "node:test";
import { problems } from "./problems.ts";
import {
  categoriesForLanguage,
  filterProblems,
  drawProblems,
  buildExamPath,
} from "./random-exam.ts";

test("categoriesForLanguage maps javascript and typescript", () => {
  assert.deepStrictEqual(categoriesForLanguage("javascript"), [
    "arrays",
    "strings",
    "objects",
    "logic",
    "react",
  ]);
  assert.deepStrictEqual(categoriesForLanguage("typescript"), ["typescript"]);
  assert.strictEqual(categoriesForLanguage("all"), null);
});

test("filterProblems javascript excludes typescript/python/sql/prisma", () => {
  const pool = filterProblems({ language: "javascript", difficulty: "all" });
  assert.ok(pool.length > 0);
  for (const p of pool) {
    assert.ok(
      ["arrays", "strings", "objects", "logic", "react"].includes(p.category)
    );
  }
});

test("filterProblems typescript is only typescript category", () => {
  const pool = filterProblems({ language: "typescript", difficulty: "all" });
  assert.ok(pool.every((p) => p.category === "typescript"));
});

test("filterProblems respects difficulty", () => {
  const easy = filterProblems({ language: "all", difficulty: "easy" });
  assert.ok(easy.length > 0);
  assert.ok(easy.every((p) => p.difficulty === "easy"));
});

test("drawProblems returns count items from pool", () => {
  const pool = filterProblems({ language: "all", difficulty: "all" });
  const drawn = drawProblems(pool, 3);
  assert.strictEqual(drawn.length, 3);
  const ids = new Set(pool.map((p) => p.id));
  for (const p of drawn) assert.ok(ids.has(p.id));
});

test("drawProblems clamps count to pool size and min 1 behavior via empty", () => {
  const pool = filterProblems({ language: "typescript", difficulty: "all" });
  assert.strictEqual(drawProblems(pool, 999).length, pool.length);
  assert.deepStrictEqual(drawProblems(pool, 0), []);
  assert.deepStrictEqual(drawProblems([], 5), []);
});

test("buildExamPath encodes ids and optional timer", () => {
  assert.strictEqual(buildExamPath([1, 2, 3], null), "/exam?p=1,2,3");
  assert.strictEqual(buildExamPath([4, 5], 900), "/exam?p=4,5&t=900");
});

test("bank has problems for javascript filter", () => {
  assert.ok(problems.length >= 1);
  assert.ok(
    filterProblems({ language: "javascript", difficulty: "all" }).length >= 1
  );
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test lib/random-exam.test.ts`  
Expected: FAIL (module not found)

- [ ] **Step 3: Implement helpers**

Create `lib/random-exam.ts`:

```ts
import { problems, type Problem } from "./problems";
import { shuffleArray } from "./shuffle";

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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test lib/random-exam.test.ts`  
Expected: all PASS

- [ ] **Step 5: Register test in package.json**

Append `lib/random-exam.test.ts` to the `test` script array in `package.json`.

Run: `npm test`  
Expected: all existing + new tests PASS

- [ ] **Step 6: Commit**

```bash
git add lib/random-exam.ts lib/random-exam.test.ts package.json
git commit -m "feat: add random-exam filter and draw helpers"
```

---

### Task 2: `/random-exam` page with cascading deal

**Files:**
- Create: `app/random-exam/page.tsx`

**Interfaces:**
- Consumes: helpers from Task 1; `clampMinutes`, `minutesToSeconds` from `lib/time-attack.ts`; `useRouter` from `next/navigation`
- Produces: client page at `/random-exam`

- [ ] **Step 1: Create the page shell with config state**

Create `app/random-exam/page.tsx` as `"use client"` with:

- State: `language`, `difficulty`, `count`, `timeMode` (`"off" | "preset" | "custom"`), `presetMin`, `customMin`, `phase` (`"config" | "spinning" | "done"`), `drawn` (`Problem[]`), `revealedCount` (number)
- Derived: `pool = filterProblems(...)`, `available = pool.length`, clamp `count` into `1…max(1, available)` when filters change via `useEffect`
- UI: header “Random Exam”, language chips, difficulty chips, count number input, Time Attack row (Off / 10/15/30/45/60 / Custom), live “N available”, Spin button disabled when `available === 0` or `phase !== "config"`

Reuse chip class patterns from `app/admin/page.tsx` (rounded-full, active `bg-slate-900` or `bg-blue-600`).

Difficulty badge classes:

```ts
const difficultyBadge = {
  easy: "bg-blue-50 text-blue-600",
  medium: "bg-purple-50 text-purple-600",
  hard: "bg-red-50 text-red-600",
} as const;
```

- [ ] **Step 2: Implement Spin + cascading deal + redirect**

On Spin click:

```ts
async function spin() {
  if (available === 0 || phase !== "config") return;
  const picks = drawProblems(pool, count);
  if (!picks.length) return;
  setDrawn(picks);
  setRevealedCount(0);
  setPhase("spinning");

  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion) {
    setRevealedCount(picks.length);
    await wait(400);
  } else {
    await wait(400); // decoy beat
    for (let i = 1; i <= picks.length; i++) {
      setRevealedCount(i);
      await wait(300);
    }
    await wait(600);
  }

  const timeSeconds =
    timeMode === "off"
      ? null
      : minutesToSeconds(timeMode === "preset" ? presetMin : customMin);
  setPhase("done");
  router.push(buildExamPath(picks.map((p) => p.id), timeSeconds));
}

function wait(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}
```

Deal stage UI (visible when `phase !== "config"`):

- List of `drawn.length` slots
- For index `i < revealedCount`, render problem card with `animate-pop`: title, difficulty badge, `categoryLabels[category]`
- For unrevealed slots: muted placeholder “…” or empty dashed row
- Optional decoy line above while `phase === "spinning" && revealedCount === 0`: cycling muted titles from `pool` (simple: show “Shuffling the bank…” text)

Spin button label: `phase === "config" ? "Spin" : "Drawing…"`

- [ ] **Step 3: Manual smoke check**

Run: `npm run dev`  
Open `/random-exam`, pick JavaScript / easy / 3, Spin — cards deal, then URL is `/exam?p=…` with 3 ids.  
With 15m Time Attack — URL includes `&t=900`.  
With filters that yield 0 — Spin disabled.

- [ ] **Step 4: Commit**

```bash
git add app/random-exam/page.tsx
git commit -m "feat: add random-exam page with cascading deal"
```

---

### Task 3: Home entry card

**Files:**
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: none new
- Produces: link card to `/random-exam`

- [ ] **Step 1: Add the card**

After the “Build a Quiz” card (inside the same grid), add:

```tsx
<Link
  href="/random-exam"
  className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-100 sm:col-span-2"
>
  <span className="text-2xl">🎲</span>
  <h2 className="mt-3 text-lg font-bold group-hover:text-blue-600">
    Random Exam →
  </h2>
  <p className="mt-1 text-sm text-slate-500">
    Pick language, difficulty, and count — spin for a surprise set and jump
    straight in.
  </p>
</Link>
```

(`sm:col-span-2` keeps the fifth card full-width under the 2×2 grid; drop `sm:col-span-2` if a compact fifth cell is preferred.)

- [ ] **Step 2: Verify home renders the link**

Run: `npm run dev` → `/` shows Random Exam card → navigates to `/random-exam`.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: link random exam from home"
```

---

## Spec coverage

| Spec requirement | Task |
|---|---|
| Language / difficulty / count filters | 1 + 2 |
| Time Attack optional → `t=` | 2 |
| Fisher–Yates draw | 1 (`drawProblems`) |
| Cascading deal + redirect | 2 |
| `prefers-reduced-motion` | 2 |
| Empty pool disables Spin | 2 |
| Home card | 3 |
| Unit tests for helpers | 1 |
| No examiner / no shuffle flag | 1 (`buildExamPath`) + 2 |

## Self-review

- No TBD/placeholder steps  
- Types consistent: `RandomLanguage`, `RandomDifficulty`, `buildExamPath(ids, timeSeconds)`  
- `package.json` test script updated in Task 1 so CI/local `npm test` includes new file  
