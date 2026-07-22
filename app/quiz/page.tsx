"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  quizQuestions,
  parseQuizIds,
} from "@/lib/quiz/index";
import { gradeAnswer, summarizeAnswer } from "@/lib/quiz/grade";
import type { AnswerEntry, AnswerValue, QuizMode } from "@/lib/quiz/types";
import QuestionStage from "@/components/quiz/QuestionStage";
import QuizProgress from "@/components/quiz/QuizProgress";
import FeedbackBurst from "@/components/quiz/FeedbackBurst";
import TimeAttackBar from "@/components/TimeAttackBar";
import FreezeOverlay from "@/components/FreezeOverlay";
import { parseTimeLimit } from "@/lib/time-attack";
import { useTimeAttack } from "@/lib/use-time-attack";
import { parseShuffle, sessionItemOrder } from "@/lib/shuffle";

function parseMode(raw: string | null): QuizMode {
  return raw === "practice" ? "practice" : "assessment";
}

function hasAnswerValue(v: AnswerValue | null | undefined): boolean {
  if (!v) return false;
  switch (v.type) {
    case "single":
    case "snippet":
      return Boolean(v.id);
    case "multi":
      return v.ids.length > 0;
    case "boolean":
      return typeof v.value === "boolean";
    case "fill":
    case "output":
      return v.text.trim().length > 0;
    case "order":
      return v.order.length > 0;
    case "match":
      return Object.keys(v.pairs).length > 0;
    case "hotspot":
      return Boolean(v.regionId);
    default:
      return false;
  }
}

