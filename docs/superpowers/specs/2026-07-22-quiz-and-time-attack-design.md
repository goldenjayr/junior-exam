# Quiz Features + Time Attack — Design Spec

**Date:** 2026-07-22  
**Status:** Approved  
**Repo:** `basic-technical-interview` (Next.js App Router, React 19, Tailwind 4)

## Summary

Expand the product from “coding exam only” into a dual-track assessment hub:

1. **Coding Exam** (existing) — JS/React coding problems with in-browser tests  
2. **Knowledge Quiz** (new) — gamified, one-question-at-a-time knowledge checks across JS, TS, Tailwind, React, HTML, Node  

Both tracks gain **Time Attack**: a single session countdown configurable on the builder. When time hits zero, the session freezes; only name + Submit remain. Results still email the examiner.

## Goals

- Hiring screens *and* practice drills from one quiz engine (builder chooses mode)  
- Playful but professional quiz player (Pro Clean visual system)  
- Multiple answer interaction types with smart UIs per type  
- Shareable links (same pattern as exams)  
- Email results (same examiner map + nodemailer pipeline)  
- Time Attack for exam and quiz  

## Non-goals (v1)

- Auth / accounts / multi-tenant  
- Server-side question editing UI  
- Leaderboards, multiplayer, AI-generated questions  
- Per-question timers  
- Partial credit scoring  
- Strong anti-cheat beyond freeze + sessionStorage clock  

## Product decisions (locked)

| Topic | Decision |
|---|---|
| Purpose | Dual: hiring + practice |
| Feedback | Builder toggle: `assessment` \| `practice` |
| Answer types | Full set (see below) |
| Timer | One total session clock |
| Navigation | One-at-a-time; revisit allowed; **answers lock when leaving** a question |
| Bank size | ~120+ questions across 6 topics |
| Multi / match scoring | All-or-nothing |
| Architecture | Parallel product surfaces + shared timer/email (not a unified session engine rewrite) |
| Quiz visual style | Pro Clean (aligned with existing exam UI) |

## Routes & surfaces

### Home `/`

Hub with two lanes:

- **Coding Exam** → Take (`/exam`) · Build (`/admin`)  
- **Knowledge Quiz** → Take (`/quiz`) · Build (`/admin/quiz`)  

Update copy/metadata from “Junior JavaScript Assessment only” to a broader product name still focused on junior technical screening.

### Exam (extended)

- `/admin` — Exam Builder  
  - Add **Time Attack**: Off | 10/15/30/45/60 min | Custom minutes (1–180)  
  - Share link appends `t=<seconds>` when enabled  
- `/exam` — existing coding player  
  - If `t` present: show Time Attack UI; on expire freeze code editing, Run Tests, problem navigation  
  - Submit still works; email includes timer metadata  

### Quiz (new)

- `/admin/quiz` — Quiz Builder (mirrors exam builder patterns)  
  - Filters: topic, difficulty, type, search, selected-only  
  - Presets + localStorage “My Quizzes”  
  - Examiner select, mode (`assessment` \| `practice`), Time Attack  
  - Link: `/quiz?q=1,2,3&e=jayr&mode=assessment&t=900`  
- `/quiz` — gamified one-item player  

### Shared API

- `POST /api/submit` accepts `kind: "exam" | "quiz"` and formats HTML email accordingly  

## Share link query params

### Exam

| Param | Meaning | Default |
|---|---|---|
| `p` | Comma-separated problem ids | all problems |
| `e` | Examiner id | server default |
| `t` | Time limit seconds | no timer |

### Quiz

| Param | Meaning | Default |
|---|---|---|
| `q` | Comma-separated quiz question ids | empty → empty state |
| `e` | Examiner id | server default |
| `mode` | `assessment` \| `practice` | `assessment` |
| `t` | Time limit seconds | no timer |

## Quiz data model

### Layout

```
lib/quiz/
  types.ts
  grade.ts
  index.ts          # aggregate bank, parseQuizIds, categories
  presets.ts
  bank/
    javascript.ts
    typescript.ts
    tailwind.ts
    react.ts
    html.ts
    nodejs.ts
```

### Topics

`javascript | typescript | tailwind | react | html | nodejs`

### Difficulty

`easy | medium | hard` (same badge language as exam)

### Question types

| `type` | UI | Correct shape | Grade (all-or-nothing) |
|---|---|---|---|
| `single` | Large option cards / radio | `correctId: string` | exact id |
| `multi` | Checkboxes | `correctIds: string[]` | set equality |
| `boolean` | True / False duel buttons | `correct: boolean` | exact |
| `fill` | Short text | `accept: string[]` | normalize (trim, collapse space, case-insensitive) match any |
| `order` | Reorder list (buttons or drag) | `correctOrder: string[]` | exact sequence |
| `snippet` | Pick one code card | `correctId: string` | exact id |
| `match` | Left→right pairing | `pairs: Record<string, string>` | full map equality |
| `hotspot` | Click region on code block | `correctRegionId: string` | exact id |
| `output` | Type expected output | `accept: string[]` | same as fill |

### Common fields

```ts
type QuizBase = {
  id: number;
  topic: QuizTopic;
  difficulty: "easy" | "medium" | "hard";
  prompt: string;
  hint?: string;          // practice-only helper
  explanation?: string;   // practice after lock; optional in email
};
```

