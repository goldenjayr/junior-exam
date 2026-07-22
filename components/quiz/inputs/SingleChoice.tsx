"use client";
import type { AnswerValue, Labeled } from "@/lib/quiz/types";

export default function SingleChoice({
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
  const selected = value?.type === "single" ? value.id : null;
  return (
    <div className="grid gap-2">
      {options.map((o) => {
        const on = selected === o.id;
        return (
          <button
            key={o.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange({ type: "single", id: o.id })}
            className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-all active:scale-[0.99] disabled:cursor-not-allowed ${
              on
                ? "border-blue-400 bg-blue-50 text-blue-900"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
