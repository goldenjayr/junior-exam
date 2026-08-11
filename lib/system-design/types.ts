export type ComponentCategory =
  | "client"
  | "edge"
  | "compute"
  | "data"
  | "messaging"
  | "storage"
  | "observability"
  | "other";

export type ComponentDef = {
  id: string;
  label: string;
  category: ComponentCategory;
  description: string;
  tags: string[];
  icon: string;
};

export type ScaleSpec = {
  users: string;
  traffic: "low" | "medium" | "high";
  readHeavy: "low" | "medium" | "high";
  writeHeavy: "low" | "medium" | "high";
  durability: "low" | "medium" | "high";
};

export type SoftDimension =
  | "scalability"
  | "reliability"
  | "faultTolerance"
  | "latency"
  | "costEfficiency"
  | "tradeoffs";

export type HardRequirement = {
  id: string;
  label: string;
  hint?: string;
  predicate: string;
  params?: Record<string, unknown>;
};

export type SoftRubricRule = {
  dimension: SoftDimension;
  weight: number;
  predicate: string;
  params?: Record<string, unknown>;
  tipOnFail?: string;
  bottleneckOnFail?: string;
  bestPracticeOnPass?: string;
};

export type Challenge = {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  blurb: string;
  objective: string;
  scale: ScaleSpec;
  allowedComponents?: string[];
  hardRequirements: HardRequirement[];
  softRubric: SoftRubricRule[];
  starterTips: string[];
  suggestedComponents?: string[];
};

export type EdgeKind = "request" | "async" | "data" | "observe";

export type DesignNode = {
  id: string;
  componentId: string;
  position: { x: number; y: number };
  label?: string;
};

export type DesignEdge = {
  id: string;
  source: string;
  target: string;
  kind: EdgeKind;
};

export type DesignGraph = {
  nodes: DesignNode[];
  edges: DesignEdge[];
};

export type HardResult = {
  id: string;
  label: string;
  passed: boolean;
  detail?: string;
};

export type DimensionResult = {
  dimension: SoftDimension;
  score: number;
  tip?: string;
};

export type ValidationResult = {
  hard: HardResult[];
  hardPassed: number;
  hardTotal: number;
  dimensions: DimensionResult[];
  softScore: number;
  bottlenecks: string[];
  bestPractices: string[];
  tips: string[];
};

export type PredicateContext = {
  graph: DesignGraph;
  componentIds: Map<string, string>;
  adjacency: Map<string, string[]>;
};

export type PredicateFn = (
  ctx: PredicateContext,
  params?: Record<string, unknown>
) => { passed: boolean; detail?: string };
