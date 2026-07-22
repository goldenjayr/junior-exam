"use client";
import type { AnswerValue } from "@/lib/quiz/types";

export default function FillInput({
  value,
  onChange,
  disabled,
  placeholder,
}: {
  value: AnswerValue | null;
  onChange: (v: AnswerValue) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const text = value?.type === "fill" ? value.text : "";
  return (
    <input
      type="text"
      value={text}
      disabled={disabled}
      placeholder={placeholder ?? "Type your answer…"}
      onChange={(e) => onChange({ type: "fill", text: e.target.value })}
      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 disabled:cursor-not-allowed disabled:bg-slate-50"
    />
  );
}
