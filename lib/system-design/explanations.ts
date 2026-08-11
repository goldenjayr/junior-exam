import { getComponent } from "./components.ts";
import type { DesignGraph } from "./types.ts";
import {
  SOLUTION_LEVEL_LABELS,
  type SolutionLevel,
} from "./solutions.ts";

/**
 * Educational “why this piece” copy for beginners.
 * Prefer plain language, a concrete analogy, the failure mode without it,
 * and one interview-ready takeaway. Separate paragraphs with blank lines.
 */
export const componentWhy: Record<string, string> = {
  client: `The client is the app on the user’s phone or browser. It’s where the journey starts: someone taps a button, and a request leaves their device toward your servers.

Think of it as the front door of a restaurant. Guests don’t walk into the kitchen — they order at the door. In diagrams, drawing the client first forces you to answer: who talks to us, over what (HTTP, WebSocket), and what they expect back.

Without an explicit client, designs feel abstract. In interviews, start here and narrate the happy path from the user’s screen into the rest of the system.`,

  cdn: `A CDN (Content Delivery Network) is a fleet of cache servers spread around the world. Instead of every user hitting your main data center, they get popular files from a nearby edge location.

Analogy: a bookstore with branches in many cities. Bestsellers sit on local shelves so people don’t wait for a shipment from HQ. Images, JS/CSS bundles, videos, and sometimes cached API responses travel this way.

Without a CDN, users far from your origin feel lag, and your origin servers waste capacity serving the same static bytes repeatedly. Interview tip: mention CDN when the problem is global users, media, or mostly-read public content.`,

  "load-balancer": `A load balancer sits in front of several identical servers and decides which one handles each request. Users still see one address; behind the scenes traffic is spread out.

Think of supermarket checkout: one queue, many cashiers. If one cashier leaves, others keep working. That’s horizontal scale (add machines) plus basic fault tolerance (one machine dying shouldn’t kill the product).

Without it, you’re stuck with a single server — a bottleneck and a single point of failure. In interviews, say “LB → N app instances” whenever you claim the system can scale or survive instance crashes.`,

  "api-gateway": `An API gateway is the shared front door for many backend APIs. Clients talk to one place; the gateway routes to the right service and can enforce cross-cutting rules.

Like a hotel reception desk: guests don’t wander floor to floor looking for keys. Reception checks ID, points them to the right room, and can refuse troublemakers. Gateways often handle routing, auth checks, rate limits, and request logging in one layer.

Without one, every service reimplements the same edge logic and clients must know every internal URL. Interview tip: use a gateway when you have multiple services and want one clean public API surface.`,

  "auth-service": `The auth service answers: “Who is this user, and what are they allowed to do?” It issues and validates tokens/sessions so other services don’t invent their own login systems.

Analogy: a badge office at a company. Once you have a badge, security at each floor trusts it instead of interviewing you again. Central auth keeps password rules, OAuth, MFA, and token expiry consistent.

Without it, identity becomes copy-pasted and insecure. In interviews, separate “prove who you are” from product logic — chat, files, and rides shouldn’t each own passwords.`,

  "chat-service": `The chat service owns messaging business logic: conversations, who can send, delivery rules, and how messages are stored or fan out to recipients.

Think of it as the post office for your product — sorting mail and applying rules — while WebSockets or HTTP are just the trucks that carry letters. Keeping chat logic in one service makes rooms, history, and permissions easier to reason about.

Without a dedicated chat service, messaging rules get tangled into gateways or random workers. Interview tip: separate “transport” (how bytes move) from “domain” (what a message means).`,

  "notification-service": `The notification service sends alerts through push (FCM/APNs), email, SMS, and similar providers. Product features request a notification; this service talks to flaky third parties.

Analogy: a mailroom that ships packages through UPS, FedEx, and local couriers. Your café app shouldn’t block the order button waiting for Apple’s push servers. Retries, templates, and quiet hours live here.

Without it, every feature calls providers directly, timeouts pile up, and delivery policy is inconsistent. Interview tip: notifications are almost always async — queue them off the user request.`,

  "presence-service": `Presence tracks ephemeral state like “online,” “last seen,” or “typing…”. It changes constantly and is usually okay if it’s briefly wrong.

Like a “busy / free” light on an office door — helpful, chatty, and not the same as the locked filing cabinet (your message database). High-churn presence would overload a primary DB if you wrote every keystroke there.

Without a separate presence path, typing indicators and online status hammer your main chat write path. Interview tip: call out that presence is best-effort and often lives in memory (Redis) with short TTLs.`,

  "feed-service": `The feed service builds timelines — “what should this user see next?” — which is a different problem from storing a single post.

Analogy: a newspaper layout desk. Writers create articles (posts); the desk decides which stories land on each reader’s front page. Fan-out (pushing a post into many timelines) or fan-in (pulling from many followees) is its own scaling challenge.

Without a feed service, you either scan the whole social graph on every scroll (too slow) or overload the post-write path. Interview tip: name your fan-out strategy and where timelines are stored/cached.`,

  "matching-service": `The matching service decides pairings — riders to drivers, buyers to sellers, players to lobbies — using rules, location, or scores.

Think of an air-traffic controller: lots of moving pieces, decisions under a time budget, and clear ownership when something goes wrong. Matching is often CPU- and geo-index heavy, so isolating it lets you scale and deploy it independently.

Without it, matching logic hides inside a generic API box and becomes hard to tune. Interview tip: state inputs (location, availability), outputs (assignment), and what happens when no match exists.`,

  "rate-limiter": `A rate limiter caps how many requests a user, IP, or API key can make in a time window. It protects expensive work behind it.

Analogy: a nightclub bouncer with a guest list and a capacity count. Even paying customers get turned away when the room is full — otherwise the whole venue collapses. Limits stop bots, accidental retry storms, and noisy neighbors.

Without rate limiting, one bad client can take down shared databases or third-party quotas. Interview tip: say what you limit (per user / IP), where counters live (usually Redis), and what the client sees (429 + retry-after).`,

  worker: `A worker is a background process that pulls jobs and does slow or retryable work outside the user’s click path.

Like kitchen prep staff: the waiter takes the order quickly, then prep handles chopping and baking. Virus scans, image thumbnails, emails, feed fan-out, and analytics rollups belong here so APIs stay snappy.

Without workers, request threads wait on slow tasks and timeouts spike under load. Interview tip: anything that can take >100–200ms or needs retries is a candidate for async workers.`,

  "websocket-gateway": `A WebSocket gateway keeps long-lived connections open so the server can push updates instantly instead of waiting for the client to poll.

Analogy: a phone call vs sending letters. Polling is “anything new?” every few seconds — wasteful and laggy. WebSockets are a live line for chat messages, driver GPS, or live match status.

Without them, realtime products feel delayed and hammer your HTTP layer with polls. Interview tip: mention sticky sessions or a pub/sub layer so any server instance can reach the right connection.`,

  "message-queue": `A message queue stores jobs between producers and consumers. Producers enqueue work and move on; workers process at their own pace.

Think of a ticket spike at a busy deli: tickets pile in order so the kitchen isn’t crushed by a lunch rush all at once. Queues absorb spikes, decouple services, and enable retries without blocking the original request.

Without a queue, a slow consumer forces the producer to wait or drop work. Interview tip: use queues whenever one step is slower, flakier, or more scalable than the step before it.`,

  cache: `A cache keeps hot data in fast memory (often Redis) so you don’t hit the database for every read.

Analogy: sticky notes of the answers you look up constantly, stuck on your monitor, instead of walking to the archive room each time. Caches trade freshness for speed — data can be slightly stale unless you invalidate carefully.

Without a cache, read-heavy paths melt the database and latency climbs. Interview tip: say what you cache, the TTL/invalidation rule, and what happens on a cache miss.`,

  database: `The database is the durable source of truth for structured data you can’t afford to lose — users, orders, short links, chat history metadata, and so on.

Like a bank vault ledger: slower than sticky notes (cache), but authoritative after a crash. Choose relational (Postgres) when you need strong consistency and joins; consider other stores when access patterns demand it — but beginners should justify Postgres first for most interview problems.

Without a real database, “memory only” designs lose data on restart. Interview tip: name primary entities and which reads/writes must be strongly consistent.`,

  "object-storage": `Object storage (S3-style) holds large blobs: images, videos, PDFs, backups. You store a file and get a URL/key back; metadata usually lives in a normal database.

Analogy: a self-storage warehouse for bulky items, while your apartment (the DB) only keeps the inventory list. Blobs don’t belong as huge rows in Postgres — it’s expensive and awkward.

Without object storage, file features bloat the primary DB and app servers. Interview tip: upload via signed URLs, store metadata in DB, serve downloads through CDN when possible.`,

  monitoring: `Monitoring is metrics, logs, and traces that show what the system is doing — latency, errors, queue depth, CPU, throttle rates.

Like cockpit instruments on a plane. Flying without them means you learn about engine failure from passengers screaming. You need dashboards and alerts before outages become Twitter threads.

Without monitoring, you can’t tune rate limits, catch regressions, or prove SLOs. Interview tip: pick 2–3 golden signals (latency, errors, saturation) for the critical path of the problem.`,

  "search-service": `A search service is built for text relevance: inverted indexes, ranking, typo tolerance, and filters. It’s not the same as SQL \`LIKE\` on a database.

Analogy: a library card catalog vs reading every book to find a word. Databases store truth; search engines store indexes optimized for “find stuff that matches this query fast.”

Without a dedicated search path, query quality and latency suffer as data grows. Interview tip: index asynchronously from the source of truth, and explain how updates eventually become searchable.`,

  analytics: `Analytics collects product and business events — clicks, funnels, retention — usually off the user-facing critical path.

Think of a museum’s security cameras and visitor counters: useful for learning later, but they shouldn’t block the front door. Events often go queue → workers → warehouse/dashboard so dashboards never compete with live traffic.

Without a separate analytics path, counting and reporting slow down core features. Interview tip: say “emit an event, process async” whenever metrics are nice-to-have compared to the user action.`,
};

