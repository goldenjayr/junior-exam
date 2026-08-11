import type { Challenge, DesignGraph } from "./types.ts";
import { buildPredicateContext, runPredicate } from "./predicates.ts";

export function getLiveTips(
  graph: DesignGraph,
  challenge: Challenge
): { tips: string[]; bestPractices: string[]; bottlenecks: string[] } {
  const tips: string[] = [];
  const bestPractices: string[] = [];
  const bottlenecks: string[] = [];

  if (graph.nodes.length === 0) {
    return {
      tips: [
        "Drag components from the left palette onto the canvas.",
        ...challenge.starterTips.slice(0, 2),
      ],
      bestPractices: [],
      bottlenecks: [],
    };
  }

  const ctx = buildPredicateContext(graph);
  const types = new Set(ctx.componentIds.values());

  if (types.has("client") && types.has("database")) {
    const direct = runPredicate("noDirectClientToDb", ctx);
    if (!direct.passed) {
      bottlenecks.push("Clients talking straight to the DB will not scale.");
    }
  }

  if (types.has("database") && !types.has("cache")) {
    tips.push("Consider a cache in front of hot database reads.");
  }

  if (
    (challenge.id === "realtime-chat" || types.has("chat-service")) &&
    !types.has("websocket-gateway")
  ) {
    tips.push("Use WebSocket (or similar) for realtime delivery — polling won't cut it.");
  }

  if (types.has("message-queue")) {
    bestPractices.push("Queues decouple producers from slow consumers — nice.");
  }

  if (types.has("load-balancer")) {
    bestPractices.push("Load balancer present — good horizontal scale signal.");
  }

  if (types.has("database") && !types.has("message-queue") && challenge.scale.writeHeavy === "high") {
    bottlenecks.push("Database could be a bottleneck under high write load.");
  }

  if (!types.has("monitoring") && graph.nodes.length >= 4) {
    tips.push("Wire Monitoring & Logging early — you can't fix what you can't see.");
  }

  const fan = runPredicate("maxFanIn", ctx, { max: 5 });
  if (!fan.passed && fan.detail) bottlenecks.push(fan.detail);

  return { tips, bestPractices, bottlenecks };
}
