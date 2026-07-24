// Run with: npm test
import assert from "node:assert";
import test from "node:test";
import { gradeAnswer, normalizeText } from "./grade.ts";
import { quizQuestions, quizTopics } from "./index.ts";
import type { QuizQuestion } from "./types.ts";

const single: QuizQuestion = {
  id: 1,
  type: "single",
  topic: "javascript",
  difficulty: "easy",
  prompt: "Pick A",
  options: [
    { id: "a", label: "A" },
    { id: "b", label: "B" },
  ],
  correctId: "a",
};

const multi: QuizQuestion = {
  id: 2,
  type: "multi",
  topic: "javascript",
  difficulty: "easy",
  prompt: "Pick A and C",
  options: [
    { id: "a", label: "A" },
    { id: "b", label: "B" },
    { id: "c", label: "C" },
  ],
  correctIds: ["a", "c"],
};

const boolQ: QuizQuestion = {
  id: 3,
  type: "boolean",
  topic: "javascript",
  difficulty: "easy",
  prompt: "JS is single-threaded?",
  correct: true,
};

const fill: QuizQuestion = {
  id: 4,
  type: "fill",
  topic: "javascript",
  difficulty: "easy",
  prompt: "Keyword for constant",
  accept: ["const"],
};

const order: QuizQuestion = {
  id: 5,
  type: "order",
  topic: "javascript",
  difficulty: "medium",
  prompt: "Order lifecycle",
  items: [
    { id: "m", label: "mount" },
    { id: "u", label: "update" },
    { id: "d", label: "unmount" },
  ],
  correctOrder: ["m", "u", "d"],
};

const snippet: QuizQuestion = {
  id: 6,
  type: "snippet",
  topic: "javascript",
  difficulty: "easy",
  prompt: "Correct sum",
  snippets: [
    { id: "ok", code: "a + b" },
    { id: "bad", code: "a - b" },
  ],
  correctId: "ok",
};

const match: QuizQuestion = {
  id: 7,
  type: "match",
  topic: "javascript",
  difficulty: "medium",
  prompt: "Match",
  left: [
    { id: "l1", label: "const" },
    { id: "l2", label: "let" },
  ],
  right: [
    { id: "r1", label: "block reassignable" },
    { id: "r2", label: "block constant" },
  ],
  pairs: { l1: "r2", l2: "r1" },
};

const hotspot: QuizQuestion = {
  id: 8,
  type: "hotspot",
  topic: "javascript",
  difficulty: "medium",
  prompt: "Click the bug",
  code: "const x = 1\nx = 2",
  regions: [
    { id: "line1", label: "line 1", startLine: 1, endLine: 1 },
    { id: "line2", label: "line 2", startLine: 2, endLine: 2 },
  ],
  correctRegionId: "line2",
};

const output: QuizQuestion = {
  id: 9,
  type: "output",
  topic: "javascript",
  difficulty: "easy",
  prompt: "What logs?",
  code: "console.log(1 + 2)",
  accept: ["3"],
};

test("normalizeText trims, collapses space, lowercases", () => {
  assert.strictEqual(normalizeText("  Hello   World "), "hello world");
});

test("grades single", () => {
  assert.strictEqual(gradeAnswer(single, { type: "single", id: "a" }), true);
  assert.strictEqual(gradeAnswer(single, { type: "single", id: "b" }), false);
  assert.strictEqual(gradeAnswer(single, null), false);
});

test("grades multi all-or-nothing with order independence", () => {
  assert.strictEqual(
    gradeAnswer(multi, { type: "multi", ids: ["c", "a"] }),
    true
  );
  assert.strictEqual(gradeAnswer(multi, { type: "multi", ids: ["a"] }), false);
  assert.strictEqual(
    gradeAnswer(multi, { type: "multi", ids: ["a", "b", "c"] }),
    false
  );
});

test("grades boolean", () => {
  assert.strictEqual(
    gradeAnswer(boolQ, { type: "boolean", value: true }),
    true
  );
  assert.strictEqual(
    gradeAnswer(boolQ, { type: "boolean", value: false }),
    false
  );
});

test("grades fill with normalization", () => {
  assert.strictEqual(
    gradeAnswer(fill, { type: "fill", text: " Const " }),
    true
  );
  assert.strictEqual(gradeAnswer(fill, { type: "fill", text: "var" }), false);
});

test("grades order", () => {
  assert.strictEqual(
    gradeAnswer(order, { type: "order", order: ["m", "u", "d"] }),
    true
  );
  assert.strictEqual(
    gradeAnswer(order, { type: "order", order: ["d", "u", "m"] }),
    false
  );
});

test("grades snippet", () => {
  assert.strictEqual(
    gradeAnswer(snippet, { type: "snippet", id: "ok" }),
    true
  );
  assert.strictEqual(
    gradeAnswer(snippet, { type: "snippet", id: "bad" }),
    false
  );
});

test("grades match", () => {
  assert.strictEqual(
    gradeAnswer(match, {
      type: "match",
      pairs: { l1: "r2", l2: "r1" },
    }),
    true
  );
  assert.strictEqual(
    gradeAnswer(match, {
      type: "match",
      pairs: { l1: "r1", l2: "r2" },
    }),
    false
  );
});

test("grades hotspot", () => {
  assert.strictEqual(
    gradeAnswer(hotspot, { type: "hotspot", regionId: "line2" }),
    true
  );
  assert.strictEqual(
    gradeAnswer(hotspot, { type: "hotspot", regionId: "line1" }),
    false
  );
});

test("grades output", () => {
  assert.strictEqual(gradeAnswer(output, { type: "output", text: "3" }), true);
  assert.strictEqual(
    gradeAnswer(output, { type: "output", text: "12" }),
    false
  );
});

test("registers the complete PostgreSQL question bank", () => {
  const questions = quizQuestions.filter((question) => question.topic === "postgresql");

  assert.ok(quizTopics.includes("postgresql"));
  assert.strictEqual(questions.length, 25);
  assert.strictEqual(questions[0]?.id, 211);
  assert.strictEqual(questions.at(-1)?.id, 235);
});
