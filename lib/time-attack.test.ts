// Run with: npm test
import assert from "node:assert";
import test from "node:test";
import {
  parseTimeLimit,
  remainingSeconds,
  clampMinutes,
  minutesToSeconds,
  formatClock,
} from "./time-attack.ts";

test("parseTimeLimit parses positive int seconds", () => {
  assert.strictEqual(parseTimeLimit("900"), 900);
});

test("parseTimeLimit rejects empty, zero, negative, non-numeric", () => {
  assert.strictEqual(parseTimeLimit(null), null);
  assert.strictEqual(parseTimeLimit(""), null);
  assert.strictEqual(parseTimeLimit("0"), null);
  assert.strictEqual(parseTimeLimit("-5"), null);
  assert.strictEqual(parseTimeLimit("abc"), null);
});

test("clampMinutes clamps 1..180", () => {
  assert.strictEqual(clampMinutes(0), 1);
  assert.strictEqual(clampMinutes(200), 180);
  assert.strictEqual(clampMinutes(15), 15);
});

test("remainingSeconds computes floor remaining", () => {
  const startedAt = 1_000_000;
  const now = 1_000_000 + 10_000;
  assert.strictEqual(remainingSeconds(startedAt, 60, now), 50);
});

test("remainingSeconds never goes below 0", () => {
  assert.strictEqual(remainingSeconds(0, 10, 50_000), 0);
});

test("minutesToSeconds converts", () => {
  assert.strictEqual(minutesToSeconds(15), 900);
});

test("formatClock pads mm:ss", () => {
  assert.strictEqual(formatClock(65), "01:05");
  assert.strictEqual(formatClock(0), "00:00");
});
