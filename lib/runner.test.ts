// Run with: npm test
import assert from "node:assert";
import test from "node:test";
import { problems, parseProblemIds } from "./problems.ts";
import { examSolutions } from "./exam-solutions.ts";
import { runProblem } from "./runner.ts";

function isClassicJsProblem(p: { kind?: string }) {
  return p.kind === undefined || p.kind === "prisma-client";
}

test("every problem has a solution that passes all its tests", () => {
  for (const p of problems.filter(isClassicJsProblem)) {
    const result = runProblem(p, examSolutions[p.id]);
    assert.strictEqual(result.status, "passed", `${p.title}: ${JSON.stringify(result)}`);
    const expectedEff = p.tests.some((t) => t.maxMs != null) ? "ok" : "na";
    assert.strictEqual(
      result.efficiency,
      expectedEff,
      `${p.title}: efficiency`
    );
  }
});

test("starter code fails (returns undefined)", () => {
  for (const p of problems.filter(isClassicJsProblem)) {
    assert.notStrictEqual(runProblem(p, p.starterCode).status, "passed", p.title);
  }
});

test("syntax errors are reported, not thrown", () => {
  const r = runProblem(problems[0], "function ( {");
  assert.strictEqual(r.status, "error");
  assert.ok(r.error);
});

test("missing function is reported", () => {
  const r = runProblem(problems[0], "const x = 1;");
  assert.strictEqual(r.status, "error");
});

test("object equality ignores key order", () => {
  const minMax = problems.find((p) => p.fnName === "minMax")!;
  const r = runProblem(
    minMax,
    "function minMax(ns){ return { max: Math.max(...ns), min: Math.min(...ns) }; }"
  );
  assert.strictEqual(r.status, "passed");
});

test("wrong values still fail", () => {
  const minMax = problems.find((p) => p.fnName === "minMax")!;
  const r = runProblem(
    minMax,
    "function minMax(ns){ return { min: 0, max: 0 }; }"
  );
  assert.strictEqual(r.status, "failed");
});

test("parseProblemIds filters invalid ids", () => {
  assert.deepStrictEqual(parseProblemIds("1,2,999,abc,2"), [1, 2]);
  assert.deepStrictEqual(parseProblemIds(null), []);
});

test("includes Prisma client problems 43–45", () => {
  assert.deepStrictEqual(
    problems
      .filter((p) => p.kind === "prisma-client")
      .map(({ id, kind, category }) => ({ id, kind, category })),
    [
      { id: 43, kind: "prisma-client", category: "prisma" },
      { id: 44, kind: "prisma-client", category: "prisma" },
      { id: 45, kind: "prisma-client", category: "prisma" },
    ]
  );
});

test("shared exam dispatch selects languages, labels, and runners", async () => {
  const { callLabel, editorLanguageFor, runAny } = await import(
    "./exam-dispatch.ts"
  );
  const jsProblem = problems[0];
  const sqlProblem = problems.find((p) => p.kind === "sql")!;
  const schemaProblem = problems.find((p) => p.kind === "prisma-schema")!;
  const prismaClientProblem = problems.find((p) => p.id === 43)!;
  const pythonProblem = problems.find((p) => p.kind === "python")!;

  assert.strictEqual(editorLanguageFor(jsProblem), "javascript");
  assert.strictEqual(editorLanguageFor(sqlProblem), "sql");
  assert.strictEqual(editorLanguageFor(schemaProblem), "prisma");
  assert.strictEqual(editorLanguageFor(pythonProblem), "python");
  assert.strictEqual(callLabel(sqlProblem, sqlProblem.tests[0]), "SQL query → rows");
  assert.strictEqual(
    callLabel(schemaProblem, schemaProblem.tests[0]),
    "schema structure"
  );
  assert.strictEqual(callLabel(jsProblem, jsProblem.tests[2]), "getActiveUsers([])");
  assert.strictEqual(
    (await runAny(prismaClientProblem, examSolutions[43])).status,
    "passed"
  );
  assert.strictEqual(
    (
      await runAny(
        pythonProblem,
        `def get_active_users(users):
    return [u for u in users if u["active"]]
`
      )
    ).status,
    "passed"
  );
});

test("captures console output per test", () => {
  const minMax = problems.find((p) => p.fnName === "minMax")!;
  const r = runProblem(
    minMax,
    'function minMax(ns){ console.log("got", ns.length); return { max: Math.max(...ns), min: Math.min(...ns) }; }'
  );
  assert.strictEqual(r.status, "passed");
  assert.ok(r.tests[0].logs?.[0]?.startsWith("got "));
});

test("efficiency is na when no maxMs cases", () => {
  const minMax = problems.find((p) => p.fnName === "minMax")!;
  assert.ok(!minMax.tests.some((t) => t.maxMs != null));
  const r = runProblem(
    minMax,
    "function minMax(ns){ return { min: Math.min(...ns), max: Math.max(...ns) }; }"
  );
  assert.strictEqual(r.status, "passed");
  assert.strictEqual(r.efficiency, "na");
});

test("efficiency soft-badge: correct but slow still passes", () => {
  const fixture = {
    id: 9001,
    title: "Perf Fixture",
    category: "logic" as const,
    difficulty: "easy" as const,
    instructions: "sum numbers",
    fnName: "sumNums",
    starterCode: "function sumNums(ns) {}",
    tests: [
      { args: [[1, 2, 3]], expected: 6 },
      {
        args: [Array.from({ length: 200 }, (_, i) => i)],
        expected: 19900,
        maxMs: 5,
      },
    ],
  };
  // Busy-wait so wall time exceeds maxMs while still returning the right answer.
  const slow = `function sumNums(ns) {
  const end = performance.now() + 20;
  while (performance.now() < end) {}
  return ns.reduce((a, b) => a + b, 0);
}`;
  const r = runProblem(fixture, slow);
  assert.strictEqual(r.status, "passed");
  assert.strictEqual(r.efficiency, "slow");
  assert.strictEqual(r.tests[0].passed, true);
  assert.strictEqual(r.tests[1].passed, false);
  assert.strictEqual(r.tests[1].performanceFailed, true);
});

test("efficiency ok when under budget", () => {
  const fixture = {
    id: 9002,
    title: "Perf Fixture Fast",
    category: "logic" as const,
    difficulty: "easy" as const,
    instructions: "sum numbers",
    fnName: "sumNums",
    starterCode: "function sumNums(ns) {}",
    tests: [
      { args: [[1, 2, 3]], expected: 6 },
      {
        args: [Array.from({ length: 200 }, (_, i) => i)],
        expected: 19900,
        maxMs: 200,
      },
    ],
  };
  const fast = `function sumNums(ns) { return ns.reduce((a, b) => a + b, 0); }`;
  const r = runProblem(fixture, fast);
  assert.strictEqual(r.status, "passed");
  assert.strictEqual(r.efficiency, "ok");
  assert.strictEqual(r.tests[1].passed, true);
});

test("wrong answer fails even with maxMs cases", () => {
  const fixture = {
    id: 9003,
    title: "Perf Fixture Wrong",
    category: "logic" as const,
    difficulty: "easy" as const,
    instructions: "sum numbers",
    fnName: "sumNums",
    starterCode: "function sumNums(ns) {}",
    tests: [
      { args: [[1, 2, 3]], expected: 6 },
      {
        args: [[1, 2, 3, 4]],
        expected: 10,
        maxMs: 200,
      },
    ],
  };
  const wrong = `function sumNums(ns) { return 0; }`;
  const r = runProblem(fixture, wrong);
  assert.strictEqual(r.status, "failed");
  assert.strictEqual(r.efficiency, "slow");
});
