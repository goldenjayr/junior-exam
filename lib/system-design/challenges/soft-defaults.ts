import type { SoftRubricRule } from "../types.ts";

/** Shared soft-dimension defaults; challenges can spread and override. */
export function defaultSoftRubric(overrides: SoftRubricRule[] = []): SoftRubricRule[] {
  const base: SoftRubricRule[] = [
    {
      dimension: "scalability",
      weight: 2,
      predicate: "hasRedundancySignal",
      tipOnFail: "Add a load balancer to scale out compute.",
      bestPracticeOnPass: "Horizontal scale signal present (LB or replicas).",
    },
    {
      dimension: "reliability",
      weight: 2,
      predicate: "hasQueueForWritePath",
      tipOnFail: "Decouple writes with a message queue.",
      bottleneckOnFail: "Synchronous write path may collapse under load.",
    },
    {
      dimension: "faultTolerance",
      weight: 1,
      predicate: "hasRedundancySignal",
      tipOnFail: "Single instances are single points of failure.",
    },
    {
      dimension: "latency",
      weight: 2,
      predicate: "hasCacheBeforeDb",
      tipOnFail: "Cache hot reads before they hit the database.",
      bottleneckOnFail: "Uncached DB reads will hurt p99 latency.",
    },
    {
      dimension: "costEfficiency",
      weight: 1,
      predicate: "maxFanIn",
      params: { max: 6 },
      bottleneckOnFail: "A node with huge fan-in is an expensive hotspot.",
    },
    {
      dimension: "tradeoffs",
      weight: 1,
      predicate: "hasObservability",
      params: { minServices: 1 },
      tipOnFail: "Add monitoring so you can see what breaks.",
      bestPracticeOnPass: "Observability is wired into the design.",
    },
  ];

  // Overrides replace same dimension+predicate if provided, else append
  const out = [...base];
  for (const o of overrides) {
    const idx = out.findIndex(
      (b) => b.dimension === o.dimension && b.predicate === o.predicate
    );
    if (idx >= 0) out[idx] = { ...out[idx], ...o };
    else out.push(o);
  }
  return out;
}
