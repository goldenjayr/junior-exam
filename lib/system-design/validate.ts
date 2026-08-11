import type {
  Challenge,
  DesignGraph,
  SoftDimension,
  ValidationResult,
} from "./types.ts";
import { buildPredicateContext, runPredicate } from "./predicates.ts";
import { getLiveTips } from "./tips.ts";

const DIMENSION_ORDER: SoftDimension[] = [
  "scalability",
  "reliability",
  "faultTolerance",
  "latency",
  "costEfficiency",
  "tradeoffs",
];

function uniq(items: string[]): string[] {
  return [...new Set(items.filter(Boolean))];
}

export function runValidation(
  graph: DesignGraph,
  challenge: Challenge
): ValidationResult {
  const ctx = buildPredicateContext(graph);

  const hard = challenge.hardRequirements.map((req) => {
    const result = runPredicate(req.predicate, ctx, req.params);
    return {
      id: req.id,
      label: req.label,
      passed: result.passed,
      detail: result.detail,
    };
  });

  const hardPassed = hard.filter((h) => h.passed).length;
  const hardTotal = hard.length;

  const byDim = new Map<
    SoftDimension,
    { weight: number; score: number; tip?: string; bottleneck?: string; best?: string }
  >();

  for (const dim of DIMENSION_ORDER) {
    byDim.set(dim, { weight: 0, score: 0 });
  }

  const bottlenecks: string[] = [];
  const bestPractices: string[] = [];
  const tips: string[] = [...challenge.starterTips];

  for (const rule of challenge.softRubric) {
    const result = runPredicate(rule.predicate, ctx, rule.params);
    const entry = byDim.get(rule.dimension)!;
    entry.weight += rule.weight;
    entry.score += rule.weight * (result.passed ? 1 : 0);
    if (!result.passed) {
      if (rule.tipOnFail) tips.push(rule.tipOnFail);
      if (rule.bottleneckOnFail) bottlenecks.push(rule.bottleneckOnFail);
      if (result.detail) tips.push(result.detail);
    } else if (rule.bestPracticeOnPass) {
      bestPractices.push(rule.bestPracticeOnPass);
    }
  }

  // Always surface fan-in bottleneck heuristic
  const fan = runPredicate("maxFanIn", ctx, { max: 5 });
  if (!fan.passed && fan.detail) bottlenecks.push(fan.detail);

  const dimensions = DIMENSION_ORDER.map((dimension) => {
    const entry = byDim.get(dimension)!;
    const score = entry.weight === 0 ? 0.5 : entry.score / entry.weight;
    return {
      dimension,
      score,
      tip: score < 0.67 ? tips.find(Boolean) : undefined,
    };
  });

  const softScore = Math.round(
    (dimensions.reduce((s, d) => s + d.score, 0) / dimensions.length) * 100
  );

  const live = getLiveTips(graph, challenge);

  return {
    hard,
    hardPassed,
    hardTotal,
    dimensions,
    softScore,
    bottlenecks: uniq([...bottlenecks, ...live.bottlenecks]),
    bestPractices: uniq([...bestPractices, ...live.bestPractices]),
    tips: uniq([...tips, ...live.tips]).slice(0, 8),
  };
}
