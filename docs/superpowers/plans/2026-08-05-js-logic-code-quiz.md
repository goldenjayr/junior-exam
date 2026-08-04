# JS Logic Code Quiz Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 10 JavaScript logic/code-trace quiz questions (ids 301–310) and a “JS Logic Trace” admin preset.

**Architecture:** Data-only change. Append questions to the existing `javascript` bank and register one preset. No new topic, types, grading, or admin UI.

**Tech Stack:** Existing quiz bank (`QuizQuestion` in TypeScript), Node test runner (`npm test`).

## Global Constraints

- IDs: exactly `301–310`, topic `"javascript"`
- Types: `output` ×4, `hotspot` ×3, `order` ×3
- Difficulty mix: junior + mid (~3 easy / ~5 medium / ~2 hard)
- Spec: `docs/superpowers/specs/2026-08-05-js-logic-code-quiz-design.md`
- Do not fold new ids into Full Stack Blitz / Junior Knowledge Full

---

### Task 1: Bank registration test for ids 301–310

**Files:**
- Modify: `lib/quiz/grade.test.ts`
- Modify (later): `lib/quiz/bank/javascript.ts`

**Interfaces:**
- Consumes: `quizQuestions` from `lib/quiz/index.ts`
- Produces: failing test until Task 2 lands questions 301–310

- [ ] **Step 1: Write the failing test**

Append to `lib/quiz/grade.test.ts`:

```ts
test("registers JS logic-trace questions 301–310", () => {
  const logic = quizQuestions.filter(
    (q) => q.topic === "javascript" && q.id >= 301 && q.id <= 310
  );
  assert.strictEqual(logic.length, 10);
  assert.deepStrictEqual(
    logic.map((q) => q.id),
    [301, 302, 303, 304, 305, 306, 307, 308, 309, 310]
  );
  const byType = Object.fromEntries(
    ["output", "hotspot", "order"].map((t) => [
      t,
      logic.filter((q) => q.type === t).length,
    ])
  );
  assert.deepStrictEqual(byType, { output: 4, hotspot: 3, order: 3 });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- lib/quiz/grade.test.ts`
Expected: FAIL — `logic.length` is `0` (or not `10`)

- [ ] **Step 3: Commit test**

```bash
git add lib/quiz/grade.test.ts
git commit -m "test: expect JS logic-trace quiz ids 301–310"
```

---

### Task 2: Append questions 301–310 to javascript bank

**Files:**
- Modify: `lib/quiz/bank/javascript.ts` (append before closing `];`)

**Interfaces:**
- Consumes: `QuizQuestion` type from `../types.ts`
- Produces: 10 new bank entries registered via existing `javascriptQuestions` spread in `index.ts`

- [ ] **Step 1: Append the 10 questions**

Replace the trailing `];` of `javascriptQuestions` with the following entries then `];`. Exact content:

```ts
  {
    id: 301,
    type: "output",
    topic: "javascript",
    difficulty: "easy",
    prompt: "What is logged (three values, space-separated)?",
    code: `for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}`,
    accept: ["3 3 3", "3, 3, 3", "3,3,3"],
    explanation:
      "`var` is function-scoped; all three timeouts see the final `i` after the loop finishes.",
  },
  {
    id: 302,
    type: "output",
    topic: "javascript",
    difficulty: "medium",
    prompt: "What is logged?",
    code: `"use strict";
const obj = {
  n: 1,
  get() {
    return this && this.n;
  },
};
const g = obj.get;
console.log(g());`,
    accept: ["undefined"],
    explanation:
      "Extracting the method loses the receiver. Calling `g()` unbound makes `this` falsy under the guard, so the expression yields `undefined` instead of `1`.",
  },
  {
    id: 303,
    type: "order",
    topic: "javascript",
    difficulty: "medium",
    prompt: "Order these from earliest to latest in the event loop:",
    items: [
      { id: "sync", label: "Synchronous console.log on the call stack" },
      { id: "promise", label: "Promise.then callback (microtask)" },
      { id: "timeout", label: "setTimeout(fn, 0) callback (macrotask)" },
    ],
    correctOrder: ["sync", "promise", "timeout"],
    explanation:
      "The current stack runs first; then the microtask queue drains before the next macrotask.",
  },
  {
    id: 304,
    type: "hotspot",
    topic: "javascript",
    difficulty: "easy",
    prompt: "Click the line that throws at runtime.",
    code: `const user = { name: "Ada" };
user.age = 30;
user = { name: "Grace" };
console.log(user.name);`,
    regions: [
      { id: "r1", label: "Line 1: const declaration", startLine: 1, endLine: 1 },
      { id: "r2", label: "Line 2: mutate property", startLine: 2, endLine: 2 },
      { id: "r3", label: "Line 3: reassign const", startLine: 3, endLine: 3 },
      { id: "r4", label: "Line 4: log", startLine: 4, endLine: 4 },
    ],
    correctRegionId: "r3",
    explanation:
      "Property mutation on a const object is fine; reassigning the binding throws.",
  },
  {
    id: 305,
    type: "output",
    topic: "javascript",
    difficulty: "medium",
    prompt: "What is logged?",
    code: `const a = { x: 1 };
