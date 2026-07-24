# Prisma + PostgreSQL Exam & Quiz Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add PostgreSQL + Prisma knowledge quiz banks and coding-exam kinds (PGlite SQL execution, Prisma schema structural grading, Prisma client args via existing JS runner), plus updated presets.

**Architecture:** Extend `Problem` with `kind: "sql" | "prisma-schema" | "prisma-client"` and categories `postgresql` | `prisma`. Dispatch runners like React: SQL → async PGlite; schema → custom parser + structural match; client → existing `runProblemSandboxed`. Quiz adds two topic banks and preset updates. CodeMirror gains `language` prop.

**Tech Stack:** Next.js 16 App Router, React 19, CodeMirror 6, `@electric-sql/pglite`, `@codemirror/lang-sql`, Node test runner (`node --test`), pnpm

**Spec:** `docs/superpowers/specs/2026-07-24-prisma-postgres-exam-quiz-design.md`

## Global Constraints

- Spec decisions are locked: PGlite for SQL; custom schema subset parser; prisma-client returns query args object via JS fn
- Quiz IDs: postgresql `211–235`, prisma `241–265` (leave gaps like existing banks)
- Exam IDs: SQL `34–39`, prisma-schema `40–42`, prisma-client `43–45`
- Do not commit unless the user explicitly asks (skip commit steps or leave uncommitted)
- Read `node_modules/next/dist/docs/` before inventing App Router patterns
- Keep existing JS/React exam + quiz behavior unchanged
- Dynamic-import PGlite only when running SQL problems
- Match existing junior tone in banks (short prompts, plausible wrong options, optional `explanation`)

---

## File map

| Path | Responsibility |
|---|---|
| `package.json` / lockfile | Add `@electric-sql/pglite`, `@codemirror/lang-sql` |
| `next.config.ts` | `serverExternalPackages: ['@electric-sql/pglite']` if build needs it |
| `components/CodeEditor.tsx` | `language?: "javascript" \| "sql" \| "prisma"` |
| `lib/problems.ts` | Extend types + add problems 34–45 + categories |
| `lib/sql-runner.ts` | Async PGlite grade |
| `lib/sql-runner.test.ts` | SQL runner tests |
| `lib/prisma-schema.ts` | Parse + `schemaContains` helpers |
| `lib/prisma-schema-runner.ts` | Grade schema problems |
| `lib/prisma-schema.test.ts` | Parser + runner tests |
| `lib/runner.test.ts` | Exclude non-JS kinds from classic `runProblem` loops |
| `lib/exam-language.ts` | Map `kind` → editor language + shared `runAny` / `callLabel` helpers (optional; may inline) |
| `app/exam/page.tsx` | Dispatch + language + SQL loading UX |
| `app/admin/page.tsx` | Presets, `callLabel`, preview language if editor shown |
| `lib/quiz/types.ts` | Add topics |
| `lib/quiz/bank/postgresql.ts` | ~25 questions |
| `lib/quiz/bank/prisma.ts` | ~25 questions |
| `lib/quiz/index.ts` | Register banks |
| `lib/quiz/presets.ts` | New + updated presets |
| `app/page.tsx` | Hub copy mentions data/ORM |
| `package.json` `scripts.test` | Include new `*.test.ts` files |

---

### Task 1: Dependencies + CodeEditor languages

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml`
- Modify: `components/CodeEditor.tsx`
- Modify: `next.config.ts`

**Interfaces:**
- Consumes: none
- Produces: `CodeEditor` props `{ value, onChange, readOnly?, language?: "javascript" | "sql" | "prisma" }` (default `"javascript"`)

- [ ] **Step 1: Install packages**

```bash
pnpm add @electric-sql/pglite @codemirror/lang-sql
```

Expected: exit 0; both listed under `dependencies`.

- [ ] **Step 2: Update `next.config.ts`**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@electric-sql/pglite"],
};

export default nextConfig;
```

- [ ] **Step 3: Extend `CodeEditor`**

Replace `components/CodeEditor.tsx` with language-aware extensions:

