import type { Problem, TestCase } from "./problems.ts";

export type Efficiency = "ok" | "slow" | "na";

export type TestResult = {
  test: TestCase;
  passed: boolean;
  actual?: unknown;
  error?: string;
  logs?: string[];
  durationMs?: number;
  performanceFailed?: boolean;
};

export type RunResult = {
  status: "passed" | "failed" | "error";
  tests: TestResult[];
  error?: string;
  efficiency: Efficiency;
};

export function formatValue(value: unknown): string {
  if (value === undefined) return "undefined";
  if (typeof value === "string") return JSON.stringify(value);
  return JSON.stringify(value, null, 2) ?? String(value);
}

// Self-contained on purpose: runProblemSandboxed ships this whole function
// into a Web Worker via toString(), so it must not reference module scope.
export function runProblem(problem: Problem, code: string): RunResult {
  function deepEqual(a: unknown, b: unknown): boolean {
    if (Object.is(a, b)) return true;
    if (
      typeof a !== "object" ||
      typeof b !== "object" ||
      a === null ||
      b === null
    )
      return false;
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    if (Array.isArray(a) && Array.isArray(b))
      return (
        a.length === b.length && a.every((v, i) => deepEqual(v, b[i]))
      );
    const ka = Object.keys(a);
    const kb = Object.keys(b);
    return (
      ka.length === kb.length &&
      ka.every(
        (k) =>
          Object.hasOwn(b, k) &&
          deepEqual(
            (a as Record<string, unknown>)[k],
            (b as Record<string, unknown>)[k]
          )
      )
    );
  }

  // Keep worker results postMessage-safe (drops functions, symbols, etc.).
  function sanitize(value: unknown): unknown {
    if (value === undefined) return undefined;
    try {
      return JSON.parse(JSON.stringify(value));
    } catch {
      return String(value);
    }
  }

  // Capture the candidate's console.* so they can debug their solution.
  // Injected as a `console` parameter because `new Function` bodies resolve
  // free names against global scope, not this closure.
  const logs: string[] = [];
  const fmtArg = (a: unknown): string => {
    if (typeof a === "string") return a;
    if (a === undefined) return "undefined";
    try {
      return JSON.stringify(a) ?? String(a);
    } catch {
      return String(a);
    }
  };
  const capture =
    (level: string) =>
    (...args: unknown[]) =>
      logs.push(
        (level === "log" ? "" : `[${level}] `) + args.map(fmtArg).join(" ")
      );
  const sandboxConsole = {
    log: capture("log"),
    error: capture("error"),
    warn: capture("warn"),
    info: capture("info"),
    debug: capture("debug"),
  };

  let fn: (...args: unknown[]) => unknown;
  try {
    fn = new Function(
      "console",
      `"use strict";\n${code}\nif (typeof ${problem.fnName} !== "function") throw new Error("Function ${problem.fnName} was not defined.");\nreturn ${problem.fnName};`
    )(sandboxConsole) as typeof fn;
  } catch (error) {
    return {
      status: "error",
      tests: [],
      error: error instanceof Error ? error.message : String(error),
      efficiency: "na",
    };
  }

  const tests: TestResult[] = problem.tests.map((test) => {
    logs.length = 0;
    const isPerf = typeof test.maxMs === "number";
    try {
      const args = structuredClone(test.args);
      const start = performance.now();
      const actual = fn(...args);
      const durationMs = performance.now() - start;
      const correct = deepEqual(actual, test.expected);
      if (isPerf) {
        const withinBudget = durationMs <= test.maxMs!;
        const ok = correct && withinBudget;
        return {
          test,
          passed: ok,
          actual: sanitize(actual),
          logs: [...logs],
          durationMs,
          performanceFailed: !ok,
        };
      }
      return {
        test,
        passed: correct,
        actual: sanitize(actual),
        logs: [...logs],
        durationMs,
      };
    } catch (error) {
      return {
        test,
        passed: false,
        error: error instanceof Error ? error.message : String(error),
        logs: [...logs],
        ...(isPerf ? { performanceFailed: true } : {}),
      };
    }
  });

  const correctness = tests.filter((t) => t.test.maxMs == null);
  const perf = tests.filter((t) => t.test.maxMs != null);
  const status = (
    correctness.length > 0 ? correctness : tests
  ).every((t) => t.passed)
    ? "passed"
    : "failed";

  let efficiency: Efficiency;
  if (perf.length === 0) efficiency = "na";
  else if (perf.every((t) => t.passed)) efficiency = "ok";
  else efficiency = "slow";

  return { status, tests, efficiency };
}

function sandboxTimeoutMs(problem: Problem, override?: number): number {
  if (override != null) return override;
  const perfBudget = problem.tests.reduce(
    (sum, t) => sum + (t.maxMs ?? 0),
    0
  );
  // Extra headroom so slow-but-correct solutions finish and get efficiency:"slow"
  // instead of a hard worker kill.
  if (perfBudget === 0) return 3000;
  return Math.max(10000, perfBudget + 5000);
}

// Runs candidate code in a Web Worker so infinite loops can't freeze the
// exam tab — the worker is terminated after timeoutMs. Falls back to the
// synchronous runner where Worker is unavailable (tests, SSR).
export function runProblemSandboxed(
  problem: Problem,
  code: string,
  timeoutMs?: number
): Promise<RunResult> {
  if (typeof Worker === "undefined")
    return Promise.resolve(runProblem(problem, code));

  const ms = sandboxTimeoutMs(problem, timeoutMs);
  const src = `const run = ${runProblem.toString()};
onmessage = (e) => postMessage(run(e.data.problem, e.data.code));`;
  const url = URL.createObjectURL(
    new Blob([src], { type: "application/javascript" })
  );
  const worker = new Worker(url);

  return new Promise<RunResult>((resolve) => {
    worker.postMessage({ problem, code });
    const timer = setTimeout(() => {
      worker.terminate();
      resolve({
        status: "error",
        tests: [],
        error: `Your code took longer than ${ms / 1000} seconds to run — check for infinite loops.`,
        efficiency: "na",
      });
    }, ms);
    worker.onmessage = (e) => {
      clearTimeout(timer);
      worker.terminate();
      resolve(e.data as RunResult);
    };
    worker.onerror = (e) => {
      clearTimeout(timer);
      worker.terminate();
      resolve({
        status: "error",
        tests: [],
        error: e.message || "Your code could not be executed.",
        efficiency: "na",
      });
    };
  }).finally(() => URL.revokeObjectURL(url));
}
