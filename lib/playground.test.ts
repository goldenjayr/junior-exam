// Run with: npm test
import assert from "node:assert";
import test from "node:test";
import { decodeShare, encodeShare, STARTERS } from "./playground.ts";
import {
  runJavaScriptScratch,
  runTypeScriptScratch,
} from "./playground-runner.ts";

test("playground share codec round-trips", () => {
  const payload = { lang: "typescript" as const, code: STARTERS.typescript };
  const encoded = encodeShare(payload);
  assert.match(encoded, /^v1\./);
  assert.deepStrictEqual(decodeShare(encoded), payload);
  assert.deepStrictEqual(decodeShare(`#${encoded}`), payload);
});

test("playground share codec rejects garbage", () => {
  assert.equal(decodeShare(""), null);
  assert.equal(decodeShare("v1.!!!"), null);
});

test("JavaScript scratch captures console.log", () => {
  const result = runJavaScriptScratch(`console.log("hi"); console.log(1 + 1);`);
  assert.equal(result.status, "ok");
  assert.deepStrictEqual(result.logs, ["hi", "2"]);
});

test("JavaScript scratch surfaces errors with prior logs", () => {
  const result = runJavaScriptScratch(
    `console.log("before"); throw new Error("boom");`
  );
  assert.equal(result.status, "error");
  assert.deepStrictEqual(result.logs, ["before"]);
  assert.match(result.error ?? "", /boom/);
});

test("TypeScript scratch strips types then runs", () => {
  const result = runTypeScriptScratch(
    `const n: number = 3;\nconsole.log(n * 2);`
  );
  assert.equal(result.status, "ok");
  assert.deepStrictEqual(result.logs, ["6"]);
});
