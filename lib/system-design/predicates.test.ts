import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildPredicateContext,
  runPredicate,
} from "./predicates.ts";
import type { DesignGraph } from "./types.ts";

function graph(
  nodes: { id: string; componentId: string }[],
  edges: { id: string; source: string; target: string; kind?: "request" | "async" | "data" | "observe" }[]
): DesignGraph {
  return {
    nodes: nodes.map((n) => ({
      ...n,
      position: { x: 0, y: 0 },
    })),
    edges: edges.map((e) => ({
      kind: "request" as const,
      ...e,
    })),
  };
}

describe("predicates", () => {
  it("pathExists finds directed paths", () => {
    const g = graph(
      [
        { id: "c", componentId: "client" },
        { id: "lb", componentId: "load-balancer" },
        { id: "api", componentId: "api-gateway" },
        { id: "db", componentId: "database" },
      ],
      [
        { id: "e1", source: "c", target: "lb" },
        { id: "e2", source: "lb", target: "api" },
        { id: "e3", source: "api", target: "db" },
      ]
    );
    const ctx = buildPredicateContext(g);
    assert.equal(
      runPredicate("pathExists", ctx, { from: "client", to: "database" }).passed,
      true
    );
    assert.equal(
      runPredicate("pathExists", ctx, { from: "database", to: "client" }).passed,
      false
    );
  });

  it("noDirectClientToDb catches bad edges", () => {
    const bad = graph(
      [
        { id: "c", componentId: "client" },
        { id: "db", componentId: "database" },
      ],
      [{ id: "e1", source: "c", target: "db" }]
    );
    assert.equal(
      runPredicate("noDirectClientToDb", buildPredicateContext(bad)).passed,
      false
    );

    const good = graph(
      [
        { id: "c", componentId: "client" },
        { id: "api", componentId: "api-gateway" },
        { id: "db", componentId: "database" },
      ],
      [
        { id: "e1", source: "c", target: "api" },
        { id: "e2", source: "api", target: "db" },
      ]
    );
    assert.equal(
      runPredicate("noDirectClientToDb", buildPredicateContext(good)).passed,
      true
    );
  });

  it("hasComponent and hasAnyComponent", () => {
    const g = graph([{ id: "q", componentId: "message-queue" }], []);
    const ctx = buildPredicateContext(g);
    assert.equal(
      runPredicate("hasComponent", ctx, { componentId: "message-queue" }).passed,
      true
    );
    assert.equal(
      runPredicate("hasAnyComponent", ctx, {
        componentIds: ["websocket-gateway", "message-queue"],
      }).passed,
      true
    );
    assert.equal(
      runPredicate("hasComponent", ctx, { componentId: "cache" }).passed,
      false
    );
  });
});
