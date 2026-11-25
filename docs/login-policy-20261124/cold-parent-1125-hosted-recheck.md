# Independent Parent hosted recheck — exact69 candidate

Frozen 2026-11-25 (browser-displayed access-check timestamp 11/24/2026, 11:10:01 PM). Candidate origin: https://watchnest-dbybelcbs-avromy.vercel.app . Root binds this deployment to commit `69a023a8ee143513d24ac8af7284f9c6d365d192`, previously reviewed UI blob `3e90cd99ca020216c5a6d3a2243ca5c5846564ba`. This recheck observed rendered product only; deployment/commit binding is root-supplied.

Own Work CLOUD cdp tab 4; root tab 2 untouched. Existing cookies only. No credentials, saves, recovery/reset, approvals/rejections, requests, playback, time/access changes, profile/session switches or logout performed by this reviewer. Ari stop was not altered. Native screenshots inspected in browser transcript; no family photos exported or downloaded.

## Result

D1, D2 helper copy, and D3 are visibly corrected. D2 metadata loading cannot be closed as functionally reverified in this session: clicking Load videos returned “Parent sign-in required.” Time device status also became unavailable. These are concrete session-context obstacles, not proof of an application-wide regression or failed authorization security. Full Parent workflow acceptance remains unresolved. No physical-device, security, cross-role, timer, or whole-product PASS is claimed.

## Exact journal

| Step | Action / expected | Actual | Evidence / conclusion |
|---|---|---|---|
| 1 | Create own tab at /parent/settings; expect existing Parent access | Brief Loading family overview then full Settings with family navigation and request count | AX and native Settings screenshot H1; authentication not requested |
| 2 | Check this browser; expect read-only guidance | Inline Safe Playback always on; Home Screen app strongest setup; no touch input; restrictions must be checked in iPad Settings | AX; successful read-only guidance |
| 3 | Overview; expect corrected shortcut name | “Manage Eli’s profile” and corresponding labels for other nonempty child cards | AX; D1 corrected accessible name |
| 4 | Manage Eli’s profile; expect profile configuration | /parent/children, Child profiles with photo/avatar, experience, PIN and device access cards | AX; destination now matches revised label. Empty-library variant not exercised |
| 5 | Ari → Check access; expect inspection only | Check/Open buttons temporarily disabled, then enabled; inline “Child PIN is off. No child PIN wait applies. Device entry is available.” with checked timestamp and refresh caveat | AX plus native screenshot H2. No Open button clicked. “Device entry” is explicitly separate from viewing time/schedules; not evidence Ari viewing access was allowed |
| 6 | Requests; expect pending list | 93 requests and first item's Review & organize available | AX; no queue action selected |
| 7 | First request → Review & organize; expect explicit prefilled-link guidance | Correct public video URL prefilled; helper now: “Pasted links load automatically. For a prefilled link, choose Load videos to review it. Nothing is approved until you choose to approve.” | AX and native screenshot H3; D2 misleading promise corrected and no text clipping at desktop viewport |
| 8 | Load videos; expect metadata lookup | Inline error “Parent sign-in required.” No metadata loaded | AX plus native screenshot H4; new observed session-context obstacle. No automatic retry, reload or sign-in attempted |
| 9 | Collections; expect singular/plural correction | Family favorites and Rocks show “1 video”; other counts show “videos” | AX and native screenshot H5; D3 rendered correction verified |
| 10 | Time; inspect only, expect current status | Every child card says “Remote device status is unavailable. Try again in a moment.” and “Timer on · checking time…”; End now disabled. A follow-up state observation was unchanged | AX; current time/device status could not be verified. No timer or access controls pressed |
| 11 | Freeze | Tab 4 left at /parent/controls, marked deliverable | No account mutation performed |

## Visual usability

Settings, Profiles, Add videos and Collections retain readable type, consistent purple/navy hierarchy, generous controls and coherent spacing. Corrected helper is readable on one line at approximately 1348 × 926. Collections singular text wraps naturally at card width. The access-check result is plainly visible and timestamped, but its current placement makes a long child card longer. Existing recommendations about long request queues, searchable collection membership and repeated settings prose remain recommendations; they were not newly repaired or accepted here.

The new Parent sign-in error is conspicuous in a peach banner and does not silently approve content. It does not offer a direct reauthentication action in the observed view. The Time page gives an honest unavailable message, though leaving “checking time…” alongside it does not clearly distinguish a completed failure from work still in progress. Consider a settled unavailable status after the check fails, subject to reproducing under a stable session.

## Later coordination observation / causal limit

After this pass froze, root reported that their separate tab had performed authorized Parent-to-Ari opening, picker and ordinary Ari entry, while Ari remained stopped. Root also encountered Miri's explicit Parent PIN requirement and canceled. Because browser cookies/session state are shared, those transitions may explain the later lookup and remote-status failures in this review tab. Timing and causality were not independently established. Preserve the exact observations but do not label these errors a confirmed source69 regression without a stable-session recheck. This reviewer did not authenticate, retry or repair after the error.

## Scoped disposition

- D1: hosted rendered accessible-name/destination correction verified for Eli's nonempty card.
- D2: hosted helper correction verified; successful Load videos lookup remains blocked in observed session context.
- D3: hosted rendered singular/plural correction verified for one and multiple counts.
- Parent access Check: successful read-only Ari inspection verified; no entry, recovery or limit changes tested.
- Navigation: requested screens reached; no navigation dead end observed. Metadata and remote-time checks have the explicit limits above.
- Broader readiness and physical acceptance remain pending.
