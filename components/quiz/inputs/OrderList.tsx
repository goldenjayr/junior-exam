"use client";
import { useEffect, useState } from "react";
import { Reorder } from "motion/react";
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
    if (disabled) return;
    const next = [...order];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    onChange({ type: "order", order: next });
  }

  function reorder(next: string[]) {
    if (disabled) return;
    onChange({ type: "order", order: next });
  }

  return (
    <div className="grid gap-2">
      <p className="text-xs font-semibold text-slate-500">
        Drag to reorder{disabled ? "" : " (or use arrows)"}
      </p>
      <Reorder.Group
        as="div"
        axis="y"
        values={order}
        onReorder={reorder}
        className="grid gap-2"
      >
        {order.map((id, i) => (
          <Reorder.Item
            key={id}
            as="div"
            value={id}
            dragListener={!disabled}
            layout
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            whileDrag={{
              scale: 1.03,
              boxShadow: "0 12px 28px rgba(15, 23, 42, 0.18)",
              cursor: "grabbing",
              zIndex: 20,
            }}
            className={`flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 ${
              disabled ? "cursor-default opacity-90" : "cursor-grab active:cursor-grabbing"
            }`}
          >
            <span
              aria-hidden
              className="select-none text-slate-300"
              title="Drag"
            >
              ⋮⋮
            </span>
            <span className="w-6 text-xs font-bold text-slate-400">{i + 1}</span>
            <span className="min-w-0 flex-1 text-sm font-semibold">
              {byId[id]?.label ?? id}
            </span>
            <button
              type="button"
              disabled={disabled || i === 0}
              aria-label="Move up"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => move(i, -1)}
              className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-sm disabled:opacity-30"
            >
              ↑
            </button>
            <button
              type="button"
              disabled={disabled || i === order.length - 1}
              aria-label="Move down"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => move(i, 1)}
              className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-sm disabled:opacity-30"
            >
              ↓
            </button>
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  );
}
