# Independent security repair review — bounded SOURCE / local SQL verdict

Reviewer: separate `profile_handoff_security` context. Root is the sole implementation/release owner; this reviewer wrote no implementation, UI, migration or shared test changes. Prior investigation remains separately preserved in `ProfileHandoffSecurityInvestigation-20261119.md`. This review is independent technical/security review, **not** a cold visual/Stranger review.

**Verdict: PASS within the inspected source and local behavioral scope below.** No material bypass was found in this repair. Hosted migration/config/auth and real-device acceptance remain separate OPEN gates. Neither stage nor canonical production is certified by this document alone.

## Exact inspected candidate

Uncommitted repair based on remote `43c2ae8f48a3a7515c47436258658a78db3949b0` / prior app306. Bind any later committed candidate only after verifying these implementation bytes (or independently reviewing differences).

| Path | SHA256 |
|---|---|
| src/lib/server/product.ts | 8cb34d582b35bea26b2885c14de733f3c2a36bc73892cebbe6f45d0a0996e74f |
| src/components/child/ChildLogin.tsx | 0fc31a6b4abdcba38d31e43b7b4ca21aa26de634c643eb0721e590a9bf209202 |
| src/app/privacy/page.tsx | 2f5172f8299dcbe5acac39ff24140d8fc574cae836e8e44668f63e26508e8178 |
| supabase/migrations/20261119034107_device_profile_handoff.sql | bd1ea94795d494f298405850b1601c1c74a924c9efa80fef1b69c3e09532012a |
| src/lib/server/profile-handoff-route.test.ts | 0dbf136ee1e80e84b095c8a9b5334152d0a9cb3d3ad79c1e8a9250ecf76cb5f4 |
| src/lib/server/profile-handoff-database.test.ts | d3c391b42f8c554f8b4df39a6635f03ab6ed05e39875861ef14629bf05fdabe4 |

Authority: latest Founder requirement; all eight WatchNest governance files; App Dev instructions; recovered current RunState/TimerDailyHostedOutcome and independent investigation. Product Intelligence was consumed and applied as a scoped failure-classification/generalization lens; this is no claim of broader brand/visual or product-release acceptance.

## Actual independent verification

Executed against the inspected local repair:

```sh
npx vitest run src/lib/server/profile-handoff-route.test.ts src/lib/server/profile-handoff-database.test.ts src/lib/server/independent-security-resume.test.ts src/lib/server/independent-route-resume.test.ts
```

Actual result: **4 files / 88 tests PASS**, exit0; started22:46:00UTC, duration1.78seconds. This reviewer executed rather than merely reading Root's result. Existing independent security/route regression files were included. Supabase Auth/route tests use synthetic mocked DB/Auth; the SQL test file executes real PostgreSQL semantics in local PGlite. The service is not a deployed HTTP test, concurrent native PostgreSQL stress test or physical media observation. Npm's `Unknown env config http-proxy` warning was present and did not fail the run.

Also executed an independently authored local PGlite probe using the exact migration and a new synthetic minimal parent/profile/device/session schema. **9 checks PASS**:

1. Actual SQL `p_parent_authorized=NULL` cannot change A→B.
2. Actual NULL Parent authority cannot use `p_bypass_child_pin=true` for A.
3. NULL `p_expected_pin_enabled` rejects against actual non-null profile state even with Parent authority.
4. NULL expiry rejects.
5. Empty token rejects.
6. NULL token rejects.
7. Actual `SET ROLE anon` invocation raises permission denied.
8. Actual `SET ROLE authenticated` invocation raises permission denied.
9. Every rejected call leaves the original A binding and zero inserted Child sessions.

Probe used two synthetic profiles and one device; no hosted query, credential or family mutation. First six calls directly invoked the ten-argument RPC with the stated NULL/empty value, valid matching Parent hash where applicable, future server expiry otherwise, and no default-helper substitution. The two role checks attempted Parent-authorized/bypass=true switch calls, ensuring denial is actual EXECUTE protection rather than only `has_function_privilege` metadata. This supplements rather than replaces the18-case implementation SQL suite.

## Finite reviewed authorization surface

