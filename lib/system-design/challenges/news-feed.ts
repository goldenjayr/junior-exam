import type { Challenge } from "../types.ts";
import { defaultSoftRubric } from "./soft-defaults.ts";

export const newsFeed: Challenge = {
  id: "news-feed",
  title: "News Feed",
  difficulty: "medium",
  blurb: "Social timeline with fan-out and caching.",
  objective:
    "Design a news feed (Twitter/Instagram-style) supporting posts, fan-out to followers, and fast feed reads.",
  scale: {
    users: "100M+",
    traffic: "high",
    readHeavy: "high",
    writeHeavy: "medium",
    durability: "high",
  },
  suggestedComponents: [
    "client",
    "cdn",
    "load-balancer",
    "api-gateway",
    "feed-service",
    "worker",
    "message-queue",
    "cache",
    "database",
  ],
  hardRequirements: [
    {
      id: "feed",
      label: "Feed service present",
      predicate: "hasComponent",
      params: { componentId: "feed-service" },
    },
    {
      id: "async",
      label: "Async fan-out via queue",
      hint: "Writing to every follower synchronously won't scale.",
      predicate: "hasQueueForWritePath",
    },
    {
      id: "worker-path",
      label: "Queue feeds a background worker",
      predicate: "hasQueueWorkerPath",
    },
    {
      id: "cache-path",
      label: "Cache sits in front of the database",
      predicate: "hasCacheBeforeDb",
    },
    {
      id: "db",
      label: "Durable post store",
      predicate: "hasComponent",
      params: { componentId: "database" },
    },
    {
      id: "no-direct",
      label: "No direct client→DB",
      predicate: "noDirectClientToDb",
    },
  ],
  softRubric: defaultSoftRubric([
    {
      dimension: "latency",
      weight: 2,
      predicate: "hasAnyComponent",
      params: { componentIds: ["cdn", "cache"] },
      tipOnFail: "CDN + cache keep media and feeds fast.",
    },
  ]),
  starterTips: [
    "Decide fan-out on write vs fan-out on read — and justify it.",
    "Workers + queues handle celebrity fan-out spikes.",
  ],
};
