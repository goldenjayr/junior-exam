import assert from "node:assert";
import test from "node:test";
import { problems, type Problem } from "./problems.ts";
import { runPythonProblem } from "./python-runner.ts";

const pythonSolutions: Record<number, string> = {
  46: `def get_active_users(users):
    return [u for u in users if u["active"]]
`,
  47: `def word_lengths(words):
    return [len(w) for w in words]
`,
  48: `def group_by_category(products):
    g = {}
    for p in products:
        g.setdefault(p["category"], []).append(p["name"])
    return g
`,
  49: `def is_palindrome(text):
    s = "".join(c.lower() for c in text if c.isalnum())
    return s == s[::-1]
`,
  50: `def top_n_frequencies(words, n):
    from collections import Counter
    counts = Counter(words)
    ranked = sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))
    return [[w, c] for w, c in ranked[:n]]
`,
  51: `def flatten(values):
    out = []
    for v in values:
        if isinstance(v, list):
            out.extend(flatten(v))
        else:
            out.append(v)
    return out
`,
};

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

test("non-callable function name is reported as a top-level error", async () => {
  const r = await runPythonProblem(filterActive, "get_active_users = 42\n");
  assert.strictEqual(r.status, "error");
  assert.deepStrictEqual(r.tests, []);
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

test("aliased JSON-friendly return values are accepted", async () => {
  const problem: Problem = {
    ...filterActive,
    tests: [{ args: [[]], expected: [{ id: 1 }, { id: 1 }] }],
  };
  const code = `
def get_active_users(users):
    item = {"id": 1}
    return [item, item]
`;
  const r = await runPythonProblem(problem, code);
  assert.strictEqual(r.status, "passed", JSON.stringify(r));
});

test("cyclic return values remain rejected", async () => {
  const code = `
def get_active_users(users):
    result = []
    result.append(result)
    return result
`;
  const r = await runPythonProblem(filterActive, code);
  assert.strictEqual(r.status, "failed");
  assert.match(r.tests[0].error ?? "", /JSON-friendly/);
});

test("includes Python problems 46–51", () => {
  assert.deepStrictEqual(
    problems.filter((p) => p.kind === "python").map((p) => p.id),
    [46, 47, 48, 49, 50, 51]
  );
});

test("every python problem solution passes", async () => {
  for (const p of problems.filter((x) => x.kind === "python")) {
    const r = await runPythonProblem(p, pythonSolutions[p.id]);
    assert.strictEqual(r.status, "passed", `${p.title}: ${JSON.stringify(r)}`);
  }
});

test("python starter codes do not pass", async () => {
  for (const p of problems.filter((x) => x.kind === "python")) {
    const r = await runPythonProblem(p, p.starterCode);
    assert.notStrictEqual(r.status, "passed", p.title);
  }
});