Each concrete type extends base with type-specific fields (options, code, regions, etc.).

### Session answer state

```ts
type AnswerEntry = {
  value: AnswerValue;
  locked: boolean;
  graded?: { correct: boolean };
};
// Record<questionId, AnswerEntry>
```

- **Lock** when the user leaves the item (Next or jump away after answering).  
- If they jump away without answering, do not lock (still unanswered).  
- **Practice:** grade on lock; show feedback + explanation.  
- **Assessment:** no correctness until submit (or freeze then submit).  
- Unanswered at submit/time-up → incorrect / not scored as correct.

### Presets (examples)

- Quick JS Screen  
- React Essentials  
- Tailwind Sprint  
- Node API Basics  
- Full Stack Blitz  
- Time Attack 10  
- Junior Knowledge Full  

Presets store ordered id lists + description + suggested minutes (soft guidance).

## Quiz player UX (Pro Clean)

- Light slate canvas (matches exam), one centered question card  
- Progress rail / dots (current, answered-locked, unanswered); jump to revisit  
- Locked items: show prior answer read-only  
- Type-specific input components swap inside the stage  
- Header: title strip, score or progress count, Time Attack bar, Submit  
- Practice: quiet green/red feedback after lock + short explanation; optional streak  
- Assessment: no mid-run correctness  
- Motion: CSS transitions; optional light confetti on practice correct / complete — respect `prefers-reduced-motion`  
- Persistence: `localStorage` for answers/locks keyed by question set + mode  
- Empty link: clear empty state  

## Time Attack (shared)

### Builder

- Control: **Off** | **10 / 15 / 30 / 45 / 60** | **Custom (1–180 minutes)**  
- Encode as `t=<seconds>`; omit when off  
- Soft estimate still shown separately from hard limit  

### Runtime

```ts
// lib/time-attack.ts + components/TimeAttackBar.tsx + FreezeOverlay.tsx
useTimeAttack(limitSeconds: number | null)
// → { remaining, isExpired, elapsed, limitSeconds }
```

- Timer starts on session mount  
- `sessionStorage` stores `startedAt` + limit key so refresh cannot cheaply reset remaining time  
- Under 30s: amber → red urgency  
- On expire: `frozen = true`; disable all interactive answering; show FreezeOverlay; only name + Submit enabled  
- Email fields: `timedOut`, `timeLimitSeconds`, `timeUsedSeconds`  

### Exam-specific freeze

Disable: code editor, Run Tests, Reset, problem switching. Submit remains.

### Quiz-specific freeze

Disable: all inputs, Next, progress jumps. Submit remains.

## Submit / email

```ts
type Submission = {
  kind: "exam" | "quiz";
  examiner?: string;
  applicantName: string;
  timedOut?: boolean;
  timeLimitSeconds?: number;
  timeUsedSeconds?: number;
  mode?: "assessment" | "practice"; // quiz
  results: ExamResult[] | QuizResult[];
};
```

- Exam results: existing shape (title, difficulty, status, passed/total, code, error)  
- Quiz results: title/prompt, topic, difficulty, type, correct boolean, answer summary, explanation optional  
- Subject lines distinguish Exam vs Quiz  
- Examiner map unchanged (server-side)  

## Component / file map

```
app/page.tsx
app/layout.tsx
app/admin/page.tsx
app/admin/quiz/page.tsx
app/exam/page.tsx
app/quiz/page.tsx
app/api/submit/route.ts

components/TimeAttackBar.tsx
components/FreezeOverlay.tsx
components/quiz/QuizProgress.tsx
components/quiz/QuestionStage.tsx
components/quiz/inputs/{SingleChoice,MultiChoice,BooleanChoice,FillInput,OrderList,SnippetPick,MatchPairs,HotspotCode,OutputInput}.tsx
components/quiz/FeedbackBurst.tsx

lib/time-attack.ts
lib/quiz/types.ts
lib/quiz/grade.ts
lib/quiz/grade.test.ts
lib/quiz/index.ts
lib/quiz/presets.ts
lib/quiz/bank/{javascript,typescript,tailwind,react,html,nodejs}.ts
```

## Edge cases

- Invalid / empty quiz ids → empty state  
- Unknown mode → `assessment`  
- Invalid `t` → no timer  
- Double submit prevented while `sending`  
- Email failure → retry UI (existing pattern)  
- Mid-session refresh restores answers, locks, remaining time  
- Custom time clamped 1–180 minutes  

## Testing strategy

- Unit tests for `grade.ts` covering every type + normalization edge cases  
- Unit tests for `parseQuizIds`, `parseTimeLimit`  
- Existing `lib/runner.test.ts` remains green  
- Manual: builder link round-trip, freeze at 0, practice vs assessment, exam timer  

## Content plan

- Target **≥20 questions per topic** (6 topics → **≥120** total)  
- Mix difficulties and types per topic  
- Stable numeric ids; never reuse ids  
- Prefer practical junior-level questions over trivia  

## Success criteria

1. Interviewer can build a quiz, copy link, candidate completes one-at-a-time UI, results arrive by email  
2. Practice mode shows feedback on lock; assessment does not  
3. Time Attack freezes exam and quiz when configured  
4. All nine answer types render and grade correctly  
5. Home clearly offers both product lanes  
