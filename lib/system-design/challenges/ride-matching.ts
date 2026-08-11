import type { Challenge } from "../types.ts";
import { defaultSoftRubric } from "./soft-defaults.ts";

export const rideMatching: Challenge = {
  id: "ride-matching",
  title: "Ride Matching",
  difficulty: "hard",
  blurb: "Match riders to drivers in realtime.",
  objective:
    "Design a ride-hailing matching system with location updates, matching, dispatch, and notifications.",
  scale: {
    users: "5M+",
    traffic: "high",
    readHeavy: "high",
    writeHeavy: "high",
    durability: "medium",
  },
  suggestedComponents: [
    "client",
    "load-balancer",
    "api-gateway",
    "websocket-gateway",
    "matching-service",
    "message-queue",
    "worker",
    "cache",
    "database",
    "notification-service",
  ],
  hardRequirements: [
    {
      id: "match",
      label: "Matching service",
      predicate: "hasComponent",
      params: { componentId: "matching-service" },
    },
    {
      id: "realtime",
      label: "Realtime channel (WebSocket)",
      hint: "Driver locations and ride status need low-latency updates.",
      predicate: "hasRealtimePath",
    },
    {
      id: "queue",
      label: "Queue for match/dispatch jobs",
      predicate: "hasQueueForWritePath",
    },
    {
      id: "worker-path",
      label: "Workers consume match jobs from the queue",
      predicate: "hasQueueWorkerPath",
    },
    {
      id: "notify",
      label: "Notification service for ride events",
      predicate: "hasComponent",
      params: { componentId: "notification-service" },
    },
    {
      id: "cache-path",
      label: "Geo/nearby cache in front of DB",
      hint: "Matching without an in-memory geo index will be too slow.",
      predicate: "hasCacheBeforeDb",
    },
    {
      id: "store",
      label: "Durable trip store",
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
      predicate: "hasComponent",
      params: { componentId: "cache" },
      tipOnFail: "Cache geo indexes / nearby drivers in memory.",
      bottleneckOnFail: "Matching without a geo cache will be too slow.",
    },
    {
      dimension: "scalability",
      weight: 2,
      predicate: "hasComponent",
      params: { componentId: "worker" },
      tipOnFail: "Workers help process match jobs in parallel.",
    },
  ]),
  starterTips: [
    "Separate location ingestion from matching logic.",
    "Use queues so match spikes don't melt the API tier.",
  ],
};
