import assert from "node:assert/strict";
import test from "node:test";
import { withSessionShuffledChoices } from "./choice-order.ts";
import type { QuizQuestion } from "./types.ts";

const sample: QuizQuestion = {
  id: 331,
  type: "single",
  topic: "architecture",
  difficulty: "easy",
  prompt: "Sample?",
  options: [
    { id: "a", label: "A" },
    { id: "b", label: "B" },
    { id: "c", label: "C" },
    { id: "d", label: "D" },
  ],
  correctId: "a",
};

function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key: string) {
      return map.has(key) ? map.get(key)! : null;
    },
    key() {
      return null;
    },
    removeItem(key: string) {
      map.delete(key);
    },
    setItem(key: string, value: string) {
      map.set(key, value);
    },
  };
}

test("withSessionShuffledChoices keeps the same option ids and correctId", () => {
  const store = memoryStorage();
  const out = withSessionShuffledChoices(sample, store, "quiz-test");
  assert.equal(out.type, "single");
  if (out.type !== "single") return;
  assert.equal(out.correctId, "a");
  assert.deepEqual(
    [...out.options.map((o) => o.id)].sort(),
    ["a", "b", "c", "d"]
  );
  assert.equal(out.options.find((o) => o.id === "a")?.label, "A");
});

test("withSessionShuffledChoices is stable within a session key", () => {
  const store = memoryStorage();
  const a = withSessionShuffledChoices(sample, store, "quiz-test");
  const b = withSessionShuffledChoices(sample, store, "quiz-test");
  assert.deepEqual(a, b);
});
