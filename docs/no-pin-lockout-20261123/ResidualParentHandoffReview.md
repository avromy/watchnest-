# Independent residual Parent-session handoff review

**Bounded source result: PASS for the narrow picker-admission guard. Release disposition: HOLD; reported exact-stage physical safety FAIL remains.** No source edits, test edits, family writes, database/configuration mutations, authentication attempt or deployment operation performed by this reviewer.

## Source binding and inspected delta

Compared committed archive `5859ade14dc053aac877ec992f9431c170abacf1` to the current repaired `watchnest-integrity` working file. Baseline product blob `3fd080425b0973f2ce0c9c77be0df1c2bc9af2eb`; reviewed repaired product blob `c98496685208f9e8faf577b323b56774cf361a93`; reviewed route-test blob `33755d7a21c39688d8649b8f00b8ac58542fe3c8`. The separate a292 reference was not locally resolvable, so no a292 byte-equivalence claim is made.

The entire server delta versus5859 is adding `!household.parent_pin_hash` to the implicit Parent authorization branch in auth/child, plus a comment. This removes implicit residual Parent-cookie authorization for a sibling switch in PIN-configured households. No SQL, timer, auth helper, ownership, rate-budget, player, cookie or response-format change is part of this delta.

## Confirmed source behavior

Previously, after trusted-device and household validation, an auth/child request for another profile without body.parentPin called parent(). A valid wn_parent, wn_refresh or wn_parent_mode session could therefore set parentAuthorized=true. The atomic admission RPC then legitimately accepted that server-issued Parent authority and bypassed child PIN verification. This is a source-confirmed route for switching without target-specific Parent PIN input; its existence does not prove it generated the observed physical switch.

Now, in a household with a Parent PIN hash, that fallback is not entered. A different target without explicit valid Parent PIN remains parentAuthorized=false and receives403 before profile admission. Supplied Parent PIN still uses the shared Parent-mode5/900 budget and verification before admission; a correct PIN establishes target request authority. Same-profile PIN-off returns remain available, with general device120/60 protection and no child-credential5/900 use. PIN-enabled own-profile entry retains its child PIN budget. Families with no Parent PIN retain verified Parent sign-in enrollment rather than losing their only enrollment path.

All family/device checks, foreign-family-link denial, profile ownership/archive checks, access windows, expected Parent/profile PIN snapshots and atomic RPC protections remain. The RPC does not reset Parent-stopped/daily/one-time budget state. This patch does not relax timers or convert a stopped child into allowed playback.

## Scope caveat: explicit Parent management

The separately authenticated Parent view-as-child management/recovery route intentionally remains authorized by Parent session authority. This patch closes implicit *picker admission*, not every capability of a residual valid Parent session. Do not describe it as removing all residual Parent privilege or as an adversarial guarantee against invoking every Parent API from a browser that still holds valid Parent authority. That broader model remains a separate boundary. The requested preservation of explicit Parent management is maintained.

## Regression review

Inspected the three new synthetic route cases, one each for residual wn_parent, wn_refresh and wn_parent_mode. They assert a sibling request without target PIN returns403 with no RPC admission, then explicit correct Parent PIN succeeds with parentAuthorized=true. A separate case preserves no-Parent-PIN signed-in enrollment. The controller reports these initially failed200-versus403 on baseline and is running the scoped suite; this reviewer did not independently rerun or claim results from that in-progress run. Existing scoped timer/isolation results retain their historical candidate binding until requalified as affected.

## Physical evidence and causation

Preserve the Founder report as an actual safety FAIL on the tested stage: Ari fullscreen AV was observed; Parent End now led to a physical Time’s up screen; the Founder then entered Miri and played without Parent PIN; returning to Ari with Parent PIN remained blocked. The blocked Ari and successful End now are partial observations, not grounds to erase the sibling-switch failure.

The controller-supplied database history shows v2 Ari→Miri→Ari admissions and a recent same-device Parent-mode session revoked before the Miri admission. It does not record the authentication method for each admission. Neither those timestamps nor the existence of this source fallback establish whether the physical switch used a residual parent access token, refresh token, mode session, a different authorized route, or another mechanism. Do not retrospectively assert a matched root cause. Preserve the evidence and distinction between confirmed source vulnerability and unproven historical path.

## Required release boundary

Freeze the repaired source, complete candidate-bound functional/security checks, and independently read back deployed source/alias identity if a successor is staged. The current physical FAIL cannot become PASS from local source or synthetic tests. Repeat the affected actual-device handoff/identity/stop scenario under the governing authorization and acceptance workflow on the exact successor, while retaining the no-PIN own-profile behavior and stopped Ari policy. No new browser/authentication request or family experiment is initiated by this report.

**Source repair is appropriately narrow. No additional defect found in this delta. Production/merge/promotion/phase2 remain on hold; exact cause and repaired physical acceptance remain unresolved.**
