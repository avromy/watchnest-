# iPad startup recovery — 2026-11-02

Status: IN PROGRESS. Physical-iPad playback FAIL on the prior deployment; no
new real-device PASS is claimed. Builder 2 is the sole active implementation
owner. Prior Builder is historical/recovery only.

## Exact recovery

- Production/source base: `1bd5f184c61cc9e43af2a707884e98fd1d7731e9`.
- Base tree: `1f37d1b6334496a05dbb87ca4e60baf9d2f334b3`.
- Production: `dpl_HAF2T6KASXZMTaQ86Z4LhKY5QD8i`, canonical
  `https://watchnest-rho.vercel.app`; Vercel project
  `prj_tQi2cBAosldposlx61FcwnwDJ8OG`.
- Production branch is `product-completion-20260930`; `main` is an older
  foundation. Do not deploy or rebuild from main.
- No newer recovery branch/commit was present among recovered remote refs.
  The removed local clone/background work was NOT recovered.
- Last physically working source in durable evidence is `c01979c`, which used
  direct MFK/unknown embedding without mandatory IFrame API readiness. Its iPad
  observation does not certify the present player or recommendations.
- Hosted WatchNest project `ysukwpeowpcixdzkexky` is active/healthy. Migration
  `20261027134442_mandatory_safe_playback` remains applied; database check
  `parents_safe_playback_required` enforces true. One existing household remains
  true. No database, credentials, profiles, timer or family-content mutation.

## Verified source defects versus physical hypothesis

The photographed message, “The video player could not start safely. Please try
again.” comes from the startup promise rejection handler: API script failure,
API/iframe timeout, or synchronous construction exception. The second-load
navigation guard directly produces a different authorization message.

Verified source defects:

1. API attachment unnecessarily waits for full iframe document load, with a
   15-second deadline. Slow subresources prevent attachment even when the
   official API could already initialize. Google documents attachment to an
   existing iframe; it does not require full-document load first.
2. Containment teardown has no terminal latch. A late API promise can construct
   against a removed iframe and overwrite the original error; late readiness
   callbacks can execute after shutdown.
3. Provider onReady had no bounded deadline after successful construction.

The exact event sequence on the physical iPad remains UNVERIFIED. The
second-load hypothesis is not promoted into a verified physical root cause.

## Bounded repair

- Attach the official API without waiting for the iframe full-document load.
- Arm load containment before insertion; ignore only readable initial
  `about:blank`; reject a second nonblank completed document load. Never trust
  the DOM src as proof of the cross-origin document's current URL.
- Irreversible stopped/disposed/remote-block checks prevent callback revival.
- A bounded 20-second readiness deadline and construction/readiness exception
  handling fail closed and remove frames; diagnostic phase/reason is separate
  from the child-facing error.
- Validate the exact expected iframe and embed path; unexpected frame
  replacement fails closed.
- Sandbox, CSP, identity polling, individual authorization, sibling isolation,
  Parent Mode, native in-frame Play/manual fullscreen, remote timer and Discover
  & Request remain unchanged. No unsafe direct-embed fallback or OFF toggle.

## Qualification and limitations

Local lint/typecheck/build and 200 unit/integration tests passed during the
repair. Local Node memory telemetry fails with `uv_resident_set_memory ENOENT`;
a scratch-only preload handles unavailable telemetry for build/test execution.
It is not committed or deployed. Chromium in this restricted runtime exits
SIGTRAP before any browser test executes; those runs are environment FAIL, not
product PASS. Run exact-candidate browser qualification in GitHub CI before
release. New synthetic regressions exercise delayed full load, late API and
ready callbacks after containment, missing readiness, frame replacement,
readiness exceptions and provider error before readiness.

Independent technical source review found and required repair of unmonitored
frame replacement and exceptions in readiness setup. Independent security
source review found no new P0/P1 regression after those repairs. This is not a
real-provider or physical-iPad verdict.

Inherited limitation: a first nonblank completed iframe load is not proof of
its current cross-origin document identity. Existing sandbox/CSP and continuous
identity checking are layered protections, not a browser navigation delegate.
Do not claim zero-duration unapproved playback or native-device containment
from synthetic tests. Genuine recommendation and remote-fullscreen gates
remain open; assess a thin native navigation-delegate correction if the PWA
fails those gates.

## Rollback and deterministic queue

Preserve production base `1bd5f18` / `dpl_HAF2T6KASXZMTaQ86Z4LhKY5QD8i`
before mutation. It is a recoverable baseline with KNOWN iPad playback FAIL,
not a family-usable rollback. Never roll back mandatory database enforcement or
restore optional Safe Playback.

Next: publish isolated repair branch; exact-candidate CI/browser regression;
reconcile independent source review; deploy the same reviewed application to
the existing project; verify exact alias/source/configuration; freeze; then
perform one consolidated real-iPad observation beginning with approved video
picture/sound. Only after startup succeeds, test related/More Videos in normal
and native fullscreen plus phone End now while fullscreen. Do not claim
WATCHNEST_IPAD_PLAYBACK_RESTORED or Founder Ready before genuine evidence.
