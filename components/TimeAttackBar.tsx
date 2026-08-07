"use client";
import { formatClock } from "@/lib/time-attack";

export default function TimeAttackBar({
  remaining,
  limitSeconds,
}: {
  remaining: number;
  limitSeconds: number;
}) {
  const pct = limitSeconds > 0 ? remaining / limitSeconds : 0;
  const urgent = remaining <= 30;
  const critical = remaining <= 10;
  const color = critical
    ? "text-red-600"
    : urgent
      ? "text-amber-600"
      : "text-blue-600";
  const bar = critical
    ? "bg-red-500"
    : urgent
      ? "bg-amber-500"
      : "bg-blue-600";
  const r = 15;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct);

  return (
    <div
      className={`flex flex-col gap-1 rounded-xl border border-border bg-card px-3 py-2 shadow-sm ${
        critical ? "animate-pulse" : ""
      }`}
      role="timer"
      aria-live="polite"
      aria-label={`${formatClock(remaining)} remaining`}
    >
      <div className="flex items-center gap-2">
        <svg width="40" height="40" viewBox="0 0 36 36" className={color}>
          <circle
            cx="18"
            cy="18"
            r={r}
            fill="none"
            className="stroke-border"
            strokeWidth="3"
          />
          <circle
            cx="18"
            cy="18"
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            transform="rotate(-90 18 18)"
          />
          <text
            x="18"
            y="21.5"
            textAnchor="middle"
            fontSize="7"
            fontWeight="700"
            className="fill-foreground"
          >
            {formatClock(remaining)}
          </text>
        </svg>
        <div className="text-xs">
          <p className="font-semibold uppercase tracking-wide text-muted">
            Time left
          </p>
          <p className="text-muted-fg">of {formatClock(limitSeconds)}</p>
        </div>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-background">
        <div
          className={`h-full transition-[width] duration-1000 ${bar}`}
          style={{ width: `${pct * 100}%` }}
        />
      </div>
    </div>
  );
}
