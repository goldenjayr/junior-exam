import assert from "node:assert/strict";
import test from "node:test";
import { quizDiagramKeys } from "./diagram-keys.ts";

const expected = [
  "request-path",
  "load-balancer",
  "cdn-origin",
  "reverse-proxy",
  "nextjs-layers",
  "ci-cd-pipeline",
  "blue-green",
  "cache-layers",
] as const;

test("quiz diagram registry exposes the locked SVG keys", () => {
  assert.deepEqual([...quizDiagramKeys].sort(), [...expected].sort());
});
