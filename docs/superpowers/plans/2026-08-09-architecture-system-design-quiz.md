# Architecture / System Design Quiz Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add ~50 knowledge-quiz questions across `architecture`, `nextjs`, and `devops`, with optional themeable SVG (and rare image) illustrations on ~half the items, plus presets.

**Architecture:** Extend `QuizQuestion` base with optional `illustration`. Ship a small SVG diagram registry and `QuizIllustration` above `QuizPrompt`. Three new bank files register through existing `lib/quiz/index.ts`; grading unchanged.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind 4, Node test runner (`node --test`), existing quiz types/inputs

**Spec:** `docs/superpowers/specs/2026-08-09-architecture-system-design-quiz-design.md`

## Global Constraints

- Spec locked: three topics; ~50 questions; IDs **331–380**; hybrid SVG primary / image rare; visuals on ~half; quiz + presets only (no exam)
- Do not invent a diagram-hotspot answer type
- Do not commit unless the user explicitly asks (skip commit steps or leave uncommitted)
- Read `node_modules/next/dist/docs/` before inventing App Router patterns
- Match existing junior tone: short prompts, plausible distractors, `explanation` on every item
- Theme SVGs with CSS variables (`currentColor` / `var(--foreground)` / `var(--border)`) so light/dark work
- Keep existing quiz grading, modes, timers, and share links unchanged

---

## File map

| Path | Responsibility |
|---|---|
| `lib/quiz/types.ts` | Add topics + optional `illustration` on `Base` |
| `lib/quiz/diagrams.ts` | Registry map: diagram key → React component |
| `components/quiz/diagrams/*.tsx` | Individual themeable SVG diagrams |
| `components/quiz/QuizIllustration.tsx` | Render svg/image + caption; fallback on unknown key |
| `components/quiz/QuestionStage.tsx` | Mount illustration above prompt |
| `app/admin/quiz/page.tsx` | Show illustration in preview dialog |
| `lib/quiz/bank/architecture.ts` | IDs 331–348 |
| `lib/quiz/bank/nextjs.ts` | IDs 349–364 |
| `lib/quiz/bank/devops.ts` | IDs 365–380 |
| `lib/quiz/index.ts` | Register topics + banks |
| `lib/quiz/presets.ts` | New presets + update Full Stack / Junior Knowledge Full |
| `lib/quiz/grade.test.ts` | Bank registration + illustration integrity tests |
| `lib/quiz/diagrams.test.ts` | Registry key completeness |
| `package.json` `scripts.test` | Include `lib/quiz/diagrams.test.ts` |
| `app/page.tsx` | Hub copy mentions architecture / Next.js / DevOps |
| `docs/superpowers/plans/2026-08-09-architecture-quiz-sources/*.ts` | Verbatim bank sources for Tasks 4–6 (copy into `lib/quiz/bank/`) |

---

### Task 1: Types + illustration integrity tests (TDD)

**Files:**
- Modify: `lib/quiz/types.ts`
- Modify: `lib/quiz/grade.test.ts`
- Create: `lib/quiz/diagrams.ts` (stub registry — empty object first is OK if tests only check type shape later; prefer exporting keys list)
- Modify: `package.json` (only if adding `diagrams.test.ts` in Task 2 — otherwise defer)

**Interfaces:**
- Consumes: existing `QuizQuestion` / `Base`
- Produces:
  - `QuizTopic` includes `"architecture" | "nextjs" | "devops"`
  - `Base.illustration?: { kind: "svg" | "image"; diagram?: string; src?: string; alt: string; caption?: string }`

- [ ] **Step 1: Write failing integrity tests**

Append to `lib/quiz/grade.test.ts`:

```ts
test("architecture topic is part of QuizTopic union via bank registration shape", () => {
  // Will pass only after types + banks land; for now assert topics array will include them —
  // temporarily skip bank length until Task 4–7. Prefer a focused type-level check:
  const allowed = [
    "javascript",
    "typescript",
    "tailwind",
    "react",
    "html",
    "nodejs",
    "css",
    "postgresql",
    "prisma",
    "python",
    "architecture",
    "nextjs",
    "devops",
  ] as const;
  // After Task 7 this becomes quizTopics deepEqual — for Task 1 only extend types;
  // move the strict quizTopics assertion to Task 7.
  assert.ok(allowed.includes("architecture"));
});
```

