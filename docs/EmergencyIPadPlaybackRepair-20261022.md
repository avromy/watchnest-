# Emergency iPad playback repair — 2026-10-22

## Exact recovery point

- Reported application commit: `9c873e5fd339fcc512aca33697c6d13b6f8b5e2e`
- Reconciled production source commit: `1350431531d9664b8f451362b64cbd6a2ba7b026`
- Current production deployment before repair: `dpl_9b7aXXJWspCMUfE5TjZ1mLrYthU4`
- Application deployment before repair: `dpl_GgstPwCnUtCaxW6oZJP9Zf7aR5BN`
- Last real-iPad-working application candidate: commit
  `c01979cac34bd713b4db0eeb9b7f3f9a1e32e8de`, tree
  `9f1ef6a38b95d13738cc8bf814066ed5839f3871`, deployment
  `dpl_96bDGJEnZqSn2tdKR1Sfc7fpAWQ7`

No Parent, household, child, PIN, video, assignment, Collection, setting or
trusted-device row was changed during diagnosis or repair. The pre-repair
deployments above remain rollback points.

## Verified root cause

The October 21 desktop repair unintentionally replaced the last-known-good iPad
behavior for Made-for-Kids and unknown-status videos. The working candidate used
native controls and one manual Play action. The successor requested autoplay
and treated a temporarily empty `getVideoData().video_id` during WebKit
buffering as an unauthorized video.

That combination is an application regression on iPad/WebKit: an authorized
video could be rejected before the player had a stable identity, and the MFK
path unnecessarily requested autoplay instead of preserving the proven manual
Play behavior. The database, assignment, embeddability and session state did not
cause this code-path regression.

## Repair

- Restored manual native Play behavior for MFK and unknown-status videos; they no
  longer request autoplay.
- Kept identity monitoring for every Safe Playback video so related/end-screen
  interaction cannot replace the approved video with an unapproved one.
- Made identity enforcement fail closed immediately on an explicit mismatching
  video ID and after a bounded 2.5-second grace period for a persistently
  unreadable identity. A transiently absent ID is treated as initialization
  state rather than immediate proof of unauthorized playback.
- Added the documented `getVideoUrl()` identity source before classifying the ID
  as unavailable.
- Preserved native controls, `playsinline`, manual fullscreen, the existing
  iframe sandbox, external-navigation containment and assignment authorization.
- Preserved the Safe Playback fail-closed behavior if monitored initialization
  genuinely fails. No broad direct-iframe fallback was introduced for that path.

## Exact-candidate verification

- Typecheck: PASS
- Lint: PASS
- Unit/integration tests: 188/188 PASS
- Production build: PASS
- Isolated Chromium browser flows: 20/20 PASS
- New regression coverage: MFK manual contained playback with no autoplay;
  exact approved source; external navigation blocked; an unapproved related ID
  is stopped; transient empty iPad identity recovers; permanently unreadable
  identity and Safe Playback initialization failure both fail closed.
- WebKit package installation succeeded, but this execution host lacks required
  system WebKit libraries and sandbox policy denied the OS-package installation.
  No physical-iPad result is inferred from Chromium or responsive simulation.

## Evidence state

The earlier real-iPad PASS is controlling evidence for the last-known-good
candidate and establishes that manual Play, manual fullscreen and Safe Playback
worked on the family device. It is stale for the repaired successor
because the player implementation materially changed after that observation.
One final physical-family-iPad playback observation is therefore required only
after the repaired production candidate is frozen.

