import type { Challenge } from "../types.ts";
import { defaultSoftRubric } from "./soft-defaults.ts";

export const searchSystem: Challenge = {
  id: "search-system",
  title: "Search System",
  difficulty: "medium",
  blurb: "Index documents and serve fast relevance queries.",
  objective:
    "Design a search system (like site search) with indexing workers, a search service, caching, and durable storage.",
  scale: {
    users: "30M+",
    traffic: "high",
    readHeavy: "high",
    writeHeavy: "medium",
    durability: "high",
  },
  suggestedComponents: [
    "client",
    "load-balancer",
    "api-gateway",
    "search-service",
    "message-queue",
    "worker",
    "cache",
    "database",
  ],
  hardRequirements: [
    {
      id: "search",
      label: "Search service present",
      predicate: "hasComponent",
      params: { componentId: "search-service" },
    },
    {
      id: "client-path",
      label: "Client reaches the search service",
      predicate: "pathExists",
      params: { from: "client", to: "search-service" },
    },
    {
      id: "index-queue",
      label: "Async indexing via message queue",
      hint: "Don't block writes on reindexing every document synchronously.",
      predicate: "hasQueueForWritePath",
    },
    {
      id: "worker-path",
      label: "Workers consume indexing jobs",
      predicate: "hasQueueWorkerPath",
    },
    {
      id: "cache-path",
      label: "Cache hot queries in front of storage",
      predicate: "hasCacheBeforeDb",
    },
    {
      id: "no-direct",
      label: "No direct client→DB",
      predicate: "noDirectClientToDb",
    },
  ],
  softRubric: defaultSoftRubric(),
  starterTips: [
    "Separate query path from indexing path.",
    "Cache popular queries; index asynchronously via workers.",
  ],
};
