# Python Exam & Quiz Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a junior Python knowledge quiz bank and six coding-exam problems graded by Pyodide in a Web Worker, with CodeMirror Python highlighting and admin/quiz presets.

**Architecture:** Extend `Problem` with `category: "python"` and `kind: "python"`. Grade via `lib/python-runner.ts`: Node tests call `loadPyodide()` in-process; the browser uses a persistent module worker at `public/python-worker.js` that loads Pyodide from jsDelivr (same version as the `pyodide` npm package) to avoid Next/Turbopack WASM mangling. Quiz adds `lib/quiz/bank/python.ts` and presets. Dispatch through existing `lib/exam-dispatch.ts`.

**Tech Stack:** Next.js 16 App Router, React 19, CodeMirror 6 (`@codemirror/lang-python`), `pyodide`, Node test runner (`node --test`), npm

**Spec:** `docs/superpowers/specs/2026-07-24-python-exam-quiz-design.md`

## Global Constraints

- Spec decisions are locked: Pyodide in a Web Worker for browser; pure `def fn_name(...):` exam style; JSON-friendly returns only; no third-party Python packages
- Quiz IDs: `271–300` (30 questions); Exam IDs: `46–51`
- Do not commit unless the user explicitly asks (skip commit steps or leave uncommitted)
- Read `node_modules/next/dist/docs/` before inventing App Router patterns
- Keep existing JS/React/SQL/Prisma exam + quiz behavior unchanged
- Dynamic-load Pyodide only when a Python problem is run (non-Python exams must not download it)
- Match existing junior tone in banks (short prompts, plausible wrong options, optional `explanation`)
- Pin worker CDN URL to the installed `pyodide` package version (read from `package.json` / `pyodide/package.json` `version` field)

---

## File map

| Path | Responsibility |
|---|---|
| `package.json` / lockfile | Add `pyodide`, `@codemirror/lang-python`; include `lib/python-runner.test.ts` in `scripts.test` |
| `components/CodeEditor.tsx` | Python language extension via `@codemirror/lang-python` |
| `lib/exam-dispatch.ts` | `EditorLanguage` + `"python"`; `runAny` case; language mapping |
| `lib/python-runner.ts` | `runPythonProblem` — Node in-process / browser worker bridge |
| `public/python-worker.js` | Persistent module worker: load Pyodide from CDN, exec + grade |
| `lib/python-runner.test.ts` | Node tests for runner + solutions for 46–51 |
| `lib/problems.ts` | Types + categories + problems 46–51 |
| `lib/runner.test.ts` | Dispatch assertions for python language / routing |
| `app/exam/page.tsx` | “Starting Python…” / “Restarting Python…” while `running && kind === "python"` |
| `app/admin/page.tsx` | Python Basics preset; Junior Full Stack adds `46` |
| `lib/quiz/types.ts` | `"python"` topic |
| `lib/quiz/bank/python.ts` | 30 questions ids 271–300 |
| `lib/quiz/index.ts` | Register bank + topic |
| `lib/quiz/presets.ts` | Python Essentials + fold into mixed presets |
| `app/page.tsx` | Hub copy mentions Python |

---

### Task 1: Dependencies + CodeEditor Python language

**Files:**
- Modify: `package.json`, lockfile
- Modify: `components/CodeEditor.tsx`
- Modify: `lib/exam-dispatch.ts` (EditorLanguage only in this task — full dispatch in Task 3)

**Interfaces:**
- Consumes: none
- Produces: `EditorLanguage` includes `"python"`; `CodeEditor` highlights Python when `language === "python"`

- [ ] **Step 1: Install packages**

```bash
npm install pyodide @codemirror/lang-python
```

Expected: exit 0; both listed under `dependencies`.

- [ ] **Step 2: Extend `EditorLanguage` in `lib/exam-dispatch.ts`**

```ts
export type EditorLanguage = "javascript" | "sql" | "prisma" | "python";
```

Do not add the `runAny` python case yet (Task 3).

- [ ] **Step 3: Update `components/CodeEditor.tsx`**

