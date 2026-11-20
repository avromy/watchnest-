# Independent client integrity audit and narrow sign-out repair

Date2026-11-20. Integrity checkout currentremote36e8b683, inherited application source146a672f. Reviewer previously performed independent blind Parent/Child journeys and then authority pass; this new source integrity audit is explicitly not blind. No hosted login, family settings, credentials or production data touched. No publish performed.

## Reproduced defect CLIENT-01 — silent failed sign-out / unhandled promise

Before repair, Settings `Sign out of this device` awaited `/api/auth/logout` without catch, busy state or failure feedback. Browser fault injection against the unchanged146a672 `.next` reproduces:

- Aborted logout fetch emits actual browser pageerror `Failed to fetch`, remains on Parent Settings, no sign-out failure alert.
- HTTP503 logout has no user-visible failure alert.
- Held logout request leaves sign-out button enabled and no pending label.

Severity: P1 safety-relevant error handling; this does not prove backend session clearance fails on successful requests and does not establish unauthorized access. It means the parent gets no explanation when the requested access-removal operation fails. Failed fetch is a realistic runtime fault, not malformed successful data invention.

### Red evidence

Focused regression file `e2e/independent-client-integrity.spec.ts` (three tests) first failed3/3 against old146 built app: missing alert for network/HTTP fault and missing pending disabled state. A second network-only run strengthened the assertion and preserves actual unhandled browser error:

```
Expected []
Received ["Failed to fetch"]
```

Receipt: `docs/integrity-20261120/client/red-results/results.json` and corresponding `error-context.md`; red-only config points explicitly at old watchnest build on isolated3004. Its output is intentionally separate from controller suite. The final network rerun replaced the first result JSON; initial3/3 outcomes are recorded here and in tool journal, not claimed as still present in that JSON. Source fixes do not alter old built artifact; this red check remains meaningful after edits.

### Authorized narrow repair

Only production file changed by this reviewer: `src/components/parent/ParentApp.tsx`, Settings sign-out handler.

- Separate logoutBusy/logoutError state, pending `Signing out…` disabled button and in-handler repeat guard.
- Failure is caught and displays `Could not sign out. This browser may still be signed in. Please try again.`; button reenabled for retry.
- Navigation to /login occurs only after confirmed success. No fake local logout or optimistic claim that cookies/session were cleared; actual HttpOnly cookie clearing must remain server-owned.
- Successful pending state stays disabled until navigation. Failed retry clears previous error before sending.

Scoped eslint and `tsc --noEmit` passed before controller build. Controller owns repaired-build green run and whole-suite regression; this report does not fabricate that result. Three tests assert network/HTTP failure visible+no pageerror, button retry with subsequent success navigation, and exactly one request while held/pending disabled.

## Other reviewed client paths / evidence limits

Inspected ParentShell startup/API/reload/act, parent async callbacks (switch profile, collections/bulk/request/profile photo/view-as/settings), ChildLogin startup/PIN/handoff, ChildLibrary startup/session refresh/favorite/hide/request/discovery, ChildPlayer startup and session refresh, login handling, error boundary and existing startup/e2e tests.

- Parent startup rejection is caught, displays an alert with Try again when no data; session role mismatch directs to picker/login. Child library startup rejection renders an error and Choose profile. Login errors catch and restore busy state. These are source observations, not new exhaustive rendered acceptance.
- Parent shared `act` catches mutation or subsequent dashboard reload failures and restores busy. Most parent callback paths use it or local try/catch. Child favorite/hide rejection restores optimistic state and shows error; requests/discovery handle errors. No second unhandled rejection conclusively reproduced in this bounded source pass.
- Child session-access polling has a4second abort and fails closed on unconfirmed time. Player startup existing tests specifically cover storage denial/corruption, late readiness/containment, replaced frames, startup errors and timeout. Those existing tests were inspected, not independently re-executed here or mistaken for provider/device validation.

### Conditional concerns, not established production defects

1. Parent dashboard response is cast with no runtime schema guard; requests.filter at shell render assumes an array. Child library directly stores videos/collections and later filters/maps. A malformed200 JSON shape could render-error (caught at app boundary where applicable), but no naturally produced endpoint response causing this was established. Do not turn arbitrary fabricated malformed200 into an observed product incident. Server contract inspection is needed before promoting severity; no repair undertaken.
2. Initial session/dashboard/library/login fetches have no explicit app timeout or AbortController (unlike child polling). A transport that neither resolves nor rejects can retain loading/pending state. This is conditional availability risk; no real persistent hang proven. Browser/network/platform deadlines and explicit abort behavior were not exhaustively qualified.
3. Parent shared act treats successful mutation plus failed dashboard reload as false/error, so caller may offer retry of already-applied action. No server idempotency/duplicate destructive effect established by this reviewer; server auditor/controller should assess specific non-idempotent operations before escalating.
4. ChildLogin redirects to /login for any picker setup failure, including transient network faults in profile-exit/device/parent-lock sequence. This may force unnecessary sign-in recovery but fails closed; no real-host authentication or harmful session action tested.

## Final state

CLIENT-01 objectively reproduced and narrowly repaired, green verification pending controller. Other issues remain explicitly conditional. No arbitrary schema hardening, unrelated UI redesign, auth bypass, local credential purge, hosted login handoff or family configuration mutation performed. Current source includes controller-owned server changes not assessed here. Bind green evidence to its exact new commit/build before acceptance.
