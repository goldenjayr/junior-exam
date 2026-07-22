// Run with: npm test
import assert from "node:assert";
import test from "node:test";
import {
  parseShuffle,
  shuffleArray,
  sessionItemOrder,
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
