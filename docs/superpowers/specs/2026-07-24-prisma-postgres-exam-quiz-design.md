# Prisma + PostgreSQL Exam & Quiz — Design Spec

**Date:** 2026-07-24  
**Status:** Approved  
**Repo:** `basic-technical-interview` (Next.js App Router, React 19, Tailwind 4)

## Summary

Add a junior **data layer** track to both builders:

1. **Knowledge Quiz** — new `postgresql` and `prisma` topic banks + updated presets  
2. **Coding Exam** — new problem kinds with language-aware editing and hybrid grading:
   - **SQL** → execute candidate queries against **PGlite** (WASM Postgres)
   - **Prisma schema** → parse + structural match (no Prisma CLI runtime)
   - **Prisma client** → JS function returns query args object; graded like classic problems (deepEqual)

## Goals

- Honest PostgreSQL syntax in the coding exam (real Postgres dialect via PGlite)  
- Prisma coverage for both schema modeling and client query API  
- Same UX patterns as existing React `kind` problems (dispatch runner by kind)  
- Quiz banks at ~current topic depth (~25 questions each)  
- New dedicated presets + fold data topics into Full Stack / Junior Full presets  

## Non-goals (v1)

- Real Prisma Client against a live database / `prisma generate` in the browser  
- Migrations, Prisma Migrate, Prisma Accelerate, Pulse, or Studio as exam tasks  
- Auth, server-side question CMS, or storing exams in Postgres  
- Teaching advanced DBA topics (replication, vacuum tuning, WAL internals)  
- Full Prisma schema language server / autocomplete  
- Offline-first caching of the PGlite WASM asset beyond normal browser cache  

## Product decisions (locked)

| Topic | Decision |
|---|---|
| Surfaces | Quiz **and** exam |
| SQL runtime | `@electric-sql/pglite` (in-memory, per-run) |
| Prisma schema grading | Parse + structural compare |
| Prisma client grading | JS fn returns args object; sandboxed deepEqual (no Prisma runtime / no DB) |
| Prisma exam mix | Schema problems **and** client-query problems |
| Ship style | Unified (one coherent data track) |
| Editor | CodeMirror language by problem kind (`javascript` / `sql` / `prisma`-as-plain or custom) |
| Content level | Junior fullstack screen (CRUD, joins, relations, findMany/include) |

## Exam problem model

Extend `lib/problems.ts`:

```ts
category: /* existing */ | "postgresql" | "prisma"
kind?: "react" | "sql" | "prisma-schema" | "prisma-client"
```

### Kind: `sql`

- Candidate writes a SQL statement (or short script) in the editor  
- Extend `TestCase` with optional `setupSql?: string` (required for `kind: "sql"`)  
- Each test provides:
  - `setupSql` — seed schema + rows (run before candidate code)  
  - `expected` — result rows as array of objects (column keys as returned by PGlite), deepEqual  
  - `args` — unused for SQL v1 (keep `[]` for type compatibility)  
- Runner flow per test:
  1. Create fresh in-memory `PGlite`  
  2. Execute `setupSql`  
  3. Execute candidate SQL  
  4. Compare result rows to `expected` (normalize column names / order as documented per problem)  
- `fnName` can be a display label like `query` (kept for UI compatibility)  
- Starter code: commented SQL template or empty `SELECT`

### Kind: `prisma-schema`

- Candidate completes a `.prisma` schema fragment (models, fields, relations, enums)  
- Tests assert structural expectations, e.g.:
  - model `User` exists with fields `id`, `email` (unique), `posts` relation  
  - `Post.author` → `User` with correct relation attributes  
- Grading: parse schema → normalized AST/map → deepEqual against `expected` structure  
- Parser: **custom lightweight parser** for a documented subset (models, enums, `@id`, `@unique`, `@default`, `@relation`, scalar types). No full Prisma language server; reject unsupported constructs with a clear error  

### Kind: `prisma-client`

- Candidate completes a JS function (same sandbox pattern as classic problems) that **returns the query args object**  
- Problem instructions name the target `model` + `method` (e.g. “return the args for `prisma.user.findMany(...)`”)  
- Grading: run the function (existing JS runner path or thin wrapper) → deepEqual returned args against `expected`  
- Do **not** require parsing `prisma.x.y(...)` call strings in v1 — keeps grading aligned with current `fnName` + `tests.args` style

### Dispatch

Update `runAny` in `app/exam/page.tsx` (and admin preview):

```ts
switch (problem.kind) {
  case "react": return runReactProblem(...)
  case "sql": return runSqlProblem(...)        // async (PGlite)
  case "prisma-schema": return runPrismaSchemaProblem(...)
  case "prisma-client": // fall through — same as classic JS
  default: return runProblemSandboxed(...)
}
```

Admin preview + `callLabel` must handle SQL/Prisma display (show setup hint / expected shape, not fake `fn(args)` when misleading).

## Runners & dependencies

| Module | Role |
|---|---|
| `lib/sql-runner.ts` | Async PGlite setup → exec → compare rows |
| `lib/prisma-schema-runner.ts` | Parse schema → structural tests |
| `lib/runner.ts` | Classic JS **and** `prisma-client` (args object deepEqual) |

**Dependency:** `@electric-sql/pglite`  
- Load only when a SQL problem is run (dynamic import) so non-SQL exams stay light  
- Next config: add to `serverExternalPackages` if SSR/build requires it; SQL runner is client-side only (same constraint as React runner)  
- Show a brief “Starting Postgres…” state on first SQL Run Tests  