function QuizPlayer() {
  const searchParams = useSearchParams();
  const mode = parseMode(searchParams.get("mode"));
  const limitSeconds = parseTimeLimit(searchParams.get("t"));
  const shuffle = parseShuffle(searchParams.get("s"));
  const qParam = searchParams.get("q") ?? "";
  const orderSessionKey = `quiz:${qParam}:s=${shuffle ? 1 : 0}`;

  const sessionQuestions = useMemo(() => {
    const ids = parseQuizIds(searchParams.get("q"));
    if (!ids.length) return [];
    const byId = new Map(quizQuestions.map((q) => [q.id, q]));
    const orderedIds =
      typeof window === "undefined"
        ? ids
        : sessionItemOrder(sessionStorage, orderSessionKey, ids, shuffle);
    return orderedIds
      .map((id) => byId.get(id))
      .filter((q): q is NonNullable<typeof q> => Boolean(q));
  }, [searchParams, shuffle, orderSessionKey]);

  const storageKey = `quiz-answers:${qParam}:${mode}`;
  const timerSessionId = `quiz:${qParam}:${searchParams.get("t") ?? ""}`;

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, AnswerEntry>>(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) ?? "{}");
    } catch {
      return {};
    }
  });
  const [applicantName, setApplicantName] = useState("");
  const [submitState, setSubmitState] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const { remaining, frozen, elapsed } = useTimeAttack(
    limitSeconds,
    timerSessionId
  );

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(answers));
  }, [answers, storageKey]);

  const question = sessionQuestions[index];

  function lockCurrentIfNeeded(fromIndex: number) {
    const q = sessionQuestions[fromIndex];
    if (!q) return;
    setAnswers((prev) => {
      const entry = prev[q.id];
      if (!entry || entry.locked || !hasAnswerValue(entry.value)) return prev;
      const correct = gradeAnswer(q, entry.value);
      return {
        ...prev,
        [q.id]: {
          ...entry,
          locked: true,
          graded:
            mode === "practice" ? { correct } : entry.graded,
        },
      };
    });
  }

  function goTo(nextIndex: number) {
    if (frozen) return;
    if (nextIndex === index) return;
    lockCurrentIfNeeded(index);
    setIndex(nextIndex);
  }

  function setValue(v: AnswerValue) {
    if (!question || frozen) return;
    setAnswers((prev) => {
      const entry = prev[question.id];
      if (entry?.locked) return prev;
      return {
        ...prev,
        [question.id]: { value: v, locked: false },
      };
    });
  }

  async function submitResults() {
    // Snapshot + lock current answer synchronously for grading
    const snapshot: Record<number, AnswerEntry> = { ...answers };
    const current = sessionQuestions[index];
    if (current) {
      const entry = snapshot[current.id];
      if (entry && !entry.locked && hasAnswerValue(entry.value)) {
        snapshot[current.id] = {
          ...entry,
          locked: true,
          graded:
            mode === "practice"
              ? { correct: gradeAnswer(current, entry.value) }
              : entry.graded,
        };
      }
    }

    const graded = sessionQuestions.map((q) => {
      const entry = snapshot[q.id];
      const value = entry?.value ?? null;
      const correct = gradeAnswer(q, value);
      return {
        prompt: q.prompt,
        topic: q.topic,
        difficulty: q.difficulty,
        type: q.type,
        correct,
        answer: summarizeAnswer(q, value),
        explanation: q.explanation,
      };
    });

    setAnswers(() => {
      const next: Record<number, AnswerEntry> = { ...snapshot };
      for (const q of sessionQuestions) {
        const entry = next[q.id] ?? { value: null, locked: true };
        next[q.id] = {
          value: entry.value,
          locked: true,
          graded: { correct: gradeAnswer(q, entry.value) },
        };
      }
      return next;
    });

    setSubmitState("sending");
    const timeUsed = elapsed ?? undefined;
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "quiz",
          examiner: searchParams.get("e") ?? undefined,
          applicantName: applicantName.trim() || "Applicant",
          mode,
          timedOut: frozen,
          timeLimitSeconds: limitSeconds ?? undefined,
          timeUsedSeconds: timeUsed,
          results: graded,
        }),
      });
      setSubmitState(res.ok ? "sent" : "error");
    } catch {
      setSubmitState("error");
    }
  }

  if (!sessionQuestions.length) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-100 px-6 text-center text-slate-500">
        <div>
          <p className="text-lg font-semibold text-slate-700">
            This quiz link has no questions.
          </p>
          <p className="mt-2 text-sm">
            Ask your interviewer for a new link from the Quiz Builder.
          </p>
        </div>
      </main>
    );
  }

  const entry = answers[question.id];
  const locked = Boolean(entry?.locked) || frozen;
  const correctCount = sessionQuestions.filter(
    (q) => answers[q.id]?.graded?.correct
  ).length;
  const answeredFlags = sessionQuestions.map((q) =>
    hasAnswerValue(answers[q.id]?.value)
  );
  const lockedFlags = sessionQuestions.map((q) =>
    Boolean(answers[q.id]?.locked)
  );

  const submitControls = (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input
        type="text"
        value={applicantName}
        onChange={(e) => setApplicantName(e.target.value)}
        placeholder="Your name"
        aria-label="Your name"
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400"
      />
      <button
        type="button"
        onClick={submitResults}
        disabled={submitState === "sending"}
        className={`rounded-lg px-4 py-2 text-sm font-bold text-white transition-transform active:scale-95 disabled:cursor-not-allowed ${
          submitState === "sent"
            ? "bg-green-700"
            : submitState === "error"
              ? "bg-red-600 hover:bg-red-700"
              : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {submitState === "sending"
          ? "Sending…"
          : submitState === "sent"
            ? "✓ Results sent"
            : submitState === "error"
              ? "Failed — retry"
              : "Submit Results"}
      </button>
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-900 sm:p-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
              Knowledge Quiz
            </p>
            <h1 className="text-3xl font-bold">
              {mode === "practice" ? "Practice mode" : "Assessment"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              One question at a time. Leaving a question locks your answer.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {limitSeconds != null && remaining != null && (
              <TimeAttackBar remaining={remaining} limitSeconds={limitSeconds} />
            )}
            <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-sm">
              {mode === "practice"
                ? `${correctCount} correct`
                : `${answeredFlags.filter(Boolean).length} / ${sessionQuestions.length} answered`}
            </div>
            {!frozen && submitControls}
          </div>
        </header>

        <div className="mb-4">
          <QuizProgress
            total={sessionQuestions.length}
            current={index}
            locked={lockedFlags}
            answered={answeredFlags}
            onJump={goTo}
            disabled={frozen}
          />
        </div>

        <QuestionStage
          question={question}
          index={index}
          total={sessionQuestions.length}
          value={entry?.value ?? null}
          onChange={setValue}
          disabled={locked}
          showHint={mode === "practice" && !locked}
        />

        {mode === "practice" && entry?.locked && entry.graded && (
          <FeedbackBurst
            correct={entry.graded.correct}
            explanation={question.explanation}
          />
        )}

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={frozen || index === 0}
            onClick={() => goTo(index - 1)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold transition-transform hover:bg-slate-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Back
          </button>
          {index < sessionQuestions.length - 1 ? (
            <button
              type="button"
              disabled={frozen}
              onClick={() => goTo(index + 1)}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-bold text-white transition-transform hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next →
            </button>
          ) : (
            <button
              type="button"
              disabled={frozen}
              onClick={() => lockCurrentIfNeeded(index)}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-bold text-white transition-transform hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Lock answer
            </button>
          )}
        </div>
      </div>

      {frozen && (
        <FreezeOverlay>
          <div className="flex flex-col items-stretch gap-2">
            {submitControls}
          </div>
        </FreezeOverlay>
      )}
    </main>
  );
}

export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center bg-slate-100 text-sm text-slate-400">
          Loading quiz…
        </main>
      }
    >
      <QuizPlayer />
    </Suspense>
  );
}
