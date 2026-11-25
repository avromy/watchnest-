# Independent no-PIN repair / Parent access recovery review

Evidence: SOURCE + AUTOMATED ROUTE + LOCAL POSTGRESQL SEMANTICS. Independent reviewer, not the admission/recovery implementer. No hosted credentials, family writes, production changes, publication or physical-device assertions. Current Founder correction remains controlling: no child PIN exists; this is not a wrong-child-PIN incident.

## Exact reviewed working candidate

Working src tree `9c247f77cf64143c320b204587e2f3d1e7f487e4` (isolated temporary Git index; actual index untouched). Baseline frozen2fba remains the source comparison. Final remote commit binding must be appended once frozen; no future mutation is implicitly accepted.

| File | Reviewed/tested blob |
|---|---|
| src/lib/server/product.ts | 3fd080425b0973f2ce0c9c77be0df1c2bc9af2eb |
| src/lib/profile-access-status.ts | 493247fd299abf61b08d2f18a0f687f37a517dfb |
| src/lib/server/profile-access-route.test.ts | be423c9fd754a92429de0eb3b5bd25a753bc2471 |
| src/lib/server/profile-handoff-route.test.ts | 25f33251cad2c81125e69e9f6f760e23c340bf14 |

Authority applied: current Founder scope plus eight app governance sources, existing no-PIN source investigation and bounded Supabase security source-review receipt. No inaccessible current universal/visual authority certification claimed.

## Source/security disposition

**PASS for bounded admission/status/recovery security semantics.** No material defect found in reviewed paths.

- The low child5/900 credential budget is now consulted only when the authoritative profile has PIN enabled and Parent authority does not bypass that PIN. PIN-off own-profile re-entry ignores spent historical child buckets. General device admission120/60 remains, with accurate device-opening guidance; Vercel auth-network150/60, child PIN5/900 and shared Parent PIN5/900 protections remain separate. Sibling handoff still needs verified Parent authority, regardless of child PIN state.
- Parent GET profile-access verifies Parent auth, owned/unarchived profile and an existing unrevoked/unexpired device in the same family before reading any relevant windows. It hashes internal key inputs and returns only serverNow, PIN-required, limited and expiration fields. It exposes no key/hash/attempt counter, PIN hash, device token, child session or private video data. PIN-off status deliberately does not read the obsolete child bucket. The endpoint does not renew the device or clear counters; existing Parent request rate limiting remains an intentional server operation.
- Status calculations use server time and the stored window start with the actual bucket durations. At the exact expiry boundary they remain limited because the SQL reset comparison is strictly older-than; after expiry they release. A threshold-count row is marked limited because the next admission would increment past the maximum. Non-finite timestamps fail rather than inventing a safe status.
- Explicit Parent recovery uses the existing owned-profile Parent view-as-child route and atomic service-only admission RPC. Recovery request audit is written before admission, with a bounded action name and Parent/profile/device reference; no PIN, credential token, provider content or viewing telemetry is recorded. Audit failure blocks admission. The event is named requested, not completed, so a later admission failure does not falsely attest success.
- Recovery does not delete/reset any login_limits row, change PIN state or grant a new public-role permission. Parent authorization is an alternative verified admission authority, not a way to turn off time policy. Child/device-only callers and foreign-family profiles/devices are denied before audit/admission. Existing non-recovery view-as-child remains available as previously authorized Parent functionality; this audit is scoped to explicit recovery requests.

## Timer and clock invariants

Inspected unchanged `wn_admit_device_child_session` in `20261119034107_device_profile_handoff.sql`. It locks Parent/device/profile, validates family/binding/security snapshots and device expiry, revokes the device's former child sessions, updates active_profile_id, and inserts the new session. It does not update profile timer fields, daily allowance/period, pause state, Parent block, access windows or siblings on other devices. Existing real-PostgreSQL tests verify repeat admissions do not start or extend budgets.

Admission and playback permission are distinct. Parent recovery may successfully establish a profile session while Parent-stopped or outside its viewing window. Subsequent `child()` enforces actual household clock windows before child routes; `accessView` derives server timer/Parent-block status, and child/player denies before returning playable content when access.allowed is false. This is fail-closed behavior, not permission to watch. Raw bookmark, assignment, safe-player, Made-for-Kids and metadata restrictions are unchanged.

## Independently added and executed tests

Added five cases to the new profile-access-route.test.ts, using controlled local fixtures:

1. Child/device-only recovery returns401, no audit/admission/profile or limit-state reset.
2. Foreign-family profile recovery returns403 before audit/admission.
3. Foreign-family device recovery returns403 before audit/admission.
4. After explicit successful recovery of Parent-stopped profile, session access remains blocked and player returns403 with the time-specific denial (not an incidental missing-video denial).
5. After explicit recovery outside a real America/New_York access window (17:00Z/noon local versus00:00–00:01), both session-access and player return the window-specific403; no profile/limit state reset occurs.

Independent targeted run: **4 files /75 tests PASS**, exit0,1.84s:

- profile-access-route.test.ts (including audit failure, PIN-off stale bucket, server timestamp/expiry tests and the five independent cases)
- profile-handoff-route.test.ts (count-aware admissions, PIN guessing, handoff and Parent-stopped policy)
- profile-handoff-database.test.ts (real local PostgreSQL transaction/security/timer invariants)
- access-window.test.ts (real timezone/window logic)

`git diff --check -- src` passed. No browser/build operation started by this reviewer. Controller broader suites and hosted results must be separately candidate-bound. Source/fixture/PostgreSQL evidence does not establish actual family recovery or physical playback.

## Remaining acceptance boundary

No new security blocker identified in this bounded candidate. Freeze source and append exact final remote binding; rerun affected evidence if implementation changes. Preserve the old canonical versus repaired deployment distinction and release hold until coordinating hosted/device gates are actually satisfied. This report neither attributes a live daughter's current counter value nor claims a live family unlock was performed.


## Final frozen remote binding

Independently verified both final application commit `1c1228faef321e8cc3a4b30429a64e6897977575` and reported test-only successor `a2aa711a082d3063de0ac1b753687177bb99ea5d` resolve to exact reviewed source tree `9c247f77cf64143c320b204587e2f3d1e7f487e4`. All four reviewed Git blobs in the table above are byte-identical in the frozen application commit; there is no source delta between those commits. The reported alternative file-hash prefixes are not substituted for these verified Git object IDs.

The bounded source/security PASS and independently executed75-test receipt therefore bind to both commit references for this exact source. Controller reports full419 units,9 Parent browser flows and7 no-PIN browser flows passing; CI172 was still running at the binding boundary. Those are controller-reported checks, not newly executed by this reviewer. No unchanged tests, hosted/family operation, production mutation or physical-device check was performed for this binding. Remaining hosted/device/release limits above remain unchanged.
