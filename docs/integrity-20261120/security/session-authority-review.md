# Independent session authority investigation and repair review

Evidence: SOURCE / AUTOMATED REAL-SDK WITH CONTROLLED TRANSPORT. No hosted authentication, database mutation, grants, deployment, or publication performed. Separate reviewer context from the production implementer. This is one integrity-audit lane, not full-app or release acceptance.

## Exact candidate

Baseline worktree HEAD: `36e8b68325202a25c3466ee3eb1c501d6b12d0de`; baseline source tree `464c41e300e38b9c34cb4f6603f4f2019e4141c4`.

Independently tested repaired working source tree: `2911ca7f1e049a1404d00fb9f7af29883b6cc458` (temporary isolated Git index, actual index untouched).

| File | Tested Git blob |
|---|---|
| src/lib/server/product.ts | 80d2219d9eea504824ae403372b48efd3282e765 |
| src/lib/server/session-authority-sdk.test.ts | bd5cca6eb71a2b352e76614d5a73104f6a247e16 |

Controller changes elsewhere may move the whole tree identity; the file hashes bound this lane. A material change to these files requires affected re-review. Prior incident source/security reviews remain independently scoped to their recorded candidates.

## Confirmed mechanism

The original `parent()` created a service-role Supabase client, called `client.auth.refreshSession()` when the parent access token failed verification, then queried `parents` on that same client. Refreshing installs the returned user session into the SDK's in-memory auth state. `persistSession:false` disables persistent storage, not that state.

Installed supabase-js `SupabaseClient.ts:327,533-542` uses `_getAccessToken()` for REST fetches; it selects the auth session's access token before falling back to the service key. auth-js `_callRefreshToken()` stores the session before returning. Consequently, after refresh, REST requests carry **user Bearer authorization with the service key still in the apikey header**. The apikey does not restore service authority. A controlled real-SDK reproduction observed service authorization before refresh and user authorization afterward.

The secure schema intentionally revokes table access from anon/authenticated and grants it to service_role (`supabase/migrations/20260930192030_secure_family_product.sql:15`; device tables follow the same pattern in `20261002035922_household_device_ux.sql:59-60`). The resulting parents query is denied with PostgreSQL `42501`, HTTP403, which `check()` logs as context family-data and turns into dependency Failure503. These grants must remain unchanged.

The `/api/session` role probes originally caught every error, including this dependency failure, and continued to child/device/anonymous fallback. It could therefore report device or null despite a valid refreshed Founder identity. A separate transient auth provider error was also collapsed to credential Failure401 by `parent()` and then silently downgraded by session probing.

The same refresh-on-service-client defect is present in old production commit `77a5017d938ded03b1530c2b72978cef27273d61`, independently inspected with `git show`. This establishes historical source exposure, **not attribution of every reported production crash**. The supplied stage log at 2026-11-20T17:15:09.590Z has the matching 42501/403/family-data signature; an end-to-end hosted refresh trace was not observed by this reviewer.

## Security-preserving repair reviewed

The production implementer now performs refresh on a distinct anon-key auth client while retaining the original service client exclusively for verified server-authorized family access. It still verifies returned access credentials through `getUser`, checks confirmed Founder identity, rotates HttpOnly cookies, and scopes the parent lookup by verified auth_user_id. Service authority is never sent to the browser or introduced into a client-side component.

`parent()` distinguishes transient auth status0/missing-status or >=500 failures as sanitized503, including refresh and post-refresh verification failures. Expired/invalid credentials continue through the established401 path. Session role probes now rethrow dependency failures and unknown exceptions while preserving fallback for expected authorization failures. A dependency outage therefore remains an error, not evidence the user signed out.

The diff changes no SQL grants, RLS, family ownership checks, parent-mode/device binding, child handoff authorization, origin enforcement, rate limits, child playback containment, or analytics policy. No new permission or authentication bypass was introduced.

## Regression evidence

New `session-authority-sdk.test.ts` keeps actual supabase-js/auth-js implementations and controls only transport and cookie fixtures. Synthetic credentials and `.invalid` origins are used; no network request reaches hosted services. REST fixtures enforce existing service-only table access instead of pretending every request has elevated authorization.

1. Expired parent access token + valid refresh retains parent role, rotates cookies, and uses service Bearer authorization on **every** family REST request.
2. Verified identity + database outage returns503 with sanitized error and no role downgrade.
3. Auth provider503 returns503 with sanitized error and no role downgrade.
4. Auth network failure returns503 with sanitized error and no role downgrade.

RED baseline: copied baseline product source into an isolated scratch checkout; **4/4 failed** in538ms. The first test reproduced `[watchnest-data] operation failed {context:'family-data',code:'42501',status:403}` and returned device instead of parent. Database/auth outage cases returned200 instead of503. The real worktree's production file was not replaced.

Intermediate repair: auth isolation + database propagation fixed first2 tests, while newly added auth outage cases still failed. This exposed the second classification gap before final review.

GREEN independently executed on the repaired file hashes above: **4/4 passed**, exit0, duration556ms. `git diff --check` passed. The controller separately reported400 unit tests passing; that wider run is controller evidence, not independently executed by this lane. No shared browser/build operation was started by this reviewer.

## Scoped disposition

**PASS for the reviewed session authority and dependency-failure repair.** The source mechanism and actual-SDK regression are established without widening database permissions. No remaining defect identified in this bounded repaired path. Invalid-token/Founder mismatch/device and child isolation continue to require the controller's broader existing security regressions.

The reported stage symptom is consistent with this confirmed defect, but hosted authenticated refresh, current production behavior, actual provider playback, physical-device gates, and full-app integrity remain unaccepted by this report. Keep the release hold until the coordinating audit completes its candidate-bound checks. No additional Founder login handoff is warranted by these local findings.
