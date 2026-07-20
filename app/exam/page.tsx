"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { problems, parseProblemIds, type Problem } from "@/lib/problems";
import { runProblemSandboxed, formatValue, type RunResult } from "@/lib/runner";
import { runReactProblem } from "@/lib/react-runner";
import type { TestCase } from "@/lib/problems";
import CodeEditor from "@/components/CodeEditor";

const statusLabel: Record<string, string> = {
  passed: "Passed",
  failed: "Failed",
  error: "Error",
};

const statusBadge: Record<string, string> = {
  passed: "bg-green-100 text-green-700",
  failed: "bg-amber-100 text-amber-700",
  error: "bg-red-100 text-red-700",
};

function runAny(problem: Problem, code: string): Promise<RunResult> {
  return problem.kind === "react"
    ? Promise.resolve(runReactProblem(problem, code))
    : runProblemSandboxed(problem, code);
}

function callLabel(problem: Problem, t: TestCase): string {
  if (problem.kind !== "react")
    return `${problem.fnName}(${t.args.map((a) => JSON.stringify(a)).join(", ")})`;
  const props = Object.entries((t.args[0] ?? {}) as Record<string, unknown>)
    .map(([k, v]) => `${k}={${JSON.stringify(v)}}`)
    .join(" ");
  const clicks = t.clicks
    ? ` then click <${t.clickOn}> ×${t.clicks}`
    : "";
  return `<${problem.fnName}${props ? " " + props : ""} />${clicks}`;
}

