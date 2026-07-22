"use client";
import type { AnswerValue } from "@/lib/quiz/types";

export default function OutputInput({
  code,
  value,
  onChange,
  disabled,
}: {
  code: string;
  value: AnswerValue | null;
  onChange: (v: AnswerValue) => void;
  disabled?: boolean;
}) {
  const text = value?.type === "output" ? value.text : "";
  return (
    <div className="grid gap-3">
      <pre className="overflow-x-auto rounded-xl bg-slate-900 p-4 font-mono text-sm leading-relaxed text-slate-100">
        {code}
      </pre>
      <input
        type="text"
        value={text}
        disabled={disabled}
        placeholder="What does this output?"
        onChange={(e) => onChange({ type: "output", text: e.target.value })}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-mono text-sm outline-none focus:border-blue-400 disabled:cursor-not-allowed disabled:bg-slate-50"
      />
    </div>
  );
}