```tsx
"use client";

import { useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { sql, PostgreSQL } from "@codemirror/lang-sql";

export type EditorLanguage = "javascript" | "sql" | "prisma";

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
    if (language === "prisma") return []; // plain text v1
    return [javascript({ jsx: true })];
  }, [language]);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-700">
      <CodeMirror
        value={value}
        height="380px"
        minHeight="380px"
        theme="dark"
        extensions={extensions}
        basicSetup
        indentWithTab
        readOnly={readOnly}
        editable={!readOnly}
        onChange={onChange}
        aria-label="Code editor"
        className="text-sm"
      />
    </div>
  );
}
```

If `PostgreSQL` is not exported from the installed `@codemirror/lang-sql` version, use `sql()` without dialect and note in a comment.

- [ ] **Step 4: Smoke-check resolve**

```bash
node -e "require.resolve('@electric-sql/pglite'); require.resolve('@codemirror/lang-sql'); console.log('ok')"
```

Expected: `ok`

---

### Task 2: Problem types + SQL runner (TDD)

**Files:**
- Modify: `lib/problems.ts` (types + `categories` only in this task — problems added in Task 3)
- Create: `lib/sql-runner.ts`
- Create: `lib/sql-runner.test.ts`
- Modify: `package.json` `scripts.test` to include `lib/sql-runner.test.ts`

**Interfaces:**
- Consumes: `Problem`, `TestCase` with optional `setupSql?: string`
- Produces: `runSqlProblem(problem: Problem, code: string): Promise<RunResult>` (same `RunResult` shape as `lib/runner.ts`)

- [ ] **Step 1: Extend types in `lib/problems.ts`**

Update:

```ts
export type TestCase = {
  args: unknown[];
  expected: unknown;
  clickOn?: string;
  clicks?: number;
  /** SQL problems: seed schema + data before candidate query. */
  setupSql?: string;
};

export type Problem = {
  id: number;
  title: string;
  category:
    | "arrays"
    | "strings"
    | "objects"
    | "logic"
    | "react"
    | "postgresql"
    | "prisma";
  kind?: "react" | "sql" | "prisma-schema" | "prisma-client";
  difficulty: "easy" | "medium" | "hard";
  instructions: string;
  fnName: string;
  starterCode: string;
  tests: TestCase[];
};

export const categories: Problem["category"][] = [
  "arrays",
  "strings",
  "objects",
  "logic",
  "react",
  "postgresql",
  "prisma",
];
```

- [ ] **Step 2: Write failing SQL runner tests**

Create `lib/sql-runner.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import type { Problem } from "./problems.ts";
import { runSqlProblem } from "./sql-runner.ts";

const filterActive: Problem = {
  id: 9001,
  title: "Filter Active (fixture)",
  category: "postgresql",
  kind: "sql",
  difficulty: "easy",
  instructions: "Select active users",
  fnName: "query",
  starterCode: "-- write SQL",
  tests: [
    {
      args: [],
      setupSql: `
        CREATE TABLE users (id INT PRIMARY KEY, name TEXT, active BOOLEAN);
        INSERT INTO users VALUES (1, 'John', true), (2, 'Maria', false), (3, 'Peter', true);
      `,
      expected: [
        { id: 1, name: "John", active: true },
        { id: 3, name: "Peter", active: true },
      ],
    },
  ],
};

test("correct SELECT passes", async () => {
  const r = await runSqlProblem(
    filterActive,
    "SELECT id, name, active FROM users WHERE active = true ORDER BY id;"
  );
  assert.equal(r.status, "passed", JSON.stringify(r));
});

test("wrong SELECT fails", async () => {
  const r = await runSqlProblem(filterActive, "SELECT id, name, active FROM users;");
  assert.equal(r.status, "failed");
});

test("syntax error reports error status", async () => {
  const r = await runSqlProblem(filterActive, "SELEC oops");
  assert.equal(r.status, "error");
  assert.ok(r.error || r.tests.some((t) => t.error));
});
```

- [ ] **Step 3: Run tests — expect FAIL (module missing)**

```bash
node --test lib/sql-runner.test.ts
```

Expected: FAIL cannot find module `./sql-runner.ts`

- [ ] **Step 4: Implement `lib/sql-runner.ts`**

