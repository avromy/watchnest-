# Independent security resume — 2026-09-30

Candidate reviewed: `8bc07527dbe5eac5e4c194aaa327b5a36440f690`, with new tests/report only. Product implementation and migrations preserved. This is an independent inspection of actual source, not a restatement of the earlier security report. No deployed certification is issued.

## Scope and evidence classes

Inspected catch-all API dispatch, actual `product.ts` auth/session/ownership/metadata routes, crypto helpers, both SQL migrations, legacy redirect pages, child player polling, password-recovery page, Supabase server factories and application CSP. Read the Supabase skill and security checklist. The markdown changelog fetch failed in the web tool; current official changelog index and Auth documentation were retrieved through search. No implementation or schema change was made.

- **Source:** confirmed parent authorization uses provider `getUser`, founder-email allowlist and `email_confirmed_at`, then lookup by immutable auth user ID. Pending signup cannot initialize without a verified session. Legacy email binding refuses a conflicting existing auth ID and uses a conditional null-owner update. Child authorization is an opaque 256-bit cookie hashed in the database; every request rechecks expiry/revocation and nonarchived profile. Parent/child cookies are HttpOnly, Strict SameSite and Secure in production. Mutations require exact request-origin equality and reject cross-site fetch metadata. Secret service keys remain server environment values, not public UI imports.
- **Actual route handler with mocked Auth/database:** new tests execute `handle` with synthetic cookie/query results. This verifies control flow and forwarded ownership fields, not provider semantics, actual PostgREST query filtering, mail delivery or real cookies.
- **Actual PostgreSQL engine:** new PGlite tests execute both migrations, grant/revoke statements and RPC bodies. This is PostgreSQL-in-WASM, not a connected Supabase project. Only unavailable pgcrypto setup/default are substituted; security SQL is unchanged. This verifies SQL execution/privileges but not PostgREST exposure, hosted Auth, advisors, extensions or deployment configuration.
- **Unexecuted:** live founder sign-in/signup/confirmation, recovery email delivery/token consumption, refresh rotation, revoked parent-session behavior, configured REST/RPC access, two real household/cookie jars, browser-cookie transport, actual YouTube playback/removal and infrastructure secrets/schedulers. No credentials/project were available.

## Findings

### SEC-R1 — Medium availability: anonymous global auth throttle also blocks logout

`handle` applies the single `public-auth-global` bucket (150 requests per 60 seconds) to every `auth/*` route before branch validation. Anonymous `GET /api/auth/children?family=x` consumes this budget even though the invalid family string immediately returns 400. No legitimate family secret, PIN, authenticated account or Origin header is required for that GET. All users share the bucket, including parent login, callback, child sign-in and logout.

The actual-handler tests prove an invalid anonymous family GET reaches that global rate-limit RPC before rejection, and that a depleted bucket returns 429 for a legitimate same-origin logout without clearing any session cookie. The existing actual-PostgreSQL rate-limit test independently confirms atomic increments and exhaustion. Thus an anonymous caller can deny new authentication and browser logout for the remainder of each fixed window; sustained repetition can keep disrupting these operations. This is availability/session-exit interference, not account takeover or an authorization bypass.

Minimum fix: do not put logout behind the anonymous aggregate limiter; maintain its Origin protection and perform local cookie clearing even when provider revocation has a reported transient failure, with accurate failure semantics. Partition public abuse protection using a trustworthy edge/network signal or enforce it upstream, keep per-account/per-child limits, and retain any aggregate resource safety cap without allowing cheap invalid lookups to exhaust critical session-exit paths. Do not trust arbitrary forwarded-IP headers without a verified proxy contract. Verify exhausted-budget logout/login behavior after fixing.

### SEC-R2 — Low defense-in-depth: progress RPC lacks metadata freshness check

The HTTP progress path rejects stale, null and future timestamps before calling `wn_record_progress`. The SQL RPC independently checks live session, active profile, assignment, availability/embeddability and explicit `made_for_kids=false`, but does **not** check `metadata_last_checked_at`. Actual PostgreSQL tests using `SET ROLE service_role` demonstrate that each of two-day-old, null and two-day-future timestamps still creates a progress row and a viewing event. Actual-handler mock tests demonstrate the same timestamp states return `trackingDisabled:true` without any progress RPC.

This is not a public-client exploit: anon/authenticated have no table or RPC access, and current HTTP control flow fails closed. It matters for future server callers, privileged background tasks or freshness changes between route validation and RPC execution. The database is advertised as the final integrity boundary, so the audience/freshness policy should be enforced there too.

Minimum fix: inside the progress transaction, require a nonnull check timestamp in the past and less than one day old before storing progress/events. Consider a shared lock on the video row so its eligibility cannot change while the RPC writes. Keep the independent route gate. Add fail-closed database regression assertions after implementation.

## Verified boundaries and limitations

The new independent tests prove direct anon/authenticated SELECT/DELETE denials across all 14 product tables and EXECUTE denials for all five privileged RPCs. The invoker RPCs have explicit service-only grants; there are no new definer functions/views. Actual PostgreSQL tests confirm true/unknown MFK statuses create neither history nor viewing events, and revoked/expired child sessions and archived profiles cannot record. Existing SQL tests verify cross-family FK restrictions, assignment deduplication and assignment removal denial.

