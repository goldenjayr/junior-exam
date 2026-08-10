import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { challenges } from "./challenges/index.ts";
import { componentById } from "./components.ts";
import { predicates } from "./predicates.ts";

describe("challenge bank integrity", () => {
  it("has unique ids and expected count", () => {
    const ids = challenges.map((c) => c.id);
    assert.equal(new Set(ids).size, ids.length);
    assert.equal(challenges.length, 6);
  });

  it("every predicate exists and allowed components are valid", () => {
    for (const c of challenges) {
      assert.ok(c.hardRequirements.length >= 4, c.id);
      for (const req of c.hardRequirements) {
        assert.ok(
          predicates[req.predicate],
          `${c.id} hard ${req.id}: ${req.predicate}`
        );
      }
      for (const rule of c.softRubric) {
        assert.ok(
          predicates[rule.predicate],
          `${c.id} soft ${rule.dimension}: ${rule.predicate}`
        );
      }
      for (const id of c.allowedComponents ?? []) {
        assert.ok(componentById[id], `${c.id} allowed ${id}`);
      }
      for (const id of c.suggestedComponents ?? []) {
        assert.ok(componentById[id], `${c.id} suggested ${id}`);
      }
    }
  });
});
