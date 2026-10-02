# WatchNest independent security review — 2026-09-30

Reviewed the candidate source independently, including `product.ts`, `product-security.ts`, the catchall API, both migrations, child components, legacy child route redirects, and current security headers. No environment secrets inspected. Source was changing during review; this report describes the snapshot observed at approximately 15:33 UTC. No application files repaired.

## Assessment

No demonstrated critical child-IDOR, cross-family API access, direct anonymous database access, or secret-key exposure was found. Child APIs derive the profile from a hashed opaque session token, check expiry/revocation, and intersect active assignments with household-approved videos. Supplying a sibling profile ID in a URL does not switch identity. Legacy profile URL pages redirect into session-based pages. Passcode-free profiles require their own authenticated parent before opening.

This is a source review and a local database/test run, not verification of deployed Supabase grants, Auth settings, or live YouTube behavior. It does not establish absolute confinement to approved content inside third-party YouTube UI.

## Findings

### Medium — initialize household before email ownership verification

Location: `src/lib/server/product.ts`, `handle` branch `auth/parent`, and `initialize` (around lines 308–332 and 479).

The signup path calls `initialize(result.data.user)` even if Supabase returns a user without a session pending confirmation. `initialize` accepts the returned email as ownership proof and upserts `parents` on email, replacing `auth_user_id` and `family_code`. A caller can submit the public founder email before establishing ownership and mutate a preseeded household's identity/link. Existing-account obfuscation behavior could also produce a failed/rebinding attempt depending on Auth configuration. With email confirmation disabled and an unclaimed founder account, public signup permits immediate founder impersonation; this deployment dependency was not inspected.

Recommendation: initialize only from a verified access-token user with confirmed email, and bind an existing email household once rather than overwriting an existing non-null identity. Test pending-confirmation signup, existing-confirmed-account signup, and attempted rebinding against an established household.

### Medium — asynchronous route failures bypass intended JSON/status handling

Location: `src/lib/server/product.ts`, `handle`, returns at lines 591 and 596.

`return parentRoute(...)` and `return childRoute(...)` occur inside a `try` without awaiting the returned promises. Failures after either async function begins reject outside the surrounding catch. A child requesting a sibling-only/revoked video therefore remains denied, but the promised 403/409 JSON response can instead become framework 500 output. The frontend's unconditional `res.json()` may show a parsing error rather than the actionable denial. Invalid profile/video/collection writes have the same problem. This is fail-closed access control, with broken error behavior rather than unauthorized access.

Recommendation: await both delegates inside the try. Add authenticated handler tests asserting JSON content type and expected 403 for unassigned/sibling-only video, 409 for unavailable video, and 400 for malformed payload.

### Boundary requiring acceptance — YouTube iframe is not an enforceable content allowlist

Location: `src/components/child/ChildPlayer.tsx`, player construction and authorization poll (around lines 172–219 and 225–236).

The player exposes native YouTube controls and uses `rel: 0`. Google's official [player parameter documentation](https://developers.google.com/youtube/player_parameters?hl=en) says this restricts related videos to the same channel rather than disabling them. The end handler destroys the player, which reduces the end-screen opportunity, but native YouTube links/UI remain outside WatchNest server authorization. This is an exposure path to unassigned public content, not a demonstrated sibling database leak. A browser-level live embed test is required before claiming all playback remains exclusive to assignments.

Likewise, removal blocks later WatchNest library/player/progress requests, but the already-authorized public iframe cannot be revoked by the WatchNest server. The normal client polls every 20 seconds and destroys on denial; a modified client can suppress that poll. Document the guarantee as API/library isolation and prompt ordinary-client shutdown, not immediate DRM-style revocation of public YouTube content.

### Low — analytics remain client claims, despite time bounds

Location: `childRoute` progress branch; SQL `wn_record_progress`.

A valid child session can submit a near-end current time and `completed:true` without playing, and can submit elapsed watch seconds while idle. SQL correctly bounds seconds by session elapsed time and serializes updates with a session row lock, but it does not prove playback or constrain position advancement to reported watch time. Multiple simultaneously valid sessions each have their own elapsed budget. Parent analytics should therefore be described as approximate self-reported playback, not verified viewing. This does not grant sibling access or bypass revocation.

## SQL and authentication checks

- RLS is enabled and table privileges revoked from anon/authenticated for every product table in these migrations; the new RPC functions also explicitly revoke PUBLIC/anon/authenticated execution and grant only service role.
- Household composite foreign keys reject cross-family assignment/request/event writes. The historical assignment constraints are `NOT VALID`, so old rows are not certified clean; new writes are enforced.
- `wn_record_progress` locks the child session, rechecks expiry/revocation, checks an active assignment for that exact session child, verifies video availability, and rejects tracking unless made-for-kids is explicitly false.
- No SQL string interpolation of user-controlled input is used in these RPCs. YouTube Data API credentials remain in server-only code and the IFrame API is loaded from the official endpoint.
- POST/PATCH/DELETE requests require exact same origin; auth cookies are HttpOnly, Strict SameSite, and Secure in production. No cross-site write bypass was identified.