```tsx
"use client";

import { useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { sql, PostgreSQL } from "@codemirror/lang-sql";
import { python } from "@codemirror/lang-python";
import type { EditorLanguage } from "@/lib/exam-dispatch";

export default function CodeEditor({
  value,
  onChange,
  readOnly = false,
  language = "javascript",
}: {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  language?: EditorLanguage;
}) {
  const extensions = useMemo(() => {
    if (language === "sql") return [sql({ dialect: PostgreSQL })];
    if (language === "prisma") return [];
    if (language === "python") return [python()];
    return [javascript({ jsx: true })];
  }, [language]);

  // ... existing CodeMirror JSX unchanged
}
```

- [ ] **Step 4: Sanity check**

```bash
node -e "import('@codemirror/lang-python').then(m => console.log(typeof m.python))"
```

Expected: `function`

---

### Task 2: Python runner (Node path) — TDD with fixture problem

**Files:**
- Create: `lib/python-runner.ts`
- Create: `lib/python-runner.test.ts`
- Modify: `package.json` (`scripts.test` append `lib/python-runner.test.ts`)

**Interfaces:**
- Consumes: `Problem`, `RunResult` / `TestResult` from `lib/problems.ts` + `lib/runner.ts`
- Produces:
  - `runPythonProblem(problem: Problem, code: string, timeoutMs?: number): Promise<RunResult>`
  - Node (`typeof window === "undefined"`): in-process `loadPyodide()` — no Worker
  - Browser path stubbed or delegated in Task 3 (may throw/`TODO` only if tests stay Node-only; prefer implementing Node branch fully here)

- [ ] **Step 1: Write failing tests** in `lib/python-runner.test.ts`

```ts
import assert from "node:assert";
import test from "node:test";
import type { Problem } from "./problems.ts";
import { runPythonProblem } from "./python-runner.ts";

const filterActive: Problem = {
  id: 9001,
  title: "Fixture Filter",
  category: "python",
  kind: "python",
  difficulty: "easy",
  instructions: "test fixture",
  fnName: "get_active_users",
  starterCode: "def get_active_users(users):\n    pass\n",
  tests: [
    {
      args: [
        [
          { id: 1, name: "John", active: true },
          { id: 2, name: "Maria", active: false },
        ],
      ],
      expected: [{ id: 1, name: "John", active: true }],
    },
    { args: [[]], expected: [] },
  ],
};

test("correct python solution passes", async () => {
  const code = `
def get_active_users(users):
    return [u for u in users if u["active"]]
`;
  const r = await runPythonProblem(filterActive, code);
  assert.strictEqual(r.status, "passed", JSON.stringify(r));
});

test("starter code does not pass", async () => {
  const r = await runPythonProblem(filterActive, filterActive.starterCode);
  assert.notStrictEqual(r.status, "passed");
});

test("syntax errors are reported, not thrown", async () => {
  const r = await runPythonProblem(filterActive, "def get_active_users(users\n");
  assert.strictEqual(r.status, "error");
  assert.ok(r.error);
});

test("missing function is reported", async () => {
  const r = await runPythonProblem(filterActive, "x = 1\n");
  assert.strictEqual(r.status, "error");
  assert.match(r.error ?? "", /get_active_users/);
});

test("wrong values fail", async () => {
  const code = `def get_active_users(users):\n    return users\n`;
  const r = await runPythonProblem(filterActive, code);
  assert.strictEqual(r.status, "failed");
});

test("print output is captured per test", async () => {
  const code = `
def get_active_users(users):
    print("n", len(users))
    return [u for u in users if u["active"]]
`;
  const r = await runPythonProblem(filterActive, code);
  assert.strictEqual(r.status, "passed");
  assert.ok(r.tests[0].logs?.some((l) => l.includes("n")));
});

test("non-JSON-friendly return fails clearly", async () => {
  const code = `
def get_active_users(users):
    return {1, 2, 3}
