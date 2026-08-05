# Upper-Easy JS & TS Exams — Implementation Plan

> **For agentic workers:** Execute task-by-task. Steps use checkbox syntax.

**Goal:** Add exam problems 58–69 (6 JS + 6 TS upper-easy app helpers) with official solutions.

**Architecture:** Append to `lib/problems.ts` and `lib/exam-solutions.ts`; extend TS runner inclusion assertions.

**Tech Stack:** Existing JS/TS exam runners.

## Global Constraints

- IDs 58–63 JS, 64–69 TS; all `difficulty: "easy"`
- Spec: `docs/superpowers/specs/2026-08-05-upper-easy-js-ts-exams-design.md`

---

### Task 1: Add problems 58–69 + solutions

**Files:**
- Modify: `lib/problems.ts`
- Modify: `lib/exam-solutions.ts`
- Modify: `lib/typescript-runner.test.ts`

- [ ] Append 12 problems with tests
- [ ] Append 12 official solutions
- [ ] Update TS inclusion test to 52–69
- [ ] Run `npm test` — expect pass
- [ ] Commit and push
