"use client";

export default function FeedbackBurst({
  correct,
  explanation,
}: {
  correct: boolean;
  explanation?: string;
}) {
  return (
    <div
      className={`animate-pop mt-4 rounded-xl border px-4 py-3 text-sm ${
        correct
          ? "border-green-200 bg-green-50 text-green-800"
          : "border-red-200 bg-red-50 text-red-800"
      }`}
      role="status"
    >
      <p className="font-bold">{correct ? "Correct!" : "Not quite"}</p>
      {explanation && <p className="mt-1 leading-relaxed opacity-90">{explanation}</p>}
    </div>
  );
}