function Exam() {
  const searchParams = useSearchParams();
  const examProblems = useMemo<Problem[]>(() => {
    const ids = parseProblemIds(searchParams.get("p"));
    return ids.length
      ? problems.filter((p) => ids.includes(p.id))
      : problems;
  }, [searchParams]);

  const [selectedId, setSelectedId] = useState(examProblems[0]?.id);

  // ponytail: localStorage so a refresh doesn't wipe the applicant's work.
  // Read synchronously in the initializer — this component only runs in the
  // browser (the Suspense fallback is what gets prerendered), and a
  // post-mount restore effect would repaint the editor and flicker.
  const storageKey = `exam-answers:${searchParams.get("p") ?? "all"}`;
  const [answers, setAnswers] = useState<Record<number, string>>(() => {
    let saved: Record<number, string> = {};
    try {
      saved = JSON.parse(localStorage.getItem(storageKey) ?? "{}");
    } catch {}
    return {
      ...Object.fromEntries(examProblems.map((p) => [p.id, p.starterCode])),
      ...saved,
    };
  });
  const [results, setResults] = useState<Record<number, RunResult>>({});
  const [applicantName, setApplicantName] = useState("");
  const [submitState, setSubmitState] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(answers));
  }, [answers, storageKey]);

  async function submitResults() {
    const entries: [number, RunResult][] = await Promise.all(
      examProblems.map(
        async (p): Promise<[number, RunResult]> => [
          p.id,
          await runAny(p, answers[p.id] ?? p.starterCode),
        ]
      )
    );
    setResults(Object.fromEntries(entries));

    // Email the report to the examiner.
    setSubmitState("sending");
    const graded = new Map(entries);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examiner: searchParams.get("e") ?? undefined,
          applicantName: applicantName.trim() || "Applicant",
          results: examProblems.map((p) => {
            const r = graded.get(p.id)!;
            return {
              title: p.title,
              difficulty: p.difficulty,
              status: r.status,
              passed: r.tests.filter((t) => t.passed).length,
              total: r.tests.length,
              code: answers[p.id] ?? p.starterCode,
              error: r.error,
            };
          }),
        }),
      });
      setSubmitState(res.ok ? "sent" : "error");
    } catch {
      setSubmitState("error");
    }
  }

  const problem = examProblems.find((p) => p.id === selectedId);
  if (!problem) {
    return (
      <main className="grid min-h-screen place-items-center text-slate-500">
        This exam link contains no problems. Ask your interviewer for a new
        link.
      </main>
    );
  }

  const code = answers[problem.id] ?? problem.starterCode;
  const result = results[problem.id];
  const passedCount = examProblems.filter(
    (p) => results[p.id]?.status === "passed"
  ).length;

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-900 sm:p-8">
      <div className="animate-fade-up mx-auto max-w-7xl">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
              Junior JavaScript Assessment
            </p>
            <h1 className="text-3xl font-bold">JavaScript Fundamentals</h1>
            <p className="mt-1 text-slate-500">
              Complete each function, then run the tests to check your
              solution.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-sm">
              {passedCount} / {examProblems.length} solved
            </div>
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
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="mb-3 px-2 text-sm font-bold">Problems</h2>
            <div className="flex flex-col gap-1">
              {examProblems.map((p, index) => {
                const status = results[p.id]?.status;
                const selected = p.id === selectedId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedId(p.id)}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all active:scale-[0.98] ${
                      selected
                        ? "border-blue-200 bg-blue-50"
                        : "border-transparent hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold ${
                        status === "passed"
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {status === "passed" ? "✓" : index + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">
                        {p.title}
                      </span>
                      <span className="text-xs text-slate-500">
                        {status ? statusLabel[status] : "Not attempted"}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          <section key={problem.id} className="animate-fade-up rounded-2xl border border-slate-200 bg-white p-6 sm:p-7">
            <div className="border-b border-slate-200 pb-5">
              <span
                className={`mb-2 inline-block rounded-full px-2.5 py-1 text-xs font-bold capitalize ${
                  {
                    easy: "bg-blue-50 text-blue-600",
                    medium: "bg-purple-50 text-purple-600",
                    hard: "bg-red-50 text-red-600",
                  }[problem.difficulty]
                }`}
              >
                {problem.difficulty} · {problem.category}
              </span>
              <h2 className="text-2xl font-bold">{problem.title}</h2>
              <p className="mt-2 leading-relaxed text-slate-600">
                {problem.instructions}
              </p>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between gap-4">
                <h3 className="text-sm font-bold">Your Code</h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAnswers((a) => ({
                        ...a,
                        [problem.id]: problem.starterCode,
                      }));
                      setResults((r) => {
                        const next = { ...r };
                        delete next[problem.id];
                        return next;
                      });
                    }}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold transition-transform hover:bg-slate-50 active:scale-95"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const result = await runAny(problem, code);
                      setResults((r) => ({ ...r, [problem.id]: result }));
                    }}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition-transform hover:bg-blue-700 active:scale-95"
                  >
                    Run Tests
                  </button>
                </div>
              </div>
              <CodeEditor
                value={code}
                onChange={(value) =>
                  setAnswers((a) => ({ ...a, [problem.id]: value }))
                }
              />
            </div>

            <div className="mt-5 grid items-start gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="flex items-center gap-2 text-sm font-bold">
                  Test Cases
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                    {problem.tests.length}
                  </span>
                </h3>
                <div className="mt-3 flex flex-col gap-2">
                  {problem.tests.map((t, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-slate-200 bg-white p-3 font-mono text-xs"
                    >
                      <p className="flex items-baseline gap-2">
                        <span className="shrink-0 font-sans text-[11px] font-bold text-slate-400">
                          {i + 1}
                        </span>
                        <span className="overflow-x-auto whitespace-nowrap text-slate-600">
                          {callLabel(problem, t)}
                        </span>
                      </p>
                      <p className="mt-2 font-sans text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Expected
                      </p>
                      <pre className="mt-0.5 overflow-x-auto whitespace-pre-wrap text-slate-800">
                        {formatValue(t.expected)}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="flex items-center gap-2 text-sm font-bold">
                    Test Results
                    {result && result.tests.length > 0 && (
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                        {result.tests.filter((t) => t.passed).length}/
                        {result.tests.length}
                      </span>
                    )}
                  </h3>
                  {result && (
                    <span
                      className={`animate-pop rounded-full px-2.5 py-1 text-xs font-bold ${statusBadge[result.status]}`}
                    >
                      {statusLabel[result.status]}
                    </span>
                  )}
                </div>

                {!result && (
                  <div className="mt-3 grid min-h-32 place-items-center rounded-lg border border-dashed border-slate-300 text-sm text-slate-400">
                    Run the tests to see your results here.
                  </div>
                )}

                {result?.error && (
                  <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-lg border border-red-200 bg-red-50 p-3 font-mono text-sm text-red-700">
                    {result.error}
                  </pre>
                )}

                <div className="mt-3 flex flex-col gap-2">
                  {result?.tests.map((t, i) => (
                    <div
                      key={i}
                      style={{ animationDelay: `${i * 60}ms` }}
                      className={`animate-fade-up rounded-lg border p-3 text-sm ${
                        t.passed
                          ? "border-green-200 bg-green-50"
                          : "border-red-200 bg-red-50"
                      }`}
                    >
                      <p className="flex items-baseline gap-2">
                        <span
                          className={`grid h-4 w-4 shrink-0 translate-y-0.5 place-items-center rounded-full text-[10px] font-bold text-white ${
                            t.passed ? "bg-green-600" : "bg-red-600"
                          }`}
                        >
                          {t.passed ? "✓" : "✗"}
                        </span>
                        <span className="overflow-x-auto whitespace-nowrap font-mono text-xs text-slate-600">
                          {callLabel(problem, t.test)}
                        </span>
                      </p>
                      {!t.passed && (
                        <div className="mt-2 grid gap-2 font-mono text-xs sm:grid-cols-2">
                          <div>
                            <p className="mb-1 font-sans text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                              Expected
                            </p>
                            <pre className="overflow-x-auto whitespace-pre-wrap">
                              {formatValue(t.test.expected)}
                            </pre>
                          </div>
                          <div>
                            <p className="mb-1 font-sans text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                              {t.error ? "Error" : "Received"}
                            </p>
                            <pre
                              className={`overflow-x-auto whitespace-pre-wrap ${t.error ? "text-red-700" : ""}`}
                            >
                              {t.error ?? formatValue(t.actual)}
                            </pre>
                          </div>
                        </div>
                      )}
                      {t.logs && t.logs.length > 0 && (
                        <div className="mt-2">
                          <p className="mb-1 font-sans text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            Console
                          </p>
                          <pre className="overflow-x-auto whitespace-pre-wrap rounded-md bg-slate-900 p-2 font-mono text-[11px] leading-relaxed text-slate-100">
                            {t.logs.join("\n")}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default function ExamPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center bg-slate-100 text-sm text-slate-400">
          Loading exam…
        </main>
      }
    >
      <Exam />
    </Suspense>
  );
}
