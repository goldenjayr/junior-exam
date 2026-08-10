"use client";

import { formatClock } from "@/lib/time-attack";
import type { Challenge, ValidationResult } from "@/lib/system-design/types";
import Link from "next/link";

export default function BuilderHeader({
  challenge,
  remaining,
  result,
  hintsLeft,
  showConstraints,
  onToggleConstraints,
  onRevealHint,
}: {
  challenge: Challenge;
  remaining: number | null;
  result: ValidationResult | null;
  hintsLeft: number;
  showConstraints: boolean;
  onToggleConstraints: () => void;
  onRevealHint: () => void;
}) {
  const bottleneck = result?.bottlenecks?.[0];
  const best = result?.bestPractices?.[0];

  return (
    <header className="flex flex-wrap items-center gap-3 border-b border-border bg-card px-4 py-3">
      <div className="min-w-0">
        <Link
          href="/system-design"
          className="text-[10px] font-bold uppercase tracking-widest text-cyan-600 hover:underline dark:text-cyan-400"
        >
          System Design Builder
        </Link>
        <p className="truncate text-sm font-bold text-foreground">
          {challenge.title}
        </p>
        <p className="text-xs text-muted">
          Drag, connect, and validate your architecture.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onRevealHint}
          disabled={hintsLeft <= 0}
          className="rounded-full border border-border px-2.5 py-1 text-xs font-semibold disabled:opacity-40"
        >
          Hints ({hintsLeft})
        </button>
        <button
          type="button"
          onClick={onToggleConstraints}
          className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
            showConstraints
              ? "border-cyan-500 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300"
              : "border-border"
          }`}
        >
          Constraints
        </button>
        {bottleneck && (
          <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
            Bottleneck alert
          </span>
        )}
        {best && (
          <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            Best practice
          </span>
        )}
      </div>

      <div className="ml-auto flex items-center gap-3 text-sm">
        {remaining != null && (
          <span className="font-mono font-bold tabular-nums text-cyan-600 dark:text-cyan-400">
            {formatClock(remaining)}
          </span>
        )}
        {result && (
          <span className="font-bold tabular-nums">
            {result.softScore.toLocaleString()} pts
          </span>
        )}
      </div>
    </header>
  );
}
