# System Design Builder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship an interactive System Design Builder at `/system-design` with React Flow canvas, static challenge bank, layered smart validator, practice + timed challenge modes, admin link picker, and email submit.

**Architecture:** Client-only builder using `@xyflow/react`. Challenges and predicate rules live in `lib/system-design/*`. Validation is pure TypeScript over a `DesignGraph`. Admin encodes session in URL query params. Submit extends `/api/submit` with `kind: "system-design"`.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind 4, `@xyflow/react`, Motion (existing), `node --test` for lib tests, existing Time Attack + nodemailer submit pipeline.

## Global Constraints

- One challenge per play session (v1)
- No auth/DB; drafts in `localStorage`; session config in URL
- Hybrid visuals: existing CSS tokens + richer canvas/palette icons (SVG)
- Follow Next.js docs in `node_modules/next/dist/docs/` for App Router client boundaries
- Import React Flow CSS: `@xyflow/react/dist/style.css`
- Do not break exam/quiz submit paths when extending `/api/submit`
- Add new test files to `package.json` `"test"` script

## File structure

```
lib/system-design/
  types.ts
  components.ts
  predicates.ts
  validate.ts
  tips.ts
  serialize.ts
  challenges/
    index.ts
    realtime-chat.ts
    url-shortener.ts
    news-feed.ts
    file-storage.ts
    ride-matching.ts
    rate-limiter.ts
  *.test.ts
components/system-design/
  icons.tsx
  ComponentPalette.tsx
  ArchitectureNode.tsx
  DesignCanvas.tsx
  ChallengeBrief.tsx
  ValidatorPanel.tsx
  FeedbackStrip.tsx
  BuilderHeader.tsx
  BuilderShell.tsx
app/system-design/page.tsx
app/system-design/play/page.tsx
app/admin/system-design/page.tsx
app/api/submit/route.ts          # extend
app/page.tsx                     # home cards
package.json                     # dep + test script
```

---

### Task 1: Types + component catalog + predicates + validator (tested)

**Files:**
- Create: `lib/system-design/types.ts`
- Create: `lib/system-design/components.ts`
- Create: `lib/system-design/predicates.ts`
- Create: `lib/system-design/validate.ts`
- Create: `lib/system-design/tips.ts`
- Create: `lib/system-design/serialize.ts`
- Create: `lib/system-design/predicates.test.ts`
- Create: `lib/system-design/validate.test.ts`
- Modify: `package.json` (add `@xyflow/react`, extend test script)

**Interfaces:**
- Produces: `ComponentDef`, `Challenge`, `DesignGraph`, `ValidationResult`, `runValidation(graph, challenge)`, predicate registry, `toDesignGraph` / `fromDesignGraph`, `getLiveTips(graph, challenge)`

- [ ] **Step 1: Install dependency**

```bash
npm install @xyflow/react
```

- [ ] **Step 2: Implement types, catalog (≥14 components), predicate registry, validate, tips, serialize**

Implement exactly as specified in `docs/superpowers/specs/2026-08-11-system-design-builder-design.md` Domain model + Smart validator sections.

Key exports:

```ts
// validate.ts
export function runValidation(
  graph: DesignGraph,
  challenge: Challenge
): ValidationResult;

export type ValidationResult = {
  hard: { id: string; label: string; passed: boolean; detail?: string }[];
  hardPassed: number;
  hardTotal: number;
  dimensions: { dimension: SoftDimension; score: number; tip?: string }[];
  softScore: number; // 0–100
  bottlenecks: string[];
  bestPractices: string[];
  tips: string[];
};
```

Predicates must include at least: `hasComponent`, `hasAnyComponent`, `pathExists`, `noDirectClientToDb`, `hasObservability`, `hasQueueForWritePath`, `hasCacheBeforeDb`, `hasRedundancySignal`, `componentCountAtLeast`, `maxFanIn`, `hasEdgeKindBetween`, `allOfTypeConnectTo`.

- [ ] **Step 3: Write tests for pathExists, noDirectClientToDb, and a full validation on a fixture chat-like graph**

- [ ] **Step 4: Run tests**

```bash
node --test lib/system-design/predicates.test.ts lib/system-design/validate.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json lib/system-design
git commit -m "feat(system-design): add catalog, predicates, and validator"
```

---

### Task 2: Challenge bank (6 challenges) + integrity tests

**Files:**
- Create: `lib/system-design/challenges/*.ts` (6) + `index.ts`
- Create: `lib/system-design/challenges.test.ts`

