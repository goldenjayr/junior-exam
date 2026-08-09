# Architecture / System Design Quiz — Design Spec

**Date:** 2026-08-09  
**Status:** Approved (brainstorm)  
**Repo:** `basic-technical-interview` (Next.js App Router, React 19, Tailwind 4)

## Summary

Add a junior–mid **architecture & platform** knowledge track to the quiz builder:

1. Three new topics — `architecture`, `nextjs`, `devops` — totaling **~50 questions**
2. Optional **illustrations** on ~half of questions (themeable SVG diagram kit primary; static images as rare fallback)
3. New presets + fold select items into Full Stack / Junior Knowledge presets

No coding-exam changes in v1.

## Goals

- Teach interview-relevant system design / platform concepts with clear diagrams where a picture helps
- Match existing quiz bank depth, types, grading, admin filters, and shareable links
- Keep visuals crisp, themeable, and maintainable (SVG registry over one-off raster art)
- Mix difficulty: mostly junior fullstack, with a handful of medium/hard stretch items

## Non-goals (v1)

- Coding-exam problems (Next.js API route runners, Docker build tasks, etc.)
- New “diagram hotspot” question type / clickable regions on drawings
- Dedicated “diagram explain” product mode beyond normal practice + explanations
- CMS, auth, or DB-backed question storage
- Exhaustive AWS/GCP service catalogs, Kubernetes deep-dives, or CAP theorem proofs
- Generating illustrations at runtime (AI image APIs)

## Product decisions (locked)

| Topic | Decision |
|---|---|
| Topic split | Three banks: `architecture`, `nextjs`, `devops` |
| Volume | ~50 total (~18 / ~16 / ~16) |
| Audience | Mix — mostly junior, some medium/hard stretch |
| Surface | Quiz banks + presets only |
| Illustration approach | Hybrid: SVG diagram registry primary; `image` fallback rare |
| Visual density | ~half of questions (purposeful diagrams only) |
| Implementation style | Extend existing quiz model; no new answer types |
| Question IDs | Start at **331** (current bank max is 330) |

## Content outline

### `architecture` (~18) — IDs 331–348

Reverse proxy vs load balancer, CDN + origin, caching layers, horizontal vs vertical scale, monolith vs services (tradeoffs), typical request path (client → edge → app → DB), sticky sessions, health checks at LB, idempotency (intro), queues vs sync HTTP (intro).

### `nextjs` (~16) — IDs 349–364

App Router mental model, Server Components vs Client Components, route handlers, middleware placement, caching / revalidate basics, `NEXT_PUBLIC_` vs server-only env, static vs dynamic rendering (intro), deployment shape (Node server / serverless / edge — conceptual), data-fetching boundaries.

### `devops` (~16) — IDs 365–380

CI vs CD, pipeline stages, containers vs VMs, reverse proxy in front of app processes, env/config separation, logging vs metrics vs traces (intro), rolling vs blue-green (intro), health/readiness probes (conceptual), immutable artifacts.

**Types mix:** Prefer existing types already used heavily in banks — `single`, `multi`, `boolean`, `match`, `order`, plus occasional `fill` / `snippet` where natural. No new `QuizQuestion` discriminant for diagrams.

**Explanations:** Every question gets a short explanation; illustrated items should reference what the diagram shows.

## Data model

Extend shared quiz `Base` in `lib/quiz/types.ts`:

```ts
illustration?: {
  kind: "svg" | "image";
  /** Registry key when kind === "svg" */
  diagram?: string;
  /** Public path when kind === "image", e.g. "/quiz/diagrams/foo.webp" */
  src?: string;
  alt: string;
  caption?: string;
};
```

Validation rules (authoring convention + unit tests):

- If `kind: "svg"` → `diagram` required and must exist in the diagram registry
- If `kind: "image"` → `src` required
- `alt` always required when `illustration` is set

`QuizTopic` union and `quizTopics` array gain `"architecture" | "nextjs" | "devops"`.

## SVG diagram kit

