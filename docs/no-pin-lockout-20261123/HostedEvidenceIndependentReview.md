# Independent hosted functional/security evidence review — 2026-11-23

**Verdict: bounded hosted functional/security evidence ACCEPTED with explicit limits; integrated release acceptance HOLD.** The approved player has not demonstrated media playback, physical iPad/containment/remote-stop gates remain open, and screenshot capture produced no visual evidence. No new definite application defect is established by the media/capture observations or the Time mode locator failure.

Independent review context; no browser interaction, authentication attempt, family operation, database/deployment/publication mutation or duplicate application CI run performed by this reviewer. This is an evidence review with one targeted read-only source check, not an independent hands-on repetition or full cold visual jury.

## Candidate and provenance

Exact hosted stage: dpl_CfHzBU3X4rHMv7zn3w7tNRQMNk1C, https://watchnest-gnwpficxx-avromy.vercel.app ; application archive `5859ade14dc053aac877ec992f9431c170abacf1`, source tree `9c247f77cf64143c320b204587e2f3d1e7f487e4`.

Independently retrieved via GitHub the exact checkpoint file `docs/no-pin-lockout-20261123/HostedAuthenticated.md` at commit `f04dea421fc1f8163b9a6d03b29850d50b557962`; returned file blob `67efefd5f36d979e88da160f7c14357c15351018`. That checkpoint records the Parent checks and initial Child33 transition, explicitly leaving later Child completion pending. The later sibling denial, own no-PIN entry/reload, media state and empty sampled logs are additional controller observations supplied in this review task; they are not retroactively described as contents of that checkpoint. Persist those later observations durably before claiming a complete recovery record.

Parent authenticated UI plus same-cloud API session returning Parent/configured true/Parent PIN set is positive application authentication evidence; provider Vercel authentication alone would not have sufficed. No credentials, PINs, cookies or tokens are reproduced in this report.

## Functional/security conclusions supported by the observations

| Evidence | Accepted conclusion | Limit |
|---|---|---|
| Parent Inbox93, zero provider frames closed; actual correct-identity Preview, retry, close/reopen/Escape and focus restoration | Requested Preview is functional in this hosted session, including lifecycle and keyboard close; unexpanded requests do not mount provider frames | Does not establish provider AV playback or visual quality across devices |
| Requests remain93, no approve/reject/assignment operation submitted | Preview was exercised without an observed approval operation | Count alone cannot prove absence of every kind of data write; claim remains bounded to observed operations |
| Unsaved presets1/5/10/custom37 and Daily7AM explanation; no timer Save | Controls and explanatory state respond correctly before submission | No timer mutation, expiry, daily renewal, remote End now or enforcement acceptance follows |
| Parent Library96, search empty state, Manage editor/Cancel, Collections7 edit/Cancel | Navigation/findability/editor opening and cancellation worked | No save/assignment or collection mutation acceptance |
| Parent access inspection shows authoritative PIN-off/no PIN wait/device available without counters | Hosted status UX agrees with no-child-PIN context | Status is per inspected profile/device/time, not a full family grant audit |
| Explicit authorized recovery -> Child33; audit aggregate0->1, Parent actor/recovery method; Parent API subsequently requires Parent | Recovery changed intended device/session role and recorded the request; Parent boundary was not retained as unrestricted child authority | Exactly one real recovery/device admission occurred; it is not a no-write test. No claim of counter/PIN/timer reset |
| Sibling-exclusive title search0 plus actual known sibling video ID GET denies “not in your library” | Stronger current-session sibling video isolation evidence than search absence alone | One known negative target/session is not exhaustive IDOR/RLS/adversarial certification |
| Child collection3/filter and request states; no request submit | Child navigation and approved collection/request display worked without an observed request mutation | Does not test request creation or Parent approval |
| Sibling profile requires Parent handoff; Cancel; own PIN-off entry -> Opening/disabled controls -> Child33, no PIN/no429; reload remains33 | This actual own-profile PIN-off return succeeds and preserves session/library state; sibling handoff remains distinct from child PIN | One ordinary return is not a hosted six-entry/fifteen-minute stress reproduction. Preserve the count-aware local regression separately; do not repeat real credentials to manufacture evidence |

The authorized recovery is a legitimate, bounded family/device operation, not an authentication bypass. Report it accurately rather than calling the whole run read-only. Unsaved editor/timer checks do not imply settings were changed. The evidence does not justify widening permissions, clearing limits, disabling child containment, changing PINs or resetting time to make a test pass.

## Player and capture classification

The approved Made-for-Kids frame and intended identity loaded. A Play gesture was delivered, but provider DOM reports paused=false while currentTime remains0 and readyState remains0 (HAVE_NOTHING). That is **insufficient playback acceptance**: an unpaused flag can represent intent to play without receiving media. It is not picture/sound proof, verified watch progress, successful startup, or proof of an application safety defect. Keep it as an observed playback failure/stall with cause UNKNOWN.

Possible causes include provider/network/media availability, cloud browser media capabilities, client filtering or application/player integration; the supplied observations do not distinguish them. Do not label it external-only, blame Made-for-Kids policy, or assert the application is healthy merely because the iframe rendered. Conversely, do not attribute it to auth or the corrected no-PIN limiter without matching evidence. Preserve a minimal sanitized timestamp/video identity/provider state/error/network diagnostic if already available through the controlling lane; do not add restricted viewing telemetry or create a new unauthorized experiment here.

