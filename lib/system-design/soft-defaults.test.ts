import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { defaultSoftRubric } from "./challenges/soft-defaults.ts";

describe("defaultSoftRubric", () => {
  it("replaces entire dimensions instead of appending", () => {
    const rules = defaultSoftRubric([
      {
        dimension: "reliability",
        weight: 1,
        predicate: "hasRedundancySignal",
      },
      {
        dimension: "latency",
        weight: 2,
        predicate: "hasComponent",
        params: { componentId: "cache" },
      },
    ]);
    const reliability = rules.filter((r) => r.dimension === "reliability");
    const latency = rules.filter((r) => r.dimension === "latency");
    assert.equal(reliability.length, 1);
    assert.equal(reliability[0]?.predicate, "hasRedundancySignal");
    assert.equal(latency.length, 1);
    assert.equal(latency[0]?.predicate, "hasComponent");
    assert.ok(!rules.some((r) => r.predicate === "hasQueueForWritePath"));
    assert.ok(!rules.some((r) => r.predicate === "hasCacheBeforeDb"));
  });
});
