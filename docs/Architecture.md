# Architecture — current implementation, 2026-09-30

Next.js 16 / React 19 App Router under `src/app`, Supabase Postgres/Auth, official YouTube Data and IFrame APIs, intended Vercel hosting. Previous architecture is recoverable in git history before this checkpoint. Root `app/` scaffold was removed to make `src/app` authoritative.

## Trust boundaries

`src/app/api/[...path]/route.ts` dispatches to server-only `src/lib/server/product.ts`. Supabase service role and YouTube key never enter browser bundles. Every parent call verifies its Supabase user and resolves its household. Every child call resolves an opaque, hashed database session, then scopes queries to the session profile and household. Route profile identifiers do not select the active child. Mutations require same-origin requests. Invalid/unconfigured state fails closed.

A household is represented by a parent row linked to a verified Founder Auth user for this private beta. Optional child PINs use salted scrypt; distributed rate limits and 24-hour HttpOnly/Secure production/SameSite Strict child cookies protect sessions. Parent login uses Supabase password auth and refresh tokens. Starting a child session removes parent browser cookies; switching back requires parent authentication. The Parent can turn PIN protection on or off per profile. A PIN-off profile opens from the private family link without a PIN. The resulting opaque child session is still bound server-side to exactly one profile, and every library/player query derives authorization from that session rather than a client-supplied profile ID.

All tables enable RLS; anon/authenticated roles receive no direct table or privileged RPC grants. Server service-role operations must enforce family/profile membership explicitly. Atomic service-role-only RPCs approve, assign, remove, record progress and rate limit. Tests exercise PostgreSQL constraints and role denial in PGlite; production Supabase remains a release gate.

## Product flows

Parent metadata lookup/search → individual preview/selection → approve and assign atomic persistence. No automatic channel/playlist approval. Collections group existing individually approved videos. Child requests contain bounded text; only a parent can resolve them via YouTube search. Parent dashboard reports eligible viewing, requests and library attention.

Child home fetches session-bound assignments and locally searches approved metadata. Player API checks household, assignment, availability and embeddability before returning a public YouTube identifier. Missing/older-24h metadata is refreshed before playback; failure denies playback. Client rechecks authorization every 20 seconds and destroys the iframe on denial. Revocation does not control YouTube outside WatchNest and is not instantaneous inside an already loaded iframe.

Progress records incremental played time rather than seeks/hidden time, checks current assignments in SQL, and restores incomplete eligible videos. Made-for-kids or unknown classification suppresses telemetry/resume and historical progress in responses. Ended playback destroys the iframe and offers WatchNest's approved next video. On this project, Safe Playback is a server-owned, Parent-only household setting, default on. It attaches a navigation-restricting sandbox before child iframe playback loads while preserving official player rendering and controls; it is independent of content authorization.

## Operations

No sample-data imports remain in active app/components. Legacy helpers/fixtures are retained for historical tests, never fallback production libraries. See Recovery for exact external setup, live release gates, retention scheduling, and secure access setup. No working product URL or real child credentials exist at this checkpoint.
