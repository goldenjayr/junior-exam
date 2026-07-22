"use client";
import { useRef, useState } from "react";
import {
  problems,
  categories,
  type Problem,
  type TestCase,
} from "@/lib/problems";
import { formatValue } from "@/lib/runner";
import { clampMinutes, minutesToSeconds } from "@/lib/time-attack";

const difficulties = ["easy", "medium", "hard"] as const;

// ponytail: curated presets, hand-picked ids. Move into lib/problems.ts
// if presets ever need to be shared or validated against the bank.
const presets: { name: string; description: string; ids: number[] }[] = [
  {
    name: "Quick Screen",
    description: "~15 min · 3 easy warm-ups to filter out non-coders",
    ids: [4, 6, 8],
  },
  {
    name: "Junior Standard",
    description: "~50 min · balanced mix across every category, React included",
    ids: [1, 2, 6, 9, 12, 28],
  },
  {
    name: "Data Wrangling",
    description: "~40 min · arrays & objects, closest to day-to-day CRUD work",
    ids: [1, 2, 10, 13, 19, 22],
  },
  {
    name: "Strings & Logic",
    description: "~40 min · text handling plus algorithmic thinking",
    ids: [7, 14, 16, 21, 24, 26],
  },
  {
    name: "Speed Round",
    description: "~25 min · 5 quick easy problems, breadth over depth",
    ids: [3, 5, 14, 22, 27],
  },
  {
    name: "Arrays Deep Dive",
    description: "~45 min · progressive array work, easy to medium",
    ids: [4, 8, 11, 12, 20],
  },
  {
    name: "Objects & Data Shapes",
    description: "~35 min · grouping, counting, and reshaping records",
    ids: [2, 10, 17, 18, 19],
  },
  {
    name: "Algorithm Focus",
    description: "~50 min · the hardest set, for strong candidates only",
    ids: [20, 23, 24, 25, 26],
  },
  {
    name: "Warm-up + Challenge",
    description: "~30 min · two easy openers, then one hard finisher",
    ids: [6, 8, 23],
  },
  {
    name: "React Basics",
    description: "~45 min · props, conditional rendering, lists, and state",
    ids: [28, 29, 30, 31, 32, 33],
  },
  {
    name: "Frontend Junior",
    description: "~60 min · JS fundamentals plus React components and state",
    ids: [4, 10, 16, 28, 30, 32],
  },
  {
    name: "Full Assessment",
    description:
      "~2 hrs · easy to hard across JS and React, for shortlisted candidates",
    ids: [1, 6, 9, 12, 18, 20, 23, 28, 32],
  },
];

// ponytail: rough time estimate derived from difficulty; add a per-problem
// minutes field if these ever feel wrong.
const minutesFor: Record<Problem["difficulty"], number> = {
  easy: 5,
  medium: 8,
  hard: 12,
};

const difficultyBadge: Record<Problem["difficulty"], string> = {
  easy: "bg-blue-50 text-blue-600",
  medium: "bg-purple-50 text-purple-600",
  hard: "bg-red-50 text-red-600",
};

type SavedExam = { name: string; ids: number[] };

// ponytail: ids only — emails live server-side in app/api/submit/route.ts.
const examinerIds = ["jayr", "jack", "iven", "andrei", "neil", "pragya"];
const presetMinutes = [10, 15, 30, 45, 60] as const;

