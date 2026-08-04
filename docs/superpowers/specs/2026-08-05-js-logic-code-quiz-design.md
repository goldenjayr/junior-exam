# JS Logic Code Quiz — Design Spec

**Date:** 2026-08-05  
**Status:** Approved  
**Repo:** `basic-technical-interview` (Next.js App Router, React 19, Tailwind 4)

## Summary

Add **10 JavaScript logic / code-trace questions** to the quiz bank and a matching **admin preset** so examiners can build a junior–mid “predict what this does” screen from `/admin/quiz`.

## Goals

- Code-heavy questions: predict output, click the buggy line, order event-loop steps  
- Cover both junior pitfalls and mid-level mental models in one set of 10  
- Surface immediately in `/admin/quiz` via existing topic filter (`javascript`) + a named preset  
- Reuse existing question types and grading — no engine or UI changes

## Non-goals (v1)

- New `QuizTopic` or separate bank file  
- Admin UI changes beyond the new preset appearing in the list  
- Changing grading / accept matching for `output`  
- Expanding beyond these 10 items in this change

## Product decisions (locked)

| Topic | Decision |
|---|---|
| Placement | Append to `lib/quiz/bank/javascript.ts` |
| IDs | `301–310` (next free range after Python `271–300`) |
| Topic field | `javascript` (existing) |
| Types | `output` ×4, `hotspot` ×3, `order` ×3 |
| Difficulty | ~3 easy / ~5 medium / ~2 hard (junior + mid) |
| Preset | “JS Logic Trace” → exactly ids `301–310`, ~15 min |
| Approach | Extend existing bank + preset (no new topic) |

## Architecture

No new modules. Data-only change:

```
lib/quiz/bank/javascript.ts  — append QuizQuestion[] entries 301–310
lib/quiz/presets.ts          — add QuizPreset { name: "JS Logic Trace", ids: [301..310] }
```

`/admin/quiz` already loads `quizQuestions` and `quizPresets`; new items appear automatically under topic `javascript` and in “Start from a preset…”.

## Question bank (exact)

### 301 — output · easy · var loop + closure

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
```

- **prompt:** What is logged (three values, space-separated)?  
- **accept:** `["3 3 3", "3, 3, 3", "3,3,3"]`  
- **explanation:** `var` is function-scoped; all timeouts see the final `i` after the loop.

### 302 — output · medium · extracted method loses `this`

Locked snippet (logs without throwing, so `output` grading stays a string match):

```js
"use strict";
const obj = {
  n: 1,
  get() {
    return this && this.n;
  },
};
const g = obj.get;
console.log(g());
```

- **prompt:** What is logged?  
- **accept:** `["undefined"]`  
- **explanation:** Extracting the method loses the receiver. Calling `g()` unbound makes `this` falsy under the guard, so the expression yields `undefined` instead of `1`.

### 303 — order · medium · event loop basics

- **prompt:** Order these from earliest to latest in the event loop:  
- **items:**
  - `sync` — Synchronous `console.log` on the call stack  
  - `promise` — `Promise.then` callback (microtask)  
  - `timeout` — `setTimeout(fn, 0)` callback (macrotask)  
- **correctOrder:** `["sync", "promise", "timeout"]`  
- **explanation:** Current stack first; microtasks drain before the next macrotask.

### 304 — hotspot · easy · const reassignment

```js
const user = { name: "Ada" };
user.age = 30;
user = { name: "Grace" };
console.log(user.name);
```

- **prompt:** Click the line that throws at runtime.  
- **regions:** lines 1–4; **correctRegionId:** line 3 (`user = …`)  
- **explanation:** Mutating properties of a `const` object is fine; rebinding the binding is not.

### 305 — output · medium · shared object reference

```js
const a = { x: 1 };
const b = a;
b.x = 2;
console.log(a.x);
```

- **prompt:** What is logged?  
- **accept:** `["2"]`  
- **explanation:** `b` aliases `a`; mutating `b.x` mutates the same object.

### 306 — order · hard · nested microtask before macrotask

Show this program in the prompt (markdown code fence):

```js
console.log("S");
Promise.resolve()
  .then(() => {
    console.log("M1");
    return Promise.resolve();
  })
  .then(() => console.log("M2"));
setTimeout(() => console.log("T"), 0);
```

- **prompt:** Order the logged labels from earliest to latest.  
- **items:** `{ id: "S", label: '"S"' }`, `{ id: "M1", label: '"M1"' }`, `{ id: "M2", label: '"M2"' }`, `{ id: "T", label: '"T"' }`  
- **correctOrder:** `["S", "M1", "M2", "T"]`  
- **explanation:** Nested microtasks still run before the next macrotask (`setTimeout`).

### 307 — hotspot · medium · Temporal Dead Zone

```js
console.log(a);
let a = 1;
var b = 2;
console.log(b);
```

- **prompt:** Click the line that causes a Temporal Dead Zone `ReferenceError`.  
- **correctRegionId:** line 1  
- **explanation:** `let` is in the TDZ until initialized; `var` is hoisted and initialized to `undefined`.

### 308 — output · hard · Promise vs setTimeout

```js
setTimeout(() => console.log("A"), 0);
Promise.resolve().then(() => console.log("B"));
console.log("C");
```

- **prompt:** What is logged (three values, space-separated)?  
- **accept:** `["C B A", "C, B, A", "C,B,A"]`  
- **explanation:** Sync `C` first; microtask `B` before macrotask `A`.

### 309 — hotspot · medium · unexpected array mutation

```js
const nums = [3, 1, 2];
const sorted = nums.sort();
console.log(nums);
console.log(sorted);
```

- **prompt:** Click the line that mutates the original `nums` array.  
- **correctRegionId:** line 2 (`nums.sort()`)  
- **explanation:** `sort` mutates in place and returns the same array reference; prefer `toSorted` or a copy for immutability.

### 310 — order · easy · fetch pipeline

- **prompt:** Order the typical steps to handle a successful async fetch of JSON:  
- **items:** `fetch(url)` → `await response.json()` → use the parsed data  
- **correctOrder:** `["fetch", "res", "use"]`  
- **explanation:** Obtain a `Response`, parse the body, then use the data.

## Preset

```ts
{
  name: "JS Logic Trace",
  description:
    "Junior–mid code-tracing: closures, this, references, TDZ, mutation, and event-loop order.",
  ids: [301, 302, 303, 304, 305, 306, 307, 308, 309, 310],
  suggestedMinutes: 15,
}
```

Do **not** fold these ids into Full Stack Blitz / Junior Knowledge Full in this change (those presets are intentional broad sweeps of earlier id ranges).

## Overlap note

Existing JS bank already has similar items (e.g. event-loop order id 15, const hotspot 21, TDZ hotspot 22, fetch order 16). New 301–310 are intentional logic-set companions with distinct prompts/snippets so the preset is self-contained without depending on early ids. Minor conceptual overlap is acceptable.

## Error handling / grading

Unchanged. `output` answers use existing string accept lists; `hotspot` / `order` use existing graders in `lib/quiz/grade.ts`.

## Testing

- Manual: open `/admin/quiz`, filter topic `javascript`, confirm ids 301–310 appear; load preset “JS Logic Trace”, copy link, run `/quiz` through all 10 in practice mode and verify correct answers grade as expected.  
- Optional: no new unit tests required unless accept-list edge cases need fixtures (existing `grade.test.ts` already covers types).

## Implementation notes

1. Append questions to `javascript.ts` after id 30 (numeric ids need not be contiguous).  
2. Add preset near other topic essentials in `presets.ts`.  
3. No changes to `types.ts`, `index.ts`, or admin page.