```ts
import type { Problem } from "./problems.ts";
import type { RunResult, TestResult } from "./runner.ts";

function deepEqual(a: unknown, b: unknown): boolean {
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
    ka.every(
      (k) =>
        Object.hasOwn(b, k) &&
        deepEqual(
          (a as Record<string, unknown>)[k],
          (b as Record<string, unknown>)[k]
        )
    )
  );
}

/** Normalize PGlite row values (e.g. bigint) for deepEqual with JSON-ish expected. */
function normalizeRows(rows: Record<string, unknown>[]): Record<string, unknown>[] {
  return rows.map((row) => {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(row)) {
      out[k] = typeof v === "bigint" ? Number(v) : v;
    }
    return out;
  });
}

export async function runSqlProblem(
  problem: Problem,
  code: string
): Promise<RunResult> {
  const { PGlite } = await import("@electric-sql/pglite");
  const tests: TestResult[] = [];

  for (const testCase of problem.tests) {
    const db = new PGlite();
    try {
      if (testCase.setupSql) await db.exec(testCase.setupSql);
      const result = await db.query(code);
      const actual = normalizeRows(
        (result.rows ?? []) as Record<string, unknown>[]
      );
      const passed = deepEqual(actual, testCase.expected);
      tests.push({
        test: testCase,
        passed,
        actual,
        error: passed ? undefined : "Result rows did not match expected",
      });
    } catch (error) {
      tests.push({
        test: testCase,
        passed: false,
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      await db.close?.();
    }
  }

  if (tests.some((t) => t.error && !t.passed && t.actual === undefined)) {
    const first = tests.find((t) => t.error);
    const allSetupErrors = tests.every((t) => !t.passed && t.actual === undefined);
    if (allSetupErrors && tests.length === 1) {
      return { status: "error", tests, error: first?.error };
    }
  }

  const status = tests.every((t) => t.passed)
    ? "passed"
    : tests.every((t) => t.actual === undefined)
      ? "error"
      : "failed";

  return {
    status,
    tests,
    error: status === "error" ? tests.find((t) => t.error)?.error : undefined,
  };
}
```

Tune status logic so the Task 2 tests pass (`correct` → passed, `wrong` → failed, `syntax` → error). Prefer mirroring `runProblem`’s status conventions.

- [ ] **Step 5: Run tests — expect PASS**

```bash
node --test lib/sql-runner.test.ts
```

Expected: all tests pass.

- [ ] **Step 6: Update `package.json` test script**

Append `lib/sql-runner.test.ts` (and later schema test) to the existing `node --test ...` list.

---

### Task 3: SQL exam problems 34–39 + runner.test exclusions

**Files:**
- Modify: `lib/problems.ts` (append 6 SQL problems)
- Modify: `lib/runner.test.ts` (skip non-JS kinds)

**Interfaces:**
- Produces: problems with `id` 34–39, `kind: "sql"`, `category: "postgresql"`

- [ ] **Step 1: Exclude non-JS from classic runner loops**

In `lib/runner.test.ts`, replace filters:

```ts
function isClassicJsProblem(p: { kind?: string }) {
  return p.kind === undefined || p.kind === "prisma-client";
}
```

Use `problems.filter(isClassicJsProblem)` wherever the file currently uses `kind !== "react"`.

- [ ] **Step 2: Add SQL problems**

Append to `problems` array (exact content — keep junior-level):

**34 — Active Users (easy):** setup `users(id, name, active)`; expected rows where `active = true` ordered by id. Starter: `-- SELECT active users\n`.

**35 — Orders for Customer (easy):** setup `customers` + `orders`; select order id+total for customer name `'Maria'` ordered by id.

**36 — Count by Status (medium):** setup `tickets(id, status)`; `SELECT status, COUNT(*)::int AS count ... GROUP BY status ORDER BY status`.

**37 — Recent Posts (medium):** setup `posts(id, title, published_at)`; filter `published_at >= '2024-01-01'` order by date desc.

**38 — Insert Returning (medium):** setup empty `products(id SERIAL PRIMARY KEY, name TEXT, price NUMERIC)`; candidate `INSERT ... RETURNING id, name, price` for one row; expected that returned row (note: if SERIAL varies, assert on name/price only — prefer fixed `INSERT ... VALUES (1, 'Mug', 9.5) RETURNING id, name, price` with id supplied).

**39 — Join + Filter (medium):** customers ⋈ orders where total > 100; return customer name + order id ordered by order id.

Each problem: `fnName: "query"`, `args: []` on every test, at least 1–2 tests with distinct setups when useful.

