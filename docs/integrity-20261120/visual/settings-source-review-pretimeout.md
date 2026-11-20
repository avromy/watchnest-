# Independent Settings sign-out accessibility and recovery review

2026-11-20. Scope: changed Settings sign-out pending/error UI and immediate error recovery. Source review only pending exact candidate rendered evidence. No production source edits. No hosted/browser-device acceptance claim.

## Candidate identity

- `src/components/parent/ParentApp.tsx` SHA-256: `c634d1eab182e2d3daa68400fc50f74a19918f152bfaa751d02e6a27279cedbe`.
- `src/components/parent/Parent.module.css` SHA-256: `2466ba962ac8f55000d36728efa4ef852792db06e44de524821f21abf0889b2a`.
- `src/app/globals.css` SHA-256: `fd8caa0bef82097053b19c7b4ae70f75b7cf8899af95866ca33d0f07d6239287`.
- Backend auth-refresh changes are outside this UI review except their user-visible operational failures. Their correctness needs separate functional/security evidence.

## Source findings

0 confirmed defects in the changed source at this stage.

| Area | Evidence and bounded assessment |
|---|---|
| Semantics | Native button retains accessible text. Native `disabled` conveys pending unavailable state and blocks ordinary activation. |
| Pending feedback | Visible label becomes “Signing out…”. Duplicate activation guarded by state and disabled attribute. There is no separate status/live region or aria-busy; screen-reader announcement of the changed focused button name needs empirical evidence. Missing optional markup alone is not a confirmed defect. |
| Failure feedback | Catch renders a new `role="alert"` paragraph immediately after the sign-out button. Message identifies failure, accurately says the browser may remain signed in, and instructs retry. Error is not encoded by color alone. |
| Recovery | On request failure, busy resets and original sign-out action is enabled. A new attempt clears previous error. Success navigates to login only after API resolves. |
| Touch target | Parent CSS declares min-height46px, globally padded button; source meets a44px nominal height criterion. Actual width, wrap, inter-target spacing and overflow require rendered geometry. |
| Keyboard | Native button and global3px focus-visible outline support keyboard operation. Async disable/re-enable may affect actual focus; verify focus location and retry using keyboard after failure. |
| Error styling | Global `.error` uses dark red text plus pale red surface, border, padding16×20px and radius16px. Numeric contrast and rendered readability not independently established here. |
| Pending duration | Shared api() fetch has no application-level abort/timeout; a request that remains pending leaves sign-out disabled until settlement. No permanent spinner defect is claimed without evidence of actual duration/environment. Consider an explicit timeout or recovery affordance if operational failures can hang indefinitely. |

## Exact evidence still needed

1. Exact source/build binding plus rendered Settings Device access card at390×844 and820×1180, for pending and failed sign-out states. Source-derived readable crops should include heading, explanatory copy, Switch profile, sign-out button, complete alert and container edges. Capture viewport and scroll position.
2. Neutral element rectangles/computed target sizes/overflow data and image SHA-256 for each state; four-edge containment against real pixels.
3. Keyboard activation, focus location while pending/after failure, visible retry focus, and successful keyboard retry without unexpected navigation before success.
4. Real assistive-technology announcement check if an actual screen-reader accessibility pass is required. Browser semantics inspection alone cannot certify it.
5. Functional failure/retry evidence for network rejection and non-2xx operational errors; delayed-request pending state evidence. Existing test source was read but its execution has not been claimed by this reviewer.

## Current result

SOURCE REVIEW COMPLETE; RENDERED VISUAL / EMPIRICAL ACCESSIBILITY COVERAGE UNRESOLVED. Prior preview-dialog visual receipt applies only to its unchanged exact regions; it does not certify this changed Settings surface. Any candidate change invalidates affected source findings until reread.
