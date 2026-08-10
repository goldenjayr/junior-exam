import type { Challenge } from "../types.ts";
import { defaultSoftRubric } from "./soft-defaults.ts";

export const fileStorage: Challenge = {
  id: "file-storage",
  title: "File Storage Service",
  difficulty: "medium",
  blurb: "Upload, store, and serve files securely.",
  objective:
    "Design a Dropbox/Drive-like file storage service with auth, object storage, metadata, and CDN delivery.",
  scale: {
    users: "20M+",
    traffic: "high",
    readHeavy: "high",
    writeHeavy: "medium",
    durability: "high",
  },
  suggestedComponents: [
    "client",
    "cdn",
    "api-gateway",
    "auth-service",
    "object-storage",
    "database",
    "worker",
    "monitoring",
  ],
  hardRequirements: [
    {
      id: "auth",
      label: "Auth service for access control",
      predicate: "hasComponent",
      params: { componentId: "auth-service" },
    },
    {
      id: "objects",
      label: "Object storage for file blobs",
      predicate: "hasComponent",
      params: { componentId: "object-storage" },
    },
    {
      id: "meta",
      label: "Metadata database",
      predicate: "hasComponent",
      params: { componentId: "database" },
    },
    {
      id: "cdn",
      label: "CDN for download acceleration",
      predicate: "hasComponent",
      params: { componentId: "cdn" },
    },
    {
      id: "no-direct",
      label: "No direct client→DB",
      predicate: "noDirectClientToDb",
    },
  ],
  softRubric: defaultSoftRubric([
    {
      dimension: "reliability",
      weight: 1,
      predicate: "hasComponent",
      params: { componentId: "worker" },
      tipOnFail: "Workers help with virus scan, thumbnails, and async processing.",
    },
    {
      dimension: "latency",
      weight: 2,
      predicate: "hasComponent",
      params: { componentId: "cdn" },
      bestPracticeOnPass: "CDN in front of object storage — solid.",
    },
  ]),
  starterTips: [
    "Keep blobs in object storage; keep metadata in a DB.",
    "Serve downloads via CDN with signed URLs.",
  ],
};