const b = a;
b.x = 2;
console.log(a.x);`,
    accept: ["2"],
    explanation: "`b` aliases `a`; mutating `b.x` mutates the same object.",
  },
  {
    id: 306,
    type: "order",
    topic: "javascript",
    difficulty: "hard",
    prompt:
      "Order the logged labels from earliest to latest.\n\n```js\nconsole.log(\"S\");\nPromise.resolve()\n  .then(() => {\n    console.log(\"M1\");\n    return Promise.resolve();\n  })\n  .then(() => console.log(\"M2\"));\nsetTimeout(() => console.log(\"T\"), 0);\n```",
    items: [
      { id: "S", label: '"S"' },
      { id: "M1", label: '"M1"' },
      { id: "M2", label: '"M2"' },
      { id: "T", label: '"T"' },
    ],
    correctOrder: ["S", "M1", "M2", "T"],
    explanation:
      "Nested microtasks still run before the next macrotask (`setTimeout`).",
  },
  {
    id: 307,
    type: "hotspot",
    topic: "javascript",
    difficulty: "medium",
    prompt: "Click the line that causes a Temporal Dead Zone ReferenceError.",
    code: `console.log(a);
let a = 1;
var b = 2;
console.log(b);`,
    regions: [
      { id: "r1", label: "Line 1: log a before init", startLine: 1, endLine: 1 },
      { id: "r2", label: "Line 2: let a", startLine: 2, endLine: 2 },
      { id: "r3", label: "Line 3: var b", startLine: 3, endLine: 3 },
      { id: "r4", label: "Line 4: log b", startLine: 4, endLine: 4 },
    ],
    correctRegionId: "r1",
    explanation:
      "`let`/`const` are in the TDZ until initialized; accessing `a` on line 1 throws.",
  },
  {
    id: 308,
    type: "output",
    topic: "javascript",
    difficulty: "hard",
    prompt: "What is logged (three values, space-separated)?",
    code: `setTimeout(() => console.log("A"), 0);
Promise.resolve().then(() => console.log("B"));
console.log("C");`,
    accept: ["C B A", "C, B, A", "C,B,A"],
    explanation: "Sync `C` first; microtask `B` before macrotask `A`.",
  },
  {
    id: 309,
    type: "hotspot",
    topic: "javascript",
    difficulty: "medium",
    prompt: "Click the line that mutates the original `nums` array.",
    code: `const nums = [3, 1, 2];
const sorted = nums.sort();
console.log(nums);
console.log(sorted);`,
    regions: [
      { id: "r1", label: "Line 1: declare nums", startLine: 1, endLine: 1 },
      { id: "r2", label: "Line 2: nums.sort()", startLine: 2, endLine: 2 },
      { id: "r3", label: "Line 3: log nums", startLine: 3, endLine: 3 },
      { id: "r4", label: "Line 4: log sorted", startLine: 4, endLine: 4 },
    ],
    correctRegionId: "r2",
    explanation:
      "`sort` mutates in place and returns the same array reference; prefer `toSorted` or a copy for immutability.",
  },
  {
    id: 310,
    type: "order",
    topic: "javascript",
    difficulty: "easy",
    prompt: "Order the typical steps to handle a successful async fetch of JSON:",
    items: [
      { id: "fetch", label: "fetch(url)" },
      { id: "res", label: "await response.json()" },
      { id: "use", label: "use the parsed data" },
    ],
    correctOrder: ["fetch", "res", "use"],
    explanation: "Get a Response, parse the body, then work with the data.",
  },
];
```

- [ ] **Step 2: Run tests**

Run: `npm test -- lib/quiz/grade.test.ts`
Expected: PASS including `registers JS logic-trace questions 301–310`

- [ ] **Step 3: Commit**

```bash
git add lib/quiz/bank/javascript.ts
git commit -m "feat: add JS logic-trace quiz questions 301–310"
```

---

### Task 3: Add “JS Logic Trace” preset

**Files:**
- Modify: `lib/quiz/presets.ts` (insert after “Quick JS Screen”)

**Interfaces:**
- Consumes: ids `301–310` from Task 2
- Produces: preset visible in `/admin/quiz` “Start from a preset…”

- [ ] **Step 1: Insert preset**

After the Quick JS Screen object, add:

```ts
  {
    name: "JS Logic Trace",
    description:
      "Junior–mid code-tracing: closures, this, references, TDZ, mutation, and event-loop order.",
    ids: [301, 302, 303, 304, 305, 306, 307, 308, 309, 310],
    suggestedMinutes: 15,
  },
```

- [ ] **Step 2: Smoke-check admin**

Run: `npm test -- lib/quiz/grade.test.ts` (still green)

Manual: open `/admin/quiz` → Start from a preset… → “JS Logic Trace” loads 10 questions.

- [ ] **Step 3: Commit**

```bash
git add lib/quiz/presets.ts
git commit -m "feat: add JS Logic Trace quiz preset"
```

---

## Spec coverage

| Spec item | Task |
|---|---|
| Questions 301–310 in `javascript.ts` | Task 2 |
| Type mix 4/3/3 | Task 1 asserts + Task 2 |
| Preset “JS Logic Trace” | Task 3 |
| No new topic / UI / grading | (no tasks) |
| Not folding into Full Stack Blitz | (explicit non-goal) |
