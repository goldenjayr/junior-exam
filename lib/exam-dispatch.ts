import type { Problem, TestCase } from "./problems.ts";
import {
  formatValue,
  runProblemSandboxed,
  type RunResult,
} from "./runner.ts";
import { runReactProblem } from "./react-runner.ts";
import { runSqlProblem } from "./sql-runner.ts";
import { runPrismaSchemaProblem } from "./prisma-schema-runner.ts";
import { runPythonProblem } from "./python-runner.ts";
import { runTypeScriptProblem } from "./typescript-runner.ts";

export type EditorLanguage = "javascript" | "sql" | "prisma" | "python" | "typescript";

export function editorLanguageFor(problem: Problem): EditorLanguage {
  if (problem.kind === "sql") return "sql";
  if (problem.kind === "prisma-schema") return "prisma";
  if (problem.kind === "python") return "python";
  if (problem.kind === "typescript") return "typescript";
  return "javascript";
}

export function callLabel(problem: Problem, testCase: TestCase): string {
  if (problem.kind === "sql") return "SQL query → rows";
  if (problem.kind === "prisma-schema") return "schema structure";
  if (problem.kind === "react") {
    const props = Object.entries(
      (testCase.args[0] ?? {}) as Record<string, unknown>
    )
      .map(([key, value]) => `${key}={${formatValue(value)}}`)
      .join(" ");
    const clicks = testCase.clicks
      ? ` then click <${testCase.clickOn}> ×${testCase.clicks}`
      : "";
    return `<${problem.fnName}${props ? ` ${props}` : ""} />${clicks}`;
  }
  const args = testCase.args
    .map((arg) => summarizeArg(arg))
    .join(", ");
  const perf =
    typeof testCase.maxMs === "number" ? `  [perf ≤${testCase.maxMs}ms]` : "";
  return `${problem.fnName}(${args})${perf}`;
}

function summarizeArg(arg: unknown): string {
  if (typeof arg === "string" && arg.length > 40) {
    return JSON.stringify(`${arg.slice(0, 16)}…(${arg.length} chars)`);
  }
  if (Array.isArray(arg) && arg.length > 12) {
    return `[…${arg.length} items]`;
  }
  return formatValue(arg);
}

export function runAny(problem: Problem, code: string): Promise<RunResult> {
  switch (problem.kind) {
    case "react":
      return Promise.resolve(runReactProblem(problem, code));
    case "sql":
      return runSqlProblem(problem, code);
    case "prisma-schema":
      return Promise.resolve(runPrismaSchemaProblem(problem, code));
    case "python":
      return runPythonProblem(problem, code);
    case "typescript":
      return runTypeScriptProblem(problem, code);
    default:
      return runProblemSandboxed(problem, code);
  }
}
