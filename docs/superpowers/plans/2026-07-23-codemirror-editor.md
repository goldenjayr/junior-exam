# CodeMirror Editor Swap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the custom textarea `CodeEditor` with a robust CodeMirror 6 editor via `@uiw/react-codemirror`, keeping the same `value` / `onChange` / `readOnly` API for the exam page.

**Architecture:** Single client component at `components/CodeEditor.tsx` wraps `@uiw/react-codemirror` with `basicSetup` (full defaults), `@codemirror/lang-javascript` with JSX, and built-in `theme="dark"`. Exam page stays unchanged.

**Tech Stack:** Next.js 16 App Router, React 19, `@uiw/react-codemirror`, `@codemirror/lang-javascript`, Tailwind 4 (host wrapper only)

## Global Constraints

- Public API must remain `{ value: string; onChange: (value: string) => void; readOnly?: boolean }`
- Touch only `components/CodeEditor.tsx` and package dependencies (no exam page changes unless required)
- Use `theme="dark"`; enable JSX via `javascript({ jsx: true })`
- When frozen: `readOnly={true}` and `editable={false}`
- Min height ≈ 380px; keep slate rounded border shell
- Do not commit unless the user explicitly asks
- Spec: `docs/superpowers/specs/2026-07-23-codemirror-editor-design.md`

---

### Task 1: Install CodeMirror dependencies

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json` (via npm)

**Interfaces:**
- Consumes: none
- Produces: packages `@uiw/react-codemirror`, `@codemirror/lang-javascript` available for import

- [x] **Step 1: Install packages**

Run:

```bash
pnpm add @uiw/react-codemirror @codemirror/lang-javascript
```

Expected: exit 0; both packages listed under `dependencies` in `package.json`.

- [x] **Step 2: Verify imports resolve**

Run:

```bash
node -e "require.resolve('@uiw/react-codemirror'); require.resolve('@codemirror/lang-javascript'); console.log('ok')"
```

Expected: prints `ok`.

---

### Task 2: Replace `CodeEditor` with CodeMirror

**Files:**
- Modify: `components/CodeEditor.tsx` (full rewrite)
- Test: manual on `/exam` (no automated editor unit test per spec)

**Interfaces:**
- Consumes: `@uiw/react-codemirror` default export; `javascript` from `@codemirror/lang-javascript`
- Produces: default export `CodeEditor` with props `{ value: string; onChange: (value: string) => void; readOnly?: boolean }`

- [x] **Step 1: Rewrite `components/CodeEditor.tsx`**

Replace the entire file with:

```tsx
"use client";

import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";

export default function CodeEditor({
  value,
  onChange,
  readOnly = false,
}: {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-700">
      <CodeMirror
        value={value}
        height="380px"
        minHeight="380px"
        theme="dark"
        extensions={[javascript({ jsx: true })]}
        basicSetup={true}
        indentWithTab={true}
        readOnly={readOnly}
        editable={!readOnly}
        onChange={onChange}
        aria-label="Code editor"
        className="text-sm"
      />
    </div>
  );
}
```

Notes:
- Remove custom gutter, Tab/Enter `handleKeyDown`, and textarea scroll sync.
- `basicSetup={true}` enables line numbers, history, search, autocomplete, fold gutter, bracket matching/closing, indent-on-input, multiple selections, and default keymap.

- [x] **Step 2: Typecheck / lint the component**

Run:

```bash
npx tsc --noEmit
```

Expected: no errors related to `components/CodeEditor.tsx`.

- [x] **Step 3: Manual verification checklist**

Start (if not already): `npm run dev`

On `/exam`:
1. Enter after an indented line keeps indent; after `{` bumps indent
2. Tab / Shift+Tab indent / outdent
3. JS keywords/strings are colored
4. Cmd/Ctrl+F opens search
5. Autocomplete suggestions appear while typing
6. Fold markers work on blocks
7. Reset replaces editor content
8. After timer freeze (or force `readOnly`), typing is blocked but scroll still works

Expected: all eight pass.

---

## Spec coverage (self-review)

| Spec requirement | Task |
|---|---|
| `@uiw/react-codemirror` + JS lang | Task 1–2 |
| `basicSetup` robust features | Task 2 |
| Dark theme | Task 2 (`theme="dark"`) |
| Unchanged public API | Task 2 |
| Only CodeEditor (+ deps) | Task 1–2 |
| `readOnly` + `editable={false}` | Task 2 |
| Min height / slate shell | Task 2 |
| Manual testing | Task 2 Step 3 |