/** Framing for each challenge × answer tier (shown in aggregate panels / reports). */
export const levelBlurbs: Record<
  string,
  Partial<Record<SolutionLevel, string>>
> = {
  "realtime-chat": {
    simple:
      "Beginner shape: clients reach chat over HTTP + WebSocket, with a queue and a cached database so sending a message doesn’t melt one box.",
    intermediate:
      "More realistic chat: auth, presence, notifications, and monitoring join the core path — closer to how consumer chat apps split responsibilities.",
    advanced:
      "Production-shaped chat: CDN for static/media, workers for heavy fan-out, and analytics off the hot path so messaging stays fast while the business still learns.",
  },
  "url-shortener": {
    simple:
      "Core lesson: redirects are extremely read-heavy. Gateway → cache → database is the minimal path that keeps short-link hops fast.",
    intermediate:
      "Scale & ops layer: CDN and load balancer help global traffic, and monitoring teaches you to watch redirect latency and cache hit rate.",
    advanced:
      "Mature shortener: click analytics move to queue/worker so counting never slows the redirect — a classic “critical path vs side path” split.",
  },
  "news-feed": {
    simple:
      "Feed basics: a feed service plus queue→worker fan-out and a cached database — posting shouldn’t synchronously update every follower.",
    intermediate:
      "Adds CDN and monitoring so media/timeline reads stay fast and you can see fan-out lag.",
    advanced:
      "Adds notifications and analytics so “tell users” and “measure engagement” stay decoupled from timeline writes.",
  },
  "file-storage": {
    simple:
      "Files 101: auth guards access, object storage holds blobs, a DB holds metadata, CDN helps downloads.",
    intermediate:
      "Adds LB, cache, async workers, and monitoring — uploads get processed without blocking the API.",
    advanced:
      "Adds analytics on the worker path so upload/download insights don’t compete with serving bytes.",
  },
  "ride-matching": {
    simple:
      "Realtime matching skeleton: WebSocket updates, queue/worker dispatch, notifications, and a geo-friendly cache.",
    intermediate:
      "Adds monitoring so match latency and failures are visible — critical when “nearby driver” is the product promise.",
    advanced:
      "Adds presence, CDN, and analytics for a fuller mobility-platform shape beyond the matcher alone.",
  },
  "rate-limiter": {
    simple:
      "The protect path: load balancer, limiter, Redis-style counters, and monitoring — the essential pieces of an API shield.",
    intermediate:
      "Inserts an API gateway so edge concerns (routing + limiting) compose cleanly.",
    advanced:
      "Adds CDN and analytics so throttle decisions are observable at product scale, not only in infra metrics.",
  },
  "search-system": {
    simple:
      "Search basics: a dedicated search service, async indexing via queue→worker, and cached hot queries.",
    intermediate:
      "Adds monitoring on the query path so latency and error budgets are visible.",
    advanced:
      "Adds CDN and analytics for a fuller search platform around the index itself.",
  },
  "push-notifications": {
    simple:
      "Push pipeline: API → notification service → queue → workers, with monitoring — never call FCM/APNs inline on the user request.",
    intermediate:
      "Workers also report into monitoring so delivery success/failure is visible end-to-end.",
    advanced:
      "Adds cache/DB for templates & preferences plus analytics for delivery funnels.",
  },
};

