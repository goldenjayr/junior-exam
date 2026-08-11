# System Design Builder — Design Spec

**Date:** 2026-08-11  
**Status:** Approved (brainstorm; user authorized full proceed)  
**Repo:** `basic-technical-interview` (Next.js App Router, React 19, Tailwind 4)

## Summary

Add an interactive **System Design Builder** at `/system-design`: candidates drag architecture components onto a canvas, connect them, and validate designs against challenge briefs. Supports **practice** and **timed challenge** modes with shareable examiner links (same pattern as exam/quiz). Validation is a **layered client-side engine**: hard requirement predicates plus soft quality rubric scoring.

## Goals

- Recreate the spirit of the reference UI: component bank, connectable canvas, challenge brief, smart validator, live tips/bottlenecks
- Ship a robust, interview-useful tool that feels advanced without needing a backend graph DB
- Fit the existing assessment product: static content banks, URL-encoded sessions, optional email submit, Time Attack reuse
- Hybrid visuals: app shell/tokens + richer builder chrome and component icons

## Non-goals (v1)

- Full challenge/rule CMS editor in admin
- Auth, accounts, or server-persisted designs
- Multi-user collaborative canvas
- LLM-based architecture critique (may come later via API)
- Exhaustive cloud-provider catalogs (AWS/GCP every service)
- Perfect auto-layout / magic “generate architecture” button
- Mobile-first touch UX (usable on tablet; primary target is desktop)

## Product decisions (locked)

| Topic | Decision |
|---|---|
| Modes | Both: practice playground + shareable timed challenges |
| Validator | Layered: hard must-pass requirements + soft rubric (score/stars) |
| Authoring | Static challenge bank in code + `/admin/system-design` picker |
| Visuals | Hybrid: existing tokens/shell + richer canvas/palette chrome |
| Canvas tech | `@xyflow/react` (React Flow) |
| Session model | One challenge per play session in v1 |
| Persistence | `localStorage` draft per challenge id; URL for session config only |
| Submit | Extend `/api/submit` with `kind: "system-design"` |

## Routes

| Route | Role |
|---|---|
| `/system-design` | Lobby: browse challenges, start practice |
| `/system-design/play` | Builder canvas (`?c=&mode=&e=&t=&s=`) |
| `/admin/system-design` | Examiner picker → shareable challenge link |
| `/` | Home card linking to lobby + admin |

**Query params (play):**

- `c` — challenge id (slug string, e.g. `realtime-chat`)
- `mode` — `practice` \| `challenge` (default `practice`)
- `e` — examiner id (challenge mode)
- `t` — time limit seconds (challenge mode; omit = no timer)
- `s` — optional seed (reserved; unused in single-challenge v1)

## UX layout (play)

Three-column desktop layout matching the reference:

1. **Header** — title, hint/constraint chips, timer (challenge), score after validation, applicant name on submit
2. **Left: Component bank** — search + categorized palette; drag onto canvas; “request a component” is a disabled/mailto stub or local note (no backend)
3. **Center: Canvas** — React Flow with custom nodes/edges; toolbar: Select, Connect, Delete, Clear; zoom; minimap optional
4. **Right: Brief + validator** — challenge title/difficulty, requirement checklist, scale specs, validation dimensions, Run Validation / Submit Design
5. **Footer strip** — live tips, best-practice callouts, bottleneck warnings derived from current graph + last validation

Practice mode: hide Submit (or show “Copy report”); timer optional/off.  
Challenge mode: Time Attack freeze overlay on timeout (reuse patterns); Submit emails examiner.

## Domain model

### Component catalog (`lib/system-design/components.ts`)

Shared palette entries (not challenge-specific; challenges may restrict `allowedComponents`):

```ts
type ComponentCategory =
  | "client"
  | "edge"
  | "compute"
  | "data"
  | "messaging"
  | "storage"
  | "observability"
  | "other";

type ComponentDef = {
  id: string;           // e.g. "load-balancer"
  label: string;
  category: ComponentCategory;
  description: string;
  tags: string[];       // for search + validator hints
  icon: string;         // registry key for SVG icon
};
```

