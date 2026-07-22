"use client";
import type { AnswerValue } from "@/lib/quiz/types";

export default function BooleanChoice({
  value,
  onChange,
  disabled,
}: {
  value: AnswerValue | null;
  onChange: (v: AnswerValue) => void;
  disabled?: boolean;
}) {
  const selected = value?.type === "boolean" ? value.value : null;
  return (
    <div className="grid grid-cols-2 gap-3">
      {[
        { v: true, label: "True" },
        { v: false, label: "False" },
      ].map(({ v, label }) => {
        const on = selected === v;
        return (
          <button
            key={label}
            type="button"
            disabled={disabled}
            onClick={() => onChange({ type: "boolean", value: v })}
            className={`rounded-2xl border-2 px-4 py-8 text-lg font-bold transition-all active:scale-[0.98] disabled:cursor-not-allowed ${
              on
                ? v
                  ? "border-green-500 bg-green-50 text-green-800"
                  : "border-red-400 bg-red-50 text-red-800"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