Actual-handler tests reject missing/foreign Origin and cross-site metadata before privileged operations, ignore forged profile/household/session fields in a progress body, derive session ownership from the cookie, reject unassigned videos, reject child cookies at parent routes, and reject wrong-email/unconfirmed parents. Responses are no-store. Existing actual-handler tests suppress persisted child history following an MFK change and fail closed if stale playback metadata cannot refresh.

Parent logout calls provider local sign-out but ignores its returned error. Exact revoked-parent access-token behavior is **not** certified from mocks: official documentation distinguishes JWT expiry from session revocation and currently describes `getUser` as the server-side session check. Test real copied-token behavior after logout/password recovery on the configured provider before claiming immediate parent revocation. No session-ID denial test is passed off as provider evidence.

YouTube remains an external player, not a tamper-proof approved-only media sandbox. Source rechecks assignment every 20 seconds and destroys the iframe on denial, so authorization revocation is bounded/polled, not instantaneous. Existing child playback can continue until the poll; copied YouTube IDs cannot be revoked by WatchNest. CSP permits the provider frames/scripts and explicitly discloses provider links/recommendations. Actual iframe behavior remains a live test.

Watch totals are bounded by server elapsed time/60-second increments and locked child-session updates, but playback position/completion are child-client claims; no trusted proof of watching is supplied. Neither those controls nor this review certify real viewing or enforce screen-time limits.

## Original-candidate reproducible results

- Added `src/lib/server/independent-route-resume.test.ts` (16 actual-handler mocked tests).
- Added `src/lib/server/independent-security-resume.test.ts` (10 actual-PostgreSQL tests, including three passing reproductions of the freshness gap).
- `npx vitest run`: **15 test files passed; 107 tests passed**.
- `npm run typecheck`: **passed**.
- Independent subset: **2 files / 26 tests passed**.

At original review, finding reproduction tests intentionally asserted the vulnerable behavior; their passing status did not mean the findings were repaired. This lane did not change product source or SQL. No live migration, deployed request, real email, production secret or unrelated infrastructure operation was attempted. The subsequent section records independently verified repairs and updated regression expectations.

Disposition: source authorization boundaries are substantially supported by these tests; retain SEC-R1 remediation and the listed real-provider/deployment gates before security/readiness approval. SEC-R2 is defense-in-depth hardening, not evidence of current public RPC access.

Official references consulted: https://supabase.com/changelog?types=breaking-change ; https://supabase.com/docs/guides/auth/signout ; https://supabase.com/docs/guides/auth/sessions ; https://supabase.com/docs/guides/auth/server-side/advanced-guide .

## Post-repair independent verification — 2026-09-30

The implementation owner supplied repairs in `src/lib/server/product.ts` and a new CLI-generated migration `supabase/migrations/20260930235307_progress_metadata_freshness.sql`. Independently inspected both exact files and reexecuted tests. This is the repaired working tree based on the original SHA; a final committed SHA remains the implementation owner's release receipt.

**SEC-R1 repaired in source.** The shared anonymous-global limiter is removed. Logout executes before network/account limiter gates and always clears all three cookies in `finally`, including absent configuration, child-session database failure, and parent-provider sign-out failure. Provider failure returns 503 instead of success. Exact-Origin/cross-site rejection still precedes logout. On Vercel only, public auth budgets are partitioned by a hashed `x-vercel-forwarded-for` value; arbitrary ordinary forwarded headers are ignored. Non-Vercel hosts ignore even a caller-supplied platform header and retain existing account/profile limits, with verified upstream protection still a deployment gate. This review proves source header selection/partitioning, not deployed overwrite behavior or denial-of-service resistance against distributed networks. Shared-network users may still share a login budget; logout is exempt.

Added actual-handler regressions prove: invalid anonymous lookup no longer reaches a shared global RPC; logout cannot be blocked by depleted network budgets; successful/logout-error/no-config outcomes all clear local cookies; cross-origin logout cannot clear them; two platform network identities generate different opaque rate keys; Vercel network exhaustion returns 429 for discovery but not logout; non-Vercel ignores forged platform/forwarded headers. Remote revocation failure still means copied external sessions may not have been revoked; local clearing must not be described as provider-side certification.

**SEC-R2 repaired in SQL.** The new migration redefines the invoker RPC with a shared lock on the video row and a nonnull, not-future, strictly newer-than-one-day timestamp check before progress/events. Its existing session/assignment/MFK checks remain intact, and service-only EXECUTE restrictions are restated. No old rows are deleted. Independently applied all three migrations to PGlite and changed the stale/null/future reproductions into denial regressions. Added the exact one-day boundary, fresh explicit-false positive control, and stale-attempt preservation of previously saved history. All pass. Table and RPC anon/authenticated denial tests continue to pass with the replacement function.

Post-repair results:

- Independent handler file: **22 tests passed**, using mocked Auth/database and real handler.
- Independent PostgreSQL file: **13 tests passed**, executing actual migration SQL in PGlite.
- Full `npx vitest run`: **15 files / 116 tests passed**.
- `npm run typecheck`: **passed**.

