"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { clampMinutes, minutesToSeconds } from "@/lib/time-attack";
import {
  buildExamPath,
  categoryLabels,
  drawProblems,
  filterProblems,
  type RandomDifficulty,
  type RandomLanguage,
} from "@/lib/random-exam";
import type { Problem } from "@/lib/problems";

const languages: { id: RandomLanguage; label: string }[] = [
  { id: "javascript", label: "JavaScript" },
  { id: "typescript", label: "TypeScript" },
  { id: "all", label: "All" },
];

const difficulties: RandomDifficulty[] = ["all", "easy", "medium", "hard"];
const presetMinutes = [10, 15, 30, 45, 60] as const;

const difficultyBadge: Record<Problem["difficulty"], string> = {
  easy: "bg-blue-50 text-blue-600",
  medium: "bg-purple-50 text-purple-600",
  hard: "bg-red-50 text-red-600",
};

type Phase = "config" | "spinning" | "done";

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export default function RandomExamPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<RandomLanguage>("javascript");
  const [difficulty, setDifficulty] = useState<RandomDifficulty>("all");
  const [count, setCount] = useState(3);
  const [timeMode, setTimeMode] = useState<"off" | "preset" | "custom">("off");
  const [presetMin, setPresetMin] =
    useState<(typeof presetMinutes)[number]>(30);
  const [customMin, setCustomMin] = useState(45);
  const [phase, setPhase] = useState<Phase>("config");
  const [drawn, setDrawn] = useState<Problem[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);

  const pool = filterProblems({ language, difficulty });
  const available = pool.length;
  const clampedCount =
    available > 0 ? Math.min(Math.max(1, count), available) : 1;

  async function spin() {
    if (available === 0 || phase !== "config") return;
    const picks = drawProblems(pool, clampedCount);
    if (!picks.length) return;

    setDrawn(picks);
    setRevealedCount(0);
    setPhase("spinning");

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      setRevealedCount(picks.length);
      await wait(400);
    } else {
      await wait(400);
      for (let i = 1; i <= picks.length; i++) {
        setRevealedCount(i);
        await wait(300);
      }
      await wait(600);
    }

    const timeSeconds =
      timeMode === "off"
        ? null
        : minutesToSeconds(timeMode === "preset" ? presetMin : customMin);
    setPhase("done");
    router.push(buildExamPath(picks.map((p) => p.id), timeSeconds));
  }

  const spinning = phase !== "config";

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-900 sm:p-8">
      <div className="mx-auto max-w-2xl">
        <header className="mb-6 animate-fade-up">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
            Random
          </p>
          <h1 className="text-3xl font-bold">Random Exam</h1>
          <p className="mt-1 text-slate-500">
            Set your filters, spin the bank, and jump straight into the exam.
          </p>
        </header>

        <section className="animate-fade-up rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div
            className={`flex flex-col gap-5 transition-opacity ${
              spinning ? "pointer-events-none opacity-40" : ""
            }`}
          >
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                Language
              </p>
              <div className="flex flex-wrap gap-1.5">
                {languages.map((lang) => (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => setLanguage(lang.id)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      language === lang.id
                        ? "bg-slate-900 text-white"
                        : "border border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                Difficulty
              </p>
              <div className="flex flex-wrap gap-1.5">
                {difficulties.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
                      difficulty === d
                        ? "bg-slate-900 text-white"
                        : "border border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {d === "all" ? "Any" : d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Count
                </p>
                <span className="text-xs text-slate-500">
                  {available} available
                </span>
              </div>
              <input
                type="number"
                min={1}
                max={Math.max(1, available)}
                value={clampedCount}
                disabled={available === 0}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  if (!Number.isFinite(n)) return;
                  setCount(
                    Math.min(Math.max(1, Math.round(n)), Math.max(1, available))
                  );
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 disabled:bg-slate-50"
              />
              {available === 0 && (
                <p className="mt-2 text-xs font-semibold text-red-600">
                  No problems match — loosen filters.
                </p>
              )}
            </div>

            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                Time Attack
              </p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setTimeMode("off")}
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    timeMode === "off"
                      ? "bg-slate-900 text-white"
                      : "border border-slate-300"
                  }`}
                >
                  Off
                </button>
                {presetMinutes.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setTimeMode("preset");
                      setPresetMin(m);
                    }}
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      timeMode === "preset" && presetMin === m
                        ? "bg-blue-600 text-white"
                        : "border border-slate-300"
                    }`}
                  >
                    {m}m
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setTimeMode("custom")}
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    timeMode === "custom"
                      ? "bg-blue-600 text-white"
                      : "border border-slate-300"
                  }`}
                >
                  Custom
                </button>
              </div>
              {timeMode === "custom" && (
                <input
                  type="number"
                  min={1}
                  max={180}
                  value={customMin}
                  onChange={(e) =>
                    setCustomMin(clampMinutes(Number(e.target.value)))
                  }
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400"
                />
              )}
            </div>
          </div>

          <button
            type="button"
            disabled={available === 0 || spinning}
            onClick={spin}
            className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition-transform hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {spinning ? "Drawing…" : "Spin"}
          </button>
        </section>

        {spinning && (
          <section
            style={{ animationDelay: "60ms" }}
            className="animate-fade-up mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
            aria-live="polite"
          >
            <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
              {phase === "done" ? "Your exam" : "Dealing…"}
            </p>
            {revealedCount === 0 && phase === "spinning" && (
              <p className="mb-3 animate-pulse text-sm font-semibold text-blue-600">
                Shuffling the bank…
              </p>
            )}
            <div className="flex flex-col gap-2">
              {drawn.map((p, i) => {
                const revealed = i < revealedCount;
                return (
                  <div
                    key={p.id}
                    className={`rounded-xl border px-4 py-3 ${
                      revealed
                        ? "animate-pop border-slate-200 bg-slate-50"
                        : "border-dashed border-slate-200 bg-white"
                    }`}
                  >
                    {revealed ? (
                      <div className="flex items-center gap-3">
                        <span className="w-5 shrink-0 text-xs text-slate-400">
                          {i + 1}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold">
                            {p.title}
                          </span>
                          <span className="block text-xs text-slate-500">
                            {categoryLabels[p.category]}
                          </span>
                        </span>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${difficultyBadge[p.difficulty]}`}
                        >
                          {p.difficulty}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 text-sm text-slate-300">
                        <span className="w-5">{i + 1}</span>
                        <span>…</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
