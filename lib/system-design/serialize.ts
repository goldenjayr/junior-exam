import type { DesignEdge, DesignGraph, DesignNode, EdgeKind } from "./types.ts";

/** React Flow–compatible shapes without importing RF in pure lib tests. */
export type RfNodeLike = {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: { componentId: string; label?: string };
};

export type RfEdgeLike = {
  id: string;
  source: string;
  target: string;
  data?: { kind?: EdgeKind };
  animated?: boolean;
  style?: { strokeDasharray?: string };
};

export function toDesignGraph(
  nodes: RfNodeLike[],
  edges: RfEdgeLike[]
): DesignGraph {
  return {
    nodes: nodes.map(
      (n): DesignNode => ({
        id: n.id,
        componentId: n.data.componentId,
        position: n.position,
        label: n.data.label,
      })
    ),
    edges: edges.map(
      (e): DesignEdge => ({
        id: e.id,
        source: e.source,
        target: e.target,
        kind: e.data?.kind ?? (e.style?.strokeDasharray ? "observe" : "request"),
      })
    ),
  };
}

export function fromDesignGraph(graph: DesignGraph): {
  nodes: RfNodeLike[];
  edges: RfEdgeLike[];
} {
  return {
    nodes: graph.nodes.map((n) => ({
      id: n.id,
      type: "architecture",
      position: n.position,
      data: { componentId: n.componentId, label: n.label },
    })),
    edges: graph.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      data: { kind: e.kind },
      animated: e.kind === "async",
      style:
        e.kind === "observe" || e.kind === "async"
          ? { strokeDasharray: "6 4" }
          : undefined,
    })),
  };
}

export const DRAFT_PREFIX = "sd-draft:";

export function draftKey(challengeId: string): string {
  return `${DRAFT_PREFIX}${challengeId}`;
}

export function loadDraft(challengeId: string): DesignGraph | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(draftKey(challengeId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DesignGraph;
    if (!parsed?.nodes || !parsed?.edges) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveDraft(challengeId: string, graph: DesignGraph): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(draftKey(challengeId), JSON.stringify(graph));
}

export function clearDraft(challengeId: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(draftKey(challengeId));
}
