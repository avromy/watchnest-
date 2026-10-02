# Founder-found playback failure and repair — 2026-10-02

## Reopened acceptance

The Founder successfully authenticated on the real device, entered Miri's profile, opened the assigned real PBS KIDS video and reached the WatchNest player route. WatchNest then showed `This video is unavailable` and `The video player could not load. Check your connection.`

That evidence revokes every prior implication that real playback works. Authentication, child navigation and the server-owned player authorization path are confirmed; audiovisual playback and iPad Safari acceptance remain open until the repaired candidate receives new real-device evidence.

## Exact failure boundary

- Last deployed source before repair: `5482e56842d0dc3dd7945030dcf934b44130a125`.
- Last deployed runtime parent: `abd02f0a95e4fc6dc4d52acc86feea8e9b5b7132`.
- Last production deployment: `dpl_5TTgS86tuebcM48Q8PHUQJVEojKZ`, READY.
- Rollback target: that exact deployment/source remains available.
- The production `/api/child/player` request returned 200 repeatedly and Vercel reported no server runtime errors during reproduction.
- The visible child error text is emitted only by the client-side 15-second YouTube IFrame API bootstrap timeout. It is not emitted by video authorization, metadata, or an actual connectivity detector.
- The real selected video is still returned by the production Data API as available and embeddable. The failure occurred before WatchNest received a YouTube player-ready or player-error event.

## Root cause and defect class

WatchNest made all playback—including Made-for-Kids videos with progress intentionally disabled—depend on the optional YouTube IFrame JavaScript API bootstrap. When that third-party script did not signal readiness, WatchNest blocked playback and mislabeled the failure as a likely connection problem. Earlier automation reproduced the same bootstrap failure but treated it as an environment-only limitation, so it did not challenge the unnecessary dependency in the product architecture.

Defect class: a critical user outcome was coupled to optional telemetry/control infrastructure, and a timeout was presented as a diagnosed connectivity error without evidence.

## Repair

- Made-for-Kids and otherwise tracking-disabled videos use an official direct privacy-enhanced YouTube embed. Playback no longer waits for the IFrame JavaScript API.
- Every direct embed uses `youtube-nocookie.com`, `playsinline=1`, an explicit production origin and `strict-origin-when-cross-origin` referrer policy.
- Explicit non-Made-for-Kids videos retain the IFrame API for bounded functional resume. If that optional API bootstrap fails, WatchNest falls back to the direct official embed and clearly says only resume is temporarily unavailable.
- YouTube player error codes are classified: invalid parameters, HTML5/player service, removed/private, embedding prohibited, missing client identity and unknown.
- Parent Library now has a visible per-video Preview action using the same official direct embed. This lets a Parent verify approved content without entering a child profile or weakening assignment authorization.
- Approved-only server authorization, child-session binding, sibling isolation and Made-for-Kids analytics suppression are unchanged.

## Regression improvement

New tests require:

1. Made-for-Kids playback to render a direct identified privacy-enhanced iframe without `enablejsapi`.
2. IFrame API bootstrap failure to fall back to playback instead of showing an unavailable/connectivity error.
3. Parent Library to expose an obvious playback Preview.
4. Every documented YouTube error code to map to a distinct safe classification.

## Current official authority consumed

- YouTube IFrame Player API reference: documented error codes 2, 5, 100, 101, 150 and 153.
- YouTube embedded player parameters: direct iframe and IFrame API are both supported; `origin` is required when JavaScript control is enabled.
- YouTube Required Minimum Functionality: browser embeds must provide API client identity through Referer; YouTube recommends `strict-origin-when-cross-origin`.
- YouTube privacy-enhanced embedding guidance: `youtube-nocookie.com` remains the supported privacy-enhanced host; child-directed self-designation and platform rules remain controlling.

## Evidence state

Local lint, typecheck, 167 unit/integration tests, production build and ten browser tests pass. This evidence is automated/synthetic and does not certify audiovisual output. Deployment, live server-bound regression, real iPad playback/escape observation, affected visual review and independent cold recheck must bind the exact repaired candidate before Founder Ready.

## Learning propagation

- PROJECT: playback must not depend on progress/telemetry capability when policy disables that capability.
- DOMAIN: treat third-party SDK bootstrap as optional when the platform supports a simpler native/embed path for the primary outcome.
- PROCESS: a Founder-found real-device defect revokes the affected gate even when prior automation had a plausible environment explanation; the explanation must be challenged against the product architecture.
- PROCESS: never label a timeout as a network problem without a connectivity signal.
