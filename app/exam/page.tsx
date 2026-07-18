"use client";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { problems, parseProblemIds, type Problem } from "@/lib/problems";
import { runProblem, formatValue, type RunResult } from "@/lib/runner";
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

function Exam() {
  const searchParams = useSearchParams();
  const examProblems = useMemo<Problem[]>(() => {
    const ids = parseProblemIds(searchParams.get("p"));
    return ids.length
      ? problems.filter((p) => ids.includes(p.id))
      : problems;
  }, [searchParams]);

  const [selectedId, setSelectedId] = useState(examProblems[0]?.id);
  const [answers, setAnswers] = useState<Record<number, string>>(() =>
    Object.fromEntries(examProblems.map((p) => [p.id, p.starterCode]))
  );
  const [results, setResults] = useState<Record<number, RunResult>>({});
  const [applicantName, setApplicantName] = useState("");

  // ponytail: PDF via the browser's print dialog (Save as PDF) on a
  // print-only report — no pdf library needed.
  function submitResults() {
    setResults(
      Object.fromEntries(
        examProblems.map((p) => [
          p.id,
          runProblem(p, answers[p.id] ?? p.starterCode),
        ])
      )
    );
    setTimeout(() => window.print(), 50);
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
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4 print:hidden">
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
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white transition-transform hover:bg-green-700 active:scale-95"
            >
              Submit Results
            </button>
          </div>
        </header>

        <section className="hidden print:block">
          <h1 className="text-2xl font-bold">
            JavaScript Assessment — Results
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Applicant: {applicantName || "(not provided)"} · Date:{" "}
            {new Date().toLocaleDateString()} · Score: {passedCount} /{" "}
            {examProblems.length}
          </p>
          {examProblems.map((p) => {
            const r = results[p.id];
            return (
              <div
                key={p.id}
                className="mt-6 break-inside-avoid border-t border-slate-300 pt-4"
              >
                <h2 className="text-lg font-bold">
                  {p.title} —{" "}
                  {r ? statusLabel[r.status] : "Not attempted"}
                  {r?.status === "failed" &&
                    ` (${r.tests.filter((t) => t.passed).length}/${r.tests.length} tests)`}
                </h2>
                {r?.error && (
                  <p className="mt-1 font-mono text-sm">{r.error}</p>
                )}
                <pre className="mt-2 overflow-hidden whitespace-pre-wrap rounded border border-slate-300 p-3 font-mono text-xs">
                  {answers[p.id] ?? p.starterCode}
                </pre>
              </div>
            );
          })}
        </section>

        <div className="grid items-start gap-6 print:hidden lg:grid-cols-[280px_minmax(0,1fr)]">
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
                    onClick={() =>
                      setResults((r) => ({
                        ...r,
                        [problem.id]: runProblem(problem, code),
                      }))
                    }
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

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-bold">Test Cases</h3>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {problem.tests.map((t, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-slate-200 bg-white p-3 font-mono text-xs"
                  >
                    <p className="overflow-x-auto whitespace-nowrap text-slate-600">
                      {problem.fnName}(
                      {t.args.map((a) => JSON.stringify(a)).join(", ")})
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
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold">Test Results</h3>
                {result && (
                  <span
                    className={`animate-pop rounded-full px-2.5 py-1 text-xs font-bold ${statusBadge[result.status]}`}
                  >
                    {statusLabel[result.status]}
                  </span>
                )}
              </div>

              {!result && (
                <p className="mt-3 text-sm text-slate-400">
                  Run the tests to see your results.
                </p>
              )}

              {result?.error && (
                <pre className="mt-3 overflow-x-auto whitespace-pre-wrap font-mono text-sm text-red-700">
                  {result.error}
                </pre>
              )}

              {result?.tests.map((t, i) => (
                <div
                  key={i}
                  style={{ animationDelay: `${i * 60}ms` }}
                  className={`animate-fade-up mt-3 rounded-lg border p-3 text-sm ${
                    t.passed
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <p className="font-bold">
                    {t.passed ? "✓" : "✗"} Test {i + 1}
                    <span className="ml-2 font-mono font-normal text-slate-600">
                      {problem.fnName}(
                      {t.test.args.map((a) => JSON.stringify(a)).join(", ")})
                    </span>
                  </p>
                  {!t.passed && (
                    <div className="mt-2 grid gap-2 font-mono text-xs sm:grid-cols-2">
                      <div>
                        <p className="mb-1 font-sans font-semibold text-slate-500">
                          Expected
                        </p>
                        <pre className="overflow-x-auto whitespace-pre-wrap">
                          {formatValue(t.test.expected)}
                        </pre>
                      </div>
                      <div>
                        <p className="mb-1 font-sans font-semibold text-slate-500">
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
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default function ExamPage() {
  return (
    <Suspense>
      <Exam />
    </Suspense>
  );
}
