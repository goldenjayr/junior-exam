# Readable Official Exam Solutions (cheat=1)

## Problem

With `?cheat=1`, the exam UI reveals strings from `lib/exam-solutions.ts`. Early JavaScript solutions (1–27) and Prisma client helpers (43–45) are compressed one-liners with abbreviated names, which are hard to learn from. Later Python/TypeScript solutions are already readable.

## Goal

Make official answers developer-friendly: easy to scan, with clear names and a short approach comment, while keeping the same graded behavior.

## Approach

Rewrite solutions **in place** in `lib/exam-solutions.ts` (single source of truth for tests and cheat reveal). No separate “teaching” map. No UI changes.

## Scope

**In scope**
- JavaScript solutions **1–27**
- Prisma client JS helpers **43–45**
- Same algorithms; descriptive names; multi-line formatting
- One short leading comment (1–2 lines) per solution explaining the approach

**Out of scope**
- Quiz cheat formatting (`lib/quiz/reveal.ts`)
- React exam solutions **28–33** (no solutions today)
- Problem statements, starter code, or test cases
- Answer UI / editor changes
- Broad rewrite of already-readable SQL, Prisma schema, Python, or TypeScript solutions (optional tiny consistency only)

## Style rules

1. Prefer full names: `users`, `employee`, `counts` — not `u`, `e`, `c`.
2. Format like code under review (multi-line, normal indentation).
3. Leading comment states *how*, not a restatement of the problem title.
4. No new helpers or libraries beyond what the current solution already uses.
5. Must continue to pass existing `npm test` runners (including efficiency probes).

Example:

```js
// Keep users whose active flag is true.
function getActiveUsers(users) {
  return users.filter((user) => user.active);
}
```

## Verification

Run `npm test` after the rewrite. Every classic JS / prisma-client / related solution entry must still yield `status: "passed"` for its problem.

## Non-goals

Changing graded acceptance criteria, adding React solutions, or splitting test vs teach solution maps.
