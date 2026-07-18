"use client";
import { useState } from "react";
import { problems, categories, type Problem } from "@/lib/problems";

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
    description: "~45 min · balanced mix across all categories",
    ids: [1, 2, 6, 9, 12, 21],
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
    name: "Full Assessment",
    description: "~90 min · easy to hard, for shortlisted candidates",
    ids: [1, 6, 9, 12, 18, 20, 23, 24],
  },
];

const difficultyBadge: Record<Problem["difficulty"], string> = {
  easy: "bg-blue-50 text-blue-600",
  medium: "bg-purple-50 text-purple-600",
  hard: "bg-red-50 text-red-600",
};

export default function AdminPage() {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState(false);
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<string>("all");

  const visible = problems.filter(
    (p) =>
      (difficulty === "all" || p.difficulty === difficulty) &&
      (p.title + p.instructions).toLowerCase().includes(query.toLowerCase())
  );

  const ids = problems.filter((p) => selected.has(p.id)).map((p) => p.id);
  const link = ids.length
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/exam?p=${ids.join(",")}`
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

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-900 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
            Admin
          </p>
          <h1 className="text-3xl font-bold">Problem Bank</h1>
          <p className="mt-1 text-slate-500">
            Select problems, then copy an exam link to send to the applicant.
          </p>
        </header>

        <section className="mb-6">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-slate-500">
            Recommended Exams
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {presets.map((preset) => {
              const active =
                selected.size === preset.ids.length &&
                preset.ids.every((id) => selected.has(id));
              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    setSelected(new Set(preset.ids));
                    setCopied(false);
                  }}
                  className={`rounded-2xl border bg-white p-4 text-left transition-colors ${
                    active
                      ? "border-blue-400 ring-1 ring-blue-400"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{preset.name}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                      {preset.ids.length} problems
                    </span>
                  </span>
                  <span className="mt-1 block text-sm text-slate-500">
                    {preset.description}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <div className="sticky top-4 z-10 mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search problems…"
              className="min-w-40 flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-blue-400"
            />
            {["all", ...difficulties].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold capitalize ${
                  difficulty === d
                    ? "bg-slate-900 text-white"
                    : "border border-slate-300 hover:bg-slate-50"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold">
              {selected.size} selected
            </span>
            <button
              type="button"
              onClick={() =>
                setSelected(new Set(visible.map((p) => p.id)))
              }
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold hover:bg-slate-50"
            >
              Select all shown
            </button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold hover:bg-slate-50"
            >
              Clear
            </button>
            <div className="ml-auto flex min-w-0 items-center gap-2">
              {link && (
                <code className="truncate rounded-lg bg-slate-100 px-3 py-1.5 text-xs">
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
                className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {copied ? "Copied!" : "Copy exam link"}
              </button>
            </div>
          </div>
        </div>

        {categories.map((category) => {
          const group = visible.filter((p) => p.category === category);
          if (!group.length) return null;
          return (
            <section key={category} className="mb-8">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-slate-500">
                {category}{" "}
                <span className="font-normal normal-case tracking-normal">
                  ({group.length})
                </span>
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {group.map((p) => {
                  const checked = selected.has(p.id);
                  return (
                    <label
                      key={p.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-2xl border bg-white p-4 transition-colors ${
                        checked
                          ? "border-blue-400 ring-1 ring-blue-400"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(p.id)}
                        className="mt-1 h-4 w-4 accent-blue-600"
                      />
                      <span>
                        <span className="flex items-center gap-2">
                          <span className="font-semibold">{p.title}</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-bold capitalize ${difficultyBadge[p.difficulty]}`}
                          >
                            {p.difficulty}
                          </span>
                        </span>
                        <span className="mt-1 block text-sm text-slate-500">
                          {p.instructions}
                        </span>
                        <span className="mt-1 block text-xs text-slate-400">
                          {p.tests.length} tests
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </section>
          );
        })}
        {!visible.length && (
          <p className="text-center text-slate-400">
            No problems match your filters.
          </p>
        )}
      </div>
    </main>
  );
}
