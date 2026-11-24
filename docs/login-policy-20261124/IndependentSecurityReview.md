# Independent existing-password login compatibility review — 2026-11-24

**Bounded source/security verdict: PASS.** This is a safe compatibility correction, not a bypass of password authentication or a relaxation of new-password creation policy. No material new security hole found in the inspected delta. It is not hosted authentication acceptance or permission to retry the real account, deploy, promote or override the physical safety hold.

## Candidate and work performed

Clean recovered checkout baseline `6a4a1ca104249e96a44302cc750a7bad3968fcc0`. Reviewed the complete working diff in product.ts and product-dispatch.test.ts; no files changed by this reviewer.

| File | Reviewed/tested working Git blob |
|---|---|
| src/lib/server/product.ts | 40c2c9f5f54b022de52b179d5e32ecb6e5ccbf16 |
| src/lib/server/product-dispatch.test.ts | 40ec7958ecea59b877c8db413054d237f9df4396 |

The server delta changes one shared pre-login/signup guard into nonempty-password validation followed by a signup-only minimum12 check. Update-password has its own unchanged minimum12 guard before mutation. No other server behavior changes. Tests add provider-call counters/rejection state, seven focused cases and incidental formatting.

No credentials, PINs, cookies, tokens or user secret values inspected. The supplied actual-stage error is preserved as an application validation failure, not a claim that the provider rejected an existing credential. No exact password length or validity is inferred from secret content.

## Why this preserves authentication strength

Existing credentials are verified by the identity provider, not made valid by WatchNest's password-length check. A legitimate legacy credential may predate today's local creation rule. Applying the new-password minimum to sign-in blocks that provider verification entirely and can lock out its owner without establishing a wrong password.

The repaired login path requires a nonempty string, preserves the200-character input cap and sends the exact supplied credential to signInWithPassword. It does not trim or rewrite existing passwords, accept a local comparison, create a session without provider authentication, reset a password, generate a bypass or silently upgrade credentials. Provider rejection still becomes generic401 without issuing cookies.

Preserved controls independently inspected:

- same-origin mutation enforcement and bounded request parsing;
- enum-limited action dispatch, email schema and private Founder email gate;
- Parent rate budget10 with existing window and network auth protection;
- signup minimum12 and update-password minimum12;
- provider sign-in result error handling;
- explicit getUser verification of the returned access token before household initialization;
- confirmed Founder identity check before initialization/device issuance;
- existing household identity-link safeguards, HttpOnly/strict cookie handling and credential refresh architecture;
- residual Parent-cookie sibling handoff correction, child PIN/Parent PIN budgets, no-PIN re-entry, time policy, ownership and player restrictions unchanged.

A one-character or whitespace-only candidate may now reach the provider if nonempty. That is not local authentication: it succeeds only if the provider accepts that exact existing credential and the verified confirmed Founder identity. Do not add trimming or a replacement minimum to login that recreates this lockout. Creation rules remain the place for minimum-strength enforcement. Existing rate limits continue to bound online guesses.

No new defect identified in the changed path. The unchanged wider handler continues to rely on the provider SDK's session/user response contract; this narrow review is not a full provider-contract or auth-system re-audit.

## Regression evidence

Independently ran `vitest run src/lib/server/product-dispatch.test.ts`: **31/31 tests PASS**, exit0,896ms. `git diff --check` passed.

The seven new cases verify a provider-accepted legacy short password reaches sign-in and token verification; a provider-rejected short password returns401 with no cookies/data initialization; signup/update-password reject below12 without calling sign-in/signup or issuing cookies; empty/oversized login input is rejected before sign-in; and an unconfirmed provider-authenticated account returns403 without cookies or household initialization.

The controller reports three earlier red cases produced400 instead of expected200/401/403 on baseline. This reviewer inspected the narrow baseline guard and tests but did not independently repeat that red run. The green result is independently executed with mocked provider/database state; it is not a real-account credential test or actual SDK transport acceptance.

## Release and causation limits

The observed stage validation text is consistent with the exact pre-provider guard: that branch exits before signInWithPassword. It does not establish whether the underlying submitted credential would be valid, whether any provider policy changed, or why earlier authentication attempts behaved differently. No real-account retry follows from this report.

Bind this result to a final frozen successor and complete affected required checks before staging. Material auth changes invalidate affected evidence. The existing physical sibling-handoff safety FAIL and its unresolved exact cause remain preserved; this compatibility correction does not cure or certify them. **Source compatibility PASS; hosted/device/integrated release HOLD remains.**
