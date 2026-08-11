import type { Challenge } from "../types.ts";
import { defaultSoftRubric } from "./soft-defaults.ts";

export const rateLimiterChallenge: Challenge = {
  id: "rate-limiter",
  title: "API Rate Limiter",
  difficulty: "easy",
  blurb: "Protect APIs with fair request quotas.",
  objective:
    "Design a distributed rate limiter in front of an API — accurate counting, low latency, and observability.",
  scale: {
    users: "N/A (platform)",
    traffic: "high",
    readHeavy: "high",
    writeHeavy: "high",
    durability: "low",
  },
  suggestedComponents: [
    "client",
    "load-balancer",
    "api-gateway",
    "rate-limiter",
    "cache",
    "monitoring",
  ],
  hardRequirements: [
    {
      id: "gw",
      label: "API gateway or edge entry",
      predicate: "hasAnyComponent",
      params: { componentIds: ["api-gateway", "load-balancer"] },
    },
    {
      id: "limiter",
      label: "Rate limiter component",
      predicate: "hasComponent",
      params: { componentId: "rate-limiter" },
    },
    {
      id: "counter",
      label: "Fast counter store (cache/Redis)",
      hint: "Counters belong in memory, not a disk-bound DB.",
      predicate: "hasComponent",
      params: { componentId: "cache" },
    },
    {
      id: "obs",
      label: "Monitoring for throttle metrics",
      predicate: "hasObservability",
      params: { minServices: 1 },
    },
  ],
  softRubric: defaultSoftRubric([
    {
      dimension: "latency",
      weight: 3,
      predicate: "hasComponent",
      params: { componentId: "cache" },
      bestPracticeOnPass: "In-memory counters keep rate checks cheap.",
    },
    {
      dimension: "reliability",
      weight: 1,
      predicate: "hasRedundancySignal",
      tipOnFail: "Rate limiter nodes should sit behind an LB.",
    },
  ]),
  starterTips: [
    "Keep counters in Redis (or similar) — not Postgres.",
    "Emit metrics for allowed vs throttled requests.",
  ],
};