**Interfaces:**
- Consumes: `Challenge` type, predicate ids from Task 1
- Produces: `challenges`, `getChallenge(id)`, `challengeList`

- [ ] **Step 1: Author 6 challenges** with ≥4 hard requirements each and soft rubric covering all 6 dimensions (shared defaults OK via helper)

Challenges: `realtime-chat`, `url-shortener`, `news-feed`, `file-storage`, `ride-matching`, `rate-limiter`

- [ ] **Step 2: Integrity test** — unique ids, every predicate exists, allowedComponents ⊆ catalog

- [ ] **Step 3: Run tests + commit**

```bash
git commit -m "feat(system-design): add six challenge briefs with rules"
```

---

### Task 3: Canvas UI — palette, nodes, React Flow shell

**Files:**
- Create: `components/system-design/icons.tsx`
- Create: `components/system-design/ArchitectureNode.tsx`
- Create: `components/system-design/ComponentPalette.tsx`
- Create: `components/system-design/DesignCanvas.tsx`
- Create: `components/system-design/BuilderShell.tsx` (wires left/center/right/footer)
- Create: supporting brief/validator/header/feedback components (can be stubs with real layout)

**Interfaces:**
- Consumes: catalog, DesignGraph serialize helpers
- Produces: interactive canvas with drag-from-palette, connect, delete, clear, zoom

- [ ] **Step 1: SVG icon registry** — one simple colored icon per component category/id
- [ ] **Step 2: Custom `architecture` node** with Handle source/target, icon, label
- [ ] **Step 3: Palette** search + drag (`application/reactflow` data = componentId)
- [ ] **Step 4: DesignCanvas** — ReactFlowProvider, drop handler, edge kinds (solid request / dashed observe), toolbar Select/Connect/Delete/Clear
- [ ] **Step 5: Commit**

```bash
git commit -m "feat(system-design): add React Flow canvas and component palette"
```

---

### Task 4: Brief, validator panel, feedback, play page + lobby

**Files:**
- Create/finish: `ChallengeBrief.tsx`, `ValidatorPanel.tsx`, `FeedbackStrip.tsx`, `BuilderHeader.tsx`
- Create: `app/system-design/page.tsx`
- Create: `app/system-design/play/page.tsx`

**Interfaces:**
- Play page reads `c`, `mode`, `e`, `t`; loads draft; wires validation + hints budget (3)

- [ ] **Step 1: Lobby** lists challenges → links to `/system-design/play?c=...&mode=practice`
- [ ] **Step 2: Play page** full BuilderShell; Time Attack when `t` set; localStorage drafts; Run Validation; Submit in challenge mode
- [ ] **Step 3: Manual smoke** via `npm run build` typecheck path
- [ ] **Step 4: Commit**

```bash
git commit -m "feat(system-design): add lobby and play builder experience"
```

---

### Task 5: Admin picker + home cards + submit email

**Files:**
- Create: `app/admin/system-design/page.tsx`
- Modify: `app/page.tsx`
- Modify: `app/api/submit/route.ts`
- Modify: `package.json` test script if any submit-related tests added

- [ ] **Step 1: Admin** — select challenge, examiner, timer, mode, copy link
- [ ] **Step 2: Home** — two cards (Take / Build) with distinct accent (teal/cyan family to differentiate from blue exam / violet quiz)
- [ ] **Step 3: Extend submit** for `kind: "system-design"` HTML email
- [ ] **Step 4: Wire Submit Design on play page
- [ ] **Step 5: Full test suite + build**

```bash
npm test && npm run build
```

- [ ] **Step 6: Commit**

```bash
git commit -m "feat(system-design): admin links, home entry, and email submit"
```

---

### Task 6: Polish — freeze overlay, empty states, icon pass

**Files:** touch UI components as needed; reuse `FreezeOverlay` / `TimeAttackBar` from exam/quiz

- [ ] **Step 1: Challenge freeze** on timeout; view-only + allow submit
- [ ] **Step 2: Empty canvas placeholder copy; unknown challenge redirect
- [ ] **Step 3: Final test + build + commit**

```bash
git commit -m "feat(system-design): polish timer freeze and empty states"
```

## Manual test checklist

- [ ] Lobby opens 6 challenges
- [ ] Drag components, connect, delete, clear
- [ ] Validate realtime-chat with a reasonable graph → hard checks + soft score
- [ ] Practice mode has no forced submit
- [ ] Admin copies link with timer; play freezes at 0
- [ ] Submit emails (or 502 without Gmail env — client handles error)
- [ ] Dark/light theme both readable
