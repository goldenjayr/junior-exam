import type { Problem } from "./problems.ts";
import type { RunResult, TestResult } from "./runner.ts";

function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null)
    return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a) && Array.isArray(b))
    return a.length === b.length && a.every((v, i) => deepEqual(v, b[i]));
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

/** Normalize PGlite row values (e.g. bigint) for deepEqual with JSON-ish expected. */
function normalizeRows(rows: Record<string, unknown>[]): Record<string, unknown>[] {
  return rows.map((row) => {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(row)) {
      out[k] = typeof v === "bigint" ? Number(v) : v;
    }
    return out;
  });
}

export async function runSqlProblem(
  problem: Problem,
  code: string
): Promise<RunResult> {
  const { PGlite } = await import("@electric-sql/pglite");
  const tests: TestResult[] = [];

  for (const testCase of problem.tests) {
    const db = new PGlite();
    try {
      if (testCase.setupSql) await db.exec(testCase.setupSql);
      const result = await db.query(code);
      const actual = normalizeRows(
        (result.rows ?? []) as Record<string, unknown>[]
      );
      const resultPassed = deepEqual(actual, testCase.expected);
      let verificationPassed = true;
      if (testCase.verifySql) {
        const verification = await db.query(testCase.verifySql);
        const verificationActual = normalizeRows(
          (verification.rows ?? []) as Record<string, unknown>[]
        );
        verificationPassed = deepEqual(
          verificationActual,
          testCase.verifyExpected
        );
      }
      const passed = resultPassed && verificationPassed;
      tests.push({
        test: testCase,
        passed,
        actual,
        error: passed
          ? undefined
          : resultPassed
            ? "Verification rows did not match expected"
            : "Result rows did not match expected",
      });
    } catch (error) {
      tests.push({
        test: testCase,
        passed: false,
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      await db.close?.();
    }
  }

  if (tests.some((t) => t.error && !t.passed && t.actual === undefined)) {
    const first = tests.find((t) => t.error);
    const allSetupErrors = tests.every((t) => !t.passed && t.actual === undefined);
    if (allSetupErrors && tests.length === 1) {
      return { status: "error", tests, error: first?.error };
    }
  }

  const status = tests.every((t) => t.passed)
    ? "passed"
    : tests.every((t) => t.actual === undefined)
      ? "error"
      : "failed";

  return {
    status,
    tests,
    error: status === "error" ? tests.find((t) => t.error)?.error : undefined,
  };
}
