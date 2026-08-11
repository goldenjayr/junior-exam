"use client";

import { getLiveTips } from "@/lib/system-design/tips";
import type { Challenge, DesignGraph, ValidationResult } from "@/lib/system-design/types";

export default function FeedbackStrip({
  graph,
  challenge,
  result,
  onReset,
  onSave,
}: {
  graph: DesignGraph;
  challenge: Challenge;
  result: ValidationResult | null;
  onReset: () => void;
  onSave: () => void;
}) {
  const live = getLiveTips(graph, challenge);
  const tips = result?.tips?.length ? result.tips : live.tips;
  const best = result?.bestPractices?.length
    ? result.bestPractices
    : live.bestPractices;
  const bottlenecks = result?.bottlenecks?.length
    ? result.bottlenecks
    : live.bottlenecks;

  return (
    <footer className="relative z-10 flex shrink-0 flex-wrap items-start gap-3 border-t border-border bg-card px-4 py-3">
      <div className="min-w-0 flex-1 space-y-1 text-xs">
        {tips.slice(0, 2).map((t) => (
          <p key={t}>
            <span className="font-bold text-cyan-600 dark:text-cyan-400">Tip:</span>{" "}
            {t}
          </p>
        ))}
        {best.slice(0, 1).map((t) => (
          <p key={t}>
            <span className="font-bold text-emerald-600">Best practice:</span>{" "}
            {t}
          </p>
        ))}
        {bottlenecks.slice(0, 1).map((t) => (
          <p key={t}>
            <span className="font-bold text-amber-600">Potential bottleneck:</span>{" "}
            {t}
          </p>
        ))}
        {tips.length === 0 && best.length === 0 && bottlenecks.length === 0 && (
          <p className="text-muted">Keep building — tips appear as your graph grows.</p>
        )}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-hover"
        >
          Reset canvas
        </button>
        <button
          type="button"
          onClick={onSave}
          className="rounded-lg bg-foreground px-3 py-1.5 text-xs font-semibold text-background"
        >
          Save design
        </button>
      </div>
    </footer>
  );
}
