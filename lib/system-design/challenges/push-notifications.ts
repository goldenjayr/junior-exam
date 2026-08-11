import type { Challenge } from "../types.ts";
import { defaultSoftRubric } from "./soft-defaults.ts";

export const pushNotifications: Challenge = {
  id: "push-notifications",
  title: "Push Notification Service",
  difficulty: "easy",
  blurb: "Reliable fan-out of push/email/SMS alerts.",
  objective:
    "Design a notification platform that accepts events, queues delivery, and fans out via a notification service with observability.",
  scale: {
    users: "20M+",
    traffic: "high",
    readHeavy: "low",
    writeHeavy: "high",
    durability: "medium",
  },
  suggestedComponents: [
    "client",
    "api-gateway",
    "load-balancer",
    "notification-service",
    "message-queue",
    "worker",
    "monitoring",
  ],
  hardRequirements: [
    {
      id: "notify",
      label: "Notification service present",
      predicate: "hasComponent",
      params: { componentId: "notification-service" },
    },
    {
      id: "queue",
      label: "Async delivery via message queue",
      hint: "Providers are slow — buffer with a queue.",
      predicate: "hasQueueForWritePath",
    },
    {
      id: "worker-path",
      label: "Workers pull from the queue",
      predicate: "hasQueueWorkerPath",
    },
    {
      id: "obs",
      label: "Monitoring for delivery metrics",
      predicate: "hasObservability",
      params: { minServices: 1 },
    },
    {
      id: "scale",
      label: "Load balancer for horizontal scale",
      predicate: "hasRedundancySignal",
    },
  ],
  softRubric: defaultSoftRubric([
    {
      dimension: "latency",
      weight: 1,
      predicate: "hasComponent",
      params: { componentId: "message-queue" },
      tipOnFail: "Queues absorb spikes so providers aren't hammered.",
      bestPracticeOnPass: "Async delivery path is present.",
    },
    {
      dimension: "reliability",
      weight: 2,
      predicate: "hasQueueWorkerPath",
      tipOnFail: "Workers should consume the notification queue.",
    },
  ]),
  starterTips: [
    "Never call FCM/APNs/SMS synchronously from the API request.",
    "Track delivery success/failure in monitoring.",
  ],
};
