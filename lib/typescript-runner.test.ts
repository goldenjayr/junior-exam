import assert from "node:assert/strict";
import test from "node:test";
import { problems } from "./problems.ts";
import { examSolutions } from "./exam-solutions.ts";
import {
  runTypeScriptProblemSync,
  transpileTypeScript,
} from "./typescript-runner.ts";

test("transpileTypeScript strips type annotations", () => {
  const js = transpileTypeScript(
    "function f(x: number): number { return x; }"
  );
  assert.match(js, /function f\(x\)/);
  assert.doesNotMatch(js, /: number/);
});

test("correct TypeScript solution passes", () => {
  const problem = problems.find((p) => p.id === 52)!;
  const result = runTypeScriptProblemSync(
    problem,
    examSolutions[52]!
  );
  assert.strictEqual(result.status, "passed");
});

test("starter code does not pass TypeScript problems 52-69", () => {
  for (const problem of problems.filter((p) => p.kind === "typescript")) {
    const result = runTypeScriptProblemSync(problem, problem.starterCode);
    assert.notStrictEqual(result.status, "passed", problem.title);
  }
});

test("official solutions pass TypeScript problems 52-69", async () => {
  for (const problem of problems.filter((p) => p.kind === "typescript")) {
    const result = runTypeScriptProblemSync(
      problem,
      examSolutions[problem.id]!
    );
    assert.strictEqual(
      result.status,
      "passed",
      `${problem.title}: ${JSON.stringify(result)}`
    );
  }
});

test("includes TypeScript problems 52-69", () => {
  assert.deepStrictEqual(
    problems
      .filter((p) => p.kind === "typescript")
      .map(({ id, kind, category }) => ({ id, kind, category })),
    [
      { id: 52, kind: "typescript", category: "typescript" },
      { id: 53, kind: "typescript", category: "typescript" },
      { id: 54, kind: "typescript", category: "typescript" },
      { id: 55, kind: "typescript", category: "typescript" },
      { id: 56, kind: "typescript", category: "typescript" },
      { id: 57, kind: "typescript", category: "typescript" },
      { id: 64, kind: "typescript", category: "typescript" },
      { id: 65, kind: "typescript", category: "typescript" },
      { id: 66, kind: "typescript", category: "typescript" },
      { id: 67, kind: "typescript", category: "typescript" },
      { id: 68, kind: "typescript", category: "typescript" },
      { id: 69, kind: "typescript", category: "typescript" },
    ]
  );
});