## Verification performed and remaining meaningful tests

Ran `npm run test -- --run src/lib/server/product-security.test.ts src/lib/server/product-database.test.ts src/lib/server/product.test.ts`: 3 files, 17 tests passed. Database tests use PGlite with roles and applied SQL, covering FK rejection, RPC grants, progress isolation/bounds, made-for-kids suppression, reassignment denial, and removal cleanup. These checks do not exercise authenticated HTTP requests or deployed Supabase Auth.

Highest-value additional checks:

1. Two households, two independent child cookie jars, exclusive Ari/Benny videos: query library/player/progress with sibling and foreign IDs, assert no metadata leakage and no foreign progress/event writes.
2. Hold a valid player session, reassign/remove the video, then call player/progress; verify JSON 403 and no writes. In a real browser, verify iframe shutdown on the first failed authorization poll, including made-for-kids videos where no progress is sent.
3. Change passcode/disable profile, reuse old child token, and assert denial on every child API; verify an unpinned sibling cannot open without parent authentication.
4. Supabase REST with real anon and authenticated JWTs: attempt every product table and RPC, including token hashes and family codes; all must remain denied.
5. Exercise actual signup/recovery/refresh/logout against staging Auth with confirmation enabled; pending signup must not mutate household identity or rotate the family link.
6. Test concurrent progress writes to the same session and concurrent remove/reassign operations; assert bounded events and that no active assignments remain for a deleted family approval. SQL progress currently checks active assignment but not `family_videos`, so the latter is also a useful database invariant test.

Do not interpret passing existing tests as deployment or beta readiness approval; they leave the authenticated HTTP error path, real Auth identity binding, and iframe confinement unverified.

## Recheck of repaired candidate — 15:47 UTC

Re-read the current files after the implementation changes. The original findings above are retained as the initial review record; the following statuses supersede their outstanding-code status.

| Item | Recheck result | Concrete evidence and limit |
| --- | --- | --- |
| Pending-signup household mutation | Repaired in source | `auth/parent` now initializes only when a session exists, then fetches its user via `auth.getUser`. The regression test returns an unconfirmed user with `session:null` and verifies no product-table access. |
| Overwriting an existing household identity | Repaired in source | `initialize` refuses a different non-null `auth_user_id`; a legacy unbound row is updated only with `auth_user_id IS NULL`. The family code is preserved during linkage. This conditional update also fails closed if linkage changes concurrently. This branch was inspected, not exercised against live Auth. |
| Async delegated route failures | Repaired and locally exercised | Both delegates now use `return await` within `handle`'s try. Authenticated mocked-handler regressions return 403 for unapproved parent deletion and unassigned child player access; parent rejection is verified as JSON. |
| Stale metadata before embed | Guard present and failure locally exercised | The child player refreshes metadata older than one day before returning a playable video. Missing YouTube credentials with stale metadata yields 503 and no `video` response. Source inspection confirms subsequent availability/embed checks. Actual YouTube API refresh success/failure was not live-tested. |
| Historical progress on made-for-kids/unknown content | Suppressed in source and locally exercised | `videos` excludes progress unless `made_for_kids === false`; `childVideoView` separately omits it for true/null/undefined, removes DB row/profile identifiers, and hides metadata/progress older than 30 days. The handler test serves stored historical progress for a now-made-for-kids video and verifies that the child library omits it. |

Re-ran `npm run test -- --run src/lib/server/product-security.test.ts src/lib/server/product-database.test.ts src/lib/server/product.test.ts src/lib/server/product-dispatch.test.ts`: **4 files, 25 tests passed**. The added HTTP-handler tests mock Supabase and cookies; the database checks execute migration SQL in PGlite. This is evidence for the changed local branches, not deployed security.

Remaining live gates are unchanged: verify Supabase email confirmation is enabled and the founder mailbox is controlled (the application does not independently require `email_confirmed_at`); exercise confirmed login/callback/recovery and attempted existing-account rebinding in staging; test exclusive sibling/family access with separate real cookie jars; verify real anon/authenticated REST/RPC denials; and exercise an actual YouTube iframe during removal/reassignment. The iframe confinement/revocation boundary and client-claimed analytics findings remain applicable. No live security or readiness approval is claimed.

## Final implementation hardening after independent recheck

The implementation team added explicit `email_confirmed_at` checks across parent session resolution, initialization, active login/signup, OTP callback and password update. Regression tests deny unconfirmed login and callback with zero household side effects. Authorized requests now purge raw API metadata older than30days and expired search cache entries. Daily cleanup in idle periods still requires deployment configuration. These additions passed the final local suite; actual hosted Auth and retention remain release gates, and this paragraph is implementation evidence rather than independent deployed certification.