`;
  const r = await runPythonProblem(filterActive, code);
  assert.strictEqual(r.status, "failed");
  assert.ok(
    (r.tests[0].error ?? "").toLowerCase().includes("json") ||
      (r.tests[0].error ?? "").toLowerCase().includes("list")
  );
});
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
node --test lib/python-runner.test.ts
```

Expected: FAIL (module not found or `runPythonProblem` missing).

- [ ] **Step 3: Implement Node path in `lib/python-runner.ts`**

Core behavior:

1. `loadPyodide()` once (module-level promise cache) — in Node, default artifacts from the `pyodide` package work with no `indexURL` (or set `indexURL` to the package directory if needed).
2. For each run:
   - Reset / redirect stdout into a buffer (Pyodide: patch `sys.stdout` or use `pyodide.setStdout({ batched: (s) => logs.push(s) })` if available; otherwise wrap `print` via `sys.stdout`).
   - `pyodide.runPython(code)` (or `runPythonAsync`) to define the function.
   - Look up `problem.fnName` in `pyodide.globals`; if missing → `{ status: "error", error: "Function ${fnName} was not defined." }`.
   - For each test: convert `test.args` to Python (JSON: `pyodide.toPy` after `JSON.parse(JSON.stringify(args))`), call the function, convert result with `result.toJs({ dict_converter: Object.fromEntries })` then `JSON.parse(JSON.stringify(...))`. If conversion throws (e.g. `set`), mark test failed with message like: `Return value must be JSON-friendly (list, dict, str, int, float, bool, or None).`
   - Deep-equal against `expected` (copy the `deepEqual` helper from `lib/sql-runner.ts` / `lib/runner.ts`).
3. Map to `RunResult` like classic runner (`passed` / `failed` / `error`).
4. Export `runPythonProblem` as `async`.

Browser branch for this task: if `typeof window !== "undefined"`, you may temporarily call the same in-process path **or** leave a clear throw — Task 3 replaces it with the worker. Prefer implementing a shared `gradeWithPyodide(pyodide, problem, code)` used by both paths so Task 3 stays thin.

- [ ] **Step 4: Append to `package.json` scripts.test**

```json
"test": "node --test lib/runner.test.ts lib/quiz/grade.test.ts lib/time-attack.test.ts lib/shuffle.test.ts lib/sql-runner.test.ts lib/prisma-schema.test.ts lib/python-runner.test.ts"
```

- [ ] **Step 5: Run tests — expect PASS**

```bash
node --test lib/python-runner.test.ts
```

Expected: all PASS (first run may be slow while Pyodide loads).

---

### Task 3: Browser worker + exam dispatch + loading UX

**Files:**
- Create: `public/python-worker.js`
- Modify: `lib/python-runner.ts` (browser Worker bridge)
- Modify: `lib/exam-dispatch.ts`
- Modify: `app/exam/page.tsx`
- Modify: `lib/runner.test.ts` (dispatch assertions)

**Interfaces:**
- Consumes: `runPythonProblem` from Task 2
- Produces:
  - Browser: persistent Worker at `/python-worker.js`; timeout terminates + recreates worker
  - `editorLanguageFor`: `kind === "python"` → `"python"`
  - `runAny`: `case "python": return runPythonProblem(problem, code)`

- [ ] **Step 1: Create `public/python-worker.js`** (module worker)

Use jsDelivr full build matching installed pyodide version (replace `0.27.7` with the actual version from `node_modules/pyodide/package.json`):

