# Independent investigation — profile handoff and remote-stop bypass

Reviewer: separate `profile_handoff_security` context, read-only implementation investigation. Root remains sole implementation/release owner. No provider mutation, credentials, real family profile changes or deployment was performed by this reviewer. This report is SOURCE evidence, not browser/device certification or acceptance of a not-yet-written repair.

## Candidate and authority

Repository branch `premium-ui-ux-20261103`, recovered HEAD `43c2ae8f48a3a7515c47436258658a78db3949b0`; application `30681533551d916c08161f29bbb9ba821f6c92f9`. The report consumes the newest Founder physical findings, all eight attached WatchNest governance files, App Dev instructions, current RunState/TimerDailyHostedOutcome, and installed Product Intelligence instructions (failure-classification/reusable-principle lens only). Existing actual source evidence outranks old layout/task descriptions. Concept3 remains selected; completed timer code is preserved.

Baseline SHA256:

| File | SHA256 |
|---|---|
| src/lib/server/product.ts | e9af5fd70d64715c776e034091e66241d443a22322ff55f39e5e7596d903f34b |
| src/components/child/ChildLogin.tsx | 710aa9c478d04de254192251dae75308f3bcbfb2dc50ae8a2100c5704ba0f3ce |
| src/components/child/ChildLibrary.tsx | ca68649dc4dc47d9eb38e50ef7ba5aa227b59b32f3f4d074cbb553e33363ca8c |

## Verified root cause — release blocking

Per-profile session access is enforced after Child authentication, but selecting the Child identity is not bound to the current household device identity. `ChildLibrary.switchProfile()` calls POST `auth/profile-exit`, which revokes the current child token and clears `wn_child`. `ChildLogin` repeats that exit on mount, then GET `auth/device` lists the household profiles using the long-lived `wn_device`. POST `auth/child` accepts any same-household selected profile with only its optional Child PIN. `wn_admit_child_session` locks/checks the destination profile PIN snapshot and inserts a Child session; it does not check the previous device profile or a Parent-authorized transition. The route attaches device_id afterward in a separate operation. `child()` validates the Child session token and profile but does not require a matching live household device or active-profile binding.

Consequently the stopped profile stays denied while a different PIN-off sibling supplies a different, otherwise valid authorization context. Stopping the targeted video is therefore compatible with the reported bypass; this is not evidence that remote End-now failed to update its targeted profile. A client-only hidden picker or check of the incoming `wn_child` cannot repair it, because profile-exit, a new tab, deleting that cookie, refresh or direct API calls can remove that transient context while retaining `wn_device`.

The family-code path is an additional bypass class: POST `auth/child` with `family` skips trusted-device validation entirely. `parent/view-as-child` is another direct Child-session insertion route and must join the common authorized transition path. A Child PIN proves knowledge of a profile credential; under the newest Founder invariant it must not, by itself, authorize changing the device from a stopped identity to a sibling.

## Recommended bounded invariant

For a valid Parent-enrolled household device D with bound profile P, a Child session is usable only when its device_id equals D, its household equals D's household, and its profile_id equals D's active-profile binding. Reentry into P follows ordinary optional Child PIN rules. Any P→Q change requires verified Parent authority for that exact target Q, consumed atomically with admission/binding and invalidation of superseded same-device Child sessions. The Parent may explicitly hand the device to a legitimate sibling; the original profile's timer, block and data are not modified or copied. Other devices/siblings are not indiscriminately blocked.

The binding is server-persistent and survives `profile-exit`, `/watch`, Parent-lock, refresh and absence of a Child cookie. Explicit complete logout revokes the enrolled device; creating/replacing an enrolled device continues to require real Parent authentication. A new never-used Parent-enrolled device may choose its initial profile; a migrated device with prior session history should retain the most recent valid identity. Ambiguous legacy state must not become a new unauthenticated switch grant.

Target-specific Parent PIN verification should be rate-limited and checked against an unchanged stored Parent PIN snapshot within the atomic transition; verified existing Parent authority may authorize that transition. No broad switch-unlocked interval is necessary. Check child PIN snapshot, household ownership, device validity and Parent authority in the same transition. Parent-PIN changes must not leave previously checked PIN authority usable. Existing Parent Mode sessions remain bound to their device and revocation/expiry. Do not return hashes or authorization tokens to the Child UI.

Use one consistent lock order and server time. Two competing initial admissions/handoffs must not create two usable current Child identities on the same device. A second simultaneous request needs to re-evaluate the binding after its row lock is acquired. Child API validation and playback/session resolver must fail closed on database errors or old/unlinked/revoked device tokens. No RLS weakening is required; service-only invoker RPC permissions remain explicit.

## Route and lifecycle checklist

- `auth/child`: device required even if a family code is supplied; a code, if retained, must match the validated device household. Reject cross-family target IDs and Client-supplied authority flags.
- `auth/profile-exit` and `auth/parent-lock`: may end/clear a Child session but must not clear durable binding or grant a new first choice. Parent-lock must not accidentally carry Parent authority into Child mode.
- `parent/view-as-child`: use the same atomic bind/admission operation, with intentionally verified Parent authority; no direct session insert escape.
- `child()`: require live matching `wn_device`, session.device_id, device parent ownership and active-profile binding on every API authorization, not only login. Old/deep-link profile routes must resolve against that server identity, never a path parameter.
- `/watch` picker: current profile remains understandable/reachable; sibling selection opens a concise Parent-controlled handoff rather than silently entering. Failed/cancelled PIN must not change identity or either child's timer.
- Parent logout: existing code revokes Child token, Parent Mode token and household-device token then clears all five cookies in `finally`. Keep that fail-closed revocation behavior. Profile exit is not full logout.
- Old tabs/restored Child cookies: revoke superseded same-device sessions and reject binding mismatch. Existing ChildPlayer session-access polling already destroys the player after failed authorization; do not rewrite its iframe/containment lifecycle to implement the gate.
- Privacy and Parent Settings: old copy says a PIN-off profile can open from a family link; align it with Parent-enrolled device entry and protected profile changes.

