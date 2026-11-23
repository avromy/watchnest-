# PIN-free admission lockout — independent reproduction and narrow repair

2026-11-23. Existing watchnest-integrity worktree preserves prior published repairs. This lane inspected canonical77 source via git show and current source supplied as2fba successor by controller before editing. Both unconditionally called limit(child:<device>:<profile>,5,900) before reading whether the profile required a PIN. No real family bucket, credentials, profile settings, device binding, timer or database row was changed during this audit.

## Confirmed mechanism

A legitimate same-profile PIN-off entry has no credential guess to throttle. Nonetheless every successful entry consumed the five-attempt child credential bucket. A stateful wn_rate_limit model reproduces five HTTP200 entries followed by HTTP429 on entries6and7. An already exhausted historical child bucket also affected PIN-off entry. This is a reproduced route availability defect, not an inference that the Founder supplied wrong PINs, and not independent attribution of every live failure.

Original fixture returned rateAllowed=true regardless of call count, masking this defect. It now models each hashed key's attempts/window start and p_limit/p_seconds with the same strict expiration comparison as the existing SQL function; override rateAllowed=false remains for explicit dependency-denial tests.

## Narrow source repair

Only auth/child admission region edited in product.ts:

- Early general device admission bucket child-entry:<device>:120attempts/60seconds.
- Existing child:<device>:<profile> five/900seconds retained inside p.pin_enabled&&!parentAuthorized credential-verification block.
- Existing Parent PIN verification continues to use shared parent-mode:<device> five/900seconds across handoff and Parent Mode.
- Existing trusted Vercel auth-network150/60 unchanged.

No rate database reset, table/migration/grant changes, credential throttle removal, Parent authority widening, old-origin allowance, profile binding bypass or timer mutation. Correct PIN attempts still consume existing credential budget; known exhausted child PIN bucket remains enforced for PIN-enabled entry until legitimate recovery/window expiration. PIN-off routine entries ignore the irrelevant historical child credential bucket.

Sibling/household/device checks, available hours, atomic admission snapshot, Parent mode revocation and Parent-stopped child playback denial remain unchanged. Separate recovery lane owns any new Parent-authorized inspected/audited recovery action; this lane adds no recovery API or automatic counter clearing. Parent view-as uses its existing separate Parent-action budget/authorization and remains distinct from child credential guessing.

## Evidence

Red: `red.json` —31tests,27PASS/4FAIL before source repair. Actual repeated noPIN statuses [200,200,200,200,200,429,429]; other valid checks failed because routine admission had consumed the credential bucket. Two additional assertions were added afterward; do not describe the31test red receipt as a33test run.

Green: `green.json` —33/33PASS after narrow fix, including original existing handoff cases plus:

1. Seven normal PIN-off entries200 and zero five-attempt credential-budget calls.
2. Existing exhausted historical child credential bucket does not block PIN-off entry.
3. Shared Parent guesses3handoff+2ParentMode return401; sixth genuine Parent attempt429; ordinary own PIN-off entry still200.
4. Child PINfivewrong→sixthcorrect429; new900secondwindowcorrect200.
5. Seven harmless PIN-off entries do not spend a later required-PIN attempt.
6. General device120entries200→121st429; new60secondwindow200.
7. After repeated PIN-off use, sibling still403 and available-hours denial still403.
8. Existing Parent-stopped restriction strengthened to seven repeated routine admissions: access stillblocked and playback403; sibling still403.

Other existing foreign household/device/expired identity/atomic snapshot/revocation tests remain in the33case route suite. These are actual handler calls with synthetic Auth/DB and a modeled rateRPC, not native hosted SQL concurrency/network abuse certification. SQL wn_rate_limit implementation was read and the model follows key/count/window semantics; controller owns live read-only diagnosis, final integration/full-suite/CI/exactcandidate evidence.

Scoped eslint and typecheck passed after source change; final targeted33case rerun passed after strengthening Parent-stopped coverage. No build, publish, auth, deployment, real bucket reset or real family settings action performed by this lane. Concurrent recovery reviewer was notified of exact key semantics and PIN-off historical-bucket irrelevance; edits coordinated to separate parentRoute region.

## Release boundary

New auth route source invalidates affected older evidence until final integration checks and current independent source/security/browser acceptance bind to its exact candidate. Root owns freeze and publish. Real observed access may still be restricted legitimately by available hours, stopped timer, sibling handoff, genuine PIN guess budget or general network/device abuse bounds. Do not convert this fix into unconditional access or weaken those controls.
