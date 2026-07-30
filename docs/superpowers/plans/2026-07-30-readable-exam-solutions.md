# Readable Official Exam Solutions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite compressed official exam solutions in `lib/exam-solutions.ts` so `?cheat=1` shows readable, commented code that still passes all tests.

**Architecture:** Single source of truth remains `examSolutions`. Rewrite strings in place with descriptive names, multi-line formatting, and a short approach comment. No UI or runner changes.

**Tech Stack:** TypeScript string map; existing `npm test` / `node --test` runners.

## Global Constraints

- Same algorithms and return values as current solutions (must keep `status: "passed"`).
- One short leading comment (1–2 lines) per rewritten solution.
- Descriptive names; no new helpers/libraries beyond current usage.
- Scope: solutions **1–27** and **43–45** only.
- Do not add React solutions 28–33.

---

### Task 1: Rewrite JS solutions 1–27 and Prisma client helpers 43–45

**Files:**
- Modify: `lib/exam-solutions.ts`
- Test: `lib/runner.test.ts` (existing — no new tests required)

**Interfaces:**
- Consumes: `Problem` ids from `lib/problems.ts`; runners call `examSolutions[id]` as candidate code.
- Produces: Same `Record<number, string>` export shape; `getExamSolution(id)` unchanged.

- [ ] **Step 1: Confirm baseline tests pass**

Run: `npm test`
Expected: all tests PASS (including “every problem has a solution that passes all its tests”).

- [ ] **Step 2: Rewrite solutions 1–27 and 43–45 in place**

Replace each targeted entry with multi-line code + a short approach comment. Keep function names matching `fnName` / current exports. Example for id 1:

```js
// Keep users whose active flag is true.
function getActiveUsers(users) {
  return users.filter((user) => user.active);
}
```

Apply the same style to all of 1–27 and 43–45. Leave SQL (34–39), Prisma schema (40–42), Python (46–51), and TypeScript (52–57) as-is unless a trivial whitespace-only consistency fix is needed.

- [ ] **Step 3: Re-run tests**

Run: `npm test`
Expected: all PASS. If any fail, fix that solution’s logic (not the tests) until green.

- [ ] **Step 4: Commit**

```bash
git add lib/exam-solutions.ts
git commit -m "$(cat <<'EOF'
refactor: make official exam solutions easier to read

Expand compressed cheat answers with clear names, formatting, and short approach comments.
EOF
)"
```

---

## Spec coverage

| Spec requirement | Task |
| --- | --- |
| In-place rewrite in `exam-solutions.ts` | Task 1 |
| Style: names, multi-line, comments | Task 1 Step 2 |
| Scope 1–27 and 43–45 | Task 1 |
| `npm test` still passes | Task 1 Steps 1 & 3 |
| Out of scope (quiz/React/UI) | Not implemented |
