"use client";
import type { AnswerValue, Labeled } from "@/lib/quiz/types";

export default function MultiChoice({
  options,
  value,
  onChange,
  disabled,
}: {
  options: Labeled[];
  value: AnswerValue | null;
  onChange: (v: AnswerValue) => void;
  disabled?: boolean;
}) {
  const selected = new Set(value?.type === "multi" ? value.ids : []);
  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange({ type: "multi", ids: [...next] });
  }
  return (
    <div className="grid gap-2">
      <p className="text-xs font-semibold text-slate-500">Select all that apply</p>
      {options.map((o) => {
        const on = selected.has(o.id);
        return (
          <button
            key={o.id}
            type="button"
            disabled={disabled}
            onClick={() => toggle(o.id)}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-all disabled:cursor-not-allowed ${
              on
                ? "border-blue-400 bg-blue-50 text-blue-900"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <span
              className={`grid h-5 w-5 shrink-0 place-items-center rounded border text-[11px] ${
                on
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-300 bg-white"
              }`}
            >
              {on ? "✓" : ""}
            </span>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
