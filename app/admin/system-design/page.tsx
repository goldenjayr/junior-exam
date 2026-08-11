"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { challenges } from "@/lib/system-design/challenges";
import { clampMinutes, minutesToSeconds } from "@/lib/time-attack";

const examinerIds = ["jayr", "jack", "iven", "andrei", "neil", "pragya"];
const presetMinutes = [5, 10, 15, 30, 45, 60] as const;

const difficultyBadge: Record<string, string> = {
  easy: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300",
  medium: "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-300",
  hard: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300",
};

export default function SystemDesignAdminPage() {
  const [selected, setSelected] = useState(challenges[0]?.id ?? "");
  const [examiner, setExaminer] = useState(examinerIds[0]);
  const [mode, setMode] = useState<"practice" | "challenge">("challenge");
  const [timeMode, setTimeMode] = useState<"off" | "preset" | "custom">("preset");
  const [presetMin, setPresetMin] = useState<(typeof presetMinutes)[number]>(30);
  const [customMin, setCustomMin] = useState(20);
  const [copied, setCopied] = useState(false);
  const [query, setQuery] = useState("");
  const [saveName, setSaveName] = useState("");
  const [savedLinks, setSavedLinks] = useState<
    { name: string; path: string }[]
  >(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("saved-sd-links") ?? "[]");
    } catch {
      return [];
    }
  });

  const visible = useMemo(
    () =>
      challenges.filter((c) =>
        (c.title + c.blurb + c.difficulty)
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [query]
  );

  const linkPath = useMemo(() => {
    if (!selected) return "";
    const params = new URLSearchParams();
    params.set("c", selected);
    params.set("mode", mode);
    params.set("e", examiner);
    if (mode === "challenge" && timeMode !== "off") {
      const mins =
        timeMode === "preset" ? presetMin : clampMinutes(customMin);
      params.set("t", String(minutesToSeconds(mins)));
    }
    return `/system-design/play?${params.toString()}`;
  }, [selected, mode, examiner, timeMode, presetMin, customMin]);

  async function copyLink() {
    if (!linkPath) return;
    const full = `${window.location.origin}${linkPath}`;
    await navigator.clipboard.writeText(full);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  function persistSaved(next: { name: string; path: string }[]) {
    setSavedLinks(next);
    localStorage.setItem("saved-sd-links", JSON.stringify(next));
  }

  function saveCurrentLink() {
    const name = saveName.trim();
    if (!name || !linkPath) return;
    const next = [
      { name, path: linkPath },
      ...savedLinks.filter((s) => s.name !== name),
    ].slice(0, 20);
    persistSaved(next);
    setSaveName("");
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
              Admin
            </p>
            <h1 className="mt-1 text-3xl font-bold">Build a System Design challenge</h1>
            <p className="mt-2 text-sm text-muted">
              Pick a challenge, optional Time Attack, copy a shareable link.
            </p>
          </div>
          <Link href="/system-design" className="text-sm text-muted hover:text-foreground">
            ← Lobby
          </Link>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_280px]">
          <div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search challenges…"
              className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none focus:border-cyan-500"
            />
            <ul className="mt-4 space-y-2">
              {visible.map((c) => {
                const active = selected === c.id;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setSelected(c.id)}
                      className={`flex w-full items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                        active
                          ? "border-cyan-500 bg-cyan-500/10"
                          : "border-border bg-card hover:bg-hover"
                      }`}
                    >
                      <div>
                        <p className="font-semibold">{c.title}</p>
                        <p className="mt-0.5 text-xs text-muted">{c.blurb}</p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${difficultyBadge[c.difficulty]}`}
                      >
                        {c.difficulty}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <aside className="h-fit rounded-2xl border border-border bg-card p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-muted">
              Link settings
            </p>

            <label className="mt-3 block text-xs font-semibold">
              Mode
              <select
                value={mode}
                onChange={(e) =>
                  setMode(e.target.value as "practice" | "challenge")
                }
                className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
              >
                <option value="challenge">Challenge (submit)</option>
                <option value="practice">Practice</option>
              </select>
            </label>

            <label className="mt-3 block text-xs font-semibold">
              Examiner
              <select
                value={examiner}
                onChange={(e) => setExaminer(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
              >
                {examinerIds.map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </select>
            </label>

            <div className="mt-3">
              <p className="text-xs font-semibold">Time Attack</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {(["off", "preset", "custom"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setTimeMode(m)}
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                      timeMode === m
                        ? "bg-foreground text-background"
                        : "border border-border"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              {timeMode === "preset" && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {presetMinutes.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPresetMin(m)}
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        presetMin === m
                          ? "bg-cyan-600 text-white"
                          : "border border-border"
                      }`}
                    >
                      {m}m
                    </button>
                  ))}
                </div>
              )}
              {timeMode === "custom" && (
                <input
                  type="number"
                  min={1}
                  max={180}
                  value={customMin}
                  onChange={(e) => setCustomMin(Number(e.target.value))}
                  className="mt-2 w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
                />
              )}
            </div>

            <button
              type="button"
              onClick={copyLink}
              disabled={!selected}
              className="mt-4 w-full rounded-xl bg-cyan-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-50"
            >
              {copied ? "Copied!" : "Copy shareable link"}
            </button>
            {linkPath && (
              <p className="mt-2 break-all text-[10px] text-muted">{linkPath}</p>
            )}

            <div className="mt-4 border-t border-border pt-3">
              <p className="text-xs font-semibold">Save link</p>
              <div className="mt-1.5 flex gap-1">
                <input
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="Name"
                  className="min-w-0 flex-1 rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
                />
                <button
                  type="button"
                  onClick={saveCurrentLink}
                  disabled={!saveName.trim() || !linkPath}
                  className="rounded-lg border border-border px-2.5 text-xs font-semibold hover:bg-hover disabled:opacity-40"
                >
                  Save
                </button>
              </div>
              {savedLinks.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {savedLinks.map((s) => (
                    <li
                      key={s.name}
                      className="flex items-center justify-between gap-2 text-xs"
                    >
                      <button
                        type="button"
                        className="truncate text-left font-medium text-cyan-700 hover:underline dark:text-cyan-400"
                        onClick={() => {
                          void navigator.clipboard.writeText(
                            `${window.location.origin}${s.path}`
                          );
                          setCopied(true);
                          window.setTimeout(() => setCopied(false), 1500);
                        }}
                        title={s.path}
                      >
                        {s.name}
                      </button>
                      <button
                        type="button"
                        className="text-muted hover:text-red-600"
                        onClick={() =>
                          persistSaved(savedLinks.filter((x) => x.name !== s.name))
                        }
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