```js
/* public/python-worker.js — loaded as module worker */
import { loadPyodide } from "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.mjs";

let pyodideReady = loadPyodide({
  indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/",
});

function deepEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null)
    return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a) && Array.isArray(b))
    return a.length === b.length && a.every((v, i) => deepEqual(v, b[i]));
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  return (
    ka.length === kb.length &&
    ka.every((k) => Object.hasOwn(b, k) && deepEqual(a[k], b[k]))
  );
}

function toJsonFriendly(value) {
  if (value === undefined || value === null) return value;
  if (typeof value?.toJs === "function") {
    value = value.toJs({ dict_converter: Object.fromEntries });
  }
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    throw new Error(
      "Return value must be JSON-friendly (list, dict, str, int, float, bool, or None)."
    );
  }
}

self.onmessage = async (event) => {
  const { problem, code } = event.data;
  const logs = [];
  try {
    const pyodide = await pyodideReady;
    pyodide.setStdout?.({ batched: (s) => logs.push(s) });
    await pyodide.runPythonAsync(code);
    const fn = pyodide.globals.get(problem.fnName);
    if (!fn) {
      self.postMessage({
        status: "error",
        tests: [],
        error: `Function ${problem.fnName} was not defined.`,
      });
      return;
    }
    const tests = [];
    for (const test of problem.tests) {
      logs.length = 0;
      try {
        const pyArgs = test.args.map((a) =>
          pyodide.toPy(JSON.parse(JSON.stringify(a)))
        );
        const raw = fn(...pyArgs);
        const actual = toJsonFriendly(raw);
        tests.push({
          test,
          passed: deepEqual(actual, test.expected),
          actual,
          logs: [...logs],
        });
      } catch (error) {
        tests.push({
          test,
          passed: false,
          error: error instanceof Error ? error.message : String(error),
          logs: [...logs],
        });
      }
    }
    self.postMessage({
      status: tests.every((t) => t.passed) ? "passed" : "failed",
      tests,
    });
  } catch (error) {
    self.postMessage({
      status: "error",
      tests: [],
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
```

Keep grading semantics aligned with the Node `gradeWithPyodide` helper (same deepEqual / JSON rules). If drift is painful, generate the worker from a shared string — YAGNI unless tests prove divergence.

- [ ] **Step 2: Browser bridge in `lib/python-runner.ts`**

```ts
let worker: Worker | null = null;

function getWorker(): Worker {
  if (worker) return worker;
  worker = new Worker("/python-worker.js", { type: "module" });
  return worker;
}

function resetWorker() {
  worker?.terminate();
  worker = null;
}

// In runPythonProblem:
// if (typeof window === "undefined") → existing Node path
// else → postMessage to getWorker(); timeoutMs default 8000 (first load needs headroom)
// on timeout: resetWorker(); resolve error "Your code took longer than N seconds..."
// on success: resolve RunResult
```

Default `timeoutMs` for browser: **8000** (Pyodide init + run). After worker is warm, hangs still terminate. Optional: track `pyodideReady` via a first message — not required for v1 if 8s is enough.

- [ ] **Step 3: Wire `lib/exam-dispatch.ts`**

```ts
import { runPythonProblem } from "./python-runner.ts";

export function editorLanguageFor(problem: Problem): EditorLanguage {
  if (problem.kind === "sql") return "sql";
  if (problem.kind === "prisma-schema") return "prisma";
  if (problem.kind === "python") return "python";
  return "javascript";
}

export function runAny(problem: Problem, code: string): Promise<RunResult> {
  switch (problem.kind) {
    case "react":
      return Promise.resolve(runReactProblem(problem, code));
    case "sql":
      return runSqlProblem(problem, code);
    case "prisma-schema":
      return Promise.resolve(runPrismaSchemaProblem(problem, code));
    case "python":
      return runPythonProblem(problem, code);
    default:
      return runProblemSandboxed(problem, code);
  }
}
```

`callLabel` needs no special case — default `fnName(args…)` works.

- [ ] **Step 4: Exam page loading copy** in `app/exam/page.tsx`

Next to the existing SQL banner:

```tsx
{running && problem.kind === "sql" && (
  <span className="self-center text-xs text-slate-500">
    Starting Postgres…
  </span>
)}
{running && problem.kind === "python" && (
  <span className="self-center text-xs text-slate-500">
    Starting Python…
  </span>
)}
```

(Optional: if you surface a restart flag from the runner later, show “Restarting Python…” — v1 can reuse “Starting Python…” after timeout.)

- [ ] **Step 5: Extend dispatch test in `lib/runner.test.ts`**

