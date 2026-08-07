"use client";

export default function FeedbackBurst({
  correct,
  explanation,
  correctAnswer,
}: {
  correct: boolean;
  explanation?: string;
  correctAnswer?: string;
}) {
  return (
    <div
      className={`animate-pop mt-4 rounded-xl border px-4 py-3 text-sm ${
        correct
          ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950 text-green-800 dark:bg-green-950 dark:text-green-200"
          : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950 text-red-800 dark:bg-red-950 dark:text-red-200"
      }`}
      role="status"
    >
      <p className="font-bold">{correct ? "Correct!" : "Not quite"}</p>
      {!correct && correctAnswer && (
        <p className="mt-1">
          <span className="font-semibold">Answer: </span>
          <span className="whitespace-pre-wrap font-mono">{correctAnswer}</span>
        </p>
      )}
      {explanation && <p className="mt-1 leading-relaxed opacity-90">{explanation}</p>}
    </div>
  );
}
