# Exam Test Cases UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the `/exam` Test Cases panel easy to scan with labeled Input/Expected code blocks and no horizontal scroll for long JSON.

**Architecture:** Markup and Tailwind-only update inside the existing Test Cases card list in `app/exam/page.tsx`. Reuse `callLabel` and `formatValue`. Leave Test Results untouched.

**Tech Stack:** Next.js App Router, React 19, Tailwind 4, existing `formatValue` / `callLabel` helpers.

## Global Constraints

- Scope: exam page Test Cases panel only — do not change Test Results markup
- No new packages
- Input and Expected share the same label + inset code-block treatment
- Pretty-print via `formatValue`; wrap with `whitespace-pre-wrap` (no horizontal scroll)
- Case header is `Case N`, not an inline number beside the call
- Stay within existing slate exam palette; no extra shadows or pill clusters

---

## File map

| File | Role |
|---|---|
| `app/exam/page.tsx` | Only file to modify — Test Cases list markup/classes |
| `docs/superpowers/specs/2026-07-23-exam-test-cases-ui-design.md` | Approved spec (already committed) |

No new components required; the change is small and local to one JSX block.

---

### Task 1: Restructure Test Cases card markup

**Files:**
- Modify: `app/exam/page.tsx` (Test Cases panel only — the `problem.tests.map` block)

**Interfaces:**
- Consumes: `callLabel(problem, t)`, `formatValue(t.expected)`, existing `problem.tests`
- Produces: Updated Test Cases DOM structure matching the spec layout

- [x] **Step 1: Replace the Test Cases card body**

Find the Test Cases panel (`h3` “Test Cases” … `problem.tests.map`). Replace each card’s inner markup so it matches this structure (keep the outer panel shell and count badge):

```tsx
{problem.tests.map((t, i) => (
  <div
    key={i}
    className="rounded-lg border border-slate-200 bg-white p-3"
  >
    <p className="font-sans text-[11px] font-semibold text-slate-400">
      Case {i + 1}
    </p>
    <div className="mt-2 flex flex-col gap-2">
      <div>
        <p className="font-sans text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Input
        </p>
        <pre className="mt-1 overflow-x-auto whitespace-pre-wrap rounded-md bg-slate-50 p-2 font-mono text-xs text-slate-700">
          {callLabel(problem, t)}
        </pre>
      </div>
      <div>
        <p className="font-sans text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Expected
        </p>
        <pre className="mt-1 overflow-x-auto whitespace-pre-wrap rounded-md bg-slate-50 p-2 font-mono text-xs text-slate-800">
          {formatValue(t.expected)}
        </pre>
      </div>
    </div>
  </div>
))}
```

Requirements while editing:
- Do **not** change the Test Results column
- Keep `callLabel` using `formatValue` for args (pretty-print already in place)
- Labels may render as `INPUT` / `EXPECTED` via `uppercase` class (copy can stay `Input` / `Expected`)

- [x] **Step 2: Visual verify in the browser**

Run: `pnpm dev` (if not already running), open `/exam` on a problem with large object args (e.g. `getActiveUsers`).

Check:
1. Each card shows `Case N`, then Input block, then Expected block
2. Long JSON wraps / pretty-prints — no need to scroll sideways to read the data
3. Input and Expected look parallel (same label style, same inset block)
4. Test Results panel still looks and behaves as before
5. Run Tests still works

- [x] **Step 3: Commit**

```bash
git add app/exam/page.tsx
git commit -m "$(cat <<'EOF'
feat: polish exam test cases with labeled input/expected blocks

EOF
)"
```
