# CodeMirror Editor Swap — Design Spec

**Date:** 2026-07-23  
**Status:** Approved (pending final review)  
**Repo:** `basic-technical-interview` (Next.js App Router, React 19, Tailwind 4)

## Summary

Replace the custom `<textarea>`-based `CodeEditor` with **CodeMirror 6** via `@uiw/react-codemirror`, giving the coding exam a durable, full-featured in-browser editor while keeping the existing consumer API unchanged.

## Goals

- Real editor UX: syntax highlighting, indent/outdent, brackets, history, search, autocomplete, folding
- Preserve exam integration: controlled `value` / `onChange` / `readOnly` (frozen sessions)
- Match existing dark slate visual shell (border, radius, min height)
- Prefer composing standard CodeMirror features over hand-rolled key handlers

## Non-goals (this pass)

- Language switcher / multi-language modes beyond JS(+JSX)
- Light theme toggle
- Monaco editor
- Lint diagnostics driven by test results
- Changing Reset / Run Tests / problem UI outside the editor component

## Product decisions (locked)

| Topic | Decision |
|---|---|
| Approach | `@uiw/react-codemirror` + CodeMirror 6 |
| Feature set | Robust / IDE-like (`basicSetup` defaults + JS language) |
| Language | `@codemirror/lang-javascript` with JSX enabled |
| Theme | `@uiw/react-codemirror` built-in `theme="dark"` |
| Public API | Unchanged: `value`, `onChange`, `readOnly?` |
| Touch surface | Only `components/CodeEditor.tsx` (+ package deps) |
| Exam page | No prop/API changes required |

## Architecture

```
app/exam/page.tsx
  └── CodeEditor (same props)
        └── @uiw/react-codemirror
              ├── basicSetup (line numbers, history, search, autocomplete,
              │               fold gutter, bracket matching, close brackets,
              │               indent on input, multiple selections, keymap)
              ├── javascript({ jsx: true })
              └── dark theme + shell styling (rounded slate border, minHeight)
```

### Component contract

```ts
{
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean; // maps to CodeMirror readOnly when exam is frozen
}
```

### Behavior mapping

| Need | Implementation |
|---|---|
| Enter keeps / bumps indent | CodeMirror indent-on-input + default keymap |
| Tab / Shift+Tab | `indentWithTab` (default true) |
| Syntax colors | `javascript({ jsx: true })` + dark highlight style |
| Undo / redo | `basicSetup` history |
| Search | `basicSetup` search panel (Cmd/Ctrl+F) |
| Autocomplete | `basicSetup` autocompletion |
| Fold | `basicSetup` fold gutter |
| Bracket match / auto-close | `basicSetup` |
| Frozen exam | `readOnly={true}` and `editable={false}` |

## Dependencies

Install (exact set may include transitive peers resolved by npm):

- `@uiw/react-codemirror`
- `@codemirror/lang-javascript`

Use `basicSetup` from the React wrapper (boolean or options object). Do not reimplement Tab/Enter handlers from the old textarea.

## Visual integration

- Keep outer look close to current exam panel: dark background, slate border, rounded corners
- Min height ≈ `380px` (parity with current editor)
- Line numbers come from CodeMirror gutters (remove custom gutter DOM)
- Avoid fighting CodeMirror chrome with heavy Tailwind overrides; style the host wrapper and use theme props/extensions

## Error handling & edge cases

- Controlled updates from Reset must replace document content (wrapper already supports controlled `value`)
- `readOnly` during freeze must block edits (`readOnly` + `editable={false}`) while still allowing scroll/selection for review
- Client-only: component already is `"use client"`; CodeMirror must not run during SSR without a client boundary (existing boundary is sufficient)

## Testing

- Manual: type multi-line JS, confirm Enter indent, Tab/Shift+Tab, highlighting, Cmd/Ctrl+F, autocomplete, fold, Reset, freeze/`readOnly`
- No new automated unit test required for the editor shell unless a pure helper is extracted (none planned)
- Existing exam/runner tests remain unchanged

## Implementation notes

- Delete custom Tab/Enter `handleKeyDown` logic when swapping
- Keep file comment honest: CodeMirror is the intentional long-term editor
- Do not change `app/exam/page.tsx` unless a prop adaptation is unexpectedly required