Initial catalog (≥14): Client (Web/Mobile), Load Balancer, CDN, API Gateway, Auth Service, Chat Service, Notification Service, Worker, WebSocket Gateway, Message Queue, Cache (Redis), Database (PostgreSQL), Object Storage (S3), Monitoring & Logging, Presence Service (optional).

### Challenge bank (`lib/system-design/challenges/*.ts`)

```ts
type ScaleSpec = {
  users: string;
  traffic: "low" | "medium" | "high";
  readHeavy: "low" | "medium" | "high";
  writeHeavy: "low" | "medium" | "high";
  durability: "low" | "medium" | "high";
};

type HardRequirement = {
  id: string;
  label: string;          // shown in brief checklist
  hint?: string;          // revealed via Hints budget
  /**
   * Predicate id resolved by the validator registry.
   * Predicates receive the design graph + challenge context.
   */
  predicate: string;
  params?: Record<string, unknown>;
};

type SoftDimension =
  | "scalability"
  | "reliability"
  | "faultTolerance"
  | "latency"
  | "costEfficiency"
  | "tradeoffs";

type SoftRubricRule = {
  dimension: SoftDimension;
  weight: number;         // relative weight within soft score
  predicate: string;
  params?: Record<string, unknown>;
  tipOnFail?: string;
  bottleneckOnFail?: string;
};

type Challenge = {
  id: string;             // slug
  title: string;
  difficulty: "easy" | "medium" | "hard";
  blurb: string;
  objective: string;
  scale: ScaleSpec;
  allowedComponents?: string[]; // omit = full catalog
  hardRequirements: HardRequirement[];
  softRubric: SoftRubricRule[];
  starterTips: string[];
  /** Optional starter nodes for empty canvas guidance — not pre-placed */
  suggestedComponents?: string[];
};
```

### Design graph (canvas state)

```ts
type DesignNode = {
  id: string;
  componentId: string;
  position: { x: number; y: number };
  label?: string;         // optional override
};

type EdgeKind = "request" | "async" | "data" | "observe";

type DesignEdge = {
  id: string;
  source: string;
  target: string;
  kind: EdgeKind;         // solid vs dashed styling
};

type DesignGraph = {
  nodes: DesignNode[];
  edges: DesignEdge[];
};
```

Map to React Flow `Node`/`Edge` in the UI layer; keep `DesignGraph` as the validation/input/export shape.

## Smart validator

**Location:** `lib/system-design/validate.ts` + `lib/system-design/predicates.ts`

**Flow:**

1. Normalize graph (unknown component ids rejected; dangling edges ignored with warning)
2. Evaluate each hard requirement → `{ id, label, passed, detail? }`
3. Evaluate soft rubric rules → per-dimension score 0–1 (weighted average of matching rules)
4. Aggregate soft score → 0–100 points (and optional star display = score/20)
5. Emit feedback items: tips, best practices, bottlenecks (deduped)

**Example predicates (registry):**

| Predicate | Meaning |
|---|---|
| `hasComponent` | At least one node with `componentId` |
| `hasAnyComponent` | At least one of a list |
| `pathExists` | Directed path from type A to type B |
| `allOfTypeConnectTo` | Every node of type A has edge to some type B |
| `hasEdgeKindBetween` | Edge of kind K between types |
| `noDirectClientToDb` | No client→database edge |
| `hasCacheBeforeDb` | Path to DB goes through cache OR cache sits on read path |
| `hasQueueForWritePath` | Async decoupling on write-heavy path |
| `hasObservability` | Monitoring connected to ≥N services |
| `hasRedundancySignal` | LB or multiple compute replicas present |
| `componentCountAtLeast` | Count of component type ≥ N |
| `maxFanIn` | Fail if one node has fan-in above threshold (bottleneck heuristic) |

Hard requirements use these predicates with challenge-specific params. Soft rules reuse the same registry with weaker thresholds / tips.

**Scoring (v1):**

- Hard pass rate shown as checklist (must-pass for “complete” badge)
- Soft score = weighted average × 100
- Display score only after first “Run Validation” (or live soft hints without full score — footer tips can be always-on lightweight heuristics)

**Live footer (lightweight):** On graph change, run a cheap subset of tip generators (not full score) so the UI feels alive without thrashing.

## Challenge set (v1 — 6)