Inside `shared exam dispatch selects languages, labels, and runners`, after other asserts, add a python fixture **or** (once Task 4 lands) use problem 46. For this task, import `runPythonProblem` indirectly via `runAny` with an inline minimal problem only if problems 46–51 do not exist yet — **defer python problem assert to Task 4 Step 5** if cleaner. Minimum for this task:

```ts
assert.strictEqual(
  editorLanguageFor({
    ...problems[0],
    kind: "python",
    category: "python",
    fnName: "get_active_users",
  }),
  "python"
);
```

- [ ] **Step 6: Run unit tests**

```bash
npm test
```

Expected: PASS (Node python-runner tests + existing suite).

---

### Task 4: Exam problems 46–51

**Files:**
- Modify: `lib/problems.ts`
- Modify: `lib/python-runner.test.ts` (solutions for 46–51)
- Modify: `lib/runner.test.ts` (dispatch with real problem 46)

**Interfaces:**
- Consumes: `kind: "python"`, `runPythonProblem`
- Produces: six problems ids 46–51; `categories` includes `"python"`

- [ ] **Step 1: Extend types in `lib/problems.ts`**

```ts
category:
  | "arrays"
  | "strings"
  | "objects"
  | "logic"
  | "react"
  | "postgresql"
  | "prisma"
  | "python";

kind?: "react" | "sql" | "prisma-schema" | "prisma-client" | "python";

export const categories: Problem["category"][] = [
  "arrays",
  "strings",
  "objects",
  "logic",
  "react",
  "postgresql",
  "prisma",
  "python",
];
```

- [ ] **Step 2: Append problems 46–51**

**46 — Filter Active Users (easy)**  
`fnName: "get_active_users"`  
Same fixtures as JS #1 (list of dicts with `id`, `name`, `active`).  
Starter:

```python
def get_active_users(users):
    # Write your solution here
    pass
```

**47 — Word Lengths (easy)**  
`fnName: "word_lengths"`  
Args: `[["hi", "world"]]` → `[2, 5]`; `[[]]` → `[]`.

**48 — Group by Category (medium)**  
`fnName: "group_by_category"`  
Same shape as JS #10: products `{ name, category }` → dict of name lists.

**49 — Is Palindrome (medium)**  
`fnName: "is_palindrome"`  
Ignore non-alphanumeric and case: `"A man, a plan, a canal: Panama"` → `true`; `"hello"` → `false`.

**50 — Top N Frequencies (medium)**  
`fnName: "top_n_frequencies"`  
Args: `(words: list[str], n: int)` → list of `[word, count]` pairs for the top `n` by count desc, ties by word asc.  
Example: `(["a","b","a","c","b","a"], 2)` → `[["a", 3], ["b", 2]]`.

**51 — Flatten Nested Lists (hard)**  
`fnName: "flatten"`  
Recursively flatten nested lists to a flat list of ints: `[[1,[2,3]],4]` → `[1,2,3,4]`.

All: `category: "python"`, `kind: "python"`. Include ≥2 tests each (except where one thorough case + empty edge is enough — prefer ≥2).

- [ ] **Step 3: Add solutions map + bank test** in `lib/python-runner.test.ts`

```ts
import { problems } from "./problems.ts";

const pythonSolutions: Record<number, string> = {
  46: `def get_active_users(users):\n    return [u for u in users if u["active"]]\n`,
  47: `def word_lengths(words):\n    return [len(w) for w in words]\n`,
  48: `def group_by_category(products):\n    g = {}\n    for p in products:\n        g.setdefault(p["category"], []).append(p["name"])\n    return g\n`,
  49: `def is_palindrome(text):\n    s = "".join(c.lower() for c in text if c.isalnum())\n    return s == s[::-1]\n`,
  50: `def top_n_frequencies(words, n):\n    from collections import Counter\n    counts = Counter(words)\n    ranked = sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))\n    return [[w, c] for w, c in ranked[:n]]\n`,
  51: `def flatten(values):\n    out = []\n    for v in values:\n        if isinstance(v, list):\n            out.extend(flatten(v))\n        else:\n            out.append(v)\n    return out\n`,
};

test("every python problem solution passes", async () => {
  for (const p of problems.filter((x) => x.kind === "python")) {
    const r = await runPythonProblem(p, pythonSolutions[p.id]);
    assert.strictEqual(r.status, "passed", `${p.title}: ${JSON.stringify(r)}`);
  }
});

test("python starter codes do not pass", async () => {
  for (const p of problems.filter((x) => x.kind === "python")) {
    const r = await runPythonProblem(p, p.starterCode);
    assert.notStrictEqual(r.status, "passed", p.title);
  }
});
```

