# Python Exam & Quiz — Design Spec

**Date:** 2026-07-24  
**Status:** Approved  
**Repo:** `basic-technical-interview` (Next.js App Router, React 19, Tailwind 4)

## Summary

Add a junior **Python** track to both builders:

1. **Knowledge Quiz** — new `python` topic bank (~30 questions) + presets  
2. **Coding Exam** — ~6 problems with `kind: "python"`, graded by running candidate code in the browser via **Pyodide in a Web Worker**

## Goals

- Quiz coverage of core Python (~60%) plus interview-flavored list/dict/string concepts (~40%)  
- Exam problems that feel like the existing JS array/string/object challenges, written as pure Python functions  
- Same UX patterns as other exam kinds (dispatch by `kind`, language-aware editor, Run Tests / Submit)  
- Lazy-load Pyodide only when a Python problem is run so non-Python exams stay light  

## Non-goals (v1)

- Third-party packages (`numpy`, `pandas`, etc.)  
- Async Python, typing/mypy exercises, Django/Flask app shells  
- Server-side Python execution  
- Generators-as-primary topic, decorators-as-class, metaclasses  
- Offline-first packaging of the full Pyodide asset tree beyond normal browser cache  
- Python language server / autocomplete beyond CodeMirror highlighting  

## Product decisions (locked)

| Topic | Decision |
|---|---|
| Surfaces | Quiz **and** exam |
| Runtime | Pyodide in a dedicated Web Worker |
| Exam style | Pure functions (`def fn_name(...):`); deepEqual on JSON-friendly return values |
| Editor | CodeMirror `@codemirror/lang-python` |
| Content level | Junior screen (basics + list/dict/string challenges) |
| Quiz IDs | `271–300` (after Prisma `241–265`) |
| Exam IDs | `46–51` (after Prisma client `43–45`) |
| Ship style | Unified (one coherent Python track) |

## Quiz model

Extend `QuizTopic` and registry:

```ts
// lib/quiz/types.ts
type QuizTopic = /* existing */ | "python";

// lib/quiz/bank/python.ts — ~30 QuizQuestion items, ids 271–300
// lib/quiz/index.ts — register bank + topic in quizTopics
```

### Content mix

| Mix | Topics |
|---|---|
| ~18 core | types/`None`, `list`/`tuple`/`dict`/`set`, mutability, slicing, comprehensions, `*args`/`**kwargs`, default args, truthiness, `is` vs `==`, exceptions, `with`, basic classes/`self`, `range`/`enumerate`/`zip`, `import`, f-strings |
| ~12 interview-flavored | list/dict idioms, sorting keys, set membership, string methods, big-O intuition for common ops, “what does this print?” |

Use the existing question `type`s (`single`, `multi`, `boolean`, `fill`, `order`, `snippet`, `match`, `hotspot`, `output`). Difficulty: easy-heavy with some medium/hard.

### Presets

- New **Python Essentials** preset (~12–15 ids, ~15 min)  
- Fold a few python ids into **Full Stack Blitz**, **Junior Knowledge Full** (first 12: `271–282`), and **Time Attack 10**

## Exam problem model

Extend `lib/problems.ts`:

```ts
category: /* existing */ | "python"
kind?: "react" | "sql" | "prisma-schema" | "prisma-client" | "python"
```

Add `"python"` to `categories`.

### Kind: `python`

- Candidate completes a `def fnName(...):` function (snake_case names)  
- Tests: `{ args, expected }` — same shape as classic JS problems  
- Returns must be JSON-friendly: `list`, `dict`, `str`, `int`, `float`, `bool`, `None`  
- Non-JSON-friendly returns (e.g. `set`, custom objects) → fail that test with a clear message  
- Starter code: `def fn_name(...):\n    pass`  
- `fnName` is the Python function name used by the runner  

### Problem list (working titles)