## Required adversarial acceptance matrix

| Scenario | Required result |
|---|---|
| End A, switch via normal picker to PIN-off B | Parent handoff required; B not silently admitted |
| End/Pause/exhaust A, clear wn_child then POST B using same wn_device | Same denial; binding survives missing Child token |
| Navigate fresh tab, reload /watch, deep-link sibling/profile/player paths | Bound identity retained; no target-URL authority |
| Direct `auth/profile-exit` or `auth/parent-lock`, then request B | Neither clears binding nor grants transition |
| Submit family code to bypass trusted device, or use foreign-family code/profile | Rejected; no session/cookie minted |
| Know B's Child PIN but no Parent switch authority | Cannot bypass stopped A by changing identity |
| Wrong, cancelled, expired or concurrently changed Parent PIN | No identity change, no session minted, existing timer/block unchanged |
| Valid Parent handoff A→B | B's own approved library/budget available; A remains stopped; C/other device unaffected |
| Replay A's old Child token after A→B | Every Child API rejects; player poll fails closed; no silent resume |
| Same P reentry/refresh after ordinary exit | Optional Child PIN respected; no Parent PIN for every routine action |
| Two simultaneous first entries, opposite handoffs or stale admission | Only current serialized binding usable; no two effective identities |
| Device revoked/expired, mismatched session.device_id, legacy unlinked session | Child endpoints deny until genuine Parent reconnect/handoff |
| `parent/view-as-child` plus old tab | Verified Parent can hand over, superseded token cannot continue |
| No Parent PIN configured | Existing Parent account sign-in is the authority; never skip gate or invent PIN |
| Daily7AM renewal after explicit End/Pause | Existing precedence unchanged; no Parent stop erased by admission/reset |
| Parent timer1/5/10/custom, independent sibling budget | Existing306 controls preserved, no15minimum introduced |

Tests must include behavior against actual route/SQL transitions; source-string assertions alone cannot close this bypass. Database row locking/idempotence tests must be distinguished from genuine overlapping native requests. Hosted qualification must not change real family allowances solely for QA. Physical iPad/phone retest is required for the affected flow and stale player stop behavior; Chromium is not certification of fullscreen media.

## Coexistence, migration and rollback limits

The old canonical77 and historicalef4 deployments will ignore new active-profile columns and routes until replaced. Adding a backward-compatible table/column/RPC alone does not repair those origins. Preserve their source/rollback and label residual old-origin exposure explicitly; do not claim global protection solely from stage PASS. Replacing the existing five-argument admission RPC with a device-required signature/behavior can break old production; plan compatibility deliberately rather than casually broadening service authority. No blind reapplication of already-applied daily migration20261118192923.

Backfill only enrollment/session identity metadata needed for the gate, without mutating approved content, family PINs, allowances or time zones. Record how ties/ambiguous legacy sessions are handled and whether existing sessions become unusable. A rollback to an old app will restore the known profile-switch vulnerability unless an additional compatible server control prevents it; therefore rollback is recovery, not a claim of current safety. Prefer fix-forward after the new protection is in active use.

## Evidence boundaries and learning

Founder physical evidence is bound to historicalef4: approved picture/sound PASS and recommendation containment Founder-reported PASS within that observed scope; targeted remote stop occurred but full control PARTIAL FAIL due sibling profile escape. Daily306/source343unit80browser qualification already exists and is not reimplemented here. The changed auth/admission candidate must rerun affected security/UI/browser/hosted gates; unchanged player source can support reasoned carryforward, never fabricated physical PASS for a new deployment.

Reusable DOMAIN/PROCESS finding: on a shared device, per-identity authorization is insufficient if identity selection itself remains unauthenticated. Persist the identity boundary server-side, preserve it through ordinary exit, and test transition authority separately from content and timer authority. This is a project learning until the repaired transition is demonstrated; no private family facts belong in universal packages.

### Root design refinement reviewed in principle

Root proposes requiring a target-specific Parent handoff for every new/unbound device as well as changes, while routine same-bound-profile entry retains optional Child PIN. This is stricter and avoids treating ambiguous migrated identity as a free first choice. After an explicit valid Parent handoff, Parent authority may intentionally bypass the Child PIN, matching the existing Parent-view authority and avoiding two PIN prompts; this does not authorize a sibling using only that sibling's Child PIN. The shared Parent-mode device rate-limit bucket must not multiply by target profile. A supplied wrong Parent PIN must not fall back to switch authorization. Server-only SQL authority parameters must originate exclusively from verified Parent/PIN checks, never client fields. Parent-PIN snapshot comparison must invalidate a concurrent change. This design direction is acceptable for implementation; it is not an acceptance of uninspected source or behavior.

Verdict: baseline profile-switch security FAIL, release blocking. Recommended repair is not yet accepted. Independent source re-review and behavioral verification must bind to the precise repaired candidate before any PASS.
