import assert from "node:assert/strict";
import test from "node:test";
import type { QuizQuestion } from "./types.ts";

test("illustration svg shape is valid on a sample question object", () => {
  const sample = {
    id: 331,
    type: "single",
    topic: "architecture",
    difficulty: "easy",
    prompt: "What sits in front of app servers to distribute traffic?",
    options: [
      { id: "a", label: "Load balancer" },
      { id: "b", label: "CSS compiler" },
    ],
    correctId: "a",
    illustration: {
      kind: "svg",
      diagram: "load-balancer",
      alt: "Clients connecting through a load balancer to app instances",
      caption: "Traffic fans out across instances",
    },
  } satisfies QuizQuestion;

  assert.equal(sample.illustration?.kind, "svg");
  assert.equal(sample.illustration?.diagram, "load-balancer");
});