/** Challenge-specific teaching text when the generic catalog isn’t specific enough. */
export const challengeComponentWhy: Record<
  string,
  Partial<Record<string, string>>
> = {
  "realtime-chat": {
    "websocket-gateway": `Chat only feels like chat when messages arrive in well under a second. WebSockets keep a live channel to each device so the server can push new messages immediately.

Polling (“any new messages?” every 2 seconds) wastes battery and still feels laggy. For group chat, the gateway accepts the connection; fan-out to many devices usually still needs a queue behind it.

Beginner takeaway: realtime delivery is a transport problem — solve it with persistent connections, not faster REST alone.`,

    "message-queue": `When you send a message to a large group, you shouldn’t make the sender wait while the server writes to thousands of inboxes or sockets. The queue absorbs that fan-out work.

Producers (chat service) drop a job and return quickly; workers deliver at sustainable speed. Spikes from viral groups become backlog, not cascading timeouts.

Beginner takeaway: if one user action can create N units of work, put a queue between “accept the action” and “do all N units.”`,

    "presence-service": `“Online” and “typing…” update constantly and don’t need bank-vault durability. A presence service (often Redis-backed) keeps that chatter off the main message write path.

If every keystroke hit the same database as durable chat history, you’d pay huge write cost for features that can be briefly wrong.

Beginner takeaway: separate durable messages from ephemeral presence — different freshness and reliability needs.`,

    cache: `Recent conversation lists, unread counts, and hot room metadata are read far more often than they’re written. A memory cache makes those reads cheap.

Without it, every app open hammering Postgres for the same threads will show up as DB CPU and slow inbox loads.

Beginner takeaway: cache the read-mostly chat metadata; invalidate or TTL when a new message arrives.`,
  },

  "url-shortener": {
    cache: `A redirect is tiny work that happens an enormous number of times. Hot short codes should resolve from memory first (Redis), then fall back to the database on miss.

If every click hits disk-backed SQL, your database becomes the bottleneck long before CPU on the API does. Popular links are extremely skewed — a few codes get most traffic.

Beginner takeaway: for read-heavy redirects, design cache-hit as the common case, not the exception.`,

    cdn: `Some short-link traffic can be cached at the edge (especially for public, stable redirects). A CDN puts popular answers closer to users worldwide and shields your origin.

Even when the final hop needs your API (analytics, auth-gated links), static assets and some redirect responses still benefit from edge caching.

Beginner takeaway: global “tiny read” products love edge caches — mention CDN when users are worldwide.`,

    analytics: `Product folks want click counts and referrers, but the user only wants the redirect to feel instant. So emit a “clicked” event and process counts asynchronously.

If you UPDATE a counter row on every redirect before returning 302, you couple user latency to write contention. Queue → worker → analytics store keeps the hot path pure.

Beginner takeaway: never let secondary metrics block the primary user action.`,
  },

  "news-feed": {
    worker: `When a celebrity posts, millions of follower timelines may need updating. That fan-out is a background job — workers write timelines after the post is accepted.

Doing it inside the HTTP request would time out and melt writers. Async workers let you throttle, retry, and parallelize fan-out safely.

Beginner takeaway: “post created” is the sync part; “update everyone’s feed” is the async part.`,

    "message-queue": `The queue decouples “someone posted” from “update millions of feeds.” Producers don’t need to know how many workers are online.

During spikes, jobs pile up instead of dropping posts or crashing the API. You can also prioritize (e.g., celebrity fan-out vs normal users) with multiple queues later.

Beginner takeaway: queues turn a thundering herd into a manageable backlog.`,

    cache: `People reopen home feeds constantly. Caching the precomputed timeline (or the top of it) beats assembling from the database on every scroll.

A cache miss can rebuild from DB/storage; a hit returns in milliseconds. Invalidate or refresh when new items arrive for that user.

Beginner takeaway: feeds are read-mostly — cache the timeline artifact, not only individual posts.`,
  },

  "file-storage": {
    "object-storage": `Photos and PDFs are large binary blobs. Object storage is built for that: durable, cheap per-GB, accessed by key/URL.

Postgres is a poor place to stuff multi‑MB files — backups balloon and queries suffer. Keep file bytes in object storage; keep filename, owner, size, and permissions in the database.

Beginner takeaway: blobs in object storage, metadata in DB — classic split.`,

    cdn: `Downloads should usually come from the edge (often via CDN + signed URLs), not stream through your app servers.

App servers are expensive compute; CDNs are good at shipping bytes. Your API’s job is to authorize and hand out a short-lived URL.

Beginner takeaway: authorize centrally, serve bytes from the edge.`,

    "auth-service": `Files are sensitive. Before any upload or download, you must know who the user is and whether they’re allowed to see that object.

Central auth issues tokens; your file API checks them and only then talks to object storage. Skipping this is how private docs leak.

Beginner takeaway: for file products, auth is not optional garnish — it’s part of the critical path.`,

    worker: `Virus scanning, thumbnails, and video transcoding are slow and bursty. Run them in workers after the raw upload lands in object storage.

The user can get a “processing” state quickly; workers update metadata when derivatives are ready. Retries belong here, not in the upload HTTP request.

Beginner takeaway: accept the bytes fast, process the bytes async.`,
  },

  "ride-matching": {
    "matching-service": `Matching riders to nearby drivers is the product brain: geo queries, availability, ETA, and assignment rules under a tight latency budget.

Isolate it so you can scale matching independently from billing, chat, or static website traffic. When matching is slow, the whole experience feels broken.

Beginner takeaway: name matching as its own service when geo + assignment is the core loop.`,

    "websocket-gateway": `Driver location and ride status change continuously. WebSockets (or similar) push updates to phones without constant polling.

Riders see the car move; drivers get “new ride” instantly. Polling every second from millions of phones would crush your HTTP tier.

Beginner takeaway: mobility apps are realtime systems — persistent connections are the default tool.`,

    cache: `“Who’s nearby right now?” needs memory-speed indexes. Caching driver locations / geo buckets in Redis-like stores keeps match latency under a second.

Hitting a disk DB for every location tick won’t keep up. Treat location as hot, short-TTL data with the durable trip record stored separately.

Beginner takeaway: geo matching reads belong in memory; trip history belongs in the database.`,

    "notification-service": `“Ride assigned,” “driver arriving,” and cancellations must reach devices even if the app isn’t open on the map screen. Push notifications handle that.

The matcher shouldn’t block on Apple/Google push APIs. Enqueue a notify job and keep assigning rides.

Beginner takeaway: matching decides; notification delivers the ping — keep them separate.`,
  },

  "rate-limiter": {
    "rate-limiter": `In this challenge, the rate limiter is the product. It must decide allow vs deny before expensive downstream work runs.

Explain the algorithm simply (fixed window, sliding window, or token bucket), what key you limit on (user/API key/IP), and the error response. Beginners often forget to say where the counter lives.

Beginner takeaway: limiting only works if the check is fast, shared across instances, and enforced at the edge of costly work.`,

    cache: `Counters must live in a fast shared store (Redis is the interview default), not in each server’s local memory and not in a disk-bound SQL table.

Local memory disagrees across instances; SQL is too slow for per-request increments at high QPS. Redis INCR + TTL patterns are the usual teaching example.

Beginner takeaway: distributed rate limits need a shared in-memory counter store.`,

    monitoring: `You can’t tune limits safely without seeing allowed vs throttled rates, latency, and which keys are hottest.

Blind limiting either fails open (outages) or fails closed (angry customers). Dashboards tell you whether a 429 spike is an attack or a bad client release.

Beginner takeaway: rate limiting without metrics is guesswork — always pair them.`,
  },

  "search-system": {
    "search-service": `Full-text search needs inverted indexes and ranking — a dedicated search stack (Elasticsearch/OpenSearch/etc. in real life). SQL LIKE won’t cut it at scale.

The search service answers queries; the primary database remains the source of truth for documents. Beginners should say both exist and how they stay in sync.

Beginner takeaway: search is a specialized read model, not a replacement for your DB.`,

    worker: `When documents change, reindexing should happen asynchronously. Writers enqueue “reindex doc X”; workers update the search index.

Blocking a user save on index refresh couples product writes to search cluster health. Eventual consistency (“searchable within a few seconds”) is usually fine.

Beginner takeaway: write to truth first, index second via workers.`,

    "message-queue": `Crawl bursts and bulk updates can create huge indexing storms. A queue buffers those jobs so the search cluster isn’t overwhelmed.

You also get retries when indexing fails. Producers stay simple: “document changed.”

Beginner takeaway: queues protect search infrastructure from spikey indexing workloads.`,

    cache: `Identical popular queries (“best pizza near me”) shouldn’t re-score the whole index every time. Cache the query results with a short TTL.

Invalidate on relevant index updates or accept brief staleness. This is one of the highest-leverage wins for search latency.

Beginner takeaway: cache hot queries; keep TTLs honest about freshness needs.`,
  },

  "push-notifications": {
    "notification-service": `This service owns provider adapters (FCM, APNs, SMS) and policy: templates, quiet hours, locale, and which channel to use.

Product APIs say “tell user X about Y”; the notification service turns that into provider calls. Centralizing avoids every team reinventing push.

Beginner takeaway: one notification brain, many channels — don’t scatter provider SDKs across the codebase.`,

    "message-queue": `Provider APIs are slow and flaky. Never call them inside the user’s HTTP request. Enqueue a delivery job and respond “queued.”

During outages you retry with backoff instead of failing the original action (comment, ride, etc.). Spikes become queue depth, not cascading timeouts.

Beginner takeaway: third-party push = async boundary, always.`,

    worker: `Workers pull notify jobs, call providers, and record success/failure. They implement retries, rate limits toward providers, and dead-letter handling.

This is where you absorb provider throttling without blocking product APIs. Scale workers independently when campaigns blast millions of pushes.

Beginner takeaway: workers are the muscles that talk to FCM/APNs; queues are the inbox.`,

    monitoring: `If you don’t track sent / delivered / bounced / failed, you’re flying blind. Push systems fail quietly from bad tokens and provider outages.

Monitor queue depth, provider error rates, and latency. Alerts should fire before “users aren’t getting codes” becomes a support storm.

Beginner takeaway: delivery metrics are part of the feature, not optional ops garnish.`,
  },
};

