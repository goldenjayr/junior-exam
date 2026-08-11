import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { componentCatalog } from "./components.ts";
import { challenges } from "./challenges/index.ts";
import {
  buildSolutionExplanation,
  componentWhy,
  levelBlurbs,
} from "./explanations.ts";
import {
  SOLUTION_LEVELS,
  getReferenceSolution,
} from "./solutions.ts";

describe("solution explanations", () => {
  it("covers every catalog component", () => {
    for (const c of componentCatalog) {
      assert.ok(componentWhy[c.id], `missing componentWhy for ${c.id}`);
    }
  });

  it("has a blurb for every challenge × level", () => {
    for (const c of challenges) {
      for (const level of SOLUTION_LEVELS) {
        assert.ok(
          levelBlurbs[c.id]?.[level],
          `missing blurb for ${c.id}/${level}`
        );
      }
    }
  });

  it("catalog explanations are educational (not one-liners)", () => {
    for (const c of componentCatalog) {
      const why = componentWhy[c.id];
      assert.ok(why.length > 280, `${c.id} too short (${why.length})`);
      assert.ok(
        /\n\s*\n/.test(why),
        `${c.id} should use paragraph breaks for readability`
      );
    }
  });

  it("builds non-empty explanations for every reference graph", () => {
    for (const c of challenges) {
      for (const level of SOLUTION_LEVELS) {
        const graph = getReferenceSolution(c.id, level)!;
        const expl = buildSolutionExplanation(c.id, level, graph);
        assert.ok(expl.items.length > 0, `${c.id}/${level}`);
        assert.ok(expl.blurb.length > 40);
        for (const item of expl.items) {
          assert.ok(
            item.why.length > 200,
            `${c.id}/${level}/${item.componentId} too brief (${item.why.length})`
          );
        }
      }
    }
  });
});