export default function AdminPage() {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState(false);
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [onlySelected, setOnlySelected] = useState(false);
  const [examiner, setExaminer] = useState(examinerIds[0]);
  const [timeMode, setTimeMode] = useState<"off" | "preset" | "custom">("off");
  const [presetMin, setPresetMin] = useState<(typeof presetMinutes)[number]>(30);
  const [customMin, setCustomMin] = useState(45);
  const [shuffle, setShuffle] = useState(false);
  const [savedExams, setSavedExams] = useState<SavedExam[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = JSON.parse(localStorage.getItem("saved-exams") ?? "[]");
      const valid = new Set(problems.map((p) => p.id));
      return stored.map((s: SavedExam) => ({
        ...s,
        ids: s.ids.filter((id: number) => valid.has(id)),
      }));
    } catch {
      return [];
    }
  });
  const presetDialog = useRef<HTMLDialogElement>(null);
  const previewDialog = useRef<HTMLDialogElement>(null);
  const [preview, setPreview] = useState<Problem | null>(null);
  const setDialog = useRef<HTMLDialogElement>(null);
  const [setPreview_, setSetPreview] = useState<{
    name: string;
    description?: string;
    ids: number[];
  } | null>(null);

  function persistExams(next: SavedExam[]) {
    setSavedExams(next);
    localStorage.setItem("saved-exams", JSON.stringify(next));
  }

  const visible = problems.filter(
    (p) =>
      (!onlySelected || selected.has(p.id)) &&
      (difficulty === "all" || p.difficulty === difficulty) &&
      (category === "all" || p.category === category) &&
      (p.title + p.instructions).toLowerCase().includes(query.toLowerCase())
  );

  const selectedProblems = problems.filter((p) => selected.has(p.id));
  const totalMinutes = selectedProblems.reduce(
    (sum, p) => sum + minutesFor[p.difficulty],
    0
  );
  const ids = selectedProblems.map((p) => p.id);
  const timeSeconds =
    timeMode === "off"
      ? null
      : minutesToSeconds(timeMode === "preset" ? presetMin : customMin);
  const link = ids.length
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/exam?p=${ids.join(",")}&e=${examiner}${
        timeSeconds ? `&t=${timeSeconds}` : ""
      }${shuffle ? "&s=1" : ""}`
    : "";

  const matchesSelection = (setIds: number[]) =>
    setIds.length === selected.size && setIds.every((id) => selected.has(id));
  const activeSetName = selected.size
    ? (savedExams.find((e) => matchesSelection(e.ids)) ??
        presets.find((p) => matchesSelection(p.ids)))?.name
    : undefined;

  function loadSet(setIds: number[]) {
    setSelected(new Set(setIds));
    setCopied(false);
  }

  function callLabel(problem: Problem, t: TestCase): string {
    if (problem.kind !== "react")
      return `${problem.fnName}(${t.args.map((a) => JSON.stringify(a)).join(", ")})`;
    const props = Object.entries((t.args[0] ?? {}) as Record<string, unknown>)
      .map(([k, v]) => `${k}={${JSON.stringify(v)}}`)
      .join(" ");
    const clicks = t.clicks ? ` then click <${t.clickOn}> ×${t.clicks}` : "";
    return `<${problem.fnName}${props ? " " + props : ""} />${clicks}`;
  }

  function toggle(id: number) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
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
          <h1 className="text-3xl font-bold">Exam Builder</h1>
          <p className="mt-1 text-slate-500">
            Pick problems from the bank — your exam takes shape on the right.
          </p>
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* Left: problem bank */}
          <section className="animate-fade-up">
            <div className="sticky top-6 z-10 mb-4 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search problems…"
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
                  ✓ Selected only{selected.size ? ` (${selected.size})` : ""}
                </button>
                <span className="mx-1 text-slate-300">|</span>
                {["all", ...categories].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                      category === c
                        ? "bg-slate-900 text-white"
                        : "border border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {visible.map((p) => {
                const checked = selected.has(p.id);
                return (
                  <label
                    key={p.id}
                    className={`flex cursor-pointer items-center gap-3 border-b border-slate-100 px-4 py-3 transition-colors last:border-b-0 ${
                      checked ? "bg-blue-50/60" : "hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(p.id)}
                      className="h-4 w-4 shrink-0 accent-blue-600"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold">
                          {p.title}
                        </span>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${difficultyBadge[p.difficulty]}`}
                        >
                          {p.difficulty}
                        </span>
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-slate-500">
                        {p.instructions}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs capitalize text-slate-400">
                      {p.category} · ~{minutesFor[p.difficulty]}m
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setPreview(p);
                        previewDialog.current?.showModal();
                      }}
                      className="shrink-0 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-600 transition-colors hover:border-blue-400 hover:text-blue-600"
                    >
                      Preview
                    </button>
                  </label>
                );
              })}
              {!visible.length && (
                <p className="p-8 text-center text-sm text-slate-400">
                  No problems match your filters.
                </p>
              )}
            </div>
          </section>

          {/* Right: exam builder */}
          <aside
            style={{ animationDelay: "100ms" }}
            className="animate-fade-up sticky top-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5"
          >
            <div>
              <h2 className="flex items-center gap-2 text-sm font-bold">
                Your Exam
                {activeSetName && (
                  <span className="animate-pop truncate rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                    {activeSetName}
                  </span>
                )}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {selected.size
                  ? `${selected.size} problems · ~${totalMinutes} min`
                  : "No problems selected yet — pick from the bank or start from a preset."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => presetDialog.current?.showModal()}
              className="flex items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold transition-colors hover:border-blue-400 hover:text-blue-600"
            >
              <span className="truncate">
                {activeSetName ?? "Start from a preset…"}
              </span>
              <span aria-hidden className="text-slate-400">
                ▸
              </span>
            </button>

            <dialog
              ref={presetDialog}
              closedby="any"
              className="m-auto w-[min(56rem,calc(100vw-2rem))] rounded-2xl p-0 shadow-2xl backdrop:bg-slate-900/40 backdrop:backdrop-blur-sm open:animate-pop"
            >
              <div className="p-6 sm:p-8">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold">Recommended Exams</h2>
                    <p className="mt-0.5 text-sm text-slate-500">
                      Pick a starting point — you can add or remove problems
                      afterwards.
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label="Close"
                    onClick={() => presetDialog.current?.close()}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  >
                    ×
                  </button>
                </div>
                {savedExams.length > 0 && (
                  <div className="mb-6">
                    <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                      My Exams
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {savedExams.map((exam) => (
                        <div
                          key={exam.name}
                          className="relative rounded-xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              loadSet(exam.ids);
                              presetDialog.current?.close();
                            }}
                            className="w-full text-left"
                          >
                            <span className="block truncate pr-6 font-semibold">
                              {exam.name}
                            </span>
                            <span className="mt-1 block text-sm text-slate-500">
                              {exam.ids.length} problems · ~
                              {exam.ids.reduce(
                                (sum, id) =>
                                  sum +
                                  minutesFor[
                                    problems.find((p) => p.id === id)!
                                      .difficulty
                                  ],
                                0
                              )}{" "}
                              min
                            </span>
                          </button>
                          <button
                            type="button"
                            aria-label={`Delete ${exam.name}`}
                            onClick={() =>
                              persistExams(
                                savedExams.filter((e) => e.name !== exam.name)
                              )
                            }
                            className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Recommended
                </h3>
                <div className="grid items-start gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {presets.map((preset) => (
                    <div
                      key={preset.name}
                      className="rounded-xl border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          loadSet(preset.ids);
                          presetDialog.current?.close();
                        }}
                        className="w-full p-4 text-left"
                      >
                        <span className="block font-semibold">
                          {preset.name}
                        </span>
                        <span className="mt-1 block text-sm text-slate-500">
                          {preset.description}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSetPreview(preset);
                          setDialog.current?.showModal();
                        }}
                        className="flex w-full items-center gap-1 border-t border-slate-100 px-4 py-2 text-xs font-semibold text-slate-500 hover:text-blue-600"
                      >
                        <span aria-hidden>▸</span> View {preset.ids.length}{" "}
                        problems
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </dialog>

            <dialog
              ref={setDialog}
              closedby="any"
              className="m-auto w-[min(34rem,calc(100vw-2rem))] rounded-2xl p-0 shadow-2xl backdrop:bg-slate-900/40 backdrop:backdrop-blur-sm open:animate-pop"
            >
              {setPreview_ && (
                <div className="p-6 sm:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold">{setPreview_.name}</h2>
                      {setPreview_.description && (
                        <p className="mt-0.5 text-sm text-slate-500">
                          {setPreview_.description}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      aria-label="Close"
                      onClick={() => setDialog.current?.close()}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    >
                      ×
                    </button>
                  </div>

                  <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                    {setPreview_.ids.map((id, i) => {
                      const prob = problems.find((p) => p.id === id)!;
                      return (
                        <div
                          key={id}
                          style={{ animationDelay: `${i * 30}ms` }}
                          className="animate-fade-up flex items-center gap-3 border-b border-slate-100 px-4 py-2.5 text-sm last:border-b-0"
                        >
                          <span className="w-4 shrink-0 text-xs text-slate-400">
                            {i + 1}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-semibold">
                              {prob.title}
                            </span>
                            <span className="block truncate text-xs text-slate-500">
                              {prob.instructions}
                            </span>
                          </span>
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${difficultyBadge[prob.difficulty]}`}
                          >
                            {prob.difficulty}
                          </span>
                          <span className="shrink-0 text-xs text-slate-400">
                            ~{minutesFor[prob.difficulty]}m
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <p className="mt-3 text-xs text-slate-500">
                    {setPreview_.ids.length} problems · ~
                    {setPreview_.ids.reduce(
                      (sum, id) =>
                        sum +
                        minutesFor[problems.find((p) => p.id === id)!.difficulty],
                      0
                    )}{" "}
                    min total
                  </p>

                  <div className="mt-5 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setDialog.current?.close()}
                      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold transition-transform hover:bg-slate-50 active:scale-95"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        loadSet(setPreview_.ids);
                        setDialog.current?.close();
                        presetDialog.current?.close();
                      }}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition-transform hover:bg-blue-700 active:scale-95"
                    >
                      Use this exam
                    </button>
                  </div>
                </div>
              )}
            </dialog>

            <dialog
              ref={previewDialog}
              closedby="any"
              className="m-auto w-[min(48rem,calc(100vw-2rem))] rounded-2xl p-0 shadow-2xl backdrop:bg-slate-900/40 backdrop:backdrop-blur-sm open:animate-pop"
            >
              {preview && (
                <div className="p-6 sm:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span
                        className={`mb-2 inline-block rounded-full px-2.5 py-1 text-xs font-bold capitalize ${difficultyBadge[preview.difficulty]}`}
                      >
                        {preview.difficulty} · {preview.category}
                      </span>
                      <h2 className="text-2xl font-bold">{preview.title}</h2>
                      <p className="mt-2 leading-relaxed text-slate-600">
                        {preview.instructions}
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label="Close"
                      onClick={() => previewDialog.current?.close()}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    >
                      ×
                    </button>
                  </div>

                  <h3 className="mt-5 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Starter Code
                  </h3>
                  <pre className="mt-2 overflow-x-auto rounded-xl bg-slate-900 p-4 font-mono text-sm leading-6 text-slate-100">
                    {preview.starterCode}
                  </pre>

                  <h3 className="mt-5 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Test Cases
                  </h3>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {preview.tests.map((t, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs"
                      >
                        <p className="overflow-x-auto whitespace-nowrap text-slate-600">
                          {callLabel(preview, t)}
                        </p>
                        <p className="mt-1 font-sans text-[11px] font-semibold text-slate-400">
                          Expected
                        </p>
                        <pre className="overflow-x-auto whitespace-pre-wrap">
                          {formatValue(t.expected)}
                        </pre>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => previewDialog.current?.close()}
                      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold transition-transform hover:bg-slate-50 active:scale-95"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!selected.has(preview.id)) toggle(preview.id);
                        previewDialog.current?.close();
                      }}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition-transform hover:bg-blue-700 active:scale-95"
                    >
                      Add to exam
                    </button>
                  </div>
                </div>
              )}
            </dialog>

            {savedExams.length > 0 && (
              <div>
                <h3 className="mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  My Exams
                </h3>
                <div className="flex flex-col gap-1">
                  {savedExams.map((exam) => (
                    <div
                      key={exam.name}
                      className="flex items-center gap-1 rounded-lg border border-slate-200 py-1.5 pl-3 pr-1.5 text-sm hover:border-slate-300"
                    >
                      <button
                        type="button"
                        onClick={() => loadSet(exam.ids)}
                        className="min-w-0 flex-1 truncate text-left font-semibold hover:text-blue-600"
                      >
                        {exam.name}
                        <span className="ml-1.5 font-normal text-slate-400">
                          {exam.ids.length}
                        </span>
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${exam.name}`}
                        onClick={() =>
                          persistExams(
                            savedExams.filter((e) => e.name !== exam.name)
                          )
                        }
                        className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedProblems.length > 0 && (
              <div className="flex max-h-72 flex-col gap-1 overflow-y-auto">
                {selectedProblems.map((p, i) => (
                  <div
                    key={p.id}
                    className="animate-pop flex items-center gap-2 rounded-lg bg-slate-50 py-1.5 pl-3 pr-1.5 text-sm"
                  >
                    <span className="w-4 shrink-0 text-xs text-slate-400">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {p.title}
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold capitalize ${difficultyBadge[p.difficulty]}`}
                    >
                      {p.difficulty}
                    </span>
                    <button
                      type="button"
                      aria-label={`Remove ${p.title}`}
                      onClick={() => toggle(p.id)}
                      className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-2 border-t border-slate-100 pt-4">
              <label className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-slate-600">
                  Send results to
                </span>
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
                  Shuffle problem order
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
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition-transform hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {copied ? "Copied!" : "Copy exam link"}
              </button>
              <div className="flex gap-2">
                <a
                  href={link || undefined}
                  target="_blank"
                  rel="noreferrer"
                  aria-disabled={!link}
                  className={`flex-1 rounded-lg border px-3 py-1.5 text-center text-sm font-bold ${
                    link
                      ? "border-slate-300 transition-transform hover:bg-slate-50 active:scale-95"
                      : "pointer-events-none border-slate-200 text-slate-300"
                  }`}
                >
                  Preview
                </a>
                <button
                  type="button"
                  disabled={!selected.size}
                  onClick={() => {
                    const name = window.prompt("Name this exam:")?.trim();
                    if (!name) return;
                    persistExams([
                      ...savedExams.filter((e) => e.name !== name),
                      { name, ids },
                    ]);
                  }}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-bold transition-transform hover:bg-slate-50 active:scale-95 disabled:cursor-not-allowed disabled:text-slate-300"
                >
                  Save
                </button>
                <button
                  type="button"
                  disabled={!selected.size}
                  onClick={() => loadSet([])}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-bold transition-transform hover:bg-slate-50 active:scale-95 disabled:cursor-not-allowed disabled:text-slate-300"
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
