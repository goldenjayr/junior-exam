import type { Problem, TestCase } from "./problems.ts";

export type TestResult = {
  test: TestCase;
  passed: boolean;
  actual?: unknown;
  error?: string;
  logs?: string[];
};

export type RunResult = {
  status: "passed" | "failed" | "error";
  tests: TestResult[];
  error?: string;
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
    };
  }

  const tests: TestResult[] = problem.tests.map((test) => {
    logs.length = 0;
    try {
      const actual = fn(...structuredClone(test.args));
      return {
        test,
        passed: deepEqual(actual, test.expected),
        actual: sanitize(actual),
        logs: [...logs],
      };
    } catch (error) {
      return {
        test,
        passed: false,
        error: error instanceof Error ? error.message : String(error),
        logs: [...logs],
      };
    }
  });

  return {
    status: tests.every((t) => t.passed) ? "passed" : "failed",
    tests,
  };
}

// Runs candidate code in a Web Worker so infinite loops can't freeze the
// exam tab — the worker is terminated after timeoutMs. Falls back to the
// synchronous runner where Worker is unavailable (tests, SSR).
export function runProblemSandboxed(
  problem: Problem,
  code: string,
  timeoutMs = 3000
): Promise<RunResult> {
  if (typeof Worker === "undefined")
    return Promise.resolve(runProblem(problem, code));

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
        error: `Your code took longer than ${timeoutMs / 1000} seconds to run — check for infinite loops.`,
      });
    }, timeoutMs);
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
      });
    };
  }).finally(() => URL.revokeObjectURL(url));
}