| Area | Finding |
|---|---|
| Durable identity | Device `active_profile_id` is server stored and is not cleared by profile-exit or Parent-lock. Missing Child cookie, fresh picker or refresh cannot manufacture an unbound identity. Null/unbound devices require Parent. |
| Same-profile routine entry | Optional Child PIN remains enforced when no deliberate Parent authority is supplied. Admission never clears the target's Parent block or modifies its timer. |
| Target-specific handoff | Route verifies supplied Parent PIN using the existing shared `parent-mode:<device>` rate bucket. A wrong supplied Parent PIN rejects before admission rather than falling back. Sibling Child PIN or injected authorization/bypass request fields cannot confer Parent authority. |
| Existing Parent authority | Fallback calls real `parent()`; Parent Mode remains bound to its live device and full Parent credentials are verified through existing Auth/founder checks. Returned Parent id must match the enrolled device family. No caller flag is forwarded as authority. |
| Family links | Admission always validates `device()`, even with a family code. A retained code must match the device family. A link cannot mint/re-enroll a device or bypass the identity gate. Anonymous profile metadata lookup is not playback/session authority. |
| Per-request Child identity | `child()` validates session token/live profile and live device, exact `session.device_id`, device parent ownership and active-profile equality before any Child route. All API Child dispatch uses this helper; old profile-id routes redirect and do not assign request identity. |
| Parent preview entry | `parent/view-as-child` verifies profile ownership and device family, reads current profile-security snapshot and calls the same atomic RPC. No direct Child-session insert remains in that path. Intentional Parent authority may bypass Child PIN, matching Parent's existing access. |
| Transaction authority | SQL locks Parent→device→profile; verifies device ownership/live expiry, nonempty token/future expiry, Parent hash snapshot including NULL, target PIN-security snapshot, profile ownership/archive state and change authority. NULL authorization does not satisfy `is true`; `is distinct from` avoids NULL-as-wildcard identity comparison. |
| Atomic replacement | Revoke all same-device live sessions, update binding and insert new device-linked token in one function/transaction. Constraint failure rolls back all three. Other devices and every profile budget remain untouched. |
| Replay/reconnect | A prior profile's held token fails both revocation and new identity checks. Missing/unlinked/different/revoked devices deny. A valid current Child credential cannot be transplanted to a different sibling-bound device. |
| Parent PIN changes | Comparison against the current locked Parent hash invalidates a pre-verified stale PIN, including NULL mismatch. Target PIN changes also reject stale snapshots even if Parent deliberately bypasses Child PIN. |
| Parent Mode cleanup | New Child admission and Parent view call `revokeParentMode()` before issuing the Child cookie, then clear Parent access/refresh/mode cookies. Revocation failure rejects before minting a browser Child cookie; an already-committed binding change may require retry, which is fail-closed availability rather than unauthorized access. |
| Logout | Existing complete logout revokes Child/mode/device state and clears all five cookies in finally. Device renewal does not set revoked_at back to NULL; it cannot resurrect a concurrently revoked enrollment. |
| Privilege posture | New RPC is SECURITY INVOKER, public/anon/authenticated revoked and service_role granted. Composite `(active_profile_id,parent_id)` FK references an already-existing unique `(profiles.id,profiles.parent_id)` key; a cross-family service writer cannot create an invalid binding. Existing table RLS/grants are not relaxed. |
| Player preservation | Existing ChildPlayer session-access poll destroys media after authorization failure. No iframe/API/CSP/containment rewrite was needed; source unchanged. This supports preservation reasoning, not a new physical-iPad PASS. |
| Copy | Privacy description now matches Parent-enrolled device and Parent-authorized profile changes. Picker indicates sibling Parent handoff; no unsupported promise that the system recognizes the actual person holding the device. Visual legibility and cold usability remain for separate reviewers. |

## Race and compatibility challenge

The locked admission rechecks the current binding rather than trusting the earlier API read, so a pending sibling request cannot change profile using stale device state without Parent authority. Parent PIN updates lock the same Parent row; existing profile-security/timer mutations do not acquire that Parent row after locking a profile, so this finite source inspection found no inverse Parent/profile lock cycle. Concurrent same-target admissions serialize to one live Child token; the SQL suite correctly labels PGlite as serialized end-state evidence, not two-native-connection stress.

Parent Mode/full Parent authority is checked before the RPC; it is not a new grant row consumed inside the SQL transaction. Two concurrent genuinely Parent-authorized actions may serialize last-authorized-wins during their already-authorized revocation window. This is not an unauthenticated Child escalation; do not describe the implementation as revision-CAS, single-use Parent intent or a revocation-atomic authorization grant. The exact Parent PIN hash still has an atomic freshness check. Per-request authorization is a checked snapshot; a request authorized immediately before a handoff can complete in flight. Existing polling then fails closed. No claim of zero-latency revocation or arbitrary native-fullscreen behavior is made.

