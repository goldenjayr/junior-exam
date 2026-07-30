// Run with: npm test
import assert from "node:assert";
import test from "node:test";
import { problems } from "./problems.ts";
import {
  categoriesForLanguage,
  filterProblems,
  drawProblems,
  buildExamPath,
} from "./random-exam.ts";

test("categoriesForLanguage maps javascript and typescript", () => {
  assert.deepStrictEqual(categoriesForLanguage("javascript"), [
    "arrays",
    "strings",
    "objects",
    "logic",
    "react",
  ]);
  assert.deepStrictEqual(categoriesForLanguage("typescript"), ["typescript"]);
  assert.strictEqual(categoriesForLanguage("all"), null);
});

test("filterProblems javascript excludes typescript/python/sql/prisma", () => {
  const pool = filterProblems({ language: "javascript", difficulty: "all" });
  assert.ok(pool.length > 0);
  for (const p of pool) {
    assert.ok(
      ["arrays", "strings", "objects", "logic", "react"].includes(p.category)
    );
  }
});

test("filterProblems typescript is only typescript category", () => {
  const pool = filterProblems({ language: "typescript", difficulty: "all" });
  assert.ok(pool.every((p) => p.category === "typescript"));
});

test("filterProblems respects difficulty", () => {
  const easy = filterProblems({ language: "all", difficulty: "easy" });
  assert.ok(easy.length > 0);
  assert.ok(easy.every((p) => p.difficulty === "easy"));
});

test("drawProblems returns count items from pool", () => {
  const pool = filterProblems({ language: "all", difficulty: "all" });
  const drawn = drawProblems(pool, 3);
  assert.strictEqual(drawn.length, 3);
  const ids = new Set(pool.map((p) => p.id));
  for (const p of drawn) assert.ok(ids.has(p.id));
});

test("drawProblems clamps count to pool size and empty cases", () => {
  const pool = filterProblems({ language: "typescript", difficulty: "all" });
  assert.strictEqual(drawProblems(pool, 999).length, pool.length);
  assert.deepStrictEqual(drawProblems(pool, 0), []);
  assert.deepStrictEqual(drawProblems([], 5), []);
});

test("buildExamPath encodes ids and optional timer", () => {
  assert.strictEqual(buildExamPath([1, 2, 3], null), "/exam?p=1,2,3");
  assert.strictEqual(buildExamPath([4, 5], 900), "/exam?p=4,5&t=900");
});

test("bank has problems for javascript filter", () => {
  assert.ok(problems.length >= 1);
  assert.ok(
    filterProblems({ language: "javascript", difficulty: "all" }).length >= 1
  );
});