- [ ] **Step 4: Update `lib/runner.test.ts` dispatch test**

```ts
const pythonProblem = problems.find((p) => p.kind === "python")!;
assert.strictEqual(editorLanguageFor(pythonProblem), "python");
assert.strictEqual(
  (await runAny(pythonProblem, /* solution 46 */)).status,
  "passed"
);
```

Import solution string from the python test map or inline the short solution for id 46.

- [ ] **Step 5: Run tests**

```bash
npm test
```

Expected: PASS.

---

### Task 5: Exam admin presets

**Files:**
- Modify: `app/admin/page.tsx` (`presets` array)

**Interfaces:**
- Produces: **Python Basics** preset ids `[46, 47, 48, 49, 50, 51]`; **Junior Full Stack** includes `46`

- [ ] **Step 1: Append / update presets**

```ts
{
  name: "Python Basics",
  description: "~40 min · list/dict/string challenges on Pyodide",
  ids: [46, 47, 48, 49, 50, 51],
},
```

Update Junior Full Stack:

```ts
{
  name: "Junior Full Stack",
  description:
    "~60 min · JS/React junior mix plus SQL, Prisma, and one Python item",
  ids: [1, 2, 6, 9, 12, 28, 34, 43, 46],
},
```

- [ ] **Step 2: Manual sanity** — open `/admin`, select Python Basics, confirm link `?p=46,47,48,49,50,51`.

---

### Task 6: Quiz topic + Python bank

**Files:**
- Modify: `lib/quiz/types.ts`
- Create: `lib/quiz/bank/python.ts`
- Modify: `lib/quiz/index.ts`

**Interfaces:**
- Produces: `QuizTopic` includes `"python"`; `pythonQuestions` length **30**; ids **271–300**

- [ ] **Step 1: Extend `QuizTopic`**

```ts
export type QuizTopic =
  | "javascript"
  | "typescript"
  | "tailwind"
  | "react"
  | "html"
  | "nodejs"
  | "css"
  | "postgresql"
  | "prisma"
  | "python";
```

- [ ] **Step 2: Author `lib/quiz/bank/python.ts`**

Export `pythonQuestions: QuizQuestion[]` with **exactly 30** items, ids **271–300**, `topic: "python"`.

Type-mix targets (approximate): ~10 `single`, ~4 `multi`, ~3 `boolean`, ~4 `fill`, ~2 `order`, ~3 `snippet`, ~2 `match`, ~1 `hotspot`, ~1 `output`.

Cover (~18 core + ~12 interview-flavored):

- Core: `None` vs falsy, `list`/`tuple`/`dict`/`set`, mutability, slicing, comprehensions, `*args`/`**kwargs`, default mutable-arg pitfall, truthiness, `is` vs `==`, `try`/`except`, `with`, `self`, `range`/`enumerate`/`zip`, `import` / `from … import`, f-strings  
- Interview: list/dict idioms, `sorted(..., key=)`, set membership, string methods, list vs dict lookup cost intuition, “what does this print?”

Example starter item:

```ts
{
  id: 271,
  type: "single",
  topic: "python",
  difficulty: "easy",
  prompt: "Which built-in type is immutable?",
  options: [
    { id: "a", label: "list" },
    { id: "b", label: "dict" },
    { id: "c", label: "tuple" },
    { id: "d", label: "set" },
  ],
  correctId: "c",
  explanation: "Tuples are immutable; lists, dicts, and sets are mutable.",
},
```

Author all 30 fully (no stubs).

- [ ] **Step 3: Register in `lib/quiz/index.ts`**