Backfill carries only a single unambiguous currently-live profile per valid device. Conflicting/missing legacy state becomes NULL and requires Parent. It does not change allowances, assignments, PINs or timezone. Legacy existing five-argument admission remains service-only and unchanged for old deployments; the new Child gate rejects unbound/mismatched legacy sessions in the repaired app. Old canonical77 and historicalef4 origins still ignore this gate until replaced: **the additive migration alone is not a repair of every old origin**. Do not use old-stage physical results to certify this candidate, or describe rollback to the old app as retaining this new security property.

The protection binds identity to a Parent-controlled device, not to physical biometrics. It cannot identify which child is physically holding a different device already authorized to another sibling. Parent controls the legitimate physical handoff; indiscriminately blocking every sibling was intentionally rejected. Normal authorized siblings on their own devices keep their own data/time.

## Open release gates

- Exact committed-source binding and any later implementation-byte differences must be verified; this was an uncommitted candidate review.
- New migration requires actual hosted source/function/grant/FK/backfill readback and compatible operation/rollback receipt. No hosted mutation was performed by this reviewer.
- Fresh full unit/browser/build/lint/type/audit/CI gates and actual rendered UX/visual/cold/jury gates belong to their actual executions, not this report.
- Authenticated hosted Parent/Child/device isolation, session persistence and supported native concurrency remain separate evidence.
- Genuine affected iPad/phone retest remains required: stop target, attempt sibling entry before Parent handoff, legitimate Parent handoff, stopped target still denied; oldef4 picture/sound and Founder-reported containment are historical scoped observations. Daily7AM renewal remains server/synthetic evidence, not physical certification.

No new Founder design approval, paid service, credential storage or infrastructure is required by this review. Root should continue qualification and preserve the release hold until genuine remaining gates pass.

## Frozen source binding —40e89db

Independently rechecked `git ls-remote origin refs/heads/premium-ui-ux-20261103`: exact remote head **40e89db85ddb2fe182b265ce0232aecbe513c9fd**. Product server, migration, privacy and both reviewed handoff test hashes remain identical to the table above. ChildLogin changed to SHA256 **62decbff5c564ff3bac98d06beef75b789fd12d55153a94573ea7b78bb747343**. Inspected its complete fc9efcd→40e89db diff: the status span is always present, with Parent handoff/PIN/Selected profile text and conditional lock icon. This adds no authorization or event-handler change. The bounded source verdict therefore binds to40e89db with that explicitly re-reviewed UI hash. Its changed E2E expectation is evidence harness work, not a server-authorization modification. This addendum does not invent a fresh full-run, hosted or device result; those must come from their actual final executions.

## Narrow hosted preflight and operation requirements

This is a reviewed operation envelope, **not an executed migration receipt**. Preserve canonical77, existing306 stage, historicalef4 physical results and rollback before any mutation. Use only the existing Supabase/Vercel projects. Do not reapply daily migration20261118192923 or use an automatic broad schema push.

Before applying only the frozen `20261119034107_device_profile_handoff.sql`:

1. Read actual migration history and inspect column/new RPC existence. If the migration/result may already exist, reconcile rather than retry. Record generated source filename separately from any provider-assigned history version and exact payload hash (including a bounded transaction-local lock timeout if used).
2. Verify the existing unique `(profiles.id,parent_id)` key is valid and source matches. Inspect current household_devices/child_sessions columns, device_id FK/indexes, RLS and effective anon/authenticated/service table privileges. An added column inherits table-wide access posture; no new public policy/grant is authorized.
3. Inspect non-internal triggers on **household_devices and child_sessions**, not only profiles. Backfill performs real device-row updates; actual admissions perform session revocations/inserts. Any side effect must be understood before relying on a rollback-only synthetic probe. Inspect current grants/body hashes of the legacy admission, Parent PIN/security, timer resolver/control and acknowledgment functions for a compatible before-image.
4. Record sanitized aggregate pre-state for profile/timer/assignment/approval invariants and the expected device backfill cohorts: valid device with exactly one distinct valid live Child profile, conflicting profiles, missing history, expired/revoked devices and foreign/archived targets. Do not export real identities, credential hashes, token hashes or family photos; compute any comparison digest inside SQL over only appropriate non-secret fields.
5. Apply the exact reviewed additive migration in one provider transaction with a bounded lock timeout. Backfill must not opt children into Daily or alter a budget/PIN/timezone/approval. No real child allowance changes solely for QA. Existing old app may continue creating legacy sessions concurrently; final new-app authorization still fails closed on NULL or mismatched binding. Do not claim this metadata snapshot is a physical identity proof or that every legacy live browser is seamlessly preserved.