| id | Title | Difficulty | Idea |
|---|---|---|---|
| 46 | Filter Active Users | easy | list of dicts → active only (Python twin of JS #1) |
| 47 | Word Lengths | easy | map strings → lengths |
| 48 | Group by Category | medium | dict of lists from products |
| 49 | Is Palindrome | medium | ignore non-alnum / case |
| 50 | Top N Frequencies | medium | count words → top n |
| 51 | Flatten Nested Lists | hard | flatten nested lists |

### Dispatch

Update `lib/exam-dispatch.ts`:

```ts
export type EditorLanguage = "javascript" | "sql" | "prisma" | "python";

editorLanguageFor: kind === "python" → "python"

runAny:
  case "python": return runPythonProblem(problem, code)
```

`callLabel` uses the same `fnName(args…)` format as classic JS (via `formatValue`).

Admin exam builder: category filter works via `categories`; add **Python Basics** preset (ids `46–51`). Add one easy python id (`46`) to **Junior Full Stack**.

## Runner architecture

### Module: `lib/python-runner.ts`

1. Lazy-create a **persistent** Web Worker on first Python run  
2. Worker loads Pyodide once (`loadPyodide`), then for each run:  
   - `exec` candidate source  
   - resolve `fnName` in globals (error if missing)  
   - call with args bridged from JS (JSON round-trip)  
   - convert return value to plain JSON for deepEqual against `expected`  
3. Capture stdout/`print` into `logs` (parallel to JS `console.log` capture)  
4. Timeout: terminate worker; next run recreates worker and re-inits Pyodide; UI shows “Restarting Python…”  
5. First-run UI: “Starting Python…” while Pyodide downloads/initializes (mirror SQL’s “Starting Postgres…”)  

### Assets & loading

- Depend on the `pyodide` package (or documented CDN `indexURL`)  
- Load only when a Python problem is run (dynamic import; client-only — no SSR)  
- Prefer the official CDN/`indexURL` pattern so we avoid vendoring the full multi-MB tree into `public/` unless Next.js forces local assets (spike in implementation plan; if CDN fails CORS/CSP in this app, fall back to copying assets like PGlite)  
- Non-Python exams must not download Pyodide  

### Comparison / grading

Reuse the same deepEqual semantics as `lib/runner.ts` (object key order independence, array order matters). Prefer comparing on the JS side after converting Pyodide results to plain JSON.

## Code editor

- Extend `EditorLanguage` with `"python"`  
- Wire `@codemirror/lang-python` in `components/CodeEditor.tsx` when `language === "python"`  

## Errors & UX

| Case | Behavior |
|---|---|
| Syntax / missing `fnName` | Top-level `status: "error"` with clear message |
| Per-test exception | That test fails with `error` + captured stdout |
| Timeout / hang | Terminate worker; recreate + re-init on next run |
| Non-JSON return | Test fail with message requesting list/dict/str/int/bool/None |
| First load | “Starting Python…” banner |
| Non-Python exam | Unchanged; no Pyodide network cost |

## Testing

| Area | Approach |
|---|---|
| `lib/python-runner.test.ts` | Node: load Pyodide in Node and grade sample solutions for problems 46–51 |
| Exam dispatch | Assert `editorLanguageFor` → `"python"`; `runAny` routes to Python runner |
| Quiz | Preset ids exist in bank; topic registered; `parseQuizIds` accepts new ids |
| Manual | `/exam?p=46` run/pass; quiz admin shows `python` topic |

## File map (expected)

| Path | Change |
|---|---|
| `lib/quiz/types.ts` | Add `"python"` to `QuizTopic` |
| `lib/quiz/bank/python.ts` | New bank (~30 questions) |
| `lib/quiz/index.ts` | Register bank + topic |
| `lib/quiz/presets.ts` | Python Essentials + fold into mixed presets |
| `lib/problems.ts` | `category`/`kind` + problems 46–51 |
| `lib/python-runner.ts` | New Pyodide worker runner |
| `lib/python-runner.test.ts` | Node tests |
| `lib/exam-dispatch.ts` | Language + `runAny` case |
| `components/CodeEditor.tsx` | Python language support |
| `app/admin/page.tsx` | Python Basics preset (+ optional Junior Full Stack tweak) |
| `app/admin/quiz/page.tsx` | Topic UI picks up new topic via registry (no special case if already dynamic) |
| `package.json` | `pyodide`, `@codemirror/lang-python` |

## Success criteria

- Candidate can take a Python-only quiz and a Python-only exam end-to-end  
- Classic JS/React/SQL/Prisma paths unchanged  
- First Python Run shows loading, then grades correctly against bank solutions  
- Timed-out Python code does not freeze the exam tab  
