// Run with: npm test
import assert from "node:assert";
import test from "node:test";
import {
  parseShuffle,
  shuffleArray,
  shuffleOrderIds,
  sessionItemOrder,
  sessionChoiceOrder,
} from "./shuffle.ts";

test("parseShuffle accepts 1/true/yes", () => {
  assert.strictEqual(parseShuffle("1"), true);
  assert.strictEqual(parseShuffle("true"), true);
  assert.strictEqual(parseShuffle("YES"), true);
  assert.strictEqual(parseShuffle(null), false);
  assert.strictEqual(parseShuffle("0"), false);
  assert.strictEqual(parseShuffle("no"), false);
});

test("shuffleArray keeps the same multiset", () => {
  const input = [1, 2, 3, 4, 5];
  const out = shuffleArray(input);
  assert.strictEqual(out.length, input.length);
  assert.deepStrictEqual([...out].sort((a, b) => a - b), input);
  assert.notStrictEqual(out, input);
});

test("sessionItemOrder without shuffle preserves order", () => {
  const store = memoryStorage();
  assert.deepStrictEqual(
    sessionItemOrder(store, "k", [3, 1, 2], false),
    [3, 1, 2]
  );
});

test("sessionItemOrder with shuffle is stable across calls", () => {
  const store = memoryStorage();
  const first = sessionItemOrder(store, "exam-a", [1, 2, 3, 4, 5], true);
  const second = sessionItemOrder(store, "exam-a", [1, 2, 3, 4, 5], true);
  assert.deepStrictEqual(first, second);
  assert.deepStrictEqual([...first].sort((a, b) => a - b), [1, 2, 3, 4, 5]);
});

test("sessionItemOrder reshuffles when id set changes", () => {
  const store = memoryStorage();
  sessionItemOrder(store, "exam-b", [1, 2, 3], true);
  const next = sessionItemOrder(store, "exam-b", [1, 2, 3, 4], true);
  assert.deepStrictEqual([...next].sort((a, b) => a - b), [1, 2, 3, 4]);
});

test("shuffleOrderIds avoids the correct order when possible", () => {
  const ids = ["a", "b", "c"];
  const correct = ["a", "b", "c"];
  for (let i = 0; i < 40; i++) {
    const out = shuffleOrderIds(ids, correct);
    assert.deepStrictEqual([...out].sort(), [...ids].sort());
    assert.notDeepStrictEqual(out, correct);
  }
});

test("shuffleOrderIds swaps when only two items", () => {
  assert.deepStrictEqual(shuffleOrderIds(["x", "y"], ["x", "y"]), ["y", "x"]);
});

test("sessionChoiceOrder without shuffle preserves order", () => {
  const store = memoryStorage();
  assert.deepStrictEqual(
    sessionChoiceOrder(store, "quiz-a", 331, ["a", "b", "c", "d"], false),
    ["a", "b", "c", "d"]
  );
});

test("sessionChoiceOrder with shuffle is stable for the same question", () => {
  const store = memoryStorage();
  const first = sessionChoiceOrder(store, "quiz-a", 331, ["a", "b", "c", "d"], true);
  const second = sessionChoiceOrder(store, "quiz-a", 331, ["a", "b", "c", "d"], true);
  assert.deepStrictEqual(first, second);
  assert.deepStrictEqual([...first].sort(), ["a", "b", "c", "d"]);
});

test("sessionChoiceOrder can differ across questions in the same session", () => {
  const store = memoryStorage();
  // Force different random draws by reshuffling until we get a difference, or
  // just assert both are valid permutations (orders may coincidentally match).
  const a = sessionChoiceOrder(store, "quiz-a", 1, ["a", "b", "c", "d"], true);
  const b = sessionChoiceOrder(store, "quiz-a", 2, ["a", "b", "c", "d"], true);
  assert.deepStrictEqual([...a].sort(), ["a", "b", "c", "d"]);
  assert.deepStrictEqual([...b].sort(), ["a", "b", "c", "d"]);
  assert.notStrictEqual(
    store.getItem("choice-order:quiz-a:q1"),
    null
  );
  assert.notStrictEqual(
    store.getItem("choice-order:quiz-a:q2"),
    null
  );
});

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
