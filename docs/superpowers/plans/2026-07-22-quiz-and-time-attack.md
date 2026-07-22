# Quiz Features + Time Attack Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a knowledge-quiz product (builder + gamified player with nine answer types, 120+ items, assessment/practice modes, email results) and shared Time Attack for both quiz and the existing coding exam.

**Architecture:** Parallel surfaces (exam stays coding; quiz is separate bank/player) sharing `lib/time-attack.ts`, timer UI, freeze overlay, and an extended `/api/submit`. Quiz grading is pure functions in `lib/quiz/grade.ts`. Share links encode ids, examiner, mode, and optional `t` seconds.

**Tech Stack:** Next.js 16 App Router, React 19 client components, Tailwind 4, nodemailer, Node test runner (`node --test`). No new dependencies unless drag-and-drop becomes painful — prefer button reorder for `order` type.

**Spec:** `docs/superpowers/specs/2026-07-22-quiz-and-time-attack-design.md`

**Next.js note:** Read `node_modules/next/dist/docs/` before inventing new App Router patterns. Follow existing `app/exam/page.tsx` / `app/admin/page.tsx` client-component style.

---

## File map

| Path | Responsibility |
|---|---|
| `lib/quiz/types.ts` | Quiz topic/type unions, question shapes, answer values |
| `lib/quiz/grade.ts` | Pure all-or-nothing graders + normalize |
| `lib/quiz/grade.test.ts` | Unit tests for every type |
| `lib/quiz/index.ts` | Aggregate bank, `parseQuizIds`, categories export |
| `lib/quiz/presets.ts` | Curated quiz presets |
| `lib/quiz/bank/*.ts` | ≥20 questions each topic |
| `lib/time-attack.ts` | Parse `t`, sessionStorage clock helpers, hook logic helpers |
| `lib/time-attack.test.ts` | Parse + remaining-time math |
| `components/TimeAttackBar.tsx` | Ring + bar urgency UI |
| `components/FreezeOverlay.tsx` | Time’s up panel |
| `components/quiz/*` | Progress, stage, inputs, feedback |
| `app/admin/quiz/page.tsx` | Quiz builder |
| `app/quiz/page.tsx` | Quiz player |
| `app/admin/page.tsx` | Exam builder + timer control |
| `app/exam/page.tsx` | Exam player + freeze |
| `app/api/submit/route.ts` | Exam + quiz email payloads |
| `app/page.tsx` | Dual-lane hub |
| `app/layout.tsx` | Metadata |

---

### Task 1: Quiz types + grade (TDD)

**Files:**
- Create: `lib/quiz/types.ts`
- Create: `lib/quiz/grade.ts`
- Create: `lib/quiz/grade.test.ts`

- [ ] **Step 1: Write failing grade tests**

Create `lib/quiz/grade.test.ts`:

```ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { gradeAnswer, normalizeText } from "./grade";
import type { QuizQuestion } from "./types";

const single: QuizQuestion = {
  id: 1,
  type: "single",
  topic: "javascript",
  difficulty: "easy",
  prompt: "Pick A",
  options: [
    { id: "a", label: "A" },
    { id: "b", label: "B" },
  ],
  correctId: "a",
};

const multi: QuizQuestion = {
  id: 2,
  type: "multi",
  topic: "javascript",
  difficulty: "easy",
  prompt: "Pick A and C",
  options: [
    { id: "a", label: "A" },
    { id: "b", label: "B" },
    { id: "c", label: "C" },
  ],
  correctIds: ["a", "c"],
};

const boolQ: QuizQuestion = {
  id: 3,
  type: "boolean",
  topic: "javascript",
  difficulty: "easy",
  prompt: "JS is single-threaded?",
  correct: true,
};

const fill: QuizQuestion = {
  id: 4,
  type: "fill",
  topic: "javascript",
  difficulty: "easy",
  prompt: "Keyword for constant",
  accept: ["const"],
};

const order: QuizQuestion = {
  id: 5,
  type: "order",
  topic: "javascript",
  difficulty: "medium",
  prompt: "Order lifecycle",
  items: [
    { id: "m", label: "mount" },
    { id: "u", label: "update" },
    { id: "d", label: "unmount" },
  ],
  correctOrder: ["m", "u", "d"],
};

const snippet: QuizQuestion = {
  id: 6,
  type: "snippet",
  topic: "javascript",
  difficulty: "easy",
  prompt: "Correct sum",
  snippets: [
    { id: "ok", code: "a + b" },
    { id: "bad", code: "a - b" },
  ],
  correctId: "ok",
};

const match: QuizQuestion = {
  id: 7,
  type: "match",
  topic: "javascript",
  difficulty: "medium",
  prompt: "Match",
  left: [
    { id: "l1", label: "const" },
    { id: "l2", label: "let" },
  ],
  right: [
    { id: "r1", label: "block reassignable" },
    { id: "r2", label: "block constant" },
  ],
  pairs: { l1: "r2", l2: "r1" },
};

const hotspot: QuizQuestion = {
  id: 8,
  type: "hotspot",
  topic: "javascript",
  difficulty: "medium",
  prompt: "Click the bug",
  code: "const x = 1\nx = 2",
  regions: [
    { id: "line1", label: "line 1", startLine: 1, endLine: 1 },
    { id: "line2", label: "line 2", startLine: 2, endLine: 2 },
  ],
  correctRegionId: "line2",
};

const output: QuizQuestion = {
  id: 9,
  type: "output",
  topic: "javascript",
  difficulty: "easy",
  prompt: "What logs?",
  code: "console.log(1 + 2)",
  accept: ["3"],
};

describe("normalizeText", () => {
  it("trims, collapses space, lowercases", () => {
    assert.equal(normalizeText("  Hello   World "), "hello world");
  });
});

describe("gradeAnswer", () => {
  it("grades single", () => {
    assert.equal(gradeAnswer(single, { type: "single", id: "a" }), true);
    assert.equal(gradeAnswer(single, { type: "single", id: "b" }), false);
    assert.equal(gradeAnswer(single, null), false);
  });

  it("grades multi all-or-nothing with order independence", () => {
    assert.equal(
      gradeAnswer(multi, { type: "multi", ids: ["c", "a"] }),
      true
    );
    assert.equal(
      gradeAnswer(multi, { type: "multi", ids: ["a"] }),
      false
    );
    assert.equal(
      gradeAnswer(multi, { type: "multi", ids: ["a", "b", "c"] }),
      false
    );
  });

  it("grades boolean", () => {
    assert.equal(gradeAnswer(boolQ, { type: "boolean", value: true }), true);
    assert.equal(gradeAnswer(boolQ, { type: "boolean", value: false }), false);
  });

  it("grades fill with normalization", () => {
    assert.equal(gradeAnswer(fill, { type: "fill", text: " Const " }), true);
    assert.equal(gradeAnswer(fill, { type: "fill", text: "var" }), false);
  });

  it("grades order", () => {
    assert.equal(
      gradeAnswer(order, { type: "order", order: ["m", "u", "d"] }),
      true
    );
    assert.equal(
      gradeAnswer(order, { type: "order", order: ["d", "u", "m"] }),
      false
    );
  });

  it("grades snippet", () => {
    assert.equal(gradeAnswer(snippet, { type: "snippet", id: "ok" }), true);
    assert.equal(gradeAnswer(snippet, { type: "snippet", id: "bad" }), false);
  });

  it("grades match", () => {
    assert.equal(
      gradeAnswer(match, {
        type: "match",
        pairs: { l1: "r2", l2: "r1" },
      }),
      true
    );
    assert.equal(
      gradeAnswer(match, {
        type: "match",
        pairs: { l1: "r1", l2: "r2" },
      }),
      false
    );
  });

  it("grades hotspot", () => {
    assert.equal(
      gradeAnswer(hotspot, { type: "hotspot", regionId: "line2" }),
      true
    );
    assert.equal(
      gradeAnswer(hotspot, { type: "hotspot", regionId: "line1" }),
      false
    );
  });

  it("grades output", () => {
    assert.equal(gradeAnswer(output, { type: "output", text: "3" }), true);
    assert.equal(gradeAnswer(output, { type: "output", text: "12" }), false);
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
node --import tsx --test lib/quiz/grade.test.ts
```

