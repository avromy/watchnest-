# WatchNest

A private family video library: **Only the videos I approve. Nothing else.** WatchNest navigation, search, and playback authorization include only individually assigned videos. YouTube controls its own embedded surfaces; see the platform limits below.

## Current status

Production-build implementation checkpoint, **not a deployed family-ready release**. Resume with [Recovery](docs/Recovery-20260930.md). Live Supabase, YouTube access, deployment, real family accounts, and live acceptance remain outstanding. Historical scaffold code and seed fixtures are not live accounts.

Parent: protected sign-in, YouTube search/URL lookup, previews, individual approval, bulk assignment, library maintenance, collections, four child profiles, Inbox and eligible-video viewing insights.

Child: personal passcode or parent-authorized shared-device entry, Simple/Standard modes, own assigned library, local search, Shows, requests, authorized player, eligible progress/resume and approved Next Up.

## Development

Node 24 recommended. `npm ci`, copy `.env.example` to `.env.local`, configure secrets through deployment settings, then `npm run dev`. Never commit credentials. Apply **all five migrations** in timestamp order to a dedicated Supabase project; see [Schema](docs/DatabaseSchema.md). **Do not apply `supabase/seed.sql` to production**. Only the verified Founder sign-in creates the locked family profiles. Metadata scheduling is a separate verified release action, not implied by applying SQL.

Checks: `npm run lint`, `npm run typecheck`, `npm run test -- --run`, `npm run build`, `npm run test:e2e`. Browser tests require a production build. Synthetic UI tests are explicitly separate from real HTTP fail-closed checks and database integration tests.

## Boundaries

Server-only YouTube API keys and metadata. No audiovisual downloading/proxying/restreaming. Child library identity comes from the server session, never a route-selected profile. Database client roles have no direct table/RPC access; authorization runs through server APIs. See [Architecture](docs/Architecture.md), [Schema](docs/DatabaseSchema.md), and [Security review](docs/SecurityReview-20260930.md).

## YouTube reality

Official embeds retain native branding, links, menus, ads and possible same-channel suggestions (`rel=0` does not eliminate them). WatchNest cannot promise that YouTube-controlled click paths are contained. Made-for-kids or unknown-status videos conservatively disable per-child viewing telemetry and resume. Actual pause/end/fullscreen/PiP/external paths and iPad Safari still require live testing. [Research and decisions](docs/ProductResearch-20260930.md).
