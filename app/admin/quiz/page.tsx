"use client";
import { useRef, useState } from "react";
import {
  quizQuestions,
  quizTopics,
} from "@/lib/quiz/index";
import { quizPresets } from "@/lib/quiz/presets";
import type { QuizQuestion, QuizMode } from "@/lib/quiz/types";
import { clampMinutes, minutesToSeconds } from "@/lib/time-attack";

const difficulties = ["easy", "medium", "hard"] as const;
const types: QuizQuestion["type"][] = [
  "single",
  "multi",
  "boolean",
  "fill",
  "order",
  "snippet",
  "match",
  "hotspot",
  "output",
];

const difficultyBadge: Record<QuizQuestion["difficulty"], string> = {
  easy: "bg-blue-50 text-blue-600",
  medium: "bg-purple-50 text-purple-600",
  hard: "bg-red-50 text-red-600",
};

type SavedQuiz = { name: string; ids: number[] };

const examinerIds = ["jayr", "jack", "iven", "andrei", "neil", "pragya"];
const presetMinutes = [10, 15, 30, 45, 60] as const;

export default function QuizAdminPage() {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState(false);
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<string>("all");
  const [topic, setTopic] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [onlySelected, setOnlySelected] = useState(false);
  const [examiner, setExaminer] = useState(examinerIds[0]);
  const [mode, setMode] = useState<QuizMode>("assessment");
  const [timeMode, setTimeMode] = useState<"off" | "preset" | "custom">("off");
  const [presetMin, setPresetMin] = useState<(typeof presetMinutes)[number]>(15);
  const [customMin, setCustomMin] = useState(20);
  const [shuffle, setShuffle] = useState(false);
  const [savedQuizzes, setSavedQuizzes] = useState<SavedQuiz[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = JSON.parse(localStorage.getItem("saved-quizzes") ?? "[]");
      const valid = new Set(quizQuestions.map((q) => q.id));
      return stored.map((s: SavedQuiz) => ({
        ...s,
        ids: s.ids.filter((id: number) => valid.has(id)),
      }));
    } catch {
      return [];
    }
  });
  const presetDialog = useRef<HTMLDialogElement>(null);
  const previewDialog = useRef<HTMLDialogElement>(null);
  const [preview, setPreview] = useState<QuizQuestion | null>(null);

  function persistQuizzes(next: SavedQuiz[]) {
    setSavedQuizzes(next);
    localStorage.setItem("saved-quizzes", JSON.stringify(next));
  }

  const visible = quizQuestions.filter(
    (q) =>
      (!onlySelected || selected.has(q.id)) &&
      (difficulty === "all" || q.difficulty === difficulty) &&
      (topic === "all" || q.topic === topic) &&
      (typeFilter === "all" || q.type === typeFilter) &&
      (q.prompt + q.topic + q.type)
        .toLowerCase()
        .includes(query.toLowerCase())
  );

  const selectedQuestions = quizQuestions.filter((q) => selected.has(q.id));
  const ids = selectedQuestions.map((q) => q.id);

  const timeSeconds =
    timeMode === "off"
      ? null
      : minutesToSeconds(timeMode === "preset" ? presetMin : customMin);

  const link = ids.length
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/quiz?q=${ids.join(",")}&e=${examiner}&mode=${mode}${
        timeSeconds ? `&t=${timeSeconds}` : ""
      }${shuffle ? "&s=1" : ""}`
    : "";

  function toggle(id: number) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setCopied(false);
  }

  function loadSet(setIds: number[]) {
    setSelected(new Set(setIds));
    setCopied(false);
  }

  const allVisibleSelected =
    visible.length > 0 && visible.every((q) => selected.has(q.id));

  function toggleSelectVisible() {
    setSelected((s) => {
      const next = new Set(s);
      if (allVisibleSelected) {
        for (const q of visible) next.delete(q.id);
      } else {
        for (const q of visible) next.add(q.id);
      }
      return next;
    });
    setCopied(false);
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-900 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 animate-fade-up">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
            Admin
          </p>
          <h1 className="text-3xl font-bold">Quiz Builder</h1>
          <p className="mt-1 text-slate-500">
            Pick knowledge questions, set mode and timer, copy a shareable link.
          </p>
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className="animate-fade-up">
            <div className="sticky top-6 z-10 mb-4 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search questions…"
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-blue-400"
              />
              <div className="flex flex-wrap items-center gap-1.5">
                {["all", ...difficulties].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                      difficulty === d
                        ? "bg-slate-900 text-white"
                        : "border border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {d}
                  </button>
                ))}
                <span className="mx-1 text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() => setOnlySelected(!onlySelected)}
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    onlySelected
                      ? "bg-blue-600 text-white"
                      : "border border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  ✓ Selected{selected.size ? ` (${selected.size})` : ""}
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {["all", ...quizTopics].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTopic(t)}
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                      topic === t
                        ? "bg-slate-900 text-white"
                        : "border border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {["all", ...types].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTypeFilter(t)}
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      typeFilter === t
                        ? "bg-slate-900 text-white"
                        : "border border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {visible.length > 0 && (
                <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-2.5">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    ref={(el) => {
                      if (el) {
                        el.indeterminate =
                          !allVisibleSelected &&
                          visible.some((q) => selected.has(q.id));
                      }
                    }}
                    onChange={toggleSelectVisible}
                    className="h-4 w-4 shrink-0 accent-blue-600"
                    aria-label={
                      allVisibleSelected
                        ? "Deselect all visible questions"
                        : "Select all visible questions"
                    }
                  />
                  <button
                    type="button"
                    onClick={toggleSelectVisible}
                    className="text-xs font-semibold text-slate-600 hover:text-blue-600"
                  >
                    {allVisibleSelected
                      ? `Deselect all (${visible.length})`
                      : `Select all (${visible.length})`}
                  </button>
                </div>
              )}
              {visible.map((q) => {
                const checked = selected.has(q.id);
                return (
                  <label
                    key={q.id}
                    className={`flex cursor-pointer items-center gap-3 border-b border-slate-100 px-4 py-3 transition-colors last:border-b-0 ${
                      checked ? "bg-blue-50/60" : "hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(q.id)}
                      className="h-4 w-4 shrink-0 accent-blue-600"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-semibold">
                          {q.prompt}
                        </span>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${difficultyBadge[q.difficulty]}`}
                        >
                          {q.difficulty}
                        </span>
                      </span>
                      <span className="mt-0.5 block text-xs capitalize text-slate-400">
                        {q.topic} · {q.type}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setPreview(q);
                        previewDialog.current?.showModal();
                      }}
                      className="shrink-0 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:border-blue-400 hover:text-blue-600"
                    >
                      Preview
                    </button>
                  </label>
                );
              })}
              {!visible.length && (
                <p className="p-8 text-center text-sm text-slate-400">
                  No questions match your filters.
                </p>
              )}
            </div>
          </section>

          <aside className="animate-fade-up sticky top-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5">
            <div>
              <h2 className="text-sm font-bold">Your Quiz</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {selected.size
                  ? `${selected.size} questions`
                  : "No questions selected yet"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => presetDialog.current?.showModal()}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-sm font-semibold hover:border-blue-400 hover:text-blue-600"
            >
              Start from a preset…
            </button>

            <dialog
              ref={presetDialog}
              closedby="any"
              className="m-auto w-[min(56rem,calc(100vw-2rem))] rounded-2xl p-0 shadow-2xl backdrop:bg-slate-900/40 backdrop:backdrop-blur-sm open:animate-pop"
            >
              <div className="p-6 sm:p-8">
                <div className="mb-5 flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold">Quiz presets</h2>
                    <p className="text-sm text-slate-500">
                      Pick a starting set — edit afterwards.
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label="Close"
                    onClick={() => presetDialog.current?.close()}
                    className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100"
                  >
                    ×
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {quizPresets.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => {
                        loadSet(p.ids);
                        presetDialog.current?.close();
                      }}
                      className="rounded-xl border border-slate-200 p-4 text-left hover:border-blue-400 hover:shadow-md"
                    >
                      <span className="block font-semibold">{p.name}</span>
                      <span className="mt-1 block text-sm text-slate-500">
                        {p.description}
                      </span>
                      <span className="mt-2 block text-xs text-slate-400">
                        {p.ids.length} questions
                        {p.suggestedMinutes
                          ? ` · ~${p.suggestedMinutes} min`
                          : ""}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </dialog>

            <dialog
              ref={previewDialog}
              closedby="any"
              className="m-auto w-[min(40rem,calc(100vw-2rem))] rounded-2xl p-0 shadow-2xl backdrop:bg-slate-900/40 open:animate-pop"
            >
              {preview && (
                <div className="p-6">
                  <div className="flex justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold uppercase text-slate-400">
                        {preview.topic} · {preview.type}
                      </span>
                      <h2 className="mt-1 text-xl font-bold">{preview.prompt}</h2>
                      {preview.explanation && (
                        <p className="mt-3 text-sm text-slate-600">
                          {preview.explanation}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      aria-label="Close"
                      onClick={() => previewDialog.current?.close()}
                      className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100"
                    >
                      ×
                    </button>
                  </div>
                  <div className="mt-5 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => previewDialog.current?.close()}
                      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!selected.has(preview.id)) toggle(preview.id);
                        previewDialog.current?.close();
                      }}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white"
                    >
                      Add to quiz
                    </button>
                  </div>
                </div>
              )}
            </dialog>

            {selectedQuestions.length > 0 && (
              <div className="flex max-h-56 flex-col gap-1 overflow-y-auto">
                {selectedQuestions.map((q, i) => (
                  <div
                    key={q.id}
                    className="flex items-center gap-2 rounded-lg bg-slate-50 py-1.5 pl-3 pr-1.5 text-sm"
                  >
                    <span className="w-4 text-xs text-slate-400">{i + 1}</span>
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {q.prompt}
                    </span>
                    <button
                      type="button"
                      aria-label="Remove"
                      onClick={() => toggle(q.id)}
                      className="grid h-6 w-6 place-items-center rounded-full text-slate-400 hover:bg-slate-200"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-4">
              <label className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-slate-600">Send to</span>
                <select
                  value={examiner}
                  onChange={(e) => {
                    setExaminer(e.target.value);
                    setCopied(false);
                  }}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-2 py-1.5 capitalize outline-none focus:border-blue-400"
                >
                  {examinerIds.map((id) => (
                    <option key={id} value={id}>
                      {id}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex rounded-lg border border-slate-200 p-0.5 text-xs font-bold">
                {(["assessment", "practice"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setMode(m);
                      setCopied(false);
                    }}
                    className={`flex-1 rounded-md px-2 py-1.5 capitalize ${
                      mode === m
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <div>
                <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Time Attack
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setTimeMode("off");
                      setCopied(false);
                    }}
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
                        setCopied(false);
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
                    onClick={() => {
                      setTimeMode("custom");
                      setCopied(false);
                    }}
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
                    onChange={(e) => {
                      setCustomMin(clampMinutes(Number(e.target.value)));
                      setCopied(false);
                    }}
                    className="mt-2 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                  />
                )}
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={shuffle}
                  onChange={(e) => {
                    setShuffle(e.target.checked);
                    setCopied(false);
                  }}
                  className="h-4 w-4 accent-blue-600"
                />
                <span className="font-semibold text-slate-600">
                  Shuffle question order
                </span>
              </label>

              {link && (
                <code className="truncate rounded-lg bg-slate-100 px-3 py-2 text-[11px]">
                  {link}
                </code>
              )}
              <button
                type="button"
                disabled={!link}
                onClick={async () => {
                  await navigator.clipboard.writeText(link);
                  setCopied(true);
                }}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {copied ? "Copied!" : "Copy quiz link"}
              </button>
              <div className="flex gap-2">
                <a
                  href={link || undefined}
                  target="_blank"
                  rel="noreferrer"
                  aria-disabled={!link}
                  className={`flex-1 rounded-lg border px-3 py-1.5 text-center text-sm font-bold ${
                    link
                      ? "border-slate-300 hover:bg-slate-50"
                      : "pointer-events-none border-slate-200 text-slate-300"
                  }`}
                >
                  Preview
                </a>
                <button
                  type="button"
                  disabled={!selected.size}
                  onClick={() => {
                    const name = window.prompt("Name this quiz:")?.trim();
                    if (!name) return;
                    persistQuizzes([
                      ...savedQuizzes.filter((e) => e.name !== name),
                      { name, ids },
                    ]);
                  }}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-bold disabled:text-slate-300"
                >
                  Save
                </button>
                <button
                  type="button"
                  disabled={!selected.size}
                  onClick={() => loadSet([])}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-bold disabled:text-slate-300"
                >
                  Clear
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