Better Task-1-only test — add `lib/quiz/illustration.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import type { QuizQuestion } from "./types.ts";

test("illustration svg shape is valid on a sample question object", () => {
  const sample = {
    id: 331,
    type: "single",
    topic: "architecture",
    difficulty: "easy",
    prompt: "What sits in front of app servers to distribute traffic?",
    options: [
      { id: "a", label: "Load balancer" },
      { id: "b", label: "CSS compiler" },
    ],
    correctId: "a",
    illustration: {
      kind: "svg",
      diagram: "load-balancer",
      alt: "Clients connecting through a load balancer to app instances",
      caption: "Traffic fans out across instances",
    },
  } satisfies QuizQuestion;

  assert.equal(sample.illustration?.kind, "svg");
  assert.equal(sample.illustration?.diagram, "load-balancer");
});
```

- [ ] **Step 2: Run test to verify it fails (topic not in union yet)**

```bash
node --test lib/quiz/illustration.test.ts
```

Expected: FAIL (TypeScript may not run via node --test on `.ts` the same way — this repo already runs `lib/quiz/grade.test.ts` with `node --test`. If the file typechecks at compile time only, the runtime test will pass once the object is valid; use `npx tsc --noEmit` to verify the `satisfies QuizQuestion` fails before types update.)

```bash
npx tsc --noEmit
```

Expected: ERROR on `topic: "architecture"` and/or `illustration` unknown.

- [ ] **Step 3: Update `lib/quiz/types.ts`**

Replace the `QuizTopic` union and `Base` with:

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
  | "python"
  | "architecture"
  | "nextjs"
  | "devops";

export type QuizDifficulty = "easy" | "medium" | "hard";

export type QuizMode = "assessment" | "practice";

export type QuizIllustration =
  | {
      kind: "svg";
      diagram: string;
      alt: string;
      caption?: string;
    }
  | {
      kind: "image";
      src: string;
      alt: string;
      caption?: string;
    };

type Base = {
  id: number;
  topic: QuizTopic;
  difficulty: QuizDifficulty;
  prompt: string;
  hint?: string;
  explanation?: string;
  illustration?: QuizIllustration;
};
```

Keep all existing `QuizQuestion` discriminants unchanged — only `Base` gains `illustration`.

- [ ] **Step 4: Re-run typecheck / test**

```bash
npx tsc --noEmit
node --test lib/quiz/illustration.test.ts
```

Expected: PASS (add `lib/quiz/illustration.test.ts` to `package.json` scripts.test).

Update `package.json` scripts.test to append `lib/quiz/illustration.test.ts` (and later `lib/quiz/diagrams.test.ts`).

- [ ] **Step 5: Commit** (skip unless user asks)

```bash
git add lib/quiz/types.ts lib/quiz/illustration.test.ts package.json
git commit -m "feat(quiz): add architecture topics and illustration type"
```

---

### Task 2: Diagram registry + SVG components + QuizIllustration

**Files:**
- Create: `components/quiz/diagrams/RequestPath.tsx`
- Create: `components/quiz/diagrams/LoadBalancer.tsx`
- Create: `components/quiz/diagrams/CdnOrigin.tsx`
- Create: `components/quiz/diagrams/ReverseProxy.tsx`
- Create: `components/quiz/diagrams/NextjsLayers.tsx`
- Create: `components/quiz/diagrams/CiCdPipeline.tsx`
- Create: `components/quiz/diagrams/BlueGreen.tsx`
- Create: `components/quiz/diagrams/CacheLayers.tsx`
- Create: `lib/quiz/diagrams.ts`
- Create: `components/quiz/QuizIllustration.tsx`
- Create: `lib/quiz/diagrams.test.ts`
- Modify: `package.json` `scripts.test`

**Interfaces:**
- Consumes: `QuizIllustration` from types
- Produces:
  - `quizDiagramKeys` readonly string array
  - `quizDiagrams: Record<string, ComponentType<{ className?: string }>>`
  - `getQuizDiagram(key: string)` → component | undefined
  - `<QuizIllustration illustration={QuizIllustration} />`

- [ ] **Step 1: Write failing registry test**

```ts
// lib/quiz/diagrams.test.ts
import assert from "node:assert/strict";
import test from "node:test";
import { quizDiagramKeys, quizDiagrams } from "./diagrams.ts";

const expected = [
  "request-path",
  "load-balancer",
  "cdn-origin",
  "reverse-proxy",
  "nextjs-layers",
  "ci-cd-pipeline",
  "blue-green",
  "cache-layers",
] as const;

