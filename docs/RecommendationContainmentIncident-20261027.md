# Recommendation containment incident — 2026-10-27

## Incident and verified cause

The Founder reported that children on the family iPad tapped YouTube
recommendations beneath an approved video and reached YouTube. This reopened
Safe Playback acceptance for recommendations, same-frame navigation, native
fullscreen, app links and Home Screen/PWA behavior.

Production readback found the affected household had
`parents.safe_playback_enabled = false`. The deployed child player intentionally
used an unsandboxed iframe whenever that legacy optional setting was false.
That was the direct escape mechanism. The product also had two defense gaps:
its sandbox blocked top-level and popup navigation but could not by itself stop
the iframe from replacing the approved video in its own browsing context, and
identity checking depended too heavily on provider state callbacks.

The prior iPad observation exercised one external exit control. It did not
exercise recommendations or same-iframe replacement and therefore does not
qualify the affected paths.

## Emergency correction

- Safe Playback is now a mandatory Child Mode invariant, not a household
  preference. The Parent UI no longer exposes an OFF control; the Parent API
  rejects false; the child API always returns true; and the database has a
  `safe_playback_enabled = true` check constraint.
- Hosted migration `20261027134442_mandatory_safe_playback` restored the sole
  production household to true and recorded an audit event. The household,
  credentials, profiles, PINs, videos, assignments, Collections and timer state
  were not recreated or reset.
- Child playback always uses the constrained `youtube-nocookie.com` embed. CSP
  permits only its `/embed/` path, not arbitrary YouTube frame destinations.
- A load guard is armed immediately after the iframe's first document load,
  before the asynchronous IFrame API readiness callback. Any subsequent frame
  document navigation fails closed.
- A 250 ms identity watchdog uses the official current-video URL first and
  player data second. An explicit mismatch stops and destroys the player even
  without a state event. Persistently unreadable identity fails closed while
  playing or paused, with the existing bounded WebKit initialization grace.
- Unauthorized recovery never plays the candidate: the iframe is removed and
  the child can return to the library or reload the approved item.
- The server-authoritative remote timer, sibling authorization, Parent Mode and
  ordinary native playback controls/manual fullscreen were not rebuilt or
  weakened.

## Verification boundary

Automated coverage includes mandatory enforcement at UI/API/database layers,
a stale-false API response, popup/top/deep-link exits, silent related-video ID
replacement, pre-ready and post-ready same-frame navigation, timer regression,
sibling authorization and child recovery. Exact final commit/deployment and
test totals are added after publication. Corrected-candidate gates before
publication: lint PASS, typecheck PASS, production build PASS, 200/200
unit/integration tests PASS and 25/25 browser flows PASS. Independent security
and product/copy re-reviews both PASS for deployment.

Physical-family-iPad evidence is still required for the provider-owned
recommendation surfaces in ordinary playback and true fullscreen. Browser
automation does not certify native fullscreen, universal links or the YouTube
app handoff. Until that one frozen-candidate observation passes, status is
`DO NOT DELETE YET` and not Founder Ready.

## Native-device decision

The strongest future architecture is a thin SwiftUI/WKWebView shell over the
existing Next.js/Supabase product, not a rewrite. Navigation and UI delegates
can reject main-frame, subframe, new-window and custom-scheme transitions;
native lifecycle code can more reliably suspend media and close fullscreen/PiP;
the same approved-video identity watchdog remains necessary.

A native wrapper cannot automatically lock an ordinary family iPad. Manual
Guided Access is the consumer fallback. Family Controls/Managed Settings can
shield selected apps and websites on a Family Sharing child device only after
Apple grants the distribution entitlement and the app is signed/distributed.
True one-app device lock requires supervision plus Single App Mode/App Lock via
Apple Configurator or MDM. No paid service, Apple agreement or entitlement was
accepted, and the current PWA was not replaced during this incident.

## Rollback and evidence

- Pre-incident durable GitHub head: `88f14c7551c8f18333941078bcd9ebef14c9120d`
- Pre-incident production deployment: `dpl_H6ngNBpffxUV6aiLvR25Vf9fB2Db`
- Prior app rollback: `dpl_FXsKRLDLwGGUs2Ers2zdECTJ6LAM`
- Exact successor commit/deployment: pending publication
- Real iPad recommendation/fullscreen acceptance: pending one final observation

