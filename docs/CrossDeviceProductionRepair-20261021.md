# Cross-device production repair — 2026-10-21

Scope was bounded to the Founder-reported production failures. No schema
migration, credential reset, account recreation, or family-data rewrite was
performed.

## Candidate and recovery

- GitHub release commit: `9c873e5fd339fcc512aca33697c6d13b6f8b5e2e`
- Application tree reviewed locally: `7e55b408baee4b2683946975696f8ed5816b87f9`
- Production deployment: `dpl_GgstPwCnUtCaxW6oZJP9Zf7aR5BN`
- Public alias: `https://watchnest-rho.vercel.app`
- Immediate rollback: `dpl_89kqGMxDf55gwTi4yQqDDzYgJgDn`
- Earlier application rollback: `dpl_68jy2Bm4JUYEWTDdJfA2rN88XG2C`

## Verified root causes and repairs

- Desktop playback raced the load of a prebuilt sandboxed YouTube iframe
  against IFrame API construction. The player now waits for both resources and
  continues to fail closed when the approved-video identity cannot be read.
- Optional YouTube search-cache reads, writes, and expired-cache cleanup were
  on a family-data critical path and generic error mapping obscured the actual
  operation. Cache operations are now best effort; sensitive values are not
  logged.
- Mobile URL intake relied on a delayed state effect. It now resolves complete
  URLs directly from change/paste input, coalesces a rapid fallback tap, and
  retains an explicit Load videos action. A rejected automatic lookup is
  evicted from the coalescer so the unchanged URL can be retried immediately.
- Channel and playlist result selection previously changed state without
  immediately loading source videos. It now issues the explicit source request.
- Parent preview iframes were less contained than Child Mode. They now use the
  same Safe Playback sandbox when the household setting is on.
- A valid trusted-device token could be redirected to login, and renewal writes
  were authorization-critical. Device sessions now return the profile-picker
  role; renewal is sliding but best effort after successful validation.
- Periodic playback authorization failures now receive authorization,
  unavailable, or network classification instead of the generic player-start
  heading.

## Qualification

- 188 unit/integration tests pass.
- TypeScript and ESLint pass.
- Optimized production build passes.
- 18 isolated Playwright flows pass, including mobile URL coalescing, transient
  automatic-failure retry, channel
  and playlist browsing, responsive widths, Safe Playback fail-closed behavior,
  and Parent preview containment.
- Independent security review: PASS with non-blocking provider-signal caveat.
- Independent visual review: PASS after 44px segmented-control repair.
- Independent Stranger review: PASS after renewal, cache, duplicate lookup,
  playlist, and error-classification repairs.

Synthetic viewport evidence is not physical-device evidence. The latest player
implementation materially changed after earlier iPad evidence, so final
physical-iPad acceptance remains pending until the device is available. No
duplicate Founder test is requested during this repair run.

Parent YouTube OAuth was not added: no OAuth client configuration exists, and
account connection would not repair playback or establish Premium entitlement.
The existing Parent Settings disclosure remains accurate. Child playback has no
WatchNest YouTube sign-in path.

## Continuous learning

Optional cache maintenance and trusted-session renewal must never sit on the
authorization or primary-product critical path after the current token/session
has already been validated. Cross-device input acceptance must exercise the
actual mobile event sequence plus a rapid fallback action. Browser evidence must
run against a freshly built isolated server; reusing an old local port can bind
tests to a stale application candidate.

