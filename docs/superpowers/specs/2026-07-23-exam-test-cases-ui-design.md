# Exam Test Cases UI — Design Spec

**Date:** 2026-07-23  
**Status:** Approved  
**Repo:** `basic-technical-interview` (Next.js App Router, React 19, Tailwind 4)

## Summary

Improve the **Test Cases** panel on `/exam` so each case is easy to scan: clear hierarchy (case header → Input → Expected) and polished, consistent code blocks. Pretty-printed values wrap instead of forcing horizontal scroll.

## Goals

- Clear visual hierarchy: case identity, then Input, then Expected
- Matching treatment for Input and Expected (labels + inset code blocks)
- Readable long JSON without horizontal scrolling
- Light polish only — same panel/card list layout model

## Non-goals

- Test Results panel changes
- Collapsible / truncated cases
- Admin page test-case UI
- New dependencies or design-system components
- Changing test data or runner behavior

## Product decisions (locked)

| Topic | Decision |
|---|---|
| Approach | Labeled Input / Expected blocks inside existing card list |
| Scope | Exam page Test Cases panel only (`app/exam/page.tsx`) |
| Case header | `Case N` (sans-serif, muted), above the body — not inline with the call |
| Labels | `INPUT` and `EXPECTED` — small uppercase tracking, identical style |
| Code blocks | Subtle inset (`bg-slate-50` or equivalent), mono `text-xs`, `whitespace-pre-wrap` |
| Formatting | Both Input and Expected use pretty-print via existing `formatValue` / indented JSON |
| Scroll | No horizontal scroll for normal cases; wrap / break within the card |
| Results panel | Unchanged |
| Shell | Keep panel chrome (border, slate-50 background, count badge) |

## Layout

```
┌─ Test Cases [n] ─────────────────────────┐
│  ┌─ Case 1 ───────────────────────────┐  │
│  │  INPUT                             │  │
│  │  ┌───────────────────────────────┐ │  │
│  │  │ getActiveUsers([              │ │  │
│  │  │   { "id": 1, ... }            │ │  │
│  │  │ ])                            │ │  │
│  │  └───────────────────────────────┘ │  │
│  │  EXPECTED                          │  │
│  │  ┌───────────────────────────────┐ │  │
│  │  │ [ { "id": 1, ... } ]          │ │  │
│  │  └───────────────────────────────┘ │  │
│  └────────────────────────────────────┘  │
│  … Case 2, Case 3 …                      │
└──────────────────────────────────────────┘
```

## Visual polish

- Cards: white, light border, slightly tighter padding; no extra shadows or pill clusters
- Spacing: consistent gap between Input and Expected within a card; consistent gap between cards
- Typography: sans labels; mono only inside code blocks
- Color: stay within existing slate / blue exam palette

## Implementation notes

- Prefer markup/class changes in the Test Cases map in `app/exam/page.tsx`
- Reuse `callLabel` + `formatValue` already used on the exam page
- Keep `callLabel` pretty-printing args (same readability contract as Expected)
- Do not alter Test Results markup in this change

## Success criteria

- Long object/array inputs are fully readable without horizontal scrolling
- Input and Expected are visually parallel and easy to distinguish at a glance
- Test Results and runner behavior are unchanged
- No new packages