1. **`realtime-chat`** (medium) — WhatsApp-like; WebSocket, queue, presence, fan-out, durability  
2. **`url-shortener`** (easy) — redirects, cache, unique codes, analytics optional  
3. **`news-feed`** (medium) — fan-out, cache, CDN, async workers  
4. **`file-storage`** (medium) — object storage, CDN, auth, metadata DB  
5. **`ride-matching`** (hard) — geo/matching service, queue, realtime location, workers  
6. **`rate-limiter`** (easy) — gateway, cache/counter, observability

Each challenge defines ≥4 hard requirements and ≥1 soft rule per dimension (or shared defaults + overrides).

## Admin (`/admin/system-design`)

Mirror quiz admin simplicity:

- List challenges with difficulty filter + search
- Select **one** challenge (v1)
- Examiner, Time Attack presets, mode practice/challenge
- Copy shareable `/system-design/play?...` link
- Optional localStorage “saved challenge links” names

No multi-challenge exam set in v1.

## Submit / email

Extend `Submission` in `app/api/submit/route.ts`:

```ts
kind?: "exam" | "quiz" | "system-design";

type SystemDesignResult = {
  challengeId: string;
  challengeTitle: string;
  difficulty: string;
  hardPassed: number;
  hardTotal: number;
  softScore: number;
  requirements: { label: string; passed: boolean }[];
  dimensions: { dimension: string; score: number }[];
  bottlenecks: string[];
  // compact graph summary for examiner
  componentsUsed: string[];
  edgeCount: number;
};
```

Email HTML: summary score, checklist, soft dimensions, bottlenecks, component list. No need to embed full coordinates.

## UI components (high level)

```
components/system-design/
  ComponentPalette.tsx
  DesignCanvas.tsx          # React Flow wrapper
  nodes/ArchitectureNode.tsx
  edges/ArchitectureEdge.tsx
  ChallengeBrief.tsx
  ValidatorPanel.tsx
  FeedbackStrip.tsx
  BuilderHeader.tsx
  icons/                    # SVG icon registry per component
app/system-design/page.tsx
app/system-design/play/page.tsx
app/admin/system-design/page.tsx
lib/system-design/
  types.ts
  components.ts
  challenges/index.ts + per-challenge files
  predicates.ts
  validate.ts
  tips.ts
  serialize.ts              # graph <-> RF / localStorage
```

## State management

- React state + React Flow controlled nodes/edges in play page (or small context)
- Draft autosave: `localStorage["sd-draft:" + challengeId]` = DesignGraph JSON
- Validation result in state; Reset Canvas clears graph (confirm); Clear selection separate from Clear all
- Hints budget: show up to N hard-requirement hints (default 3) per session

## Visual / motion

- Reuse `globals.css` tokens; dark mode via existing `next-themes`
- Custom node cards with category-colored icon badges (SVG, not emoji-heavy)
- Solid edges = request/data; dashed = observe/async
- Subtle Motion on palette drag hover / validation checkmarks
- Generate small SVG icons in-repo (no external image CDN required); optional GenerateImage only if a marketing hero is needed on lobby — prefer SVG kit

## Testing

- Unit tests (`node --test`) for predicates + `validate()` with fixture graphs
- Unit tests for challenge bank integrity (ids unique, predicates exist, allowed components valid)
- No E2E required for v1; manual checklist in plan

## Error handling

- Unknown `c` → lobby redirect with message
- Empty graph validation → all hard fail + tip “add components”
- Submit without validation → run validation once, then submit
- Submit failures → same toast/error pattern as exam/quiz
- Frozen timer → block edits optionally or allow view-only + force submit (match exam freeze UX)

## Accessibility (pragmatic)

- Keyboard: delete selected, escape clear selection
- Palette items focusable; canvas relies on React Flow defaults
- Color not sole status signal (icons + text on checklist)

## Rollout

1. Lib types + catalog + predicates + validator tests  
2. Challenge bank (6)  
3. Canvas + palette UI  
4. Brief + validator panels + feedback strip  
5. Lobby + admin + home links  
6. Submit email kind  
7. Polish icons/motion + manual pass  

## Open follow-ups (explicitly out of v1)

- Multi-challenge sessions  
- Admin rule editor  
- Server/LLM validation  
- Design export PNG/SVG  
- Collaborative mode  
