"use client";
import type { AnswerValue, Labeled } from "@/lib/quiz/types";

export default function MatchPairs({
  left,
  right,
  value,
  onChange,
  disabled,
}: {
  left: Labeled[];
  right: Labeled[];
  value: AnswerValue | null;
  onChange: (v: AnswerValue) => void;
  disabled?: boolean;
}) {
  const pairs = value?.type === "match" ? value.pairs : {};

  function setPair(leftId: string, rightId: string) {
    onChange({
      type: "match",
      pairs: { ...pairs, [leftId]: rightId },
    });
  }

  return (
    <div className="grid gap-3">
      {left.map((l) => (
        <label
          key={l.id}
          className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:gap-3"
        >
          <span className="min-w-0 flex-1 text-sm font-semibold">{l.label}</span>
          <select
            disabled={disabled}
            value={pairs[l.id] ?? ""}
            onChange={(e) => setPair(l.id, e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 disabled:cursor-not-allowed"
          >
            <option value="" disabled>
              Match…
            </option>
            {right.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
      ))}
    </div>
  );
}