After apply, read actual provider migration version, new column/FK definition and validity, expected backfill counts/mismatch count, source function body/hash, SECURITY INVOKER and effective public/anon/authenticated EXECUTE false/service true. Confirm ambiguous/new devices remain NULL, no cross-family bindings exist, legacy RPC/timer definitions and RLS/grants are unchanged, and family content/timer invariants remain unchanged within measured scope. Compare advisors for new findings rather than claiming all historical findings absent.

Use only a reviewed synthetic fixture transaction with guaranteed rollback for actual hosted RPC positive/negative checks after preflight. Exercise wrong family, no Parent switch, exact Parent PIN snapshot, same-profile reentry, legitimate sibling handoff, old token revocation, insert-failure atomicity and unchanged other-device/timer state. Do not replace server clocks or commit a test account/profile. A management-channel sequence is not proof of native overlap; label serialized/local/native tests separately. Obtain actual configured final-stage auth/device behavior with the existing secure Parent sign-in flow; never copy privileged credentials into a public preview or expose hashes/tokens in evidence.

Keep old77/ef4 origins explicitly outside repaired-origin acceptance until the affected ownership path is replaced or access is otherwise legitimately retired. Do not weaken old RPC protections or break canonical Child admission merely to make an isolated new stage appear globally fixed. Rollback to old code restores the known identity-selection weakness; preserve its recovery role and prefer reviewed fix-forward once the new binding is active. No promotion before exact-candidate hosted and applicable real-device gates pass.

## Post-qualification legacy-origin closure — planning, not performed

Root requested a release-boundary challenge after the40e source freeze. Simply making legacy `wn_admit_child_session` returnNULL **does not suffice**: old apps accept already-issued nonrevoked sibling Child tokens without checking the new binding, including legacy family-link sessions with no device_id. Old Parent view-as-child can also insert a session directly after genuine Parent authorization. Blocking new legacy admissions alone must never be described as revoking existing old-origin access.

The narrowest reversible option to qualify is an **existing-project WAF hostname deny boundary**. Preserve deployment artifacts and use one explicitly reviewed rule which denies hosts outside the canonical production hostname set and the exact new qualified stage. No broad bypass rule, paid managed ruleset, new service or deployment deletion is necessary if this boundary can actually be verified. Inspect existing rule order/bypass rules and preserve unrelated protections. Hostname `ninc`, Environment matching and terminal Deny are documented in Vercel's [rule reference](https://vercel.com/docs/vercel-firewall/vercel-waf/rule-configuration); [current pricing](https://vercel.com/docs/vercel-firewall/vercel-waf/usage-and-pricing) identifies custom rules as free. These are primary documentation facts, not a claim that the live account is already configured or a particular mutation is qualified.

Read-only actual `get_firewall_config(active)` for existing project/team returned404 `Seawall Config not found` plus connector reauthentication/access guidance. It did **not** return `configured:false`; active firewall configuration remains UNVERIFIED. No mutation, reconnect, paid upgrade or new credential was requested by this reviewer. Root may inspect the already-authenticated supported Vercel UI or an available correctly scoped existing CLI session; do not overwrite a config that has not been read. If the existing account cannot support the boundary, keep the release hold and evaluate a separately tested fallback.

Two important limitations prevent a premature WAF PASS:

