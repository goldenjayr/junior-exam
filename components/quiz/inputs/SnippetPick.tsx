"use client";
import type { AnswerValue } from "@/lib/quiz/types";

export default function SnippetPick({
  snippets,
  value,
  onChange,
  disabled,
}: {
  snippets: { id: string; code: string }[];
  value: AnswerValue | null;
  onChange: (v: AnswerValue) => void;
  disabled?: boolean;
}) {
  const selected = value?.type === "snippet" ? value.id : null;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {snippets.map((s) => {
        const on = selected === s.id;
        return (
          <button
            key={s.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange({ type: "snippet", id: s.id })}
            className={`rounded-xl border p-3 text-left transition-all disabled:cursor-not-allowed ${
              on
                ? "border-blue-400 bg-blue-50 ring-2 ring-blue-100"
                : "border-slate-200 bg-slate-900 hover:border-blue-300"
            }`}
          >
            <pre
              className={`overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-relaxed ${
                on ? "text-slate-800" : "text-slate-100"
              }`}
            >
              {s.code}
            </pre>
          </button>
        );
      })}
    </div>
  );
}