**Tests:** Node test files for schema/client graders; SQL runner tests in Node via PGlite (supported in Node — add to `npm test`).

## Code editor

Extend `CodeEditor`:

```ts
language?: "javascript" | "sql" | "prisma"
```

- `javascript` — existing `@codemirror/lang-javascript` (jsx)  
- `sql` — `@codemirror/lang-sql` (PostgreSQL dialect if available)  
- `prisma` — start with plain text or SQL-adjacent highlighting; optional simple StreamLanguage later (non-blocking for v1)

Exam/admin pass language from `problem.kind`.

## Content volume (v1 targets)

### Quiz banks

| Topic | File | ID range | Count |
|---|---|---|---|
| `postgresql` | `lib/quiz/bank/postgresql.ts` | 211–235 | ~25 |
| `prisma` | `lib/quiz/bank/prisma.ts` | 241–265 | ~25 |

Register in `QuizTopic`, `quizTopics`, `quizQuestions`.

**PostgreSQL topics (junior):** SELECT/WHERE, ORDER/LIMIT, JOINs, GROUP BY/aggregates, NULL, PRIMARY/FOREIGN KEY, indexes (what/why), transactions basics, `RETURNING`, `ILIKE`, JSON/JSONB basics, common pitfalls.

**Prisma topics (junior, current ORM practices):** `schema.prisma` models/fields, relations (`@relation`, 1-n, n-n), `prisma migrate` vs `db push` (conceptual), Client CRUD (`findUnique`/`findMany`/`create`/`update`/`delete`), `where`/`include`/`select`, uniqueness, cascading deletes (conceptual), Prisma + Postgres provider string.

Use the same question-type mix as existing banks (single, multi, boolean, fill, order, snippet, match, hotspot, output).

### Exam problems

| Kind | IDs (approx) | Count | Difficulty mix |
|---|---|---|---|
| `sql` | 34–39 | 6 | easy → medium |
| `prisma-schema` | 40–42 | 3 | easy → medium |
| `prisma-client` | 43–45 | 3 | easy → medium |

Examples:

- SQL: filter active users; join orders+customers; count by status; insert with `RETURNING`  
- Schema: User/Post 1-n; unique email; enum Role  
- Client: `findMany` with `where`+`orderBy`; `include` relation; `create` with nested connect  

## Presets

### Exam (`app/admin/page.tsx` presets)

Keep presets inline (existing pattern). Add:

- **Postgres Basics** — SQL ids only (~30–40 min)  
- **Prisma Modeling** — schema + client ids (~30–40 min)  
- **Data Layer Screen** — mix of SQL + Prisma (~45–50 min)  

Also add **Junior Full Stack** (do not rewrite **Junior Standard**): existing junior mix + 1 SQL + 1 Prisma problem.

### Quiz (`lib/quiz/presets.ts`)

Add:

- **PostgreSQL Essentials** — ~12–15 ids, ~15 min  
- **Prisma Essentials** — ~12–15 ids, ~15 min  
- **Data Layer Blitz** — mixed Postgres + Prisma, ~20 min  

Update:

- **Full Stack Blitz** — append a few Postgres + Prisma ids  
- **Time Attack 10** — swap or add 1–2 data items  
- **Junior Knowledge Full** — first 12 from each new topic  

## UI touchpoints

- Exam builder category filters: include `postgresql`, `prisma`  
- Quiz builder topic filters: include new topics  
- Exam player: language-aware editor; async Run Tests for SQL; loading/error copy for PGlite init failures  
- Home hub copy: mention data/ORM screening if product blurb lists topics  

## Architecture sketch

```text
Exam Run Tests
  ├─ kind undefined     → runProblemSandboxed (Worker + JS)
  ├─ react              → runReactProblem (Sucrase + React)
  ├─ sql                → dynamic import PGlite → setupSql → candidate → compare
  ├─ prisma-schema      → parse schema → structural deepEqual
  └─ prisma-client      → runProblemSandboxed (fn returns args object)

Quiz
  └─ bank/{postgresql,prisma}.ts → grade.ts (unchanged engine)
```

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| PGlite WASM size / first-load lag | Dynamic import; only on SQL run; loading UI |
| Prisma schema parser incompleteness | Document supported subset; keep problems inside subset |
| Schema problems too picky on formatting | Normalize parsed structure (field order independent where safe); grade structure not pretty-print |
| Next.js bundling friction | Client-only runner; `serverExternalPackages` if needed |
| ID collisions in quiz bank | Reserve 211–235 and 241–265; leave gaps like existing banks |

## Success criteria

- Builder can filter/select Postgres + Prisma quiz items and exam problems  
- New presets produce valid share links  
- SQL problems pass only when query returns correct rows on PGlite  
- Prisma schema/client problems pass on structural match, fail on wrong relations/filters  
- Existing JS/React exams and quizzes unchanged in behavior  
- `npm test` covers new graders; app builds successfully  

## Implementation outline (for planning skill)

1. Types + CodeEditor language support  
2. SQL runner + 6 SQL problems + admin/exam dispatch  
3. Prisma schema + client runners + 6 Prisma problems  
4. Quiz banks (postgresql, prisma) + type registration  
5. Exam + quiz preset updates  
6. Tests + light hub copy  