Import `pythonQuestions`, add `"python"` to `quizTopics`, spread into `quizQuestions`.

- [ ] **Step 4: Sanity check**

```bash
node -e "import { quizQuestions, quizTopics } from './lib/quiz/index.ts'; const n=quizQuestions.filter(q=>q.topic==='python'); console.log(quizTopics.includes('python'), n.length, n[0].id, n.at(-1).id)"
```

Expected: `true 30 271 300`

---

### Task 7: Quiz presets + hub copy

**Files:**
- Modify: `lib/quiz/presets.ts`
- Modify: `app/page.tsx`

**Interfaces:**
- Produces: **Python Essentials** preset; updated Full Stack Blitz / Junior Knowledge Full / Time Attack 10; hub mentions Python

- [ ] **Step 1: Add Python Essentials**

```ts
{
  name: "Python Essentials",
  description:
    "Core Python types, control flow, and list/dict interview idioms.",
  ids: [271, 272, 273, 274, 276, 279, 281, 282, 284, 286, 288, 290, 293],
  suggestedMinutes: 15,
},
```

(Adjust ids to real easy/medium picks after the bank exists — all must be in 271–300.)

- [ ] **Step 2: Fold into mixed presets**

- **Full Stack Blitz** — add ~3 python ids (e.g. `271, 274, 281`); update description to mention Python  
- **Time Attack 10** — replace one id or append by swapping one existing for `271` (keep length 10)  
- **Junior Knowledge Full** — append first 12 python ids `271–282` and note in description  

- [ ] **Step 3: Hub copy** in `app/page.tsx`

Update the line that lists topics so it includes Python (e.g. “Postgres, Prisma, Python, and more.”).

- [ ] **Step 4: Sanity**

```bash
node -e "
import { quizPresets } from './lib/quiz/presets.ts';
import { getQuizById } from './lib/quiz/index.ts';
for (const p of quizPresets) {
  for (const id of p.ids) {
    if (!getQuizById(id)) throw new Error(p.name + ' missing ' + id);
  }
}
console.log('presets ok', quizPresets.length);
"
```

Expected: `presets ok` with no throw.

---

### Task 8: End-to-end verification

**Files:** none (manual / scripted checks)

- [ ] **Step 1: Unit suite**

```bash
npm test
```

Expected: all PASS.

- [ ] **Step 2: Dev server smoke**

```bash
npm run dev
```

- Open `/exam?p=46` — editor shows Python highlighting; Run Tests with correct solution passes; wrong solution fails; “Starting Python…” appears on first run  
- Open `/admin` — category chip `python`, preset Python Basics  
- Open `/admin/quiz` — topic `python`, preset Python Essentials builds a valid `/quiz?q=…` link  
- Open `/quiz?q=271,272,273` — questions render and grade  

- [ ] **Step 3: Regression**

- `/exam?p=1` still runs JS  
- `/exam?p=34` still runs SQL  
- Non-python exam does not request `python-worker.js` or jsDelivr pyodide until a python problem is run  

---

## Self-review (plan vs spec)

| Spec requirement | Task |
|---|---|
| Quiz bank ~30, topic `python`, ids 271–300 | Task 6 |
| Quiz presets + Full Stack / Knowledge Full / Time Attack | Task 7 |
| Exam kind `python`, category `python`, ids 46–51 | Task 4 |
| Pyodide Web Worker | Task 3 (`public/python-worker.js`) |
| Pure functions + JSON-friendly returns | Tasks 2–4 |
| CodeMirror python | Task 1 |
| `runAny` / `editorLanguageFor` | Task 3 |
| Starting Python… UX | Task 3 |
| Admin Python Basics + Junior Full Stack +46 | Task 5 |
| Node tests for runner + solutions | Tasks 2, 4 |
| No third-party Python packages | Global + solutions use stdlib only (`collections.Counter` OK) |
| Lazy load | Worker/CDN only on python run |

No TBD placeholders remain; CDN version must be read from installed `pyodide` at implement time (called out in Global Constraints + Task 3).
