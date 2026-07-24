import assert from "node:assert";
import test from "node:test";
import type { Problem } from "./problems.ts";
import { runPythonProblem } from "./python-runner.ts";

const filterActive: Problem = {
  id: 9001,
  title: "Fixture Filter",
  category: "python",
  kind: "python",
  difficulty: "easy",
  instructions: "test fixture",
  fnName: "get_active_users",
  starterCode: "def get_active_users(users):\n    pass\n",
  tests: [
    {
      args: [
        [
          { id: 1, name: "John", active: true },
          { id: 2, name: "Maria", active: false },
        ],
      ],
      expected: [{ id: 1, name: "John", active: true }],
    },
    { args: [[]], expected: [] },
  ],
};

test("correct python solution passes", async () => {
  const code = `
def get_active_users(users):
    return [u for u in users if u["active"]]
`;
  const r = await runPythonProblem(filterActive, code);
  assert.strictEqual(r.status, "passed", JSON.stringify(r));
});

test("starter code does not pass", async () => {
  const r = await runPythonProblem(filterActive, filterActive.starterCode);
  assert.notStrictEqual(r.status, "passed");
});

test("syntax errors are reported, not thrown", async () => {
  const r = await runPythonProblem(filterActive, "def get_active_users(users\n");
  assert.strictEqual(r.status, "error");
  assert.ok(r.error);
});

test("missing function is reported", async () => {
  const r = await runPythonProblem(filterActive, "x = 1\n");
  assert.strictEqual(r.status, "error");
  assert.match(r.error ?? "", /get_active_users/);
});

test("wrong values fail", async () => {
  const code = `def get_active_users(users):\n    return users\n`;
  const r = await runPythonProblem(filterActive, code);
  assert.strictEqual(r.status, "failed");
});

test("print output is captured per test", async () => {
  const code = `
def get_active_users(users):
    print("n", len(users))
    return [u for u in users if u["active"]]
`;
  const r = await runPythonProblem(filterActive, code);
  assert.strictEqual(r.status, "passed");
  assert.ok(r.tests[0].logs?.some((l) => l.includes("n")));
});

test("non-JSON-friendly return fails clearly", async () => {
  const code = `
def get_active_users(users):
    return {1, 2, 3}
`;
  const r = await runPythonProblem(filterActive, code);
  assert.strictEqual(r.status, "failed");
  assert.ok(
    (r.tests[0].error ?? "").toLowerCase().includes("json") ||
      (r.tests[0].error ?? "").toLowerCase().includes("list")
  );
});