Two Page.captureScreenshot protocol timeouts produced no images. AX/DOM interactions stayed responsive. This is confirmed capture-operation failure, **not established application crash or visual PASS**. Tool/platform uncertainty remains, including whether page/provider load affected capture. No screenshot file, human-eye result or responsive visual certification may be invented. Likewise the lack of application crash during the observed interval and empty stage warning/error/fatal samples are bounded observations, not proof of crash freedom or exhaustive monitoring. Extension metadata console errors are not attributable to WatchNest without further evidence.

## Time mode label finding — not a confirmed accessibility defect

Independently inspected exact archive5859ade `src/components/parent/ParentApp.tsx`, Git blob `b20e00b85dd6061e72d2fe94ff25c6c87495c8d3`, lines2901–2914. The native select is a descendant of a `<label>` containing “Time mode”. This is an implicit programmatic association; missing id/htmlFor does not make the control unlabelled. W3C WAI explicitly recognizes a wrapping label as an association, while preferring explicit labels for broader assistive-technology support: https://www.w3.org/WAI/tutorials/forms/labels/ .

Therefore `getByLabel` failing is not enough to establish a missing-label defect, particularly with repeated cards, exact-name matching, hidden/collapsed sections, locator scope or automation transport behavior unresolved. The actual option-filtered select interaction worked. If the controlling lane later obtains a live DOM/AX snapshot, inspect that exact select's labels collection, label ancestry and computed accessible name before assigning a defect. If the actual rendered control has no accessible name despite expected markup, document the runtime mismatch and repair/retest the exact candidate. No source repair/new deployment is warranted solely by the current locator result, and this review does not claim full screen-reader conformance.

The native disclosure false negatives and first Manage action before state flush similarly do not establish dead controls when actual subsequent actions opened the correct content. Preserve them as locator/timing failures, without erasing the observations or turning them into application bugs.

## Release gate decision

The evidence closes meaningful hosted auth, Parent Preview, limited navigation, explicit recovery, one PIN-off return and one sibling authorization denial obligations for this exact stage. It does not close:

1. Actual audiovisual playback on the approved device; the current provider state is unresolved, not a pass.
2. Real iPad ordinary/native fullscreen containment, related/unapproved navigation resistance, sound/picture and remote Parent End now stopping/preventing resume under the governing acceptance protocol.
3. Candidate-bound hosted timer enforcement/renewal and the broader authenticated workflows that were deliberately not mutated/tested.
4. Required independent integrated visual/usability/security acceptance beyond this document review, with genuine visual artifacts or an explicitly governed alternative. Failed captures cannot stand in for rendered inspection.
5. Durable preservation of later Child/media/log observations beyond the earlier f04dea checkpoint.

**Keep production promotion/merge/phase2 hold.** Use the already-authorized, currently owned workflow for next evidence; this report requests no further login handoff, credential retry, family reset or browser ownership. Existing CI/source passes remain valid at their original scope and cannot substitute for unresolved provider/device/visual gates. No production-ready or final family-beta acceptance claim is supported yet.

## Additional controller observation received during review

An explicitly non-Made-for-Kids approved alternate opened the monitored player and displayed Volume60. Keyboard ArrowRight changed it to61 and ArrowLeft restored60. This supports a working hosted keyboard volume control and intended default/restoration in that session. It is not AV playback proof: the alternate was not played, and reload persistence was still being checked at this report boundary. Browser-local preference writes are distinct from family account/timer/content mutations; no family setting change is inferred. Do not call browser-local preference verification complete until the pending readback is observed. Background styling glimpsed behind the iframe, without a current rendered artifact and independent visual assessment, does not establish a new visual defect or authorize redesign.

## Late controller updates — evidence distinctions preserved

The documented native CUA `tab.getScreenshot` subsequently succeeded immediately and visibly rendered the Child Concept3 library with navy/lavender styling. The earlier two cropped Page.captureScreenshot protocol timeouts remain genuine capture failures; they do not establish that every browser capture route was unavailable. The successful screenshot contained a family photo and was therefore not exported or publicly archived. This supports one actual rendered-view observation, not full visual certification, a shareable artifact, or complete independent visual acceptance. No private image is reproduced here.

Non-Made-for-Kids Volume reload readback positively confirmed60. The earlier60→61→60 keyboard interaction therefore now has a successful restored-value persistence readback. This closes that bounded preference check; it still provides no audiovisual playback result.

A later secure Parent PIN browserAuth request was aborted by the user after a tool wait, followed by an environment restart. No Parent authentication outcome or PIN value is assumed, and no PIN retry is claimed. The controller restored browser access using a fresh Cloud tab and the retained origin, then observed the guarded Watch picker with Ari selected and sibling Parent handoff. Parent UI was not present. Browser access was restored, rather than permanently unavailable; the page was preserved with markHandoff only. Marking a handoff does not itself start a takeover or authenticate the user. No new authentication prompt, takeover or credential repetition follows from this report.

Fresh controller canonical readback still resolves to old77/GiR without a promotion; supplied documentation head remainsf04dea. These late observations are controller-supplied updates, not additional browser operations by this reviewer or a claim they were already contained in the earlier fetched checkpoint. **Integrated release HOLD remains unchanged.** Outstanding AV/provider, physical-device containment/remote-stop, broader timer/hosted and final integrated/visual acceptance gates retain their exact limits above.