Include a second test on at least problems 34 and 36 with different seed data.

- [ ] **Step 3: Add SQL solution coverage test**

Create or extend `lib/sql-runner.test.ts` with a map of official solutions for ids 34–39 and assert each `status === "passed"`, and starter code does not pass.

- [ ] **Step 4: Run**

```bash
node --test lib/sql-runner.test.ts lib/runner.test.ts
```

Expected: PASS

---

### Task 4: Prisma schema parser + runner + problems 40–42

**Files:**
- Create: `lib/prisma-schema.ts`
- Create: `lib/prisma-schema-runner.ts`
- Create: `lib/prisma-schema.test.ts`
- Modify: `lib/problems.ts` (problems 40–42)
- Modify: `package.json` test script

**Interfaces:**
- Produces:
  - `parsePrismaSchema(source: string): PrismaSchemaAst` (throws on unsupported/invalid)
  - `schemaContains(actual: PrismaSchemaAst, expected: PrismaSchemaAst): boolean`
  - `runPrismaSchemaProblem(problem: Problem, code: string): RunResult`

```ts
export type PrismaFieldAst = {
  name: string;
  type: string; // e.g. "String", "Int", "Post[]", "User"
  attributes: string[]; // normalized: "id", "unique", "default(cuid())", "relation"
};

export type PrismaModelAst = {
  name: string;
  fields: PrismaFieldAst[];
};

export type PrismaEnumAst = {
  name: string;
  values: string[];
};

export type PrismaSchemaAst = {
  enums: PrismaEnumAst[];
  models: PrismaModelAst[];
};
```

**Supported subset only:** `model`, `enum`, fields `Name Type` with optional `@id` `@unique` `@default(...)` `@relation(...)`, list types `Type[]`, optional `Type?`. Ignore `generator` / `datasource` blocks if present (skip until matching `}`). Reject unknown `@` attributes with a clear error.

- [ ] **Step 1: Write parser/runner tests**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { parsePrismaSchema, schemaContains } from "./prisma-schema.ts";
import { runPrismaSchemaProblem } from "./prisma-schema-runner.ts";
import type { Problem } from "./problems.ts";

test("parses model with id and unique email", () => {
  const ast = parsePrismaSchema(`
    model User {
      id    Int    @id
      email String @unique
      name  String
    }
  `);
  assert.equal(ast.models[0].name, "User");
  assert.ok(
    schemaContains(ast, {
      enums: [],
      models: [
        {
          name: "User",
          fields: [
            { name: "id", type: "Int", attributes: ["id"] },
            { name: "email", type: "String", attributes: ["unique"] },
            { name: "name", type: "String", attributes: [] },
          ],
        },
      ],
    })
  );
});

test("1-n relation fields parse", () => {
  const ast = parsePrismaSchema(`
    model User {
      id    Int    @id
      posts Post[]
    }
    model Post {
      id       Int  @id
      authorId Int
      author   User @relation(fields: [authorId], references: [id])
    }
  `);
  assert.equal(ast.models.length, 2);
});

const userEmail: Problem = {
  id: 9002,
  title: "fixture",
  category: "prisma",
  kind: "prisma-schema",
  difficulty: "easy",
  instructions: "x",
  fnName: "schema",
  starterCode: "",
  tests: [
    {
      args: [],
      expected: {
        enums: [],
        models: [
          {
            name: "User",
            fields: [
              { name: "id", type: "Int", attributes: ["id"] },
              { name: "email", type: "String", attributes: ["unique"] },
            ],
          },
        ],
      },
    },
  ],
};

test("schema runner passes matching schema", () => {
  const r = runPrismaSchemaProblem(
    userEmail,
    `model User {\n  id Int @id\n  email String @unique\n}`
  );
  assert.equal(r.status, "passed");
});

