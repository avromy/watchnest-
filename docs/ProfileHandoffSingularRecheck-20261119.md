# WatchNest singular minute affected-state recheck — 2026-11-19

Frozen verdict: **PASS**, restricted to the three Parent rendered states and the two supplied Child screenshot comparisons described below.

Candidate source: `decd2681e693de7ef33ea067610117c7467123b4`. Existing compiled `.next` app served by standalone Node 24 Next server on isolated loopback port 3007, with Playwright Chromium in the same execution process. No build, app edit, database write, deployment, hosted browser or real-device verification was performed. Browser and own server were stopped by the script.

This is a fresh affected-state repair recheck, not a blind initial review or new jury vote. No Root or peer reports were read. Setup inadvertently printed implementation search matches before rendered review; this disqualifies any claim of source-blind review.

## Parent scope and observations

At 390×844, navigated the rendered Parent Time link, opened Miri’s time settings, entered custom minutes 1 and clicked Give 1 minute. Clicked Pause, then End now, waiting for the stopped presentation before recording the blocked capture. Finally clicked the blocked Add 1 minute and observed active controls return.

| Actual state | Observed status | Exact action label | Action rectangle | Horizontal extent | Keyboard focus |
|---|---|---|---|---|---|
| Active | 1 min left | Add 1 minute | 316×46 px | 390/390 px | 3 px solid purple outline |
| Paused | Paused · 1 min saved | Add 1 minute | 316×46 px | 390/390 px | 3 px solid purple outline |
| Blocked | Stopped by Parent | Add 1 minute | 154×46 px | 390/390 px | 3 px solid purple outline |

All three actual screens were visually inspected. The repaired text is legible, unclipped and fits its control; hierarchy and neighboring controls remain coherent. No material overflow, tap-target or keyboard-focus regression was found in these states. Exact Add 1 minutes was absent. Custom minutes remained 1. The blocked state retained Allow access alongside Add 1 minute and the explanatory stopped-access copy. API mutation journal records start(1), pause, end, extend(1).

Limits: `fixture(page, 'parent')` intercepts API calls and `installStateful(page)` supplies review-only synthetic presentation state. The adapter applies its state across fixture profiles and does not implement production handlers. This verifies compiled UI presentation and UI requests, not production authorization, persistence, device enforcement, realtime propagation, or backend transition correctness. Capture focus was reached with keyboard Tab/Shift+Tab; programmatic focus alone after touch did not show a focus-visible outline, as expected for that modality.

Evidence: `docs/evidence/profile-handoff/singular-recheck/recheck.mjs`, `journal.json`, `active-390x844.png`, `paused-390x844.png`, `blocked-390x844.png`, `capture-sha256.json`.

## Bounded Child carryforward comparison

Freshly opened and visually inspected each actual candidate wrong-PIN PNG and the corresponding supplied reference PNG at widths 390 and 768, without reading earlier review reports. Both pairs visibly preserve the same dialog, icon, heading, explanatory copy, PIN field and focus/error presentation, incorrect-PIN message, Cancel button, spacing, and dimmed background. No visible layout or copy difference was found.

Raw RGB comparison after visual inspection found exactly one pixel differing in each pair, with maximum channel delta 1/255. The 390 pair differs at x337,y641; the 768 pair at x556,y731. These lie on the rounded Cancel button boundary and are visually negligible raster rounding differences. Neither pair is byte-identical; both are bounded visual matches.

Frozen bounded Match verdict: **PASS for these two supplied wrong-PIN screenshot pairs**. This is screenshot consumption and comparison, not a fresh interactive Child run, whole-app review, hosted verification, real-device claim, or new Blind Jury vote. It does not itself establish equivalence for any other capture.

Exact input paths, SHA-256 hashes, image dimensions, changed-pixel locations and deltas are preserved in `docs/evidence/profile-handoff/singular-recheck/wrong-pin-comparison.json`; diagnostic difference PNGs are adjacent.

## Scope amendment — synthetic extend semantics

The inherited review-only stateful adapter implements `extend` by setting presentation state to active, including after Parent End. Consequently, the recorded post-blocked **Add 1 minute → active** observation is **HARNESS ONLY and INVALID evidence for production override behavior**. It is not evidence of a product bug.

The production behavior supplied by the coordinating reviewer is that the locked database RPC preserves a Parent block when extending, saves paused seconds, and requires explicit Resume or Start to restore access. This recheck did not independently test or verify that production behavior; its synthetic adapter cannot establish it. Future continuation must not infer unlock semantics from this journal.

The three initial active, paused and blocked label renders were captured before the final blocked Add click and remain valid within their stated rendered-presentation scope. Frozen PNGs and journal are unchanged. No app change or new test was made for this amendment.
