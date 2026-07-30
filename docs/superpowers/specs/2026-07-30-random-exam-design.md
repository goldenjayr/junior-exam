# Random Exam (`/random-exam`) — Design Spec

**Date:** 2026-07-30  
**Status:** Approved  
**Repo:** `basic-technical-interview` (Next.js App Router, React 19, Tailwind 4)

## Summary

Add a `/random-exam` page that lets a candidate (or examiner) configure a language scope, difficulty, problem count, and optional Time Attack, then press **Spin**. A cascading-deal animation reveals the randomly chosen problems one by one, then the app navigates straight into `/exam` with those IDs (and timer, if set).

## Goals

- Fast “surprise me” exam generation without using the full admin builder  
- Clear filters so JavaScript vs TypeScript vs full bank are intentional  
- Suspenseful but readable reveal before the exam starts  
- Reuse existing exam URL contract (`/exam?p=…&t=…`)

## Non-goals (v1)

- Examiner picker / results-email targeting  
- Shuffle query flag (`s=1`) — draw order is already random  
- Saving random draws to localStorage  
- Quiz bank / `/quiz` integration  
- Cancel mid-spin, share-before-start, or “redraw” after reveal  
- Extracting shared admin category helpers into `lib/` (keep labels inline unless duplication becomes painful)

## Product decisions (locked)

| Topic | Decision |
|---|---|
| Approach | Single-page spin → redirect (no confirm step) |
| Language: JavaScript | Categories `arrays`, `strings`, `objects`, `logic`, `react` |
| Language: TypeScript | Category `typescript` only |
| Language: All | Every problem category (includes Python, Postgres, Prisma) |
| Difficulty | `easy` \| `medium` \| `hard` \| `all` |
| Count | Integer clamped to `1…available` for current filters |
| Time Attack | Off \| 10/15/30/45/60 min \| custom minutes (1–180 via `clampMinutes`) |
| Sampling | Fisher–Yates via existing `shuffleArray`, take first `count` |
| Animation | Cascading deal (cards land one-by-one with stagger) |
| After reveal | Brief hold (~600ms), then `router.push` to exam |
| Examiner | Omitted from URL |
| Home entry | New card on `/` linking to `/random-exam` |

## Routes & surfaces

### `/random-exam` (new)

Client page: `app/random-exam/page.tsx`

**Config UI**

- Language chips: JavaScript · TypeScript · All  
- Difficulty chips: Any · easy · medium · hard  
- Count: number input or stepper; show live “N available”  
- Time Attack: Off + presets + Custom (same spirit as admin)  
- Primary CTA: **Spin** — disabled when `available === 0` or `count > available` (count should auto-clamp so the latter is rare)

**Spin flow**

1. Filter `problems` by language + difficulty → pool  
2. If pool empty → keep Spin disabled; hint to loosen filters  
3. On Spin: `drawn = shuffleArray(pool).slice(0, count)`  
4. Enter `spinning` state; dim/hide config; show deal stage with `count` empty slots  
5. Optional ~400ms decoy title flash, then deal each drawn problem in order (~250–350ms stagger): title, difficulty badge, category label  
6. After last card + ~600ms hold → navigate to  
   `/exam?p=<ids joined by comma>` and append `&t=<seconds>` when Time Attack is on (`minutesToSeconds`)  
7. While spinning, CTA shows “Drawing…” and is disabled

### `/` (home)

Add a fifth card: **Random Exam** → `/random-exam`, short copy about spinning a filtered set.

### Unchanged

- `/exam` — no changes; consumes `p` and optional `t` as today  
- `/admin` — unchanged

## Sampling helpers

Prefer a small pure helper (e.g. `lib/random-exam.ts`) so filtering/sampling is unit-tested:

- `languageCategories(lang)` → category list or `null` for all  
- `filterProblems({ language, difficulty })` → matching problems  
- `drawProblems(pool, count)` → `shuffleArray(pool).slice(0, clamp)`  

UI owns animation and navigation only.

## Visual / motion

- Match existing admin slate/blue surface (not a new visual system)  
- Difficulty badges reuse admin-style easy/medium/hard colors  
- Deal animation: CSS transitions or lightweight Framer-free transforms already used elsewhere (`animate-fade-up` / `animate-pop` if present)  
- Prefer reduced-motion: if `prefers-reduced-motion: reduce`, skip decoy/stagger and navigate after a short beat (or show all cards at once then redirect)

## Error & edge cases

| Case | Behavior |
|---|---|
| No matches | Spin disabled; “No problems match — loosen filters” |
| Count &gt; available | Clamp count down to `available` when filters change |
| Count &lt; 1 | Treat as 1 |
| Custom minutes invalid | `clampMinutes` (1–180) |
| Mid-navigation | Standard Next.js client navigation; no special abort |

## Testing

- Unit tests for filter + draw helpers (pool sizes per language/difficulty; draw length; draw ⊆ pool; count clamp)  
- Manual: Spin with JS/easy/3 → lands on `/exam` with 3 ids; with timer → `t` present; All/hard with small pool clamps count

## Success criteria

1. `/random-exam` reachable from home  
2. Filters correctly restrict the pool  
3. Spin deals cards then opens a working exam with exactly `count` problems from the pool  
4. Optional Time Attack appears on the exam when configured  
5. Empty pool cannot start a spin  
