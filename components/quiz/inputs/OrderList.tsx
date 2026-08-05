"use client";
import { useEffect, useState } from "react";
import { shuffleOrderIds } from "@/lib/shuffle";
import type { AnswerValue, Labeled } from "@/lib/quiz/types";

export default function OrderList({
  items,
  correctOrder,
  value,
  onChange,
  disabled,
}: {
  items: Labeled[];
  correctOrder: string[];
  value: AnswerValue | null;
  onChange: (v: AnswerValue) => void;
  disabled?: boolean;
}) {
  const hasValue =
    value?.type === "order" && value.order.length === items.length;
  const [seed] = useState(() =>
    shuffleOrderIds(
      items.map((i) => i.id),
      correctOrder
    )
  );

  useEffect(() => {
    if (disabled || hasValue) return;
    onChange({ type: "order", order: seed });
  }, [disabled, hasValue, onChange, seed]);

  const order = hasValue ? value.order : seed;
  const byId = Object.fromEntries(items.map((i) => [i.id, i]));

  function move(index: number, dir: -1 | 1) {
    const next = [...order];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    onChange({ type: "order", order: next });
  }

  return (
    <div className="grid gap-2">
      <p className="text-xs font-semibold text-slate-500">
        Put in the correct order (use arrows)
      </p>
      {order.map((id, i) => (
        <div
          key={id}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2"
        >
          <span className="w-6 text-xs font-bold text-slate-400">{i + 1}</span>
          <span className="min-w-0 flex-1 text-sm font-semibold">
            {byId[id]?.label ?? id}
          </span>
          <button
            type="button"
            disabled={disabled || i === 0}
            aria-label="Move up"
            onClick={() => move(i, -1)}
            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-sm disabled:opacity-30"
          >
            ↑
          </button>
          <button
            type="button"
            disabled={disabled || i === order.length - 1}
            aria-label="Move down"
            onClick={() => move(i, 1)}
            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-sm disabled:opacity-30"
          >
            ↓
          </button>
        </div>
      ))}
    </div>
  );
}
