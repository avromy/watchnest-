# Independent no-PIN lockout source review — 2026-11-23

**Confirmed source defect; bounded repair plan.** Founder correction is controlling evidence: the daughter has no child PIN, not an incorrect PIN. No further PIN guessing, family mutation, account handoff or limiter-row deletion was performed. This report does not establish the exact daughter's live row/counter or actual device state.

## Exact source and authority receipt

Read committed old canonical `77a5017d938ded03b1530c2b72978cef27273d61` (product.ts blob `f3f99b1ff8b8e0563c621d5fe75558523bcd9417`) and frozen successor `2fba88712bd74c868e27ff5d0e0f067332340507` (product.ts blob `a1bbdb19bb94658bed84b5accc84812768087950`). Reviewed limiter migration, ChildLogin and existing route tests. Current Founder correction supersedes any earlier wrong-PIN hypothesis. Existing app governance, ownership/individual approval/time/privacy locks and previously consumed bounded Supabase security instructions remain applied. No live universal authority re-certification, physical acceptance or hosted reproduction claimed. No unchanged test rerun.

## Exact trigger

Both versions unconditionally call `limit('child:' + device-or-family + ':' + profileId,5)` before they know whether this profile requires any child PIN. Canonical77 line1022 does so before profile lookup; successor2fba line1121 does so immediately after trusted-device resolution. `limit()` defaults to900 seconds and maps denial to429 with “Too many attempts. Please wait before trying again.”

The database `wn_rate_limit` function in `20260930192030_secure_family_product.sql` inserts attempts1, increments attempts on every call within the current window, and returns attempts<=limit. It does not distinguish failures from successful logins. Therefore five ordinary successful same-profile/no-PIN admissions consume the entire child credential budget; the sixth within the same fifteen-minute window is rejected before admission. No PIN entry, invalid passcode or malicious action is needed. Denied calls continue incrementing attempts but do not extend window_started; the fixed window resets only when the next call observes the window strictly older than900 seconds.

ChildLogin correctly routes own-profile/no-PIN clicks directly into `enterChild(profile)` without a PIN dialog. Thus successful normal UI usage can exercise the defective limiter. Profile-exit/re-entry still uses the same device/profile key. This is a historical defect present in77, not newly introduced by experience-mode selection, new Parent UI or the latest two diagnostic context strings. The new sibling handoff code preserves the unconditional limiter and therefore preserves the bug.

The Vercel trusted-network limiter is a separate150/60-second budget for auth routes. Parent PIN handoff also has its own shared parent-mode5/900 budget. These must not be mistaken for the child5/900 cause or silently removed; the low child bucket alone is sufficient to reproduce the reported pattern.

## Security-preserving repair boundary

Remove the unconditional low child credential-budget call. Apply that same child key/5/900 only when `p.pin_enabled && !parentAuthorized`, immediately before validating the child PIN. PIN-enabled profiles still require bounded attempts, including missing or incorrect passcodes, and genuine Parent-authorized handoff continues to use the shared Parent-mode guess budget. A request containing a passcode cannot itself determine whether throttling applies; the authoritative database profile flag does.

A PIN-off admission remains authorized only for the already bound device/profile or independently Parent-authorized handoff. Retain family-link equality checks, device/session binding, owned/unarchived profile lookup, Parent PIN verification and shared bucket, access window, server session time rules, expected PIN hash/state and Parent hash passed to the atomic admission RPC, token revocation/cookie hygiene and sibling library isolation. Never skip authorization because a profile has no child PIN.

No migration, permission widening or live counter clearing is required. Previously exhausted child buckets cease affecting authorized PIN-off own-profile admission because that branch no longer consults them. Their expiry/retention behavior can remain intact. Do not bypass network-abuse protections or remove child PIN/Parent PIN brute-force limits. If a separate general admission-abuse budget becomes necessary, it must be distinguished from failed-credential semantics and sized/tested for normal reopen usage; it must not recreate five successful opens per fifteen minutes.

## Required regression evidence

Existing profile-handoff test mocks `wn_rate_limit` with one boolean result, so a single-call success or denial test cannot detect accumulated successful admissions. A meaningful regression must model per-key counts/window or assert that authorized PIN-off admissions never call the child credential bucket.

1. Reopen the same trusted own-profile PIN-off identity at least six times within900 seconds, with a count-aware rate-limit mock: all succeed, no child5 bucket call, real atomic admission remains invoked.
2. Pre-exhaust the old child bucket and show authorized same-profile PIN-off admission still succeeds without clearing it. Adding a meaningless passcode does not change authoritative PIN-off behavior.
3. PIN-enabled own profile: missing/wrong PIN does not admit; five guesses retain the intended budget and sixth is429, with no admission on exhaustion. Correct PIN follows existing policy without widening budget.
4. Sibling PIN-off profile without Parent authority remains403; valid Parent handoff still works and supplies expected ownership/security state to the RPC. Parent wrong-PIN guesses share the parent-mode route budget.
5. Missing/revoked device, foreign family link, archived/foreign profile and access-window/time restrictions remain fail closed. A concurrent PIN-setting or device-binding change must still be rejected atomically.
6. If browser workflow regression is added, distinguish owned PIN-off re-entry from sibling handoff and use local authorized fixtures. Do not use a fake hosted session or family writes to manufacture proof.

Baseline should fail the count-aware six-admission test and repair should pass. Bind review and test receipt to exact successor commit/tree. The source-confirmed trigger is consistent with the Founder correction; hosted event/counter attribution and physical family verification remain separate. Release acceptance requires the coordinating candidate-bound checks, not a wrong-PIN explanation or waiting out the window.
