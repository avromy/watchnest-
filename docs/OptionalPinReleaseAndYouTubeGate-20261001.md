# Optional child PIN release and YouTube service gate — 2026-10-01

## Current production authority

- Source commit: `f616c3299594de2e162c54756d1fc0ee31427899`
- Base lineage: `56045d02326ae24d26747bc830b3420a50600c8f` → optional-PIN release `a718100c5f11a4b214ec49f104b96ee5b8b2fa06` → toggle repair `f616c3299594de2e162c54756d1fc0ee31427899`
- Production deployment: `dpl_49PeNFKmmeqynhaF6FBrX6wQWxfz`, READY
- Production alias: https://watchnest-rho.vercel.app
- CI: GitHub Actions run `36862068182`, completed success
- Local candidate checks:156 tests across19 files, TypeScript, ESLint, production build,7 Playwright tests

## Product correction delivered

Child PIN protection is independently configurable per profile. PIN-off profiles open directly from the private family link. PIN-on profiles require the configured6–12 digit credential. Parent Mode remains separately protected. The Parent can enable, disable, change or reset each child PIN. Current live Miri, Ari, Benny and Eli profiles remain PIN-off by default.

A child-login session is an opaque, hashed server session bound to exactly one profile. Child library/player authorization continues to derive the profile from that server session and checks assignment server-side. Client-supplied sibling/profile identifiers do not grant access. PIN hashes remain excluded from API responses and evidence.

## Independent review chronology

Independent review initially FAILed the first release because a supplied replacement PIN overrode an explicit `pin_enabled:false`. The server update order was repaired and regression-tested. Independent retest PASSed the explicit-off case and found no material regression in set/change/reset, PIN-on validation, secret exclusion, exact-profile sessions or sibling assignment enforcement. Do not reuse the initial pre-repair PASS assumptions.

## Google / YouTube state

The existing Google account session is authenticated in the managed browser. Google Cloud Console returned a generic `Site Unavailable — Unable to access this site` page at the root console, direct YouTube Data API library path, alternate developer-console redirect, authenticated dashboard path and Cloud Shell domain. This is not classified as bot detection and no bypass was attempted.

Vercel Project and Shared environment-variable searches both confirm no `YOUTUBE_API_KEY` exists. No secret was created, viewed, copied or documented. The app therefore cannot yet complete real search, URL metadata, approval/assignment/playback, Made-for-Kids verification or populated-library acceptance.

## Exact continuation

External Google Cloud access is now the first unfinished deterministic action. Once accessible: create/select the private WatchNest project; enable YouTube Data API v3; create and appropriately restrict a server-side key; add it as private `YOUTUBE_API_KEY` in WatchNest Production; redeploy; verify it is server-only; then execute real search, URL import, approval/assignment, sibling isolation, playback/escape paths, Made-for-Kids behavior, responsive/iPad and final independent acceptance.

Status: `WATCHNEST_HARD_BLOCKED — EXTERNAL FOUNDER ACTION REQUIRED`.
