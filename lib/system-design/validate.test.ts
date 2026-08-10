import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runValidation } from "./validate.ts";
import type { Challenge, DesignGraph } from "./types.ts";

const miniChallenge: Challenge = {
  id: "test-chat",
  title: "Test Chat",
  difficulty: "medium",
  blurb: "test",
  objective: "test",
  scale: {
    users: "1M",
    traffic: "high",
    readHeavy: "medium",
    writeHeavy: "high",
    durability: "high",
  },
  hardRequirements: [
    {
      id: "ws",
      label: "WebSocket gateway",
      predicate: "hasComponent",
      params: { componentId: "websocket-gateway" },
    },
    {
      id: "no-direct",
      label: "No direct client→DB",
      predicate: "noDirectClientToDb",
    },
    {
      id: "path",
      label: "Client reaches chat service",
      predicate: "pathExists",
      params: { from: "client", to: "chat-service" },
    },
  ],
  softRubric: [
    {
      dimension: "scalability",
      weight: 1,
      predicate: "hasRedundancySignal",
      tipOnFail: "Add a load balancer",
    },
    {
      dimension: "reliability",
      weight: 1,
      predicate: "hasQueueForWritePath",
      bottleneckOnFail: "Writes may overwhelm the DB",
    },
    {
      dimension: "faultTolerance",
      weight: 1,
      predicate: "hasRedundancySignal",
    },
    {
      dimension: "latency",
      weight: 1,
      predicate: "hasComponent",
      params: { componentId: "cache" },
      tipOnFail: "Cache hot reads",
    },
    {
      dimension: "costEfficiency",
      weight: 1,
      predicate: "maxFanIn",
      params: { max: 8 },
    },
    {
      dimension: "tradeoffs",
      weight: 1,
      predicate: "hasObservability",
      params: { minServices: 1 },
      bestPracticeOnPass: "Observability connected",
    },
  ],
  starterTips: ["Start from the client"],
};

function solidChatGraph(): DesignGraph {
  return {
    nodes: [
      { id: "c", componentId: "client", position: { x: 0, y: 0 } },
      { id: "lb", componentId: "load-balancer", position: { x: 100, y: 0 } },
      { id: "api", componentId: "api-gateway", position: { x: 200, y: 0 } },
      { id: "chat", componentId: "chat-service", position: { x: 300, y: 0 } },
      { id: "ws", componentId: "websocket-gateway", position: { x: 300, y: 100 } },
      { id: "q", componentId: "message-queue", position: { x: 400, y: 0 } },
      { id: "cache", componentId: "cache", position: { x: 400, y: 100 } },
      { id: "db", componentId: "database", position: { x: 500, y: 0 } },
      { id: "mon", componentId: "monitoring", position: { x: 200, y: 200 } },
    ],
    edges: [
      { id: "1", source: "c", target: "lb", kind: "request" },
      { id: "2", source: "lb", target: "api", kind: "request" },
      { id: "3", source: "api", target: "chat", kind: "request" },
      { id: "4", source: "chat", target: "ws", kind: "request" },
      { id: "5", source: "c", target: "ws", kind: "request" },
      { id: "6", source: "chat", target: "q", kind: "async" },
      { id: "7", source: "chat", target: "cache", kind: "data" },
      { id: "8", source: "cache", target: "db", kind: "data" },
      { id: "9", source: "api", target: "mon", kind: "observe" },
    ],
  };
}

describe("runValidation", () => {
  it("scores a solid chat-like graph highly", () => {
    const result = runValidation(solidChatGraph(), miniChallenge);
    assert.equal(result.hardTotal, 3);
    assert.equal(result.hardPassed, 3);
    assert.ok(result.softScore >= 70);
    assert.ok(result.dimensions.length === 6);
  });

  it("fails most hard requirements on an empty graph", () => {
    const result = runValidation({ nodes: [], edges: [] }, miniChallenge);
    assert.ok(result.hardPassed < result.hardTotal);
    assert.equal(
      result.hard.find((h) => h.id === "ws")?.passed,
      false
    );
    assert.ok(result.tips.length > 0);
  });
});
