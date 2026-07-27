import { transform } from "sucrase";
import type { Problem } from "./problems.ts";
import { runProblem, runProblemSandboxed, type RunResult } from "./runner.ts";

export function transpileTypeScript(code: string): string {
  return transform(code, { transforms: ["typescript"] }).code;
}

export function runTypeScriptProblem(
  problem: Problem,
  code: string
): Promise<RunResult> {
  let js: string;
  try {
    js = transpileTypeScript(code);
  } catch (error) {
    return Promise.resolve({
      status: "error",
      tests: [],
      error: error instanceof Error ? error.message : String(error),
      efficiency: "na",
    });
  }
  return runProblemSandboxed(problem, js);
}

/** Synchronous path for Node tests. */
export function runTypeScriptProblemSync(
  problem: Problem,
  code: string
): RunResult {
  const js = transpileTypeScript(code);
  return runProblem(problem, js);
}
