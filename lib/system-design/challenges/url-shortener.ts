import type { Challenge } from "../types.ts";
import { defaultSoftRubric } from "./soft-defaults.ts";

export const urlShortener: Challenge = {
  id: "url-shortener",
  title: "URL Shortener",
  difficulty: "easy",
  blurb: "Tiny links with fast redirects at scale.",
  objective:
    "Design a URL shortener (bit.ly-style) with unique codes, fast redirects, and optional click analytics.",
  scale: {
    users: "50M+",
    traffic: "high",
    readHeavy: "high",
    writeHeavy: "low",
    durability: "medium",
  },
  suggestedComponents: [
    "client",
    "cdn",
    "load-balancer",
    "api-gateway",
    "cache",
    "database",
  ],
  hardRequirements: [
    {
      id: "entry",
      label: "Public entry (CDN, LB, or API gateway)",
      predicate: "hasAnyComponent",
      params: { componentIds: ["cdn", "load-balancer", "api-gateway"] },
    },
    {
      id: "store",
      label: "Persistent mapping store (database)",
      predicate: "hasComponent",
      params: { componentId: "database" },
    },
    {
      id: "cache",
      label: "Cache hot short-code lookups",
      hint: "Redirects are read-heavy — cache the popular ones.",
      predicate: "hasCacheBeforeDb",
    },
    {
      id: "no-direct",
      label: "No direct client→DB access",
      predicate: "noDirectClientToDb",
    },
  ],
  softRubric: defaultSoftRubric([
    {
      dimension: "latency",
      weight: 3,
      predicate: "hasAnyComponent",
      params: { componentIds: ["cdn", "cache"] },
      tipOnFail: "Edge CDN or Redis cache keeps redirects snappy.",
      bestPracticeOnPass: "Fast path for redirects is covered.",
    },
    {
      dimension: "reliability",
      weight: 1,
      predicate: "hasRedundancySignal",
      tipOnFail: "Add an LB so redirectors can scale.",
    },
  ]),
  starterTips: [
    "Redirects dominate traffic — optimize the read path.",
    "Cache short-code → URL mappings aggressively.",
  ],
};
