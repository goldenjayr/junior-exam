// Run with: npm test
import assert from "node:assert";
import test from "node:test";
import { parseCheat } from "./cheat.ts";

test("parseCheat accepts 1/true/yes", () => {
  assert.strictEqual(parseCheat("1"), true);
  assert.strictEqual(parseCheat("true"), true);
  assert.strictEqual(parseCheat("YES"), true);
  assert.strictEqual(parseCheat(null), false);
  assert.strictEqual(parseCheat("0"), false);
  assert.strictEqual(parseCheat("no"), false);
  assert.strictEqual(parseCheat(""), false);
});
