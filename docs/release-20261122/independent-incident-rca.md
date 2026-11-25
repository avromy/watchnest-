# Independent bounded incident RCA — 2026-11-22

Scope: read-only security/source review of supplied canonical runtime log excerpts; no database, application, deployment, account or family mutation. Independent reviewer context. No unchanged unit/browser test rerun; existing400-unit/CI100 evidence is preserved without promoting it into hosted acceptance.

## Candidate and authority receipt

- Canonical production source `77a5017d938ded03b1530c2b72978cef27273d61`; src tree `2156dabba6b2553446ef89fe22dcf3d8753f7ab9`; product.ts blob `f3f99b1ff8b8e0563c621d5fe75558523bcd9417`. Deployment supplied by controller: dpl_GiRnmGhHRYnnq16jHEUGyxtjRNac.
- Repaired candidate `0aac62ea0dd42d1f1301d98a4651d8b8f05e7394`; src tree `2911ca7f1e049a1404d00fb9f7af29883b6cc458`; product.ts blob `80d2219d9eea504824ae403372b48efd3282e765`; ChildPlayer.tsx blob `6e20b844086264cfa5394c26f850ccba671192de`.
- Compared committed Git objects, rather than assuming the detached local working tree represented the release.
- Consumed supplied eight app governance files (earlier lane), incident authority-and-preflight.md and current local invocation/run-state receipts. Founder current direction controls: no further account handoff, no publication, no relaxing safety to hide symptoms. Current live universal authority recovery belongs to controller; this lane does not independently certify inaccessible Notion packages.
- Read current Supabase cloud skill0.1.2 in this continuation, applied its auth/key/RLS/invoker/security checklist to source only. Opened current official changelog; visible branch-merge permission/CLI/Flutter changes do not alter this no-mutation source task. No CLI/MCP schema action taken. PostgreSQL official SQLSTATE appendix checked: P0001 is raise_exception, not a unique application root cause. Source: https://www.postgresql.org/docs/current/errcodes-appendix.html ; changelog: https://supabase.com/changelog.md .
- Receipt result: PASS bounded source investigation; unique runtime RCA and release acceptance UNRESOLVED. No specialist visual/physical acceptance claimed.

## What the log fields actually establish

`check(result)` in both source versions logs `{context,code:result.error.code || 'unknown',status:result.status ||503}` and throws `Failure(...,503)`. Therefore a logged status400 is the upstream result status; it does not establish that WatchNest returned HTTP400. The wrapper returns503 for these check failures. Likewise logged unknown503 may mean a missing SQLSTATE, a transport/backend error, or absent status defaulted to503. It does not identify a SQL function or prove a browser exception.

Supplied observations, not independently re-fetched by this lane:

| Canonical event | Bounded interpretation | Still unknown |
|---|---|---|
| POST /api/child/session-access, Nov19 12:08:57.866Z, unknown/503 | A server-side checked operation failed without a recorded SQLSTATE; source path can halt client playback on uncertainty | Exact checked operation, upstream message, actual HTTP response, correlation to reported device crash |
| POST /api/child/progress, Nov15 18:51:23.602Z, P0001/400 | PostgreSQL raised an application exception; source raw-bookmark function contains several intentional security/state exceptions | Exact SQL exception message/function and state transition; whether there was a backend defect versus expected rejection |

## Session-access path: old production differs materially from repaired source

On canonical77, `product.ts:1877-1892` handles POST only. Its `accessView(profile)` is synchronous local sessionAccess plus current server time (`534-536`). After child authentication and rate limit, the endpoint calls `wn_ack_profile_session` with session ID, a bounded revision and playback_active gated by access.allowed. It does **not** call `wn_resolve_profile_session` or a daily-timezone resolver. Therefore attributing this canonical log to the newer daily resolver would be incorrect.

Potential checked operations include child session/profile/parent lookups, device lookup, rate-limit RPC, and final acknowledgement RPC. Metadata maintenance is deliberately skipped for this route. The supplied unknown503 excerpt lacks an operation-specific context/message needed to select among them. `wn_ack_profile_session` itself updates only an unrevoked/unexpired child session and returns whether a row was found; it contains no explicit raise exception in its migration. A false result is currently not treated as an error by check; it also grants no playback authority by itself. No change is proposed on this evidence alone.

Repaired0aac `product.ts:2070-2091` supports GET and POST and calls awaited `accessView`; `593-620` invokes `wn_resolve_profile_session` using server profile ownership, and validates server-resolved daily boundaries. Its resolver failure has explicit context session-resolve, distinct from the generic family-data default. POST then acknowledges with the same bounded gates. This added path needs its own candidate-bound evidence; it is not the code that generated the old canonical log.

## Progress path and intentional atomic rejection

Canonical77 `product.ts:2130-2162` and repaired0aac `2335-2367` both precheck session access, input bounds, currently assigned video, available/embeddable status, fresh metadata and explicit non-Made-for-Kids classification. The repaired version awaits server session resolution. Progress invokes `wn_record_progress` with watched=0; it stores raw functional resume only.

The authoritative raw-bookmark migration `20261001053047_raw_resume_only.sql:9-19` deliberately raises for viewing metrics, invalid raw bookmark, expired/revoked session, archived/missing profile, missing/removed assignment, or unavailable video. The transactional session/assignment/video checks are required even after route prechecks: Parent handoff, revocation, assignment removal or availability change can occur between precheck and RPC. A P0001 may therefore represent correct enforcement under a race. The route already hardcodes watched0 and bounds current/completed, so a normal valid route request makes some input-guard exceptions less likely; this is an inference, not identification of the observed exception.

The code intentionally returns without storage for stale or Made-for-Kids metadata. Do not change that behavior, create watch metrics, remove SQL locks, ignore authorization failures, grant anon/authenticated table access, add SECURITY DEFINER, or retry a rejected bookmark under another identity to make the log disappear.

## User-visible behavior versus a runtime crash

ChildPlayer catches bookmark API failures inside its serialized write, pauses the player, stops active playback and displays the error while mounted. Session revalidation catches errors, pauses/destroys the frame and shows a session-confirmation error. These fail-closed states can look like sudden playback failure to a family; that does not prove an unhandled JavaScript exception or establish these two events caused every reported crash. Provider teardown itself and optional storage were independently reviewed/repaired in the prior lane; no new code mutation is justified by generic log correlation.

The known stage14642501 is a separate, source-and-real-SDK-confirmed auth-client authority contamination mechanism. It is repaired in0aac. It should not be reused as an explanation for these old child-route events: the affected refresh path is Parent authentication, whereas these child paths use fresh service clients. See integrity-20261120/security/session-authority-review.md for the red/green evidence and limits.

## Next safe evidence and disposition

Recover the existing correlated request/function diagnostics, if accessible, using timestamp/deployment/route and operation name, recording only sanitized SQLSTATE/category, upstream status, request correlation and safe operation context. Never persist tokens, secrets, PINs, private content or child viewing telemetry. The exact database error message must remain restricted if it contains identifiers. Operation-specific safe logging would help future classification, but is a separate candidate change and must be reviewed/tested before release.

No additional Founder handoff is requested. The controller reports hosted inspection currently stops at Cloud Vercel sign-in; this lane does not bypass it or certify hosted playback. **No new source defect uniquely established from these two canonical excerpts; historical incident attribution remains unresolved.** Preserve release hold and existing evidence validity; retain safe timer/auth/assignment/metadata behavior. The repaired candidate's400-unit/CI100 checks remain their original evidence categories, not proof that canonical crashes have been reproduced or the physical gates passed.
