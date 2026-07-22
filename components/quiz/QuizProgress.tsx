"use client";

export default function QuizProgress({
  total,
  current,
  locked,
  answered,
  onJump,
  disabled,
}: {
  total: number;
  current: number;
  locked: boolean[];
  answered: boolean[];
  onJump: (index: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1.5" role="navigation" aria-label="Question progress">
      {Array.from({ length: total }, (_, i) => {
        const isCurrent = i === current;
        const isLocked = locked[i];
        const hasAnswer = answered[i];
        return (
          <button
            key={i}
            type="button"
            disabled={disabled}
            onClick={() => onJump(i)}
            aria-label={`Question ${i + 1}${isCurrent ? " (current)" : ""}${
              isLocked ? " locked" : ""
            }`}
            aria-current={isCurrent ? "step" : undefined}
            className={`h-2.5 w-7 rounded-full transition-all ${
              isCurrent
                ? "bg-blue-600 ring-2 ring-blue-200"
                : isLocked
                  ? "bg-slate-700"
                  : hasAnswer
                    ? "bg-blue-300"
                    : "bg-slate-200 hover:bg-slate-300"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          />
        );
      })}
    </div>
  );
}
