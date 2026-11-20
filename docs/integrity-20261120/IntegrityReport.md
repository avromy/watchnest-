# Integrity incident continuation — November 20, 2026

Founder stopped further sign-in/PIN handoffs and requested an app-wide integrity audit. Continue the same repository, branch and PR49; no redesign or new Builder. This supersedes older next-step instructions asking for Cloud authentication.

## Separate observed environments

Stage application146a672f5b0744a13869dc29983e5942a0d7a233, deployment dpl_6smmoFJWQdRMz4uRzfRqfzjMadKB at https://watchnest-pq53jywae-avromy.vercel.app: actual Vercel error 2026-11-20T17:15:09.590Z GET /api/session, request hphp6-1795194908099-de6573b4aa95, database code42501/status403/context family-data. This is an API/session failure, not independently reproduced browser-process or rendering crash. The generic historical logging context cannot identify the exact SQL statement after the fact.

Canonical live77a5017d938ded03b1530c2b72978cef27273d61 / dpl_GiRnmGhHRYnnq16jHEUGyxtjRNac: earlier actual authenticated Cloud Inbox mounted70iframes before opening Preview. Resource fan-out observed, memory exhaustion/crash causality unproven. Original crash cause remains unresolved. Do not claim both reports have the same cause.

## Reproduced auth mechanism and repair

Independent actual installed Supabase SDK with controlled synthetic HTTP reproduces: calling refreshSession on a service-key client installs an in-memory user token. Subsequent REST requests use that user Bearer even though apikey remains service key. Intended hosted grants allow service_role, not authenticated/anon, on family tables. parent() refreshed and then read parents with the same client: permission42501. Session dispatch swallowed every error and silently fell through to device/anonymous state. This mechanism matches the observed stage error; exact historical request did not log its token-expiry transition, so attribution remains corroborated rather than complete.

Repair isolates refresh on a separate anon-key auth client, retains server role only after verified Founder identity, preserves cookie rotation and every existing permission boundary. No grants/RLS/schema weakened. Session dispatch now propagates operational/unknown errors instead of silently returning role:null; expected auth/availability denials retain fallback. Auth-provider transient errors become503 rather than counterfeit sign-out. ActualSDK red/green regression distinguishes expired credentials, provider outages and database outages.

## Independent wider sweep

A second independent reviewer reproduced Settings Sign out network failure as unhandled browser error 'Failed to fetch', without feedback. Added pending state, duplicate suppression, honest failure alert and retry; only successful response navigates to sign-in. No claim of local/session termination when server cannot confirm. Independent browser regressions cover network failure, HTTP503 and held request.

Existing whole-suite coverage includes Parent dashboard/navigation, requests/preview/approval/assignment, collections/search/profile management, keyboard/touch/tablet/phone widths, child approved library/search/requests, PIN/handoff/isolation, Safe Playback/provider failures, timers/remote shutdown,1/5/10/custom and Daily7AM server rules. These are synthetic/browser and local PostgreSQL integration scopes; they do not certify real family settings, actual YouTube or physical iPad.

Conditional risks from source inspection remain recorded separately in client/INDEPENDENT-CLIENT-AUDIT.md: unvalidated malformed successful JSON, startup requests without an application deadline, ambiguous success followed by failed refresh in generic mutations, and picker failure redirect. No evidence that current server naturally emits the malformed payload; do not label those hypotheses reproduced Founder crashes.

## Hosted and safety limits

Cloud Browser inventory after runtime recovery had zero tabs. No credentials/cookies accessed/transferred, no further login requested, no local Chrome fallback. Previous146 hosted Preview identity/open/close/retry/no-approval observations remain historical to that application source. New auth/error source needs exact-candidate hosted acceptance. Physical-device gate still open. Founder has not waived safety gates; no production promotion/merge or phase2 migration while held. No real family content/timers/settings changed by this audit.

Read-only Supabase history still latest device_profile_handoff20261119042334 / daily_session_allowance20261118192923; no duplicate migrations. Daily scheduler24h sample24runs/0failed is bounded operational evidence only.

## Deterministic continuation

Read docs/RunState.md first, fetch current PR49 head, compare exact application tree and tests. Use unique configured stage URL, not moving branch alias. Finish/freeze independent integrity gates; preserve red receipts. Do all remaining independent work without repeating Founder login. If authenticated hosted/device acceptance remains unavailable, retain precise release HOLD. Autonomous canonical promotion is authorized only after those actual gates pass. Preserve canonical77 rollback and compatible schema; phase2 remains unapplied and must not be applied merely for QA.
