# Upper-Easy JS & TS Exam Problems — Design Spec

**Date:** 2026-08-05  
**Status:** Approved  
**Repo:** `basic-technical-interview`

## Summary

Add **12 upper-easy coding exam problems** (6 JavaScript + 6 TypeScript) focused on everyday app helpers. Difficulty stays `easy` but sits at the top of that band (filter/map/sort/merge/round — no recursion or deep algorithms).

## Decisions (locked)

| Topic | Decision |
|---|---|
| Count | 6 JS + 6 TS |
| Flavor | Everyday app helpers |
| Placement | Append to `lib/problems.ts` |
| IDs | JS `58–63`, TS `64–69` |
| Difficulty | All `difficulty: "easy"` |
| Solutions | Add to `lib/exam-solutions.ts` |
| TS tests | Extend `typescript-runner.test.ts` expected id list |

## Problem list

### JavaScript (58–63)

| ID | Title | fnName | Notes |
|---|---|---|---|
| 58 | Format Full Name | `formatFullName` | Join first/last; trim; omit empties |
| 59 | Pick Completed Tasks | `getCompletedTitles` | `done === true` → titles |
| 60 | Build Query String | `buildQueryString` | Skip null/undefined; `key=value&…` |
| 61 | Unique Tags | `uniqueTags` | Flatten string[][]; unique; first-seen order |
| 62 | Apply Discount | `applyDiscount` | Round to 2 decimals |
| 63 | Newest Messages First | `sortMessagesNewestFirst` | Sort copy by `createdAt` desc |

### TypeScript (64–69)

| ID | Title | fnName | Notes |
|---|---|---|---|
| 64 | Typed Format Full Name | `formatFullName` | `Person` type |
| 65 | Active Product Names | `getInStockNames` | Filter `inStock` → names |
| 66 | Merge Settings | `mergeSettings` | Defaults + `Partial<Settings>` |
| 67 | Safe Divide | `safeDivide` | `number \| null` when divisor 0 |
| 68 | Label By Status | `statusLabel` | Union → label string |
| 69 | Paginate Items | `paginate` | Generic 1-based page slice |

## Non-goals

- New exam kinds or runner changes  
- Medium/hard problems  
- Admin UI changes (new ids appear automatically)

## Verification

- `npm test` — official solutions pass; starter code does not  
- Update TS inclusion test to expect ids 52–69
