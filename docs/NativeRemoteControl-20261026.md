# Native app and remote Parent control — 2026-10-26

## Decision

The strongest architecture available without a new paid commitment, Apple
distribution entitlement, or physical-device signing action is the existing
Next.js/Supabase product plus an enhanced server-authoritative remote session
timer. A bare native wrapper is rejected: it would still use WebKit and the
YouTube iframe, would not guarantee autoplay, and would add distribution risk
without enough new capability.

The recommended native successor is an additive SwiftUI shell around the
existing hosted WatchNest application and backend. It becomes worthwhile only
when it supplies native media shutdown, foreground/background revalidation,
PiP control, push wakeups, and—after Apple approval—Family Controls. It is not a
rewrite and is not represented as device-ready before a signed build passes on
the family iPad.

## Implemented remote-control architecture

- The Parent uses the existing protected Parent Mode on any trusted phone,
  opens **Controls**, chooses Miri/Ari/Benny/Eli, and selects **Give time**.
- Atomic service-only database actions support start, extend, pause, resume,
  end, and disable. Every action uses PostgreSQL server time, locks the profile
  row, and increments a monotonic revision.
- Each connected child player performs a lightweight authenticated status
  check every two seconds. It accepts only a current/newer revision and anchors
  its deadline to server time plus local monotonic elapsed time.
- Expiry, Pause, End, or loss of status verification pauses and destroys the
  YouTube player, removes the iframe, attempts to exit fullscreen, blocks
  another video, and fails closed on reload/direct player access.
- Device acknowledgement stores only operational presence, last applied
  revision, and whether the player surface is open. It does not store the video,
  progress, viewing duration, or engagement history.
- Commands are intentionally profile-wide: every active device using Miri gets
  Miri's same deadline/revision. Parent status aggregates distinct devices and
  separately reports connected, pending, and offline/unconfirmed devices.
- Direct Supabase Realtime was not exposed to child browsers because the product
  uses opaque server sessions and service-only RLS. Secure polling is the safe
  current transport. Push/Realtime can later reduce latency but cannot replace
  server authorization or the local deadline.

## Offline and timer semantics

This is one WatchNest wall-clock access deadline, not watched-minute analytics.
Active time continues while content is paused or the app is backgrounded;
Parent Pause explicitly saves the server-calculated remainder. A disconnected
device cannot receive an early End command until it reconnects, but its local
confirmed deadline never moves later and playback cannot continue beyond it.
The Parent UI states this limitation and does not claim an offline command was
received without acknowledgement.

Guided Access may be used without its timer to keep a child inside WatchNest.
Apple exposes Guided Access active/inactive status to a native app, not its
remaining countdown. WatchNest therefore does not synchronize or claim control
of Apple's timer.

## Native and Apple capability boundary

| Capability | Ordinary PWA / current release | Future native WatchNest | External requirement |
| --- | --- | --- | --- |
| Stop WatchNest playback | Server deadline + client teardown; physical fullscreen/PiP proof pending | Add `WKWebView` media pause/close and lifecycle hooks | Signed device build and physical iPad test |
| Block WatchNest until extension | Server-authoritative now | Same server authority, native local fail-closed cache | None beyond native build |
| Keep child in WatchNest | Optional manual Guided Access | Can observe Guided Access state; cannot start consumer device lock automatically | Parent manually enables Guided Access |
| Restrict selected apps/sites | Ordinary Screen Time configured by Parent | Family Controls/Managed Settings can apply local shields | Apple-granted Family Controls distribution entitlement and Family Sharing authorization |
| Force whole iPad into one app | Not available to an ordinary web/native app | Single App Mode only on supervised/managed devices | Device erase/supervision and Configurator/MDM |

A native YouTube player remains the official iframe inside `WKWebView`. It must
identify the API client with the correct HTTPS origin/referrer or bundle-ID
referrer. It preserves the native in-frame Play gesture because an asynchronous
outer `playVideo()` call is not a reliable iPad user gesture. Native can improve
lifecycle enforcement; it does not by itself fix or replace YouTube playback.

## Apple preflight for the native phase

No native project or speculative infrastructure was created in this run. A
meaningful native candidate requires one consolidated external preflight:

1. An active Apple Developer Program team and permission to create/sign the
   WatchNest app, App ID, TestFlight build, and required extensions.
2. The Account Holder submits Apple's Family Controls distribution-entitlement
   request for the app and extensions if cross-app/site shielding is pursued.
3. A Family Sharing child-device authorization is available for the parental
   path; individual self-authorization is not treated as equivalent.
4. The family iPad can install the signed candidate and perform playback,
   fullscreen/PiP expiry, app restart, and restriction-bypass acceptance.
5. Before Kids-category distribution, privacy/App Review review covers parental
   gates, third-party YouTube playback/ads, analytics exclusions, and content
   rights representations.

## Verification and open evidence

- Application GitHub commit: `da666702369653076ab9a7a0cc2ff94290a626e9`
- Application tree: `2fd4aae8865c131af2d1e59ae72d626f6f4c518b`
- Production deployment: `dpl_FXsKRLDLwGGUs2Ers2zdECTJ6LAM` (`READY`)
- Production URL: `https://watchnest-rho.vercel.app`
- Hosted configuration: `configured:true`; no observed runtime errors or
  warning/error/fatal logs after the production probe

- TypeScript: PASS
- ESLint: PASS
- Unit/integration/database: 199/199 PASS
- Production build: PASS
- Browser flows: 23/23 PASS on the final corrected candidate, including
  success-to-outage status truthfulness and multi-device deduplication.
- Hosted migration: `20261026152453_remote_parent_session_control`
- Independent architecture review: PWA-first / thin-native-later consensus
- Independent security review: initial FAIL on multi-device truthfulness,
  device-clock anchoring, Pause copy and stale-status presentation; every
  finding was repaired and the final corrected-candidate review is PASS.
- Physical iPad: shutdown during native YouTube fullscreen/PiP remains pending.
  Synthetic browser teardown is not promoted to native-device evidence.

## Current classification

`WATCHNEST_REMOTE_PARENT_CONTROL_AUTONOMOUS_GATES_PASS`

Native-device-control readiness and physical-iPad shutdown acceptance remain
open external gates. Do not declare native Founder Ready from this artifact.
