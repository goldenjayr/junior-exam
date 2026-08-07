"use client";
import { parseQuizPrompt } from "@/lib/quiz/prompt";

export default function QuizPrompt({ prompt }: { prompt: string }) {
  const parts = parseQuizPrompt(prompt);
  let textIndex = 0;

  return (
    <div className="space-y-4">
      {parts.map((part, i) => {
        if (part.type === "code") {
          return (
            <pre
              key={i}
              className="overflow-x-auto whitespace-pre rounded-xl bg-slate-900 p-4 font-mono text-sm leading-relaxed text-slate-100"
            >
              {part.code}
            </pre>
          );
        }
        const text = part.text.trim();
        if (!text) return null;
        textIndex += 1;
        if (textIndex === 1) {
          return (
            <h2
              key={i}
              className="text-xl font-bold leading-snug whitespace-pre-wrap text-foreground sm:text-2xl"
            >
              {text}
            </h2>
          );
        }
        return (
          <p
            key={i}
            className="whitespace-pre-wrap text-base leading-relaxed text-subtle"
          >
            {text}
          </p>
        );
      })}
    </div>
  );
}
