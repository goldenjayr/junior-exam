import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { challenges } from "./challenges/index.ts";
import {
  SOLUTION_LEVELS,
  getReferenceSolution,
  referenceSolutions,
  type SolutionLevel,
} from "./solutions.ts";
import { runValidation } from "./validate.ts";

const softFloor: Record<SolutionLevel, number> = {
  simple: 50,
  intermediate: 80,
  advanced: 90,
};

describe("reference solutions (cheat)", () => {
  it("covers every challenge at all three levels", () => {
    for (const c of challenges) {
      const tiers = referenceSolutions[c.id];
      assert.ok(tiers, `missing reference solution for ${c.id}`);
      for (const level of SOLUTION_LEVELS) {
        assert.ok(tiers[level], `${c.id} missing ${level}`);
      }
    }
  });

  it("each tier passes all hard requirements", () => {
    for (const c of challenges) {
      for (const level of SOLUTION_LEVELS) {
        const graph = getReferenceSolution(c.id, level);
        assert.ok(graph, `${c.id}/${level}`);
        const result = runValidation(graph!, c);
        assert.equal(
          result.hardPassed,
          result.hardTotal,
          `${c.id}/${level}: ${result.hard
            .filter((h) => !h.passed)
            .map((h) => `${h.id}(${h.detail ?? ""})`)
            .join(", ")}`
        );
      }
    }
  });

  it("soft scores meet tier floors", () => {
    for (const c of challenges) {
      for (const level of SOLUTION_LEVELS) {
        const graph = getReferenceSolution(c.id, level)!;
        const result = runValidation(graph, c);
        assert.ok(
          result.softScore >= softFloor[level],
          `${c.id}/${level} softScore=${result.softScore} (need ≥${softFloor[level]})`
        );
      }
    }
  });
});
