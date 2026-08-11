import type { Challenge } from "../types.ts";
import { realtimeChat } from "./realtime-chat.ts";
import { urlShortener } from "./url-shortener.ts";
import { newsFeed } from "./news-feed.ts";
import { fileStorage } from "./file-storage.ts";
import { rideMatching } from "./ride-matching.ts";
import { rateLimiterChallenge } from "./rate-limiter.ts";
import { searchSystem } from "./search-system.ts";
import { pushNotifications } from "./push-notifications.ts";

export const challenges: Challenge[] = [
  realtimeChat,
  urlShortener,
  newsFeed,
  fileStorage,
  rideMatching,
  rateLimiterChallenge,
  searchSystem,
  pushNotifications,
];

export const challengeById: Record<string, Challenge> = Object.fromEntries(
  challenges.map((c) => [c.id, c])
);

export function getChallenge(id: string): Challenge | undefined {
  return challengeById[id];
}

export function challengeList(): Pick<
  Challenge,
  "id" | "title" | "difficulty" | "blurb"
>[] {
  return challenges.map(({ id, title, difficulty, blurb }) => ({
    id,
    title,
    difficulty,
    blurb,
  }));
}
