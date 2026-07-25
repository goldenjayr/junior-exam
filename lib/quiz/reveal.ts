import type { QuizQuestion } from "./types.ts";

function labelOf(
  items: { id: string; label: string }[],
  id: string
): string {
  return items.find((item) => item.id === id)?.label ?? id;
}

/** Human-readable correct answer for cheat reveal (read-only). */
export function formatCorrectAnswer(q: QuizQuestion): string {
  switch (q.type) {
    case "single":
      return labelOf(q.options, q.correctId);
    case "multi":
      return q.correctIds.map((id) => labelOf(q.options, id)).join(", ");
    case "boolean":
      return q.correct ? "True" : "False";
    case "fill":
    case "output":
      return q.accept[0] ?? "(no accepted answer)";
    case "order":
      return q.correctOrder.map((id) => labelOf(q.items, id)).join(" → ");
    case "snippet": {
      const snip = q.snippets.find((s) => s.id === q.correctId);
      return snip?.code ?? q.correctId;
    }
    case "match":
      return q.left
        .map((l) => {
          const rightId = q.pairs[l.id];
          return `${l.label} → ${labelOf(q.right, rightId)}`;
        })
        .join("\n");
    case "hotspot": {
      const region = q.regions.find((r) => r.id === q.correctRegionId);
      return region
        ? `${region.label} (lines ${region.startLine}–${region.endLine})`
        : q.correctRegionId;
    }
    default:
      return "(unknown)";
  }
}