If `tsx` is unavailable, use the project’s existing pattern. Prefer adding a lightweight approach consistent with `lib/runner.test.ts` — inspect that file and mirror its import style.

```bash
# Fallback if runner.test uses plain node:
node --test lib/quiz/grade.test.ts
```

Expected: FAIL (module not found or exports missing).

- [ ] **Step 3: Implement types + grade**

`lib/quiz/types.ts`:

```ts
export type QuizTopic =
  | "javascript"
  | "typescript"
  | "tailwind"
  | "react"
  | "html"
  | "nodejs";

export type QuizDifficulty = "easy" | "medium" | "hard";

export type QuizMode = "assessment" | "practice";

type Base = {
  id: number;
  topic: QuizTopic;
  difficulty: QuizDifficulty;
  prompt: string;
  hint?: string;
  explanation?: string;
};

export type Labeled = { id: string; label: string };

export type QuizQuestion =
  | (Base & {
      type: "single";
      options: Labeled[];
      correctId: string;
    })
  | (Base & {
      type: "multi";
      options: Labeled[];
      correctIds: string[];
    })
  | (Base & {
      type: "boolean";
      correct: boolean;
    })
  | (Base & {
      type: "fill";
      accept: string[];
      placeholder?: string;
    })
  | (Base & {
      type: "order";
      items: Labeled[];
      correctOrder: string[];
    })
  | (Base & {
      type: "snippet";
      snippets: { id: string; code: string }[];
      correctId: string;
    })
  | (Base & {
      type: "match";
      left: Labeled[];
      right: Labeled[];
      pairs: Record<string, string>;
    })
  | (Base & {
      type: "hotspot";
      code: string;
      regions: {
        id: string;
        label: string;
        startLine: number;
        endLine: number;
      }[];
      correctRegionId: string;
    })
  | (Base & {
      type: "output";
      code: string;
      accept: string[];
    });

export type AnswerValue =
  | { type: "single"; id: string }
  | { type: "multi"; ids: string[] }
  | { type: "boolean"; value: boolean }
  | { type: "fill"; text: string }
  | { type: "order"; order: string[] }
  | { type: "snippet"; id: string }
  | { type: "match"; pairs: Record<string, string> }
  | { type: "hotspot"; regionId: string }
  | { type: "output"; text: string };

export type AnswerEntry = {
  value: AnswerValue | null;
  locked: boolean;
  graded?: { correct: boolean };
};
```

`lib/quiz/grade.ts`:

```ts
import type { AnswerValue, QuizQuestion } from "./types";

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
      return (
        answer.type === "multi" && sameSet(answer.ids, q.correctIds)
      );
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
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
# Match whatever import style runner.test.ts uses; add tsx only if already needed.
pnpm test
# or:
node --test --experimental-strip-types lib/quiz/grade.test.ts lib/runner.test.ts
```

Align with `package.json` `test` script after checking how `runner.test.ts` is executed today. Update the script to include quiz tests if needed:

```json
"test": "node --experimental-strip-types --test lib/runner.test.ts lib/quiz/grade.test.ts lib/time-attack.test.ts"
```

- [ ] **Step 5: Commit**

```bash
git add lib/quiz/types.ts lib/quiz/grade.ts lib/quiz/grade.test.ts package.json
git commit -m "feat(quiz): add question types and all-or-nothing grading"
```

---

### Task 2: Time-attack helpers (TDD)

