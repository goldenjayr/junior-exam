import type { Challenge } from "../types.ts";
import { defaultSoftRubric } from "./soft-defaults.ts";

export const realtimeChat: Challenge = {
  id: "realtime-chat",
  title: "Real-Time Chat System",
  difficulty: "medium",
  blurb: "Design a WhatsApp-like messaging platform.",
  objective:
    "Design a real-time chat application like WhatsApp with 1:1 and group messaging at scale.",
  scale: {
    users: "10M+",
    traffic: "high",
    readHeavy: "medium",
    writeHeavy: "high",
    durability: "high",
  },
  suggestedComponents: [
    "client",
    "load-balancer",
    "api-gateway",
    "websocket-gateway",
    "chat-service",
    "message-queue",
    "cache",
    "database",
  ],
  hardRequirements: [
    {
      id: "clients",
      label: "Include client apps (web/mobile)",
      hint: "Start with how users connect.",
      predicate: "hasComponent",
      params: { componentId: "client" },
    },
    {
      id: "realtime",
      label: "Realtime delivery via WebSocket gateway",
      hint: "Polling is too slow for chat — think persistent connections.",
      predicate: "hasRealtimePath",
    },
    {
      id: "chat-svc",
      label: "Dedicated chat (or messaging) service",
      predicate: "hasAnyComponent",
      params: { componentIds: ["chat-service"] },
    },
    {
      id: "async",
      label: "Async fan-out via message queue",
      hint: "Don't make every write wait on every recipient.",
      predicate: "hasQueueForWritePath",
    },
    {
      id: "durable",
      label: "Durable message store (database)",
      predicate: "hasComponent",
      params: { componentId: "database" },
    },
    {
      id: "no-direct-db",
      label: "Clients never talk directly to the DB",
      predicate: "noDirectClientToDb",
    },
  ],
  softRubric: defaultSoftRubric([
    {
      dimension: "latency",
      weight: 2,
      predicate: "hasComponent",
      params: { componentId: "cache" },
      tipOnFail: "Cache presence and recent conversations.",
    },
    {
      dimension: "reliability",
      weight: 1,
      predicate: "hasComponent",
      params: { componentId: "presence-service" },
      tipOnFail: "Presence helps UX (online/typing) without overloading chat.",
    },
  ]),
  starterTips: [
    "Use WebSocket for realtime — don't poll.",
    "Separate auth, chat, and notification concerns.",
    "Queue fan-out so one slow recipient doesn't block others.",
  ],
};
