# Final physical-device acceptance — 2026-10-07

Bound to the frozen application candidate `c01979cac34bd713b4db0eeb9b7f3f9a1e32e8de`,
tree `9f1ef6a38b95d13738cc8bf814066ed5839f3871`, deployment
`dpl_96bDGJEnZqSn2tdKR1Sfc7fpAWQ7`, production URL
https://watchnest-rho.vercel.app, and Founder household Safe Playback ON.

- **Real family iPad:** WatchNest opened; Miri's assigned video played; true
  fullscreen engaged; audible autoplay did not begin; the Founder used the
  platform-required Play action; tapping the YouTube external/exit control did
  not open an external page/app; the Founder remained in WatchNest.
- **Real iPhone:** video playback stayed in WatchNest; true fullscreen did not
  engage, so the WatchNest immersive in-app view remained the fallback.
- **Acceptance:** PASS for the intended hierarchy. Fullscreen is best-effort,
  Safe Playback—not fullscreen—is the containment boundary, and Apple-platform
  audible autoplay may require one clear Play action.
- **Evidence discipline:** the earlier pre-amendment iPad result remains
  historical baseline evidence. This post-amendment observation is the
  controlling real-iPad acceptance for the frozen final candidate.

No application change followed this observation. Terminal state:
`WATCHNEST_FINAL_FAMILY_BETA_FOUNDER_REVIEW_READY`.

---

# Device protection and immersive playback amendment — 2026-10-06

**Deployed application:** `c01979cac34bd713b4db0eeb9b7f3f9a1e32e8de` /
tree `9f1ef6a38b95d13738cc8bf814066ed5839f3871` /
`dpl_96bDGJEnZqSn2tdKR1Sfc7fpAWQ7` at
https://watchnest-rho.vercel.app.

## Product decision

WatchNest presents three protection levels in Parent Settings without making a
dedicated iPad mandatory:

1. **Safe Playback — Recommended.** Parent-controlled, on by default, and no
   special iPad setup required. The sandbox remains attached before child
   playback loads and is independent of assignment authorization.
2. **Enhanced YouTube protection — Limited on iPad / NOT PRACTICAL as a
   dependable consumer tier today.** Screen Time can restrict an app or a
   website, but Apple does not document a reliable consumer rule that
   distinguishes top-level YouTube destinations from every resource required
   by an embedded YouTube player. `Approved Websites Only` is explicitly not
   recommended because the Founder observed it breaking WatchNest playback.
   Removing/restricting the YouTube app still adds protection while ordinary
   Safari remains available, but WatchNest does not represent that as complete
   YouTube-site containment.
3. **Dedicated WatchNest device — Maximum.** Add WatchNest to the Home Screen,
   verify playback, remove/restrict the YouTube app, then disable Safari.
   Guided Access is an optional focused-session layer. This is an optional
   family choice, not a WatchNest requirement.

## Playback behavior

- A child video-card tap synchronously requests standards-based fullscreen
  before the same-document route transition. Unsupported or denied requests
  fail quietly into the WatchNest immersive player.
- The player route uses the full available viewport, removes unrelated
  WatchNest navigation and hides WatchNest Next Up until the selected video has
  ended. A visible Back to Library action remains.
- Non-Made-for-Kids videos request audible immediate playback using the current
  supported `autoplay=1` parameter and an IFrame API `playVideo()` call. If the
  browser blocks autoplay, WatchNest shows one obvious Play action.
- Made-for-Kids and unknown-status videos do **not** request autoplay. Current
  official YouTube documentation says autoplay starts playback-data collection
  on page load, while the current MFK guide requires tracking to be disabled.
  These videos therefore retain one native Play action rather than weakening
  the existing privacy safeguard.
- Muted autoplay is not used. A silently moving child video is a worse and less
  obvious fallback than one clear Play action.
- True fullscreen is best-effort. It depends on the browser honoring the
  original card-tap activation. iPhone/iPad Safari and installed web-app modes
  are not claimed to support automatic true fullscreen without final physical
  observation. The immersive WatchNest player is the deterministic fallback.

## Official player configuration and “More videos”

Current configuration keeps `controls=1`, `iv_load_policy=3`, `playsinline=1`,
`rel=0`, and `origin`; it adds `autoplay=1` only to eligible child playback.
`enablejsapi` and `start` remain conditional. WatchNest does not set
`controls=0`, `fs=0`, or `disablekb=1`, because those settings would remove
useful play/pause, fullscreen, keyboard, seek, volume, or caption access without
removing YouTube's required identity and recommendation surfaces. Deprecated
`modestbranding` and `showinfo` remain absent.

**More videos: PARTIALLY reduced, not removable.** `rel=0` narrows related
videos to the same channel; official documentation says related videos cannot
be disabled. YouTube also states that channel avatar and title remain before
playback, when paused, and when playback ends. The immersive WatchNest shell
reduces surrounding distraction without cropping or obscuring the official
player.

## Real iPad evidence — pre-amendment baseline only

Bound to production evidence commit `5e23aeb31111c721b7ebd150991f2bff3ddf35f9`,
underlying application commit `646d67b6e1b0bd15bcd01888cba93fb4daf6892d`,
production deployment `dpl_Fpj3GZH6nuXx9yX4Ut1JLiYUX8Tw`, Safe Playback ON,
Home Screen launch, Safari disabled, and `Approved Websites Only` removed:

- WatchNest remained launchable from its Home Screen icon with Safari disabled.
- Approved playback worked after the restrictive website allowlist was removed.
- The Founder tapped one tested YouTube exit; no external page or app opened,
  and the Founder remained in WatchNest.

The iPad model, iPadOS version, exact video/control, and YouTube-app state were
not separately reported and are not inferred. Because this amendment changes
player entry, autoplay, and viewing layout, the observation is retained as
authoritative baseline evidence but is stale for final post-amendment playback
UX acceptance. One final physical-iPad observation is required only after the
new candidate is deployed and frozen.

## Current official authorities consumed

- YouTube Embedded Players and Player Parameters, current through 2026-10-06.
- YouTube “Finding the MadeForKids status of a video,” updated 2026-09-14.
- WebKit iOS video policies for user activation and inline playback.
- Apple Support: Screen Time website/app restrictions and Guided Access.

No player overlay, crop, click interception, muted-autoplay workaround, device
management promise, or synthetic real-device claim is introduced.