test("schema runner fails missing unique", () => {
  const r = runPrismaSchemaProblem(
    userEmail,
    `model User {\n  id Int @id\n  email String\n}`
  );
  assert.equal(r.status, "failed");
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
node --test lib/prisma-schema.test.ts
```

- [ ] **Step 3: Implement parser + `schemaContains` + runner**

`schemaContains`: for each expected enum/model, find by name; for each expected field, find by name and require `type` equal and every expected attribute ⊆ actual attributes (order-independent). Extra fields on actual are OK.

`runPrismaSchemaProblem`: parse once; for each test, `schemaContains(ast, expected)`; map to `RunResult` like classic runner (sync).

- [ ] **Step 4: Add problems 40–42**

- **40 Unique User Email (easy):** require `User` with `id Int @id`, `email String @unique`
- **41 User–Post 1-n (medium):** `User.posts Post[]`, `Post.author User @relation(fields: [authorId], references: [id])` + `authorId Int`
- **42 Role enum (medium):** `enum Role { USER ADMIN }` and `User.role Role`

Starter code can include commented skeleton. `fnName: "schema"`.

- [ ] **Step 5: Run tests PASS**

```bash
node --test lib/prisma-schema.test.ts
```

---

### Task 5: Prisma client problems 43–45 + exam/admin dispatch

**Files:**
- Modify: `lib/problems.ts` (43–45)
- Modify: `lib/runner.test.ts` (add solutions for 43–45)
- Create: `lib/exam-dispatch.ts` (shared `runAny`, `callLabel`, `editorLanguageFor`)
- Modify: `app/exam/page.tsx`
- Modify: `app/admin/page.tsx` (`callLabel` only — keep preview as starter/tests text)

**Interfaces:**
- Produces:
  - `editorLanguageFor(problem: Problem): EditorLanguage`
  - `runAny(problem: Problem, code: string): Promise<RunResult>`
  - `callLabel(problem: Problem, t: TestCase): string`

- [ ] **Step 1: Add prisma-client problems**

All `category: "prisma"`, `kind: "prisma-client"`, JavaScript functions returning args objects.

**43 — Active Users Args (easy):**

```js
function findActiveUsersArgs() {
  // return args for prisma.user.findMany(...)
}
```

Expected: `{ where: { active: true } }` (and optionally allow `orderBy` absent). Tests call `findActiveUsersArgs()` with `args: []`.

**44 — Posts With Author (medium):** return args for `findMany` with `include: { author: true }` and `where: { published: true }`.

**45 — Create Post Connect (medium):** return args for `create` with `data: { title: "Hi", author: { connect: { id: 1 } } }`.

- [ ] **Step 2: Add solutions to `lib/runner.test.ts` `solutions` map** for 43–45; ensure `isClassicJsProblem` includes them.

- [ ] **Step 3: Create `lib/exam-dispatch.ts`**

```ts
import type { Problem, TestCase } from "./problems.ts";
import type { EditorLanguage } from "@/components/CodeEditor";
import { runProblemSandboxed, formatValue, type RunResult } from "./runner.ts";
import { runReactProblem } from "./react-runner.ts";
import { runSqlProblem } from "./sql-runner.ts";
import { runPrismaSchemaProblem } from "./prisma-schema-runner.ts";

export function editorLanguageFor(problem: Problem): EditorLanguage {
  if (problem.kind === "sql") return "sql";
  if (problem.kind === "prisma-schema") return "prisma";
  return "javascript";
}

export function callLabel(problem: Problem, t: TestCase): string {
  if (problem.kind === "sql") return "SQL query → rows";
  if (problem.kind === "prisma-schema") return "schema structure";
  if (problem.kind === "react") {
    const props = Object.entries((t.args[0] ?? {}) as Record<string, unknown>)
      .map(([k, v]) => `${k}={${formatValue(v)}}`)
      .join(" ");
    const clicks = t.clicks
      ? ` then click <${t.clickOn}> ×${t.clicks}`
      : "";
    return `<${problem.fnName}${props ? " " + props : ""} />${clicks}`;
  }
  return `${problem.fnName}(${t.args.map((a) => formatValue(a)).join(", ")})`;
}

export function runAny(problem: Problem, code: string): Promise<RunResult> {
  switch (problem.kind) {
    case "react":
      return Promise.resolve(runReactProblem(problem, code));
    case "sql":
      return runSqlProblem(problem, code);
    case "prisma-schema":
      return Promise.resolve(runPrismaSchemaProblem(problem, code));
    default:
      return runProblemSandboxed(problem, code);
  }
}
```

If importing `EditorLanguage` from a client component into a shared lib causes bundling issues, define `EditorLanguage` in `lib/exam-dispatch.ts` (or `lib/editor-language.ts`) and import that type from `CodeEditor` instead.

- [ ] **Step 4: Wire `app/exam/page.tsx`**

- Replace local `runAny` / `callLabel` with imports from `lib/exam-dispatch.ts`
- Pass `language={editorLanguageFor(problem)}` to `CodeEditor`
- When `problem.kind === "sql"`, show subtle status text while awaiting (“Starting Postgres…” / “Running SQL…”) using existing result-loading state if present; if none, add `const [running, setRunning] = useState(false)` around Run Tests

- [ ] **Step 5: Wire `app/admin/page.tsx`**

- Import shared `callLabel` (remove local duplicate)
- Ensure category filter chips pick up new categories via `categories` export (already mapped from `categories` array)

- [ ] **Step 6: Run unit tests**

```bash
pnpm test
```

Expected: PASS (including new ids in classic JS solutions where applicable)

---

### Task 6: Exam presets

**Files:**
- Modify: `app/admin/page.tsx` (`presets` array)

**Interfaces:**
- Produces: new preset entries referencing real ids 34–45

- [ ] **Step 1: Append presets** (do not remove existing)

```ts
{
  name: "Postgres Basics",
  description: "~35 min · SQL filters, joins, aggregates on PGlite",
  ids: [34, 35, 36, 37],
},
{
  name: "Prisma Modeling",
  description: "~35 min · schema relations plus client query args",
  ids: [40, 41, 43, 44],
},
{
  name: "Data Layer Screen",
  description: "~50 min · SQL + Prisma schema + client args",
  ids: [34, 36, 39, 40, 41, 43],
},
{
  name: "Junior Full Stack",
  description: "~60 min · JS/React junior mix plus one SQL and one Prisma item",
  ids: [1, 2, 6, 9, 12, 28, 34, 43],
},
```

Verify ids exist after Task 3–5.

---

### Task 7: Quiz topics + PostgreSQL bank

**Files:**
- Modify: `lib/quiz/types.ts`
- Create: `lib/quiz/bank/postgresql.ts`
- Modify: `lib/quiz/index.ts`

**Interfaces:**
- Produces: `QuizTopic` includes `"postgresql" | "prisma"`; `postgresqlQuestions` length 25; ids 211–235

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
  | "prisma";
```

- [ ] **Step 2: Author `lib/quiz/bank/postgresql.ts`**

25 questions, ids **211–235**, topic `"postgresql"`. Type mix target (mirror nodejs):

| Type | Count (approx) |
|---|---|
| single | 6 |
| multi | 3 |
| boolean | 3 |
| fill | 3 |
| order | 2 |
| snippet | 2 |
| match | 2 |
| hotspot | 2 |
| output | 2 |

Cover: SELECT/WHERE, ORDER/LIMIT, INNER JOIN, GROUP BY/COUNT, NULL vs unknown, PK/FK, index purpose, BEGIN/COMMIT, `RETURNING`, `ILIKE`, JSONB `->`/`->>` basics, `COUNT(*)` vs counting column.

Example first item:

```ts
{
  id: 211,
  type: "single",
  topic: "postgresql",
  difficulty: "easy",
  prompt: "Which clause filters rows before grouping?",
  options: [
    { id: "a", label: "WHERE" },
    { id: "b", label: "HAVING" },
    { id: "c", label: "LIMIT" },
    { id: "d", label: "OFFSET" },
  ],
  correctId: "a",
  explanation: "WHERE filters rows; HAVING filters groups after GROUP BY.",
},
```

Author all 25 fully (no stubs).

- [ ] **Step 3: Register in `lib/quiz/index.ts`**

Import `postgresqlQuestions`, add `"postgresql"` to `quizTopics`, spread into `quizQuestions`.

- [ ] **Step 4: Sanity check**

```bash
node -e "import { quizQuestions } from './lib/quiz/index.ts'; const n=quizQuestions.filter(q=>q.topic==='postgresql'); console.log(n.length, n[0].id, n.at(-1).id)"
```

Expected: `25 211 235`

---

### Task 8: Prisma quiz bank

**Files:**
- Create: `lib/quiz/bank/prisma.ts`
- Modify: `lib/quiz/index.ts`

**Interfaces:**
- Produces: 25 questions ids **241–265**, topic `"prisma"`

- [ ] **Step 1: Author bank** with same type-mix targets as Task 7.

Cover: `provider = "postgresql"`, model/field scalars, `@id`/`@unique`/`@default`, 1-n `@relation`, n-n implicit, `findUnique` vs `findMany`, `where`/`include`/`select`, `create`/`update`/`delete`, `migrate dev` vs `db push` (conceptual), cascading deletes conceptual, Client is generated from schema.

- [ ] **Step 2: Register** in `index.ts` (`"prisma"` in topics + spread).

- [ ] **Step 3: Sanity check** `25 241 265`

---

### Task 9: Quiz presets + hub copy

**Files:**
- Modify: `lib/quiz/presets.ts`
- Modify: `app/page.tsx`

- [ ] **Step 1: Add presets**

```ts
{
  name: "PostgreSQL Essentials",
  description: "SELECT/JOIN/aggregates, keys, and junior Postgres pitfalls.",
  ids: [211, 212, 213, 214, 216, 219, 221, 222, 224, 226, 228, 230, 233],
  suggestedMinutes: 15,
},
{
  name: "Prisma Essentials",
  description: "Schema modeling, relations, and Client CRUD/query args.",
  ids: [241, 242, 243, 244, 246, 249, 251, 252, 254, 256, 258, 260, 263],
  suggestedMinutes: 15,
},
{
  name: "Data Layer Blitz",
  description: "Mixed Postgres + Prisma for a short data-layer screen.",
  ids: [211, 214, 219, 224, 230, 241, 244, 249, 254, 260],
  suggestedMinutes: 20,
},
```

Adjust ids if a chosen id’s difficulty/type is awkward — keep count.

- [ ] **Step 2: Update existing presets**

- **Full Stack Blitz:** append `211, 214, 241, 244`
- **Time Attack 10:** replace two items with `211, 241` (keep length 10)
- **Junior Knowledge Full:** append first 12 postgres (`211–222`) and first 12 prisma (`241–252`)

- [ ] **Step 3: Hub copy**

In `app/page.tsx`, update quiz lane blurb to mention Postgres/Prisma, e.g. “JS, React, Postgres, Prisma, and more.”

---

### Task 10: Verification pass

**Files:** none new (fix only)

- [ ] **Step 1: Unit tests**

```bash
pnpm test
```

Expected: all PASS

- [ ] **Step 2: Production build**

```bash
pnpm build
```

Expected: exit 0. If PGlite/WASM fails, fix `next.config.ts` / client-only imports (sql-runner only imported from client exam dispatch paths).

- [ ] **Step 3: Manual smoke (dev)**

```bash
pnpm dev
```

Check:

1. `/admin` — filter `postgresql` / `prisma`; load **Data Layer Screen** preset; preview labels sane  
2. `/exam?p=34,40,43` — SQL highlighting; Run Tests passes with correct SQL; schema problem grades; client args problem grades  
3. `/admin/quiz` — topics postgresql/prisma; **Prisma Essentials** preset link loads  
4. `/quiz?q=211,241&mode=practice` — questions render and grade  

- [ ] **Step 4: Spec coverage checklist**

Confirm each success criterion in the design spec is met.

---

## Spec coverage (self-review)

| Spec requirement | Task |
|---|---|
| CodeEditor languages | 1 |
| PGlite SQL runner + setupSql | 2–3 |
| SQL problems 34–39 | 3 |
| Prisma schema parser subset + 40–42 | 4 |
| Prisma client args 43–45 via JS runner | 5 |
| Exam dispatch + loading UX | 5 |
| Exam presets (+ Junior Full Stack additive) | 6 |
| Quiz postgresql + prisma banks | 7–8 |
| Quiz presets + Full Stack / Time Attack / Junior Full updates | 9 |
| Hub copy | 9 |
| Tests + build | 10 |
| Dynamic import PGlite | 2 (`sql-runner`) |
| Non-goals respected (no real Prisma Client DB, no migrate tasks) | all |

**Placeholder scan:** Quiz bank bodies are authored in Tasks 7–8 (same pattern as original quiz plan). SQL/Prisma exam problem narratives are specified by id/behavior; implementers write full `starterCode`/`tests` objects in Task 3–5.

**Type consistency:** `kind` union, `setupSql`, `PrismaSchemaAst`, `runSqlProblem` / `runPrismaSchemaProblem` / `runAny` names are stable across tasks.
