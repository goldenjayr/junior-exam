import type { Problem } from "./problems.ts";
import { parsePrismaSchema, schemaContains, type PrismaSchemaAst } from "./prisma-schema.ts";
import type { RunResult, TestResult } from "./runner.ts";

export function runPrismaSchemaProblem(
  problem: Problem,
  code: string
): RunResult {
  let actual: PrismaSchemaAst;
  try {
    actual = parsePrismaSchema(code);
  } catch (error) {
    return {
      status: "error",
      tests: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }

  const tests: TestResult[] = problem.tests.map((test) => {
    const passed = schemaContains(actual, test.expected as PrismaSchemaAst);
    return {
      test,
      passed,
      actual,
      error: passed ? undefined : "Schema did not match expected",
    };
  });

  return {
    status: tests.every((test) => test.passed) ? "passed" : "failed",
    tests,
  };
}