The original 26-test/107-test evidence above remains a historical finding receipt; current files contain 35 independent regression tests with repaired expectations. No new source authorization bypass was identified in the repaired candidate. Security disposition: both objective source findings are addressed and regression-supported. **No deployed security/readiness approval**: live Auth/recovery/revocation, platform-header overwrite, migrated hosted permissions/advisors, private two-household sessions and real YouTube browser behavior remain unexecuted gates. No WatchNest Supabase project has been created or certified by this reviewer.

## Additional dashboard eligibility review — 2026-09-30

Independently inspected the owner-supplied dashboard repair and `dashboard-policy.test.ts`, then added `independent-dashboard-resume.test.ts` with ten additional actual-handler mocked-database regressions. No product edits by this lane.

The historical aggregate now derives eligible IDs from the authenticated household's current approval rows and requires explicit non-MFK status, metadata freshness within one day, available status and embeddability. The same filtered event set feeds today/week totals, daily series, per-child totals/recent lists and popular-video reporting. `neverWatched` uses the same eligibility set. The earlier behavior retained historical totals after an audience-status change; current source suppresses those totals without pretending to delete old rows. Suppression is not certified as a legally sufficient retention/deletion policy.

Independent tests cover MFK true/unknown, null/stale/future metadata, unavailable videos, nonembeddable/unknown embedding and removed approval. In every case all historical aggregate/recent/popular outputs are suppressed, while pending WatchNest requests remain available. A positive test confirms fresh explicit-false reporting still works and records actual query predicates: parent identity is selected by verified Auth ID; profiles, approval rows, assignments, viewing events, requests and collections are scoped to that derived parent ID; lifetime progress is scoped to its active profile IDs. A forged URL `parentId` never enters those queries. Query spies verify handler construction, not a live second household or hosted query execution.

The new workflow object counts approval rows, assignment rows, active profile rows and pending request rows. It does not use event seconds, player timers, clicks or a hidden substitute engagement metric. Eligibility changes do not suppress these application-owned workflow counts, consistent with the bounded implementation request. This reviewer makes **no YouTube policy interpretation, legal-compliance or deployment claim**, and does not certify workflow labels as provider-approved.

Dashboard subset: **2 files / 15 tests passed** (five owner tests plus ten independent tests). Full suite after dashboard repair: **17 files / 131 tests passed**. Typecheck passed. Independent test inventory now contains **45 tests** across route/SQL/dashboard files. Remaining deployed/Auth/platform/player gates above are unchanged.

## Additional maintenance inspection — 2026-10-01

Independently inspected owner-supplied `20260930235928_metadata_retention_maintenance.sql`, `supabase/operations/enable_metadata_cron.sql` and `docs/MetadataOperations.md`. Added `independent-maintenance-resume.test.ts`; this lane did not mutate product code, SQL, any hosted database or scheduler.

The sixth privileged RPC is invoker/service-only, has a fixed public search path and explicit public/anon/authenticated EXECUTE revocations. It clears third-party descriptive payloads and status/freshness fields at the inclusive 29-day boundary and for null/future timestamps while retaining the video registry UUID and YouTube identifier. It deletes expired search-cache rows, rate-limit windows at least two days old and expired/revoked child sessions at least one day old. Parent-owned approval rows, tags, assignments, collections and requests are outside its writes.

The new PGlite fixture applies **all four migration files in chronological order**. The only substitutions remove unavailable pgcrypto installation and replace its random-byte family-code default with test-only random UUID generation; maintenance/grant/function SQL is unmodified. The exact 29-day fixture and first maintenance invocation share a transaction so `now()` is stable at the inclusive boundary. Service-role invocation succeeds; anon and authenticated invocation are denied by actual PostgreSQL permissions.

Seven actual-PostgreSQL tests verify 29-day/null/future payload purge; preservation of fresh and 28-day API payloads and unexpired cache; preservation of approval identifiers/tags, assignments, collections and requests; expired cache/old limits/old sessions cleanup without deleting recent expired/revoked sessions; both public-client role denials; and repeat-call idempotence for approvals/collections. A fixture typo initially caused setup failure; it was corrected before results below. No product defect was exposed by this subset.

The separate schedule script uses named `cron.schedule` at minute 17 each hour and an immediate maintenance invocation; its rollback is named `cron.unschedule`, not dropping the extension or unrelated jobs. It is **prepared only**. No pg_cron extension, job registration, hosted run, job-history inspection, paused-database behavior or alerting was executed here. PostgreSQL maintenance correctness does not demonstrate continuous scheduler operation or certify provider/legal retention compliance. Request-path masking and playback freshness checks are independently fail-closed; they are not deletion receipts for dormant data. Existing old third-party backups/caches outside these tables remain an operational verification scope.

Maintenance subset: **1 file / 7 tests passed**. Full suite with maintenance: **18 files / 138 tests passed**. Typecheck passed. Independent inventory now totals **52 tests** across four files. All live migration/scheduler/provider/deployment gates remain open.