test("quiz diagram registry exposes the locked SVG keys", () => {
  assert.deepEqual([...quizDiagramKeys].sort(), [...expected].sort());
  for (const key of expected) {
    assert.equal(typeof quizDiagrams[key], "function");
  }
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
node --test lib/quiz/diagrams.test.ts
```

Expected: FAIL cannot find module / keys undefined.

- [ ] **Step 3: Implement one SVG pattern, then all eight**

Shared visual language for every diagram file:

```tsx
// components/quiz/diagrams/LoadBalancer.tsx
export default function LoadBalancer({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 200"
      role="img"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <marker
          id="arrow"
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L6,3 L0,6 Z" className="fill-foreground" />
        </marker>
      </defs>
      {/* clients */}
      <rect x="16" y="70" width="88" height="60" rx="10" className="fill-card stroke-border" strokeWidth="2" />
      <text x="60" y="105" textAnchor="middle" className="fill-foreground" style={{ fontSize: 12, fontWeight: 700 }}>
        Clients
      </text>
      <line x1="104" y1="100" x2="160" y2="100" className="stroke-foreground" strokeWidth="2" markerEnd="url(#arrow)" />
      {/* LB */}
      <rect x="160" y="60" width="110" height="80" rx="10" className="fill-violet-500/15 stroke-violet-500" strokeWidth="2" />
      <text x="215" y="105" textAnchor="middle" className="fill-foreground" style={{ fontSize: 12, fontWeight: 700 }}>
        Load balancer
      </text>
      {/* apps */}
      <line x1="270" y1="80" x2="330" y2="50" className="stroke-foreground" strokeWidth="2" markerEnd="url(#arrow)" />
      <line x1="270" y1="100" x2="330" y2="100" className="stroke-foreground" strokeWidth="2" markerEnd="url(#arrow)" />
      <line x1="270" y1="120" x2="330" y2="150" className="stroke-foreground" strokeWidth="2" markerEnd="url(#arrow)" />
      {[50, 100, 150].map((y, i) => (
        <g key={y}>
          <rect x="330" y={y - 22} width="120" height="44" rx="10" className="fill-card stroke-border" strokeWidth="2" />
          <text x="390" y={y + 4} textAnchor="middle" className="fill-foreground" style={{ fontSize: 12, fontWeight: 700 }}>
            {`App ${i + 1}`}
          </text>
        </g>
      ))}
    </svg>
  );
}
```

Implement the other seven with the same box/arrow style:

| File | Labels (left → right / top → bottom) |
|---|---|
| `RequestPath.tsx` | Client → Edge/Proxy → App → DB |
| `CdnOrigin.tsx` | Users → CDN → Origin |
| `ReverseProxy.tsx` | Internet → Reverse proxy → App process |
| `NextjsLayers.tsx` | Browser → Edge (middleware) → Server (RSC/Route) → Data |
| `CiCdPipeline.tsx` | Commit → Build/Test → Artifact → Deploy |
| `BlueGreen.tsx` | LB → Green (active) / Blue (idle) |
| `CacheLayers.tsx` | Browser cache → CDN → App cache → DB |

- [ ] **Step 4: Registry + QuizIllustration**

```ts
// lib/quiz/diagrams.ts
import type { ComponentType } from "react";
import RequestPath from "@/components/quiz/diagrams/RequestPath";
import LoadBalancer from "@/components/quiz/diagrams/LoadBalancer";
import CdnOrigin from "@/components/quiz/diagrams/CdnOrigin";
import ReverseProxy from "@/components/quiz/diagrams/ReverseProxy";
import NextjsLayers from "@/components/quiz/diagrams/NextjsLayers";
import CiCdPipeline from "@/components/quiz/diagrams/CiCdPipeline";
import BlueGreen from "@/components/quiz/diagrams/BlueGreen";
import CacheLayers from "@/components/quiz/diagrams/CacheLayers";

export const quizDiagramKeys = [
  "request-path",
  "load-balancer",
  "cdn-origin",
  "reverse-proxy",
  "nextjs-layers",
  "ci-cd-pipeline",
  "blue-green",
  "cache-layers",
] as const;

export type QuizDiagramKey = (typeof quizDiagramKeys)[number];

export const quizDiagrams: Record<
  QuizDiagramKey,
  ComponentType<{ className?: string }>
> = {
  "request-path": RequestPath,
  "load-balancer": LoadBalancer,
  "cdn-origin": CdnOrigin,
  "reverse-proxy": ReverseProxy,
  "nextjs-layers": NextjsLayers,
  "ci-cd-pipeline": CiCdPipeline,
  "blue-green": BlueGreen,
  "cache-layers": CacheLayers,
};

export function getQuizDiagram(key: string) {
  if ((quizDiagramKeys as readonly string[]).includes(key)) {
    return quizDiagrams[key as QuizDiagramKey];
  }
  return undefined;
}
```

```tsx
// components/quiz/QuizIllustration.tsx
"use client";

import type { QuizIllustration as Illustration } from "@/lib/quiz/types";
import { getQuizDiagram } from "@/lib/quiz/diagrams";

export default function QuizIllustration({
  illustration,
}: {
  illustration: Illustration;
}) {
  if (illustration.kind === "image") {
    return (
      <figure className="mb-5 overflow-hidden rounded-xl border border-border bg-background">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={illustration.src}
          alt={illustration.alt}
          className="mx-auto max-h-64 w-full object-contain p-3"
        />
        {illustration.caption ? (
          <figcaption className="border-t border-border px-3 py-2 text-center text-xs text-subtle">
            {illustration.caption}
          </figcaption>
        ) : null}
      </figure>
    );
  }

  const Diagram = getQuizDiagram(illustration.diagram);
  return (
    <figure className="mb-5 overflow-hidden rounded-xl border border-border bg-background">
      <div className="p-3 sm:p-4">
        {Diagram ? (
          <Diagram className="mx-auto h-auto w-full max-w-xl" />
        ) : (
          <p className="px-2 py-6 text-center text-sm text-subtle">
            {illustration.alt}
          </p>
        )}
      </div>
      {illustration.caption ? (
        <figcaption className="border-t border-border px-3 py-2 text-center text-xs text-subtle">
          {illustration.caption}
        </figcaption>
      ) : null}
      <span className="sr-only">{illustration.alt}</span>
    </figure>
  );
}
```

Note: if `@/` imports break under `node --test` for `diagrams.ts`, keep the registry test importing only keys by splitting `lib/quiz/diagram-keys.ts` (keys only, no React) and importing that from both registry and tests. Prefer split if tests fail on JSX resolution:

```ts
// lib/quiz/diagram-keys.ts
export const quizDiagramKeys = [ /* ... */ ] as const;
```

- [ ] **Step 5: Run tests**

```bash
node --test lib/quiz/diagrams.test.ts lib/quiz/illustration.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit** (skip unless user asks)

---

### Task 3: Wire illustration into QuestionStage + admin preview

**Files:**
- Modify: `components/quiz/QuestionStage.tsx`
- Modify: `app/admin/quiz/page.tsx`

**Interfaces:**
- Consumes: `QuizIllustration` component; `question.illustration?`
- Produces: illustration visible in play + admin preview

- [ ] **Step 1: Update QuestionStage**

Import and render above `QuizPrompt`:

```tsx
import QuizIllustration from "./QuizIllustration";

// inside return, replace the QuizPrompt block with:
{question.illustration ? (
  <QuizIllustration illustration={question.illustration} />
) : null}
<QuizPrompt prompt={question.prompt} />
```

- [ ] **Step 2: Update admin preview dialog**

In `app/admin/quiz/page.tsx`, import `QuizIllustration` and above `<QuizPrompt prompt={preview.prompt} />`:

```tsx
{preview.illustration ? (
  <QuizIllustration illustration={preview.illustration} />
) : null}
```

- [ ] **Step 3: Manual smoke (dev server)**

```bash
npm run dev
```

Open `/admin/quiz` after banks exist (Task 7) — for now TypeScript compile is enough:

```bash
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 4: Commit** (skip unless user asks)

---

### Task 4: Architecture question bank (IDs 331–348)

**Files:**
- Create: `lib/quiz/bank/architecture.ts`

**Interfaces:**
- Consumes: `QuizQuestion`, diagram keys from Task 2
- Produces: `architectureQuestions: QuizQuestion[]` length 18, ids 331–348

- [ ] **Step 1: Copy the verbatim bank source**

```bash
cp docs/superpowers/plans/2026-08-09-architecture-quiz-sources/architecture.ts \
  lib/quiz/bank/architecture.ts
```

The source file is complete: 18 questions (IDs 331–348), 9 with SVG illustrations. Do not invent alternate content.

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit
```

Expected: PASS (after Task 1 types exist). If Task 1 is not done, complete Task 1 first.

- [ ] **Step 3: Commit** (skip unless user asks)

---

### Task 5: Next.js question bank (IDs 349–364)

**Files:**
- Create: `lib/quiz/bank/nextjs.ts`

**Interfaces:**
- Produces: `nextjsQuestions` length 16, ids 349–364, topic `"nextjs"`

- [ ] **Step 1: Copy the verbatim bank source**

```bash
cp docs/superpowers/plans/2026-08-09-architecture-quiz-sources/nextjs.ts \
  lib/quiz/bank/nextjs.ts
```

Complete file: 16 questions (IDs 349–364) with SVG illustrations on teaching items. Do not invent alternate content.

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 3: Commit** (skip unless user asks)

---

### Task 6: DevOps question bank (IDs 365–380)

**Files:**
- Create: `lib/quiz/bank/devops.ts`

**Interfaces:**
- Produces: `devopsQuestions` length 16, ids 365–380, topic `"devops"`

- [ ] **Step 1: Copy the verbatim bank source**

```bash
cp docs/superpowers/plans/2026-08-09-architecture-quiz-sources/devops.ts \
  lib/quiz/bank/devops.ts
```

Complete file: 16 questions (IDs 365–380) with SVG illustrations on teaching items. Do not invent alternate content.

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 3: Commit** (skip unless user asks)

---

### Task 7: Register banks, presets, integrity tests

**Files:**
- Modify: `lib/quiz/index.ts`
- Modify: `lib/quiz/presets.ts`
- Modify: `lib/quiz/grade.test.ts`
- Modify: `lib/quiz/illustration.test.ts` (optional — extend to scan bank)
- Modify: `app/page.tsx` (hub one-liner — can fold here or Task 8)

**Interfaces:**
- Consumes: three banks
- Produces: playable topics in admin; presets; tests green

- [ ] **Step 1: Write failing registration tests**

Append to `lib/quiz/grade.test.ts`:

```ts
test("registers the architecture question bank 331–348", () => {
  const questions = quizQuestions.filter((q) => q.topic === "architecture");
  assert.ok(quizTopics.includes("architecture"));
  assert.strictEqual(questions.length, 18);
  assert.strictEqual(questions[0]?.id, 331);
  assert.strictEqual(questions.at(-1)?.id, 348);
});

test("registers the nextjs question bank 349–364", () => {
  const questions = quizQuestions.filter((q) => q.topic === "nextjs");
  assert.ok(quizTopics.includes("nextjs"));
  assert.strictEqual(questions.length, 16);
  assert.strictEqual(questions[0]?.id, 349);
  assert.strictEqual(questions.at(-1)?.id, 364);
});

test("registers the devops question bank 365–380", () => {
  const questions = quizQuestions.filter((q) => q.topic === "devops");
  assert.ok(quizTopics.includes("devops"));
  assert.strictEqual(questions.length, 16);
  assert.strictEqual(questions[0]?.id, 365);
  assert.strictEqual(questions.at(-1)?.id, 380);
});

test("platform quiz illustrations use known svg keys or image src", () => {
  const { quizDiagramKeys } = require("./diagrams.ts") as {
    quizDiagramKeys: readonly string[];
  };
  // Prefer static import at top if ESM-friendly in this repo:
  // import { quizDiagramKeys } from "./diagram-keys.ts";
  const platform = quizQuestions.filter((q) =>
    ["architecture", "nextjs", "devops"].includes(q.topic)
  );
  const withArt = platform.filter((q) => q.illustration);
  assert.ok(withArt.length >= 20, "expected ~half illustrated");
  for (const q of withArt) {
    const ill = q.illustration!;
    if (ill.kind === "svg") {
      assert.ok(
        (quizDiagramKeys as readonly string[]).includes(ill.diagram),
        `unknown diagram ${ill.diagram} on q ${q.id}`
      );
      assert.ok(ill.alt.length > 0);
    } else {
      assert.ok(ill.src.startsWith("/"));
      assert.ok(ill.alt.length > 0);
    }
  }
});
```

If `require` of React registry fails, import keys from `lib/quiz/diagram-keys.ts` only.

- [ ] **Step 2: Run tests — expect FAIL**

```bash
node --test lib/quiz/grade.test.ts
```

Expected: FAIL lengths 0 / topics missing.

- [ ] **Step 3: Register in `lib/quiz/index.ts`**

```ts
import { architectureQuestions } from "./bank/architecture.ts";
import { nextjsQuestions } from "./bank/nextjs.ts";
import { devopsQuestions } from "./bank/devops.ts";

export const quizTopics = [
  "javascript",
  "typescript",
  "tailwind",
  "react",
  "html",
  "css",
  "nodejs",
  "postgresql",
  "prisma",
  "python",
  "architecture",
  "nextjs",
  "devops",
] as const satisfies readonly QuizTopic[];

export const quizQuestions: QuizQuestion[] = [
  ...javascriptQuestions,
  // ...existing
  ...pythonQuestions,
  ...architectureQuestions,
  ...nextjsQuestions,
  ...devopsQuestions,
];
```

- [ ] **Step 4: Add presets in `lib/quiz/presets.ts`**

Add before Full Stack Blitz:

```ts
{
  name: "System Design Basics",
  description:
    "Reverse proxies, load balancers, CDN, caching, and request-path fundamentals.",
  ids: [331, 332, 333, 334, 335, 337, 339, 340, 341, 342, 343, 344],
  suggestedMinutes: 15,
},
{
  name: "Next.js Architecture",
  description:
    "RSC vs client, middleware, route handlers, env boundaries, and caching basics.",
  ids: [349, 350, 351, 352, 353, 354, 356, 357, 358, 359, 360, 362],
  suggestedMinutes: 15,
},
{
  name: "DevOps Screen",
  description:
    "CI/CD, containers, proxies, health checks, and blue-green/rolling intros.",
  ids: [365, 366, 367, 368, 369, 371, 372, 373, 374, 376, 378, 380],
  suggestedMinutes: 15,
},
{
  name: "Platform Blitz",
  description:
    "Mixed architecture, Next.js, and DevOps for a short platform screen.",
  ids: [331, 335, 340, 342, 349, 352, 357, 359, 365, 368, 371, 373],
  suggestedMinutes: 20,
},
```

Update **Full Stack Blitz** ids to append a few platform items, e.g. `331, 349, 365`.

Update **Junior Knowledge Full** to append first 12 of each new topic:

```ts
// architecture 331-342
331, 332, 333, 334, 335, 336, 337, 338, 339, 340, 341, 342,
// nextjs 349-360
349, 350, 351, 352, 353, 354, 355, 356, 357, 358, 359, 360,
// devops 365-376
365, 366, 367, 368, 369, 370, 371, 372, 373, 374, 375, 376,
```

- [ ] **Step 5: Run full quiz-related tests**

```bash
npm test
```

Expected: all PASS, including new registration + illustration integrity tests.

- [ ] **Step 6: Commit** (skip unless user asks)

---

### Task 8: Hub copy polish + final verification

**Files:**
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `quizTopics` / `quizQuestions` counts (already dynamic)
- Produces: copy that mentions architecture / Next.js / DevOps

- [ ] **Step 1: Update quiz card blurb**

In `app/page.tsx`, change the Take a Quiz description to mention the new areas, e.g.:

```tsx
One question at a time — multiple answer styles across JS, TypeScript,
React, Postgres, Prisma, Python, architecture, Next.js, DevOps, and more.
```

- [ ] **Step 2: Final verification**

```bash
npx tsc --noEmit
npm test
npm run build
```

Expected: typecheck PASS, tests PASS, build PASS.

Manual: `/admin/quiz` → filter `architecture` → preview an illustrated question → copy link → `/quiz?...` shows diagram.

- [ ] **Step 3: Commit** (skip unless user asks)

```bash
git add app/page.tsx
git commit -m "docs(ui): mention architecture topics on hub"
```

---

## Self-review (plan vs spec)

| Spec requirement | Task |
|---|---|
| Topics architecture / nextjs / devops | 1, 4–7 |
| ~50 questions IDs 331–380 | 4–7 |
| Optional illustration hybrid svg/image | 1–3 |
| SVG registry (8 diagrams) | 2 |
| Visuals ~half | 4–6 + integrity test Task 7 |
| Quiz + presets only | 7 (no exam tasks) |
| QuestionStage + admin preview | 3 |
| Presets + Full Stack / Junior Full | 7 |
| Integrity tests | 1, 2, 7 |
| Hub copy | 8 |

Bank content is complete under `docs/superpowers/plans/2026-08-09-architecture-quiz-sources/` (22 illustrated / 50 total). Tasks 4–6 copy those files verbatim — no free-form authoring.