export type SolutionExplanationItem = {
  componentId: string;
  label: string;
  why: string;
};

export type SolutionExplanation = {
  level: SolutionLevel;
  levelLabel: string;
  blurb: string;
  items: SolutionExplanationItem[];
};

export function whyForComponent(
  challengeId: string,
  componentId: string
): string {
  return (
    challengeComponentWhy[challengeId]?.[componentId] ??
    componentWhy[componentId] ??
    getComponent(componentId)?.description ??
    "Supports the architecture requirements for this challenge."
  );
}

export function buildSolutionExplanation(
  challengeId: string,
  level: SolutionLevel,
  graph: DesignGraph
): SolutionExplanation {
  const seen = new Set<string>();
  const items: SolutionExplanationItem[] = [];
  for (const node of graph.nodes) {
    if (seen.has(node.componentId)) continue;
    seen.add(node.componentId);
    const def = getComponent(node.componentId);
    items.push({
      componentId: node.componentId,
      label: def?.label ?? node.componentId,
      why: whyForComponent(challengeId, node.componentId),
    });
  }
  items.sort((a, b) => a.label.localeCompare(b.label));

  const blurb =
    levelBlurbs[challengeId]?.[level] ??
    `${SOLUTION_LEVEL_LABELS[level]} reference design for this challenge.`;

  return {
    level,
    levelLabel: SOLUTION_LEVEL_LABELS[level],
    blurb,
    items,
  };
}