- [Vercel Authentication](https://vercel.com/docs/deployment-protection/methods-to-protect-deployments/vercel-authentication) alone is insufficient retirement proof. Vercel documents retained access for previously authenticated per-URL cookies after protection is re-enabled, and share links/automation/trusted sources can also allow access. [Standard Protection](https://vercel.com/docs/deployment-protection) covers generated deployment URLs while leaving production domains accessible, but an ordinary SSO prompt in an empty browser does not prove previously used family-device sessions lost access.
- [Skew Protection](https://vercel.com/docs/skew-protection) can route an allowed canonical hostname to an older deployment using `?dpl=`, `x-deployment-id` or `__vdpl` document pinning. A host-only deny rule therefore requires actual project skew/pinning inspection and adversarial tests. At cutover, old-deployment pinning must be demonstrably unavailable or separately denied; do not assume the application never setting that cookie makes adversarial request markers impossible.

Required measured release sequence: qualify the new stage first; preserve exact active configuration; add the reversible boundary with canonical old production and new qualified stage still allowed; verify old generated hosts/aliases deny GET and POST before app execution, including retained old sessions in their original browser without exporting cookies; verify no custom bypass/SSO cookie bypasses that deny; promote the exact qualified app only after ordinary hosted/physical gates; then verify every canonical alias resolves to the repaired app and old-deployment pin markers cannot select old code. Test both historicalef4 and306 plus inventory all older configured deployments/aliases, not just the latest two. A positive old-host app response or old-code selection through an allowed host keeps the release blocked. Leave new unqualified previews outside the allowlist until their exact host is deliberately added for bounded QA.

Keep this cutover separate from the phase1 compatible migration. Disabling legacy admission early would break the existing canonical77 profile-entry path while the new candidate is still on hold. Deployment deletion is a later alternative only if needed and authorized at the applicable action boundary; it loses instant rollback according to [Vercel's deployment management documentation](https://vercel.com/docs/deployments/managing-deployments). Preserving code/evidence/configuration is essential even when a vulnerable runtime is no longer publicly usable.

A database fallback can be assessed later: version-tag new verified admissions, a transaction-local nonsecret marker inside the service-only validated RPC, and a post-promotion insertion barrier plus revocation of all unversioned legacy Child sessions. It must block both old RPC and old direct inserts and invalidate existing legacy tokens, not just returnNULL on one function. This changes SQL evidence and needs new tests, trigger/grant/rollback review, actual hosted readback and a fail-closed rollback plan; **no such fallback was implemented or accepted here**. The WAF plan is preferred only if its actual old-origin and skew closure can be demonstrated.

## CURRENT addendum — reviewed two-phase database retirement supersedes WAF preference

Root selected the deterministic database cutover instead of a new broad hostname policy and multiple skew-marker restrictions against an unread active WAF configuration. The earlier alternative investigation remains preserved above; no WAF mutation or deployment deletion occurred. The database specialist implemented the following **new local source delta**, independently re-reviewed here. This supersedes the prior statement that this fallback had not been implemented/accepted, and supersedes40e's original SQL hash binding for affected database evidence. Product server and ChildLogin authorization/UI bytes remain as previously reviewed; the new SQL requires its own final commit binding.

| Updated/added path | SHA256 independently measured |
|---|---|
| supabase/migrations/20261119034107_device_profile_handoff.sql | 266de6effc88c8322a9f37da5314ed37d2afa9d3dd744071c31ac718fa453b6d |
| docs/operations/profile-handoff/20261119035652_retire_legacy_child_admission.sql | 93900b2f3af19bd25cbda8704f1f6506e4add453917b99aa99bd8483aafe9825 |
| src/lib/server/profile-handoff-database.test.ts | f674362730b383e7fab677101427b6475113d4f84512820db79adfcc673b76ed |
| src/lib/server/product.ts (unchanged) | 8cb34d582b35bea26b2885c14de733f3c2a36bc73892cebbe6f45d0a0996e74f |

**Updated verdict: PASS within independently inspected SOURCE/local PostgreSQL behavioral scope for these bytes.** No hosted migration, cutover, canonical promotion, native-concurrency or physical-device result is asserted. Phase2 must remain a separately gated post-promotion operation, not automatic phase1 migration.

### Actual fresh independent tests

Repeated the same four-file command above against the updated SQL/tests: **4files /97tests PASS**, actual22:58:59UTC, duration2.08seconds, exit0. This includes27 database cases and26 handoff-route cases, plus preserved independent security/route regressions. Npm's nonfatal unknown http-proxy config warning remained. The database suite directly calls the actual old five-argument RPC before/after retirement, separately tests old direct-insert patterns, v2 spoof outside the guarded path, exact prior marker restoration, NULL authority and SQL rollback.

Ran an additional independently authored local PGlite probe against these exact two SQL files: **16checks PASS**. It created a new synthetic minimal schema, one Parent, two profiles and two devices, plus a legacy unlinked Child token. Verified: phase1 default-v1 direct admission still works; guarded admissions label both new tokensv2; successful RPC does not leak marker; phase2 revokes the held unlinked legacy token while preserving both devices' livev2 tokens; old direct insertion and declaredv2 without a marker fail; guarded new admission still works; a transaction-local preexisting marker `prior` is restored exactly; duplicate-token insert actually fails; savepoint rollback restores prior marker, original device identity and original livev2 token; trigger helper remains invoker/service-only EXECUTE; no livev1 sessions remain. No hosted query, real family change or native two-connection overlap was involved.

### Mechanism and adversarial analysis

Phase1 adds `child_sessions.admission_version smallint NOT NULL DEFAULT1 CHECK IN(1,2)`. Existing and legacy sessions remainv1. Only the existing validated service-only device-handoff RPC explicitly insertsv2 after all Parent/device/profile checks. It sets transaction-local `watchnest.device_handoff_admission=2` immediately around that insertion and restores the prior value. The marker is **not a secret or standalone credential**; the security boundary is existing table/RPC privileges plus the actual server-verified admission code. It does not purport to defend a stolen service-role key or arbitrary privileged SQL writer. Request bodies/headers cannot invoke arbitrary SQL/set_config through the current application; PostgREST exposes the configured schema's authorized functions, not a generic query executor. Unknown browser authorization/version fields are not forwarded by Root's route.

The separate CLI-generated phase2 file is deliberately under `docs/operations/profile-handoff/`, **outside auto-loaded migrations**. It contains BEGIN, transaction-local5second lock timeout, and SHARE ROW EXCLUSIVE lock on child_sessions **before** installing the BEFORE INSERT barrier and revoking every unrevokedv1 token. Both version2 and transaction-local marker2 are required, using NULL-safe `is distinct from`. Thus both the legacy five-argument RPC and legacy Parent direct-insert code fail closed. Declaring version2 alone does not help. The new guarded RPC remains usable with its original ownership/PIN/binding checks.

The table lock conflicts with old INSERT/UPDATE transactions: a prior in-flight legacy insertion must complete before the lock is obtained and is then included in version1 revocation; a queued insertion after cutover commit hits the barrier. Trigger creation, revocation and commit are one transaction. Source/serialized PGlite tests demonstrate the order and transactional behavior; true native contention remains an actual-hosted test, not inferred PASS. New admission's Parent→device→profile locks do not create an inverse row-lock path in the phase2 update, which does not need those Parent/device/profile locks to update revoked_at. Lock timeout prevents indefinite cutover waiting and an error must be reconciled before retry.

The reviewed current/legacy HTTP surface has no generic Child-session update endpoint and no route/function that resets a revoked token to NULL or upgrades admission_version. Existing metadata/acknowledgment functions update only their own fields and filter live sessions; they cannot resurrect retired credentials. The update capability of a privileged service SQL writer is outside this Child/browser threat model. Old runtimes receiving a legitimately issuedv2 cookie through canonical version-skew routing still cannot create a different identity after the barrier; the only browser-reachable new admission path requires the Parent-authorized device transition. Heldv1 cookies are revoked regardless of origin, including unlinked family-code sessions.

### Exact cutover conditions and rollback

Do **not** execute phase2 merely because phase1/stage passes: it intentionally breaks old77/ef4/306 Child admission. Root must first qualify, promote and verify the guarded app at all canonical aliases, including an actual newv2 admission through the approved current account flow; only then apply the exact separately reviewed phase2 transaction. Record actual operation/source hash, trigger body and enabled state, table/FK/grants, livev1 count0 and preservedv2/family-budget invariants. Prove old authenticated Child cookies cannot authorize and old RPC/direct admission is denied without copying credentials between origins. Qualified new admission and same-device Parent handoff must still work afterward.

Keep old deployment artifacts/source/config/evidence for forensic recovery. After phase2, they are **not a permissive functional Child rollback**. Rollback must retain the new guarded admission path or fail closed; never remove the insertion barrier, revivev1 tokens or restore unprotected legacy entry as a routine rollback. No profile budget, approval, PIN, family setting or time zone is reset by the cutover. Any interrupted phase2 outcome must first be reconciled against actual trigger/function/session state; do not infer success from interface truncation or blindly reapply.