**Location:** `components/quiz/diagrams/` + registry `lib/quiz/diagrams.ts` (or co-located index).

**API:**

```ts
export const quizDiagrams: Record<string, ComponentType<{ className?: string }>>;
```

**Initial registry (minimum set; reuse across questions):**

| Key | Shows |
|---|---|
| `request-path` | Client → reverse proxy / edge → app → DB |
| `load-balancer` | Clients → LB → N app instances |
| `cdn-origin` | Users → CDN → origin |
| `reverse-proxy` | Internet → proxy → app process(es) |
| `nextjs-layers` | Browser / Edge (middleware) / Server (RSC/route) / Data |
| `ci-cd-pipeline` | Commit → build/test → artifact → deploy |
| `blue-green` | LB switching between green and blue |
| `cache-layers` | Browser / CDN / app / DB cache (simple boxes) |

**Visual rules:**

- Theme via CSS variables (stroke/fill/text) so light/dark themes work
- Flat, labeled boxes + arrows; no decorative clutter
- Readable at quiz-card width (~mobile and desktop)
- Multiple questions may share one diagram with different prompts

**Image fallback:** `public/quiz/diagrams/*` only when SVG cannot express the idea. Prefer adding an SVG over shipping a raster.

## UI integration

- New `QuizIllustration` component renders above `QuizPrompt` in the question stage (practice + assessment)
- Admin quiz builder preview shows the illustration when present
- Grading, timers, shuffle, modes unchanged
- Home / admin topic chips pick up new topics via `quizTopics`

## Banks, registration, presets

| File | Role |
|---|---|
| `lib/quiz/bank/architecture.ts` | ~18 questions |
| `lib/quiz/bank/nextjs.ts` | ~16 questions |
| `lib/quiz/bank/devops.ts` | ~16 questions |
| `lib/quiz/index.ts` | Import + register topics/questions |
| `lib/quiz/presets.ts` | New presets + update Full Stack / Junior Knowledge Full |

**Presets (v1):**

- **System Design Basics** — architecture subset (~12), ~15 min
- **Next.js Architecture** — nextjs subset (~12), ~15 min
- **DevOps Screen** — devops subset (~12), ~15 min
- **Platform Blitz** — mixed architecture + nextjs + devops (~12), ~20 min
- Update **Full Stack Blitz** and **Junior Knowledge Full** to include a sample of the new topics (first ~12 per topic for Junior Knowledge Full)

## Components & data flow

```
admin picks ids → /quiz?q=... 
  → load QuizQuestion[] 
  → QuestionStage 
      → QuizIllustration? (svg registry | <img>)
      → QuizPrompt
      → existing input by type
      → grade.ts (unchanged)
```

Illustration is display-only; it never affects grading.

## Error handling

- Missing/unknown `diagram` key: render a compact fallback (caption/alt text only) in production; assert in tests so the bank cannot ship broken keys
- Missing image `src`: same fallback; tests require file existence for `kind: "image"` entries when any exist
- Questions without `illustration` behave exactly as today

## Testing

- Extend `lib/quiz/grade.test.ts` (or sibling bank integrity tests) to assert:
  - new topics are registered
  - all question ids unique and ≥ 331 for new banks
  - every `illustration.kind === "svg"` has a registry key
  - ~50 new questions present (± small tolerance if count adjusts during authoring)
- No grading-logic changes expected; existing type tests still pass
- Optional smoke: diagram registry exports every advertised key

## Implementation order (for plan)

1. Types + diagram registry shell + `QuizIllustration` UI
2. Architecture bank (with shared diagrams)
3. Next.js bank
4. DevOps bank
5. Wire `index.ts`, presets, admin/home topic lists
6. Integrity tests + polish captions/theme

## Success criteria

- ~50 new quiz items across three topics, selectable in admin and playable via share links
- ~half include a clear illustration; SVGs look intentional in light/dark
- Three+ dedicated presets ship; broad presets include the new topics
- No regressions to existing quiz types, grading, or timers
