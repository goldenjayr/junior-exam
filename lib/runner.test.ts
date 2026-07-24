// Run with: npm test
import assert from "node:assert";
import test from "node:test";
import { problems, parseProblemIds } from "./problems.ts";
import { runProblem } from "./runner.ts";

const solutions: Record<number, string> = {
  1: `function getActiveUsers(users) { return users.filter(u => u.active); }`,
  2: `function countEmployeesByRole(es) { const c = {}; for (const e of es) c[e.role] = (c[e.role] || 0) + 1; return c; }`,
  3: `function findEmployeeById(es, id) { return es.find(e => e.id === id); }`,
  4: `function removeDuplicates(ns) { return [...new Set(ns)]; }`,
  5: `function calculateAverage(s) { return s.reduce((a, b) => a + b, 0) / s.length; }`,
  6: `function reverseString(t) { return [...t].reverse().join(""); }`,
  7: `function isPalindrome(t) { const s = t.toLowerCase(); return s === [...s].reverse().join(""); }`,
  8: `function sumEvens(ns) { return ns.filter(n => n % 2 === 0).reduce((a, b) => a + b, 0); }`,
  9: `function fizzBuzz(n) { return Array.from({length: n}, (_, i) => { const x = i + 1; return x % 15 === 0 ? "FizzBuzz" : x % 3 === 0 ? "Fizz" : x % 5 === 0 ? "Buzz" : x; }); }`,
  10: `function groupByCategory(ps) { const g = {}; for (const p of ps) (g[p.category] ||= []).push(p.name); return g; }`,
  11: `function flatten(vs) { return vs.flat(Infinity); }`,
  12: `function chunk(vs, size) { const out = []; for (let i = 0; i < vs.length; i += size) out.push(vs.slice(i, i + size)); return out; }`,
  13: `function sortByAge(es) { return [...es].sort((a, b) => a.age - b.age); }`,
  14: `function countVowels(t) { return (t.match(/[aeiou]/gi) || []).length; }`,
  15: `function longestWord(s) { return s.split(" ").reduce((a, b) => b.length > a.length ? b : a); }`,
  16: `function capitalizeWords(s) { return s.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "); }`,
  17: `function minMax(ns) { return { min: Math.min(...ns), max: Math.max(...ns) }; }`,
  18: `function charCount(t) { const c = {}; for (const ch of t) c[ch] = (c[ch] || 0) + 1; return c; }`,
  19: `function totalCartPrice(items) { return items.reduce((sum, i) => sum + i.price * i.quantity, 0); }`,
  20: `function mergeSorted(a, b) { return [...a, ...b].sort((x, y) => x - y); }`,
  21: `function isAnagram(a, b) { const norm = s => [...s.toLowerCase()].sort().join(""); return norm(a) === norm(b); }`,
  22: `function pluck(items, key) { return items.map(i => i[key]); }`,
  23: `function twoSum(ns, t) { for (let i = 0; i < ns.length; i++) for (let j = i + 1; j < ns.length; j++) if (ns[i] + ns[j] === t) return [i, j]; }`,
  24: `function isBalanced(t) { const pairs = { ")": "(", "]": "[", "}": "{" }; const st = []; for (const c of t) { if ("([{".includes(c)) st.push(c); else if (c in pairs) { if (st.pop() !== pairs[c]) return false; } } return st.length === 0; }`,
  25: `function runningTotal(ns) { let sum = 0; return ns.map(n => sum += n); }`,
  26: `function fibonacci(n) { const out = []; let [a, b] = [0, 1]; for (let i = 0; i < n; i++) { out.push(a); [a, b] = [b, a + b]; } return out; }`,
  27: `function unslug(slug) { return slug.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" "); }`,
  43: `function findActiveUsersArgs() { return { where: { active: true } }; }`,
  44: `function findPublishedPostsArgs() { return { where: { published: true }, include: { author: true } }; }`,
  45: `function createPostArgs() { return { data: { title: "Hi", author: { connect: { id: 1 } } } }; }`,
};

function isClassicJsProblem(p: { kind?: string }) {
  return p.kind === undefined || p.kind === "prisma-client";
}

test("every problem has a solution that passes all its tests", () => {
  for (const p of problems.filter(isClassicJsProblem)) {
    const result = runProblem(p, solutions[p.id]);
    assert.strictEqual(result.status, "passed", `${p.title}: ${JSON.stringify(result)}`);
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
    problems.slice(-3).map(({ id, kind, category }) => ({ id, kind, category })),
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

  assert.strictEqual(editorLanguageFor(jsProblem), "javascript");
  assert.strictEqual(editorLanguageFor(sqlProblem), "sql");
  assert.strictEqual(editorLanguageFor(schemaProblem), "prisma");
  assert.strictEqual(callLabel(sqlProblem, sqlProblem.tests[0]), "SQL query → rows");
  assert.strictEqual(
    callLabel(schemaProblem, schemaProblem.tests[0]),
    "schema structure"
  );
  assert.strictEqual(callLabel(jsProblem, jsProblem.tests[2]), "getActiveUsers([])");
  assert.strictEqual(
    (await runAny(prismaClientProblem, solutions[43])).status,
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
