import type { Problem, TestCase } from "./problems.ts";
import {
  formatValue,
  runProblemSandboxed,
  type RunResult,
} from "./runner.ts";
import { runReactProblem } from "./react-runner.ts";
import { runSqlProblem } from "./sql-runner.ts";
import { runPrismaSchemaProblem } from "./prisma-schema-runner.ts";

export type EditorLanguage = "javascript" | "sql" | "prisma" | "python";

export function editorLanguageFor(problem: Problem): EditorLanguage {
  if (problem.kind === "sql") return "sql";
  if (problem.kind === "prisma-schema") return "prisma";
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
  return `${problem.fnName}(${testCase.args
    .map((arg) => formatValue(arg))
    .join(", ")})`;
}

export function runAny(problem: Problem, code: string): Promise<RunResult> {
  switch (problem.kind) {
    case "react":
      return Promise.resolve(runReactProblem(problem, code));
    case "sql":
      return runSqlProblem(problem, code);
    case "prisma-schema":
      return Promise.resolve(runPrismaSchemaProblem(problem, code));
    default:
      return runProblemSandboxed(problem, code);
  }
}