**Files:**
- Create: `lib/time-attack.ts`
- Create: `lib/time-attack.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  parseTimeLimit,
  remainingSeconds,
  clampMinutes,
  minutesToSeconds,
} from "./time-attack";

describe("parseTimeLimit", () => {
  it("parses positive int seconds", () => {
    assert.equal(parseTimeLimit("900"), 900);
  });
  it("rejects empty, zero, negative, non-numeric", () => {
    assert.equal(parseTimeLimit(null), null);
    assert.equal(parseTimeLimit(""), null);
    assert.equal(parseTimeLimit("0"), null);
    assert.equal(parseTimeLimit("-5"), null);
    assert.equal(parseTimeLimit("abc"), null);
  });
});

describe("clampMinutes", () => {
  it("clamps 1..180", () => {
    assert.equal(clampMinutes(0), 1);
    assert.equal(clampMinutes(200), 180);
    assert.equal(clampMinutes(15), 15);
  });
});

describe("remainingSeconds", () => {
  it("computes floor remaining", () => {
    const startedAt = 1_000_000;
    const now = 1_000_000 + 10_000; // 10s later
    assert.equal(remainingSeconds(startedAt, 60, now), 50);
  });
  it("never goes below 0", () => {
    assert.equal(remainingSeconds(0, 10, 50_000), 0);
  });
});

describe("minutesToSeconds", () => {
  it("converts", () => {
    assert.equal(minutesToSeconds(15), 900);
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

- [ ] **Step 3: Implement `lib/time-attack.ts`**

```ts
export function parseTimeLimit(raw: string | null): number | null {
  if (raw == null || raw === "") return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) return null;
  return n;
}

export function clampMinutes(m: number): number {
  if (!Number.isFinite(m)) return 1;
  return Math.min(180, Math.max(1, Math.round(m)));
}

export function minutesToSeconds(m: number): number {
  return clampMinutes(m) * 60;
}

export function remainingSeconds(
  startedAtMs: number,
  limitSeconds: number,
  nowMs: number = Date.now()
): number {
  const elapsed = Math.floor((nowMs - startedAtMs) / 1000);
  return Math.max(0, limitSeconds - elapsed);
}

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

/** sessionStorage key for a given session identity */
export function timeAttackStorageKey(sessionId: string): string {
  return `time-attack:${sessionId}`;
}

export type StoredClock = {
  startedAt: number;
  limitSeconds: number;
};

export function readStoredClock(
  storage: Storage,
  sessionId: string,
  limitSeconds: number
): StoredClock {
  const key = timeAttackStorageKey(sessionId);
  try {
    const raw = storage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredClock;
      if (
        parsed &&
        parsed.limitSeconds === limitSeconds &&
        typeof parsed.startedAt === "number"
      ) {
        return parsed;
      }
    }
  } catch {
    /* ignore */
  }
  const fresh = { startedAt: Date.now(), limitSeconds };
  storage.setItem(key, JSON.stringify(fresh));
  return fresh;
}
```

- [ ] **Step 4: Run tests — PASS; update package.json test script**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: add time-attack parse and clock helpers"
```

---

### Task 3: TimeAttackBar + FreezeOverlay components

**Files:**
- Create: `components/TimeAttackBar.tsx`
- Create: `components/FreezeOverlay.tsx`

- [ ] **Step 1: Implement TimeAttackBar**

Client component, Pro Clean:

- Props: `remaining: number`, `limitSeconds: number`
- Show ring (SVG stroke-dashoffset) + `formatClock(remaining)` + “of MM:SS”
- Linear bar under or beside
- Urgency classes: `remaining <= 30` amber, `remaining <= 10` red + subtle pulse (respect reduced motion via CSS already in globals)

