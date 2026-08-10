import type {
  DesignGraph,
  PredicateContext,
  PredicateFn,
} from "./types.ts";

function asString(v: unknown): string | undefined {
  return typeof v === "string" ? v : undefined;
}

function asStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string");
  if (typeof v === "string") return [v];
  return [];
}

function asNumber(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

export function buildPredicateContext(graph: DesignGraph): PredicateContext {
  const componentIds = new Map<string, string>();
  for (const n of graph.nodes) {
    componentIds.set(n.id, n.componentId);
  }

  const adjacency = new Map<string, string[]>();
  for (const n of graph.nodes) adjacency.set(n.id, []);
  for (const e of graph.edges) {
    if (!componentIds.has(e.source) || !componentIds.has(e.target)) continue;
    adjacency.get(e.source)!.push(e.target);
  }

  return { graph, componentIds, adjacency };
}

function nodesOfType(ctx: PredicateContext, type: string): string[] {
  return [...ctx.componentIds.entries()]
    .filter(([, cid]) => cid === type)
    .map(([id]) => id);
}

function hasPath(
  ctx: PredicateContext,
  fromIds: string[],
  toIds: Set<string>
): boolean {
  const target = toIds;
  const visited = new Set<string>();
  const queue = [...fromIds];
  while (queue.length) {
    const cur = queue.shift()!;
    if (visited.has(cur)) continue;
    visited.add(cur);
    if (target.has(cur) && !fromIds.includes(cur)) return true;
    if (target.has(cur) && fromIds.length === 0) return true;
    for (const next of ctx.adjacency.get(cur) ?? []) {
      if (target.has(next)) return true;
      if (!visited.has(next)) queue.push(next);
    }
  }
  return false;
}

function pathExistsBetweenTypes(
  ctx: PredicateContext,
  fromType: string,
  toType: string
): boolean {
  const from = nodesOfType(ctx, fromType);
  const to = new Set(nodesOfType(ctx, toType));
  if (from.length === 0 || to.size === 0) return false;
  return hasPath(ctx, from, to);
}

const hasComponent: PredicateFn = (ctx, params) => {
  const id = asString(params?.componentId) ?? asString(params?.id);
  if (!id) return { passed: false, detail: "missing componentId" };
  const ok = [...ctx.componentIds.values()].includes(id);
  return {
    passed: ok,
    detail: ok ? undefined : `Missing component: ${id}`,
  };
};

const hasAnyComponent: PredicateFn = (ctx, params) => {
  const ids = asStringArray(params?.componentIds ?? params?.ids);
  if (ids.length === 0) return { passed: false, detail: "missing componentIds" };
  const present = new Set(ctx.componentIds.values());
  const ok = ids.some((id) => present.has(id));
  return {
    passed: ok,
    detail: ok ? undefined : `Need one of: ${ids.join(", ")}`,
  };
};

const pathExists: PredicateFn = (ctx, params) => {
  const from = asString(params?.from);
  const to = asString(params?.to);
  if (!from || !to) return { passed: false, detail: "missing from/to" };
  const ok = pathExistsBetweenTypes(ctx, from, to);
  return {
    passed: ok,
    detail: ok ? undefined : `No path from ${from} → ${to}`,
  };
};

const allOfTypeConnectTo: PredicateFn = (ctx, params) => {
  const fromType = asString(params?.from);
  const toType = asString(params?.to);
  if (!fromType || !toType) return { passed: false, detail: "missing from/to" };
  const fromNodes = nodesOfType(ctx, fromType);
  const toNodes = new Set(nodesOfType(ctx, toType));
  if (fromNodes.length === 0) {
    return { passed: false, detail: `No ${fromType} nodes` };
  }
  if (toNodes.size === 0) {
    return { passed: false, detail: `No ${toType} nodes` };
  }
  const ok = fromNodes.every((id) => {
    const outs = ctx.adjacency.get(id) ?? [];
    return outs.some((t) => toNodes.has(t)) || hasPath(ctx, [id], toNodes);
  });
  return {
    passed: ok,
    detail: ok ? undefined : `Every ${fromType} should reach ${toType}`,
  };
};

const hasEdgeKindBetween: PredicateFn = (ctx, params) => {
  const from = asString(params?.from);
  const to = asString(params?.to);
  const kind = asString(params?.kind);
  if (!from || !to) return { passed: false, detail: "missing from/to" };
  const fromIds = new Set(nodesOfType(ctx, from));
  const toIds = new Set(nodesOfType(ctx, to));
  const ok = ctx.graph.edges.some((e) => {
    if (!fromIds.has(e.source) || !toIds.has(e.target)) return false;
    if (kind && e.kind !== kind) return false;
    return true;
  });
  return {
    passed: ok,
    detail: ok
      ? undefined
      : `Need ${kind ?? "an"} edge from ${from} → ${to}`,
  };
};

const noDirectClientToDb: PredicateFn = (ctx) => {
  const clients = new Set(nodesOfType(ctx, "client"));
  const dbs = new Set(nodesOfType(ctx, "database"));
  const bad = ctx.graph.edges.some(
    (e) => clients.has(e.source) && dbs.has(e.target)
  );
  return {
    passed: !bad,
    detail: bad ? "Client must not talk directly to the database" : undefined,
  };
};

const hasCacheBeforeDb: PredicateFn = (ctx) => {
  const hasCache = nodesOfType(ctx, "cache").length > 0;
  const hasDb = nodesOfType(ctx, "database").length > 0;
  if (!hasDb) return { passed: false, detail: "No database in design" };
  if (!hasCache) return { passed: false, detail: "Add a cache on the read path" };
  // Prefer: something reaches DB and cache exists; stronger: path via cache
  const cacheIds = new Set(nodesOfType(ctx, "cache"));
  const dbIds = new Set(nodesOfType(ctx, "database"));
  const viaCache = ctx.graph.edges.some(
    (e) => cacheIds.has(e.source) && dbIds.has(e.target)
  );
  const anyToDb = [...ctx.componentIds.keys()].some((id) =>
    hasPath(ctx, [id], dbIds)
  );
  const ok = viaCache || (hasCache && anyToDb);
  return {
    passed: ok,
    detail: ok ? undefined : "Wire cache on the path to the database",
  };
};

const hasQueueForWritePath: PredicateFn = (ctx) => {
  const queues = nodesOfType(ctx, "message-queue");
  if (queues.length === 0) {
    return { passed: false, detail: "Add a message queue for async writes" };
  }
  const producers = [
    "chat-service",
    "feed-service",
    "api-gateway",
    "notification-service",
    "matching-service",
    "worker",
  ];
  const present = new Set(ctx.componentIds.values());
  const hasProducer = producers.some((p) => present.has(p));
  if (!hasProducer) {
    return { passed: true, detail: "Queue present" };
  }
  const queueSet = new Set(queues);
  const ok = ctx.graph.edges.some((e) => {
    const srcType = ctx.componentIds.get(e.source);
    return (
      srcType != null &&
      producers.includes(srcType) &&
      queueSet.has(e.target)
    );
  });
  return {
    passed: ok,
    detail: ok ? undefined : "Connect a service into the message queue",
  };
};

const hasObservability: PredicateFn = (ctx, params) => {
  const min = asNumber(params?.minServices, 1);
  const monitors = nodesOfType(ctx, "monitoring");
  if (monitors.length === 0) {
    return { passed: false, detail: "Add Monitoring & Logging" };
  }
  const monSet = new Set(monitors);
  const linked = new Set<string>();
  for (const e of ctx.graph.edges) {
    if (monSet.has(e.target)) linked.add(e.source);
    if (monSet.has(e.source)) linked.add(e.target);
  }
  const ok = linked.size >= min;
  return {
    passed: ok,
    detail: ok
      ? undefined
      : `Connect monitoring to at least ${min} service(s)`,
  };
};

const hasRedundancySignal: PredicateFn = (ctx) => {
  const hasLb = nodesOfType(ctx, "load-balancer").length > 0;
  const computeTypes = [
    "chat-service",
    "feed-service",
    "api-gateway",
    "worker",
    "matching-service",
    "auth-service",
    "notification-service",
  ];
  const computeCounts = computeTypes.map(
    (t) => nodesOfType(ctx, t).length
  );
  const multi = computeCounts.some((n) => n >= 2);
  const ok = hasLb || multi;
  return {
    passed: ok,
    detail: ok
      ? undefined
      : "Add a load balancer (or multiple service instances)",
  };
};

const componentCountAtLeast: PredicateFn = (ctx, params) => {
  const id = asString(params?.componentId) ?? asString(params?.id);
  const min = asNumber(params?.min, 1);
  if (!id) return { passed: false, detail: "missing componentId" };
  const count = nodesOfType(ctx, id).length;
  const ok = count >= min;
  return {
    passed: ok,
    detail: ok ? undefined : `Need ≥${min}× ${id} (have ${count})`,
  };
};

const maxFanIn: PredicateFn = (ctx, params) => {
  const max = asNumber(params?.max, 6);
  const fanIn = new Map<string, number>();
  for (const e of ctx.graph.edges) {
    if (!ctx.componentIds.has(e.target)) continue;
    fanIn.set(e.target, (fanIn.get(e.target) ?? 0) + 1);
  }
  let worst = 0;
  let worstId = "";
  for (const [id, n] of fanIn) {
    if (n > worst) {
      worst = n;
      worstId = id;
    }
  }
  const ok = worst <= max;
  const label = worstId ? ctx.componentIds.get(worstId) ?? worstId : "";
  return {
    passed: ok,
    detail: ok
      ? undefined
      : `${label} has fan-in ${worst} (max ${max}) — likely bottleneck`,
  };
};

const hasRealtimePath: PredicateFn = (ctx) => {
  const ok =
    pathExistsBetweenTypes(ctx, "client", "websocket-gateway") ||
    (nodesOfType(ctx, "websocket-gateway").length > 0 &&
      nodesOfType(ctx, "client").length > 0 &&
      ctx.graph.edges.some((e) => {
        const s = ctx.componentIds.get(e.source);
        const t = ctx.componentIds.get(e.target);
        return (
          (s === "client" && t === "websocket-gateway") ||
          (s === "websocket-gateway" && t === "client") ||
          (s === "load-balancer" && t === "websocket-gateway") ||
          (s === "api-gateway" && t === "websocket-gateway")
        );
      }));
  return {
    passed: ok,
    detail: ok
      ? undefined
      : "Clients need a path to a WebSocket gateway for realtime",
  };
};

export const predicates: Record<string, PredicateFn> = {
  hasComponent,
  hasAnyComponent,
  pathExists,
  allOfTypeConnectTo,
  hasEdgeKindBetween,
  noDirectClientToDb,
  hasCacheBeforeDb,
  hasQueueForWritePath,
  hasObservability,
  hasRedundancySignal,
  componentCountAtLeast,
  maxFanIn,
  hasRealtimePath,
};

export function runPredicate(
  name: string,
  ctx: PredicateContext,
  params?: Record<string, unknown>
): { passed: boolean; detail?: string } {
  const fn = predicates[name];
  if (!fn) return { passed: false, detail: `Unknown predicate: ${name}` };
  return fn(ctx, params);
}
