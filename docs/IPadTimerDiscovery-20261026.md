# iPad playback, session timer, and child discovery — 2026-10-26

## Candidate binding

- Application source commit: `d0eae994ca16d8d2a347c04fe20c8db2a1409848`
- Application tree: `8ed32c6e3703ea9855653cfd106c078970011532`
- Production deployment: `dpl_EBoRfBbBRCUMgXZnCVx3GdqxsUsP` (`READY`)
- Production alias: https://watchnest-rho.vercel.app
- Database migration: `20261026045621_session_timer_discovery`
- Rollback application: `877cc82033b007e693da62675d926f3563aa9c8c`
- Preserved rollback deployment: `dpl_5o8edswdV34FYf2viSLwWnv4wNbE`

The migration was additive and backward-compatible. Post-migration verification
found one Parent, four active profiles, 25 family videos, 26 active assignments,
and two Collections. All four existing profiles remained unlimited with Discover
off. No family content, credentials, PINs, assignments, Collections, or sessions
were recreated or reset.

## Gate A — physical-iPad playback repair

Verified root cause: the prior outer WatchNest Play control called
`YT.Player.playVideo()` in a cross-origin iframe. On iPad/WebKit, the tap's user
activation does not transfer into the YouTube iframe, matching the Founder's
observation that the player opened but did not start.

Repair: the outer control and asynchronous autoplay path are removed. The
official in-frame YouTube Play control receives the child's real gesture.
Native controls and manual fullscreen remain. Safe Playback sandboxing,
approved-video identity monitoring, origin/referrer configuration, assignment
authorization, explicit mismatch shutdown, and bounded unreadable-identity
failure remain enforced. BUFFERING no longer causes a false rejection merely
because WebKit has not exposed the video identity yet.

Synthetic and source qualification pass, but this candidate has no genuine
physical-iPad picture-and-sound observation. Gate A remains **physical-device
confirmation pending**; no Chromium/tablet viewport evidence is promoted.

## Gate B — WatchNest session timer

Apple Guided Access may contain navigation, but Safari/PWA receives no supported
remaining-time or timer-expired event. WatchNest therefore owns an independent,
Parent-started wall-clock access deadline. It records no per-video elapsed time
and does not reconstruct Made-for-Kids watch telemetry.

The database supplies the deadline. Child player and progress endpoints deny at
expiry. The client anchors a local timeout from server time, pauses and destroys
the player, removes the iframe, attempts fullscreen exit, denies PiP, and shows
Time's Up. Reload and direct player access fail closed. Visibility, pageshow,
focus, and a five-second server revalidation protect sleep/wake and Parent
revocation. Parent extensions/disabling now replace the active client deadline
without rebuilding the cross-origin player.

Foreground timer teardown, reload denial, stale-deadline replacement, and
Parent restoration pass automated acceptance. Exact shutdown while iPad native
fullscreen is suspended remains part of the single final physical-device check.

## Gate C — Discover & Request

Discover defaults off per child. Parent may authorize topics or exact channels.
The child sees non-playable metadata cards only: no preview, YouTube link, or
player. Search runs through the server with strict safe-search, embeddable and
syndicated filters; conservative duration filtering excludes current Shorts at
the cost of some short-video false positives.

Request tokens are HMAC signed and bound to profile, video, boundary, and expiry.
The server rechecks the still-enabled boundary and live video metadata before
creating one idempotent pending request. The child request API never creates an
approval or assignment. Parent approval revalidates metadata and atomically
creates the family approval, requesting-child assignment, optional additional
assignments/Collection membership, and resolved state. Tampering, cross-profile
tokens, removed boundaries, duplicate requests, and video/request mismatch are
covered by negative tests.

Topic keywords are an intent boundary, not a child-safety guarantee; channel
boundaries are the stronger Parent option. Every result still requires Parent
approval before playback.

## Acceptance

- TypeScript: PASS
- ESLint: PASS
- Unit/integration/database: 197/197 PASS across 25 files
- Production build: PASS
- Browser flows: 22/22 PASS
- Independent red-team: conditional GO; no approved-only, sibling-isolation,
  request-to-approval, or migration-safety bypass found. The stale timer-deadline
  finding was repaired and regression-tested before publication.
- Production deployment and alias: READY; session probe configured; no runtime
  error/warning/fatal logs observed after probe.
- Physical family iPad: PENDING for picture/sound and timer expiry in manual
  fullscreen. This is one final observation against the frozen candidate.

## Terminal state

`WATCHNEST_IPAD_PLAYBACK_TIMER_DISCOVERY_AUTONOMOUS_GATES_PASS`

Do not claim full physical-iPad or Founder Ready acceptance until the one final
device observation passes.