```tsx
"use client";
import { formatClock } from "@/lib/time-attack";

export default function TimeAttackBar({
  remaining,
  limitSeconds,
}: {
  remaining: number;
  limitSeconds: number;
}) {
  const pct = limitSeconds > 0 ? remaining / limitSeconds : 0;
  const urgent = remaining <= 30;
  const critical = remaining <= 10;
  const color = critical
    ? "text-red-600"
    : urgent
      ? "text-amber-600"
      : "text-blue-600";
  const bar = critical
    ? "bg-red-500"
    : urgent
      ? "bg-amber-500"
      : "bg-blue-600";
  const r = 15;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct);

  return (
    <div
      className={`flex flex-col gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm ${
        critical ? "animate-pulse" : ""
      }`}
      role="timer"
      aria-live="polite"
      aria-label={`${formatClock(remaining)} remaining`}
    >
      <div className="flex items-center gap-2">
        <svg width="40" height="40" viewBox="0 0 36 36" className={color}>
          <circle
            cx="18"
            cy="18"
            r={r}
            fill="none"
            className="stroke-slate-200"
            strokeWidth="3"
          />
          <circle
            cx="18"
            cy="18"
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            transform="rotate(-90 18 18)"
          />
          <text
            x="18"
            y="21"
            textAnchor="middle"
            className="fill-slate-900 text-[8px] font-bold"
          >
            {formatClock(remaining)}
          </text>
        </svg>
        <div className="text-xs">
          <p className="font-semibold uppercase tracking-wide text-slate-500">
            Time left
          </p>
          <p className="text-slate-400">of {formatClock(limitSeconds)}</p>
        </div>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full transition-[width] duration-1000 ${bar}`}
          style={{ width: `${pct * 100}%` }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Implement FreezeOverlay**

```tsx
"use client";

export default function FreezeOverlay({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md animate-pop rounded-2xl border border-red-200 bg-white p-6 text-center shadow-2xl">
        <div className="text-3xl" aria-hidden>
          ⏱
        </div>
        <h2 className="mt-2 text-xl font-extrabold text-slate-900">
          Time&apos;s up
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Answers are locked. Enter your name and submit results.
        </p>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git commit -m "feat: add TimeAttackBar and FreezeOverlay UI"
```

---

### Task 4: Extend submit API for quiz + timer meta

**Files:**
- Modify: `app/api/submit/route.ts`

- [ ] **Step 1: Extend types and email HTML**

Support:

```ts
type Submission = {
  kind?: "exam" | "quiz"; // default exam for backward compat
  examiner?: string;
  applicantName: string;
  timedOut?: boolean;
  timeLimitSeconds?: number;
  timeUsedSeconds?: number;
  mode?: "assessment" | "practice";
  results: Array<Record<string, unknown>>;
};
```

- If `kind === "quiz"`, render quiz-oriented HTML:
  - Title: `{name} — Knowledge Quiz`
  - Score: `correct/total`
  - Mode, timedOut, time used
  - Per item: prompt (truncated), topic, difficulty, ✓/✗, answer summary, optional explanation
- If exam (default), keep existing fields (`title`, `difficulty`, `status`, `passed`, `total`, `code`, `error`) and append timer meta paragraph when present
- Subject: `Exam results:` vs `Quiz results:`

Validate lightly: `applicantName` slice 0–100; ignore unknown fields.

- [ ] **Step 2: Manual smoke** (optional if no Gmail in env) — ensure route still returns 502/200 structure without throwing on quiz body shape using a unit-less typecheck:

```bash
pnpm exec tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git commit -m "feat: support quiz and timer metadata in submit emails"
```

---

### Task 5: Quiz bank — scaffold index + first topic (≥20)

**Files:**
- Create: `lib/quiz/bank/javascript.ts` (≥20 questions, mix all 9 types)
- Create: `lib/quiz/index.ts` (will grow as topics land)
- Create: empty stubs for other topics exporting `[]` temporarily OR implement fully in Task 6

**Id ranges (stable, never reuse):**

| Topic | Id range |
|---|---|
| javascript | 1–30 |
| typescript | 31–60 |
| tailwind | 61–90 |
| react | 91–120 |
| html | 121–150 |
| nodejs | 151–180 |

- [ ] **Step 1: Author `javascript.ts` with ≥20 real junior-level items** covering every `type` at least once. Use clear prompts and `explanation` fields.

Example skeleton (expand to ≥20 — do not ship only the sample):

```ts
import type { QuizQuestion } from "../types";

export const javascriptQuestions: QuizQuestion[] = [
  {
    id: 1,
    type: "single",
    topic: "javascript",
    difficulty: "easy",
    prompt: "Which keyword declares a block-scoped constant?",
    options: [
      { id: "var", label: "var" },
      { id: "let", label: "let" },
      { id: "const", label: "const" },
      { id: "static", label: "static" },
    ],
    correctId: "const",
    explanation: "`const` is block-scoped and cannot be reassigned.",
  },
  // ... continue until ≥20, all types represented
];
```

- [ ] **Step 2: `lib/quiz/index.ts`**

```ts
import type { QuizQuestion, QuizTopic } from "./types";
import { javascriptQuestions } from "./bank/javascript";
// import others as they land

export const quizTopics: QuizTopic[] = [
  "javascript",
  "typescript",
  "tailwind",
  "react",
  "html",
  "nodejs",
];

export const quizQuestions: QuizQuestion[] = [
  ...javascriptQuestions,
  // ...others
];

export function parseQuizIds(raw: string | null): number[] {
  if (!raw) return [];
  const valid = new Set(quizQuestions.map((q) => q.id));
  return raw
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isInteger(n) && valid.has(n));
}

export function getQuizById(id: number): QuizQuestion | undefined {
  return quizQuestions.find((q) => q.id === id);
}
```

- [ ] **Step 3: Commit**

```bash
git commit -m "feat(quiz): add javascript question bank and index helpers"
```

---

### Task 6: Remaining topic banks (≥20 each) + presets

**Files:**
- Create: `lib/quiz/bank/typescript.ts`, `tailwind.ts`, `react.ts`, `html.ts`, `nodejs.ts`
- Create: `lib/quiz/presets.ts`
- Modify: `lib/quiz/index.ts` to aggregate all

- [ ] **Step 1: Author each bank file to ≥20 questions** with mixed difficulties and types. Practical junior content only.

- [ ] **Step 2: Verify counts**

```bash
node --experimental-strip-types -e "
import { quizQuestions, quizTopics } from './lib/quiz/index.ts';
const by = Object.fromEntries(quizTopics.map(t => [t, quizQuestions.filter(q => q.topic===t).length]));
console.log(by, 'total', quizQuestions.length);
if (quizQuestions.length < 120) process.exit(1);
for (const t of quizTopics) if (by[t] < 20) process.exit(1);
const ids = quizQuestions.map(q => q.id);
if (new Set(ids).size !== ids.length) { console.error('duplicate ids'); process.exit(1); }
"
```

Expected: each topic ≥20, total ≥120, unique ids.

- [ ] **Step 3: `lib/quiz/presets.ts`**

```ts
export type QuizPreset = {
  name: string;
  description: string;
  ids: number[];
  suggestedMinutes?: number;
};

export const quizPresets: QuizPreset[] = [
  {
    name: "Quick JS Screen",
    description: "~10 min · core JavaScript knowledge",
    ids: [/* 8–10 js ids */],
    suggestedMinutes: 10,
  },
  {
    name: "React Essentials",
    description: "~15 min · hooks, props, rendering",
    ids: [/* react ids */],
    suggestedMinutes: 15,
  },
  {
    name: "Tailwind Sprint",
    description: "~10 min · utilities and layout",
    ids: [/* tailwind */],
    suggestedMinutes: 10,
  },
  {
    name: "Node API Basics",
    description: "~12 min · modules, HTTP, async",
    ids: [/* node */],
    suggestedMinutes: 12,
  },
  {
    name: "Full Stack Blitz",
    description: "~25 min · mix across the stack",
    ids: [/* mixed */],
    suggestedMinutes: 25,
  },
  {
    name: "Time Attack 10",
    description: "10 min hard limit · dense mixed set",
    ids: [/* 12 mixed */],
    suggestedMinutes: 10,
  },
  {
    name: "Junior Knowledge Full",
    description: "~45 min · broad coverage",
    ids: [/* 25–30 mixed */],
    suggestedMinutes: 45,
  },
];
```

Fill `ids` with real ids from the banks.

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(quiz): complete multi-topic bank and presets"
```

---

### Task 7: Quiz input components + QuestionStage

**Files:**
- Create: `components/quiz/inputs/*.tsx` (9 files)
- Create: `components/quiz/QuestionStage.tsx`
- Create: `components/quiz/QuizProgress.tsx`
- Create: `components/quiz/FeedbackBurst.tsx`

- [ ] **Step 1: Shared input props pattern**

```ts
// each input:
// value: AnswerValue | null
// onChange: (v: AnswerValue) => void
// disabled?: boolean
// question: matching QuizQuestion narrow type
```

- [ ] **Step 2: Implement inputs (Pro Clean cards)**

- `SingleChoice` — big selectable cards  
- `MultiChoice` — checkbox cards; toggle ids in array  
- `BooleanChoice` — two large True/False buttons  
- `FillInput` — text input + optional placeholder  
- `OrderList` — list with ↑/↓ buttons (no new deps)  
- `SnippetPick` — mono code cards  
- `MatchPairs` — for each left item, `<select>` of right labels  
- `HotspotCode` — render `code` split by lines; clickable line groups for regions  
- `OutputInput` — show `code` in pre + text input  

Disabled state: `pointer-events-none opacity-60` when locked/frozen.

- [ ] **Step 3: QuestionStage**

Switch on `question.type` and render the matching input. Show `prompt`, difficulty/topic badges, optional practice `hint` when unlocked.

- [ ] **Step 4: QuizProgress**

Dots or pills for each index: current, locked, answered, empty. `onJump(index)` disabled when frozen.

- [ ] **Step 5: FeedbackBurst**

When practice + locked + graded: green/red banner + `explanation`.

- [ ] **Step 6: Commit**

```bash
git commit -m "feat(quiz): add question inputs, stage, and progress UI"
```

---

### Task 8: Quiz player page `/quiz`

**Files:**
- Create: `app/quiz/page.tsx`

- [ ] **Step 1: Implement player** (mirror exam Suspense + `useSearchParams` pattern)

Behavior checklist:

1. Parse `q`, `e`, `mode`, `t`  
2. Build ordered `sessionQuestions` from ids  
3. Empty → empty state message  
4. State: `index`, `answers: Record<number, AnswerEntry>`, `name`, `submitState`  
5. localStorage key: `quiz-answers:${q}:${mode}`  
6. Time attack: if `limit`, `readStoredClock(sessionStorage, key, limit)` + `setInterval` 250–1000ms updating `remaining`; `isExpired` freezes  
7. On leave question (Next or jump): if has value and not locked → lock + practice grade via `gradeAnswer`  
8. Jump to locked question → read-only  
9. Submit: grade all (null → false), POST `/api/submit` with `kind: "quiz"`, timer meta, mode, results  
10. FreezeOverlay when expired with name + submit controls  
11. Header: TimeAttackBar, progress count, Submit  

- [ ] **Step 2: Manual check in browser**

```bash
pnpm dev
# open /quiz?q=1,2,3&mode=practice
# open /quiz?q=1,2,3&mode=assessment&t=30
```

- [ ] **Step 3: Commit**

```bash
git commit -m "feat(quiz): add gamified quiz player with lock and timer"
```

---

### Task 9: Quiz builder `/admin/quiz`

**Files:**
- Create: `app/admin/quiz/page.tsx`

- [ ] **Step 1: Clone structure from `app/admin/page.tsx`** adapted for quiz:

- Filters: topic, difficulty, type, search, selected-only  
- Preset dialog using `quizPresets` + localStorage `saved-quizzes`  
- Preview dialog showing prompt + type + correct answer (admin only)  
- Aside: selected list, examiner, **mode** toggle, **Time Attack** control  
- Link:  
  `` `${origin}/quiz?q=${ids.join(",")}&e=${examiner}&mode=${mode}${t ? `&t=${t}` : ""}` ``  
- Copy / Preview / Save / Clear  

Time Attack control UI (shared pattern for Task 10):

```tsx
// state: timeMode: "off" | "preset" | "custom"
// presetMinutes: 10 | 15 | 30 | 45 | 60
// customMinutes: number
// seconds = timeMode === "off" ? null : minutesToSeconds(...)
```

- [ ] **Step 2: Manual: build set, copy link, open preview**

- [ ] **Step 3: Commit**

```bash
git commit -m "feat(quiz): add quiz builder with presets mode and timer"
```

---

### Task 10: Exam builder + exam player Time Attack

**Files:**
- Modify: `app/admin/page.tsx`
- Modify: `app/exam/page.tsx`

- [ ] **Step 1: Admin exam — add Time Attack controls** next to examiner; append `&t=` to link when set; reset `copied` on change.

- [ ] **Step 2: Exam player — integrate timer**

- Parse `t` via `parseTimeLimit`  
- `sessionId = exam-answers key` or `p` param  
- On expire: `frozen=true`; disable CodeEditor (readOnly prop — add if missing), Run/Reset, problem list buttons  
- Show TimeAttackBar in header  
- FreezeOverlay with name + submit  
- Pass timer fields in submit body  

If `CodeEditor` lacks `readOnly`, add:

```tsx
// components/CodeEditor.tsx
readOnly?: boolean
// textarea/readOnly={readOnly}
```

- [ ] **Step 3: Manual — short `t=15` exam freeze**

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(exam): configurable time attack with freeze on expiry"
```

---

### Task 11: Home hub + metadata polish

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Home four cards (or 2×2)**

- Take Exam / Build Exam  
- Take Quiz / Build Quiz  

Update stats to include quiz question counts from `quizQuestions`.

- [ ] **Step 2: Metadata**

```ts
title: "Junior Technical Assessment"
description: "Browser-based coding exams and knowledge quizzes for junior candidates."
```

- [ ] **Step 3: Commit**

```bash
git commit -m "feat: dual-lane home for exams and quizzes"
```

---

### Task 12: Verification pass

- [ ] **Step 1: Run automated tests**

```bash
pnpm test
pnpm exec tsc --noEmit
pnpm lint
pnpm build
```

Expected: all pass / build succeeds.

- [ ] **Step 2: Manual checklist**

- [ ] Home shows exam + quiz lanes  
- [ ] Quiz builder filters, presets, mode, timer, copy link  
- [ ] Quiz practice: feedback on leave  
- [ ] Quiz assessment: no mid feedback; email payload shape correct  
- [ ] All 9 input types answerable on a hand-built link with one of each  
- [ ] Timer freezes quiz  
- [ ] Timer freezes exam  
- [ ] Submit exam + quiz (or dry-run network tab body if no Gmail)  
- [ ] `quizQuestions.length >= 120`  

- [ ] **Step 3: Final commit if fixes needed**

```bash
git commit -m "fix: polish quiz and time-attack edge cases"
```

---

## Plan self-review

| Spec requirement | Task |
|---|---|
| Dual home lanes | 11 |
| Quiz builder + presets | 9, 6 |
| Quiz player one-at-a-time | 8 |
| Nine answer types | 1, 7 |
| Assessment/practice mode | 8, 9 |
| Lock-on-leave | 8 |
| 120+ bank | 5, 6 |
| All-or-nothing grade | 1 |
| Time Attack shared | 2, 3, 8, 10 |
| Freeze → submit only | 3, 8, 10 |
| Email exam + quiz | 4, 8, 10 |
| Exam timer configurable | 10 |

No intentional placeholders remaining: content tasks require real authored questions at implementation time (ids ranges fixed).

---

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-22-quiz-and-time-attack.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — fresh subagent per task, review between tasks  
2. **Inline Execution** — execute tasks in this session with checkpoints  

Which approach?
