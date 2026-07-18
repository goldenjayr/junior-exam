import type { Problem, TestCase } from "./problems.ts";

export type TestResult = {
  test: TestCase;
  passed: boolean;
  actual?: unknown;
  error?: string;
};

export type RunResult = {
  status: "passed" | "failed" | "error";
  tests: TestResult[];
  error?: string;
};

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === undefined || b === undefined) return a === b;
  return JSON.stringify(a) === JSON.stringify(b);
}

export function formatValue(value: unknown): string {
  if (value === undefined) return "undefined";
  if (typeof value === "string") return JSON.stringify(value);
  return JSON.stringify(value, null, 2) ?? String(value);
}

// ponytail: runs candidate code with new Function in the browser tab.
// Fine for a supervised local assessment; move to a sandboxed iframe/worker
// if this ever runs untrusted code on a shared host.
export function runProblem(problem: Problem, code: string): RunResult {
  let fn: (...args: unknown[]) => unknown;
  try {
    fn = new Function(
      `"use strict";\n${code}\nif (typeof ${problem.fnName} !== "function") throw new Error("Function ${problem.fnName} was not defined.");\nreturn ${problem.fnName};`
    )() as typeof fn;
  } catch (error) {
    return {
      status: "error",
      tests: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }

  const tests: TestResult[] = problem.tests.map((test) => {
    try {
      const actual = fn(...structuredClone(test.args));
      return { test, passed: deepEqual(actual, test.expected), actual };
    } catch (error) {
      return {
        test,
        passed: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  });

  return {
    status: tests.every((t) => t.passed) ? "passed" : "failed",
    tests,
  };
}
