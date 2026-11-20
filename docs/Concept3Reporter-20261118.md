# Concept 3 independent adversarial Reporter — frozen round 1

Date: 2026-11-18. Reviewer: isolated `/root/concept3_reporter`.
Verdict: **FAIL — material visual/task-reach defects remain.** This is an adversarial sampled review, not exhaustive Human-Eye CLEAN, functional acceptance, physical-device qualification, or release acceptance.

## Identity and independence

Candidate commit `bd8d15d7220f5496e73a562c77b34ceb8aae2370`; application source tree `67fd57e88e9adb42ec2f795e1e6473fba650a40c`. Evidence root: `test-results/visual-evidence/concept3-bd8d15d/`. The inspected 1024x768 core manifest binds Chromium, local URL `http://127.0.0.1:3001`, clean worktree, source tree `703feeffd9853782e914a23ff9728361bfe9ede6`, harness SHA256 `0ea362700c1fa0db251b00c67570c09cc60a25e2d9470371f73bed6ccb4452d8`, fixture SHA256 `c37259e3fb7c900fc071f60315671757350786189f65d9a753c3253eb54e7f56`. Synthetic responses/artwork and synthetic playback are explicit limitations. No hosted authentication, actual YouTube, Safari or physical iPad was exercised.

Consumed authority: Root assignment with written Founder Concept3 direction and `docs/Concept3AuthorityRecovery-20261118.md`, including exact-candidate and independent Reporter controls. No comparator, peer review, Builder acceptance conclusion, or historical jury verdict was consumed. No source edit, build, commit, deployment or new agent was performed. Screens were independently selected to stress child content reach, responsive controls, Parent workflows and recovery. No browser clicking was performed by this reviewer; these are actual rendered capture observations, not a click test.

## Finite material defects

### R1 — High: child Library prioritizes chrome over playable content

Evidence: A02, A09, A10, A13; supporting A01/A04. At 360x800 no individual video is visible before the fixed bottom navigation. At 390x844 only the upper sliver of card artwork reaches the visible content boundary; no video title or clearly usable video card is visible. At 1024x768 iPad landscape the first card artwork starts around y652 and is clipped at the bottom; no video title appears before scrolling. At 768x1024 the first complete content row is only reached near the bottom of the initial viewport. This is visible with a populated 12-video library, not an empty fixture.

Cause visible in pixels: brand/header, personalized heading/count, a full-width search row, All videos/Favorites/Hidden controls, sorting, collection heading/card and further section spacing precede the videos. Phone stacks three 48px filter buttons on separate full-width rows. Structural inventory independently confirms 354x48px filter buttons at 390px; the defect is excessive allocation, not undersized targets. The single collection occupies its own large vertical section even in landscape where much of that row is empty.

Impact: the primary child task starts behind a substantial scroll despite the iPad-first streaming direction and fewer competing actions. Collection browsing remains useful, but the app should also expose identifiable playable choices immediately when populated.

Repair criterion: retain comfortable targets while compressing heading/filter/collection treatment; demonstrate an identifiable first playable video row within the initial unobscured 1024x768 viewport and useful identifiable video choices at 360x800/390x844. Preserve collection access and test long collection/title states. Reinspect portrait, landscape and mobile bottom-navigation clearance on the new exact candidate.

### R2 — Medium: Discover uses oversized introductory presentation before the actual task/results

Evidence: A12/A17. At 1024x768, the search panel begins around y391 after a large icon, eyebrow, headline and explanatory block. The first result begins around y556; its title sits near y732 and its request action is below the initial viewport. At 768x1024 with the alternate request expanded, the introductory block and primary search consume the upper majority; the final Send request action falls at the viewport bottom. This is a task page, but the visible proportions resemble a promotional hero and consume space needed by search/results/request completion.

Impact: compounds the content-reach issue in a second core child flow and conflicts with the explicit no-oversized-promo-hero direction. The headline and safety explanation are useful; their allocated vertical space is disproportionate.

Repair criterion: use a compact task heading and short supporting text, bring search/results/request actions materially higher, and recapture both search results and alternate-request states at 1024x768, 768x1024 and phone. Avoid merely reducing font sizes or touch targets.

## Separate suggestions and concerns — not additional blockers

- A21: the error says “Please try again” but exposes only “Choose profile.” Structural inventory confirms that is the sole visible recovery control. Consider a direct retry that preserves the selected child, or wording explaining why choosing a profile is necessary. Actual retry behavior was not tested, so this is a recovery concern rather than a claimed functional failure.
- A03/A20: Parent Overview offers Requests in navigation, a Requests quick card and Review requests in Next up. Add videos is also repeated in header and quick card. All are understandable, but consider whether phone can prioritize the current pending task and reduce repeated entry points. The Parent phone layout otherwise has legible labels and good target separation.
- A06: a topic request explicitly instructs the Parent to add a video, return and manually mark fulfillment. This visible workflow adds memory/context-switching burden; a linked completion path would improve the request-to-approval experience. No claim is made about untested destination behavior.
- A08/A24: “Select all children” aligns alongside the first individual child chip while the remaining chips wrap below. Make the bulk action a separate row for clearer grouping.
- A23: startup error repeats Back to Library in both header and panel. Harmless but visually redundant.

## Actual pixels consumed journal

Every row below was opened with `view_image` and the returned image was actually inspected, in this order. Paths are relative to the evidence root. Full-page captures establish visible document context; they do not certify invisible interactive behavior or every small detail. These 24 images are the complete consumed sample; no unviewed file is claimed as visually reviewed.

| ID | Exact image | Actual visual observation |
| --- | --- | --- |
| A01 | `768x1024/child-home-top.png` | Navy/lavender identity coherent; first complete row low in viewport; collection occupies standalone row. |
| A02 | `1024x768/child-library-top.png` | First video artwork starts around y652; no video titles above fold. |
| A03 | `390x844/parent-dashboard-top.png` | Three quick cards and pending request panel; repeated request/add entry points; readable phone navigation. |
| A04 | `1440x1000/child-home-top.png` | Four-column video grid, long title wraps; large pre-grid area and sparse collection row. |
| A05 | `390x844/parent-add-video-top.png` | Search tabs, category selector and search form fit; stacked hierarchy consumes much phone height. |
| A06 | `390x844/parent-inbox-top.png` | Topic request has Find a video/Mark as fulfilled and explicit return instruction. |
| A07 | `390x844/parent-controls-top.png` | Clear child timer card and large Give 20 minutes action. |
| A08 | `390x844/parent-details/parent-approval-assignment-full.png` | Selection summary, selected video and final approval panel are readable; bulk child action mixed into chip row. |
| A09 | `768x1024/child-details/child-simple-home-top.png` | Same tall initial Library composition in the simple fixture. |
| A10 | `390x844/child-home-top.png` | Three full-width filter rows push individual videos below usable initial area. |
| A11 | `390x844/child-collection-top.png` | Collection screen repeats stacked filters and sort before two videos; bottom navigation crowds initial row metadata. |
| A12 | `768x1024/child-request-form-top.png` | Large Discover intro; expanded alternate-request submit reaches bottom edge. |
| A13 | `360x800/supplemental-responsive/child-home-top.png` | No video card visible; collection and bottom navigation consume remaining initial screen. |
| A14 | `390x844/parent-details/parent-remote-timer-active-top.png` | End now prominent; Add 15 minutes and Pause adjacent with sufficient separation. |
| A15 | `390x844/parent-details/parent-add-preview-dialog-full.png` | Modal has visible close action, preview and explanatory copy; synthetic player expressly excluded from playback proof. |
| A16 | `768x1024/child-entry/child-pin-dialog-full.png` | PIN modal visually distinct with large input/focus treatment and Cancel. |
| A17 | `1024x768/child-discover-results-top.png` | Oversized intro pushes search/result down; result request action absent from initial viewport. |
| A18 | `390x844/parent-details/parent-collection-edit-top.png` | Collection edit begins below existing collection card; controls readable. |
| A19 | `390x844/parent-library-top.png` | Search and child filter before first artwork; no horizontal clipping visible. |
| A20 | `1440x1000/parent-dashboard-top.png` | Balanced Parent desktop layout; repeated request destinations; children cards clear. |
| A21 | `390x844/child-library-error-full.png` | Sparse failure screen, try-again instruction, only Choose profile action. |
| A22 | `390x844/child-empty-library-full.png` | Empty message readable but full filtering controls dominate an empty state. |
| A23 | `1024x768/player-states/player-startup-error-full.png` | Error legible, two duplicate Back to Library actions. |
| A24 | `390x844/parent-details/parent-collection-share-full.png` | Share panel and edit form readable; bulk selection action visually mixed with first child. |

## Scope conclusion and recheck contract

The navy/lavender/peach/warm-neutral interface satisfies the broad palette direction in this sample; synthetic green thumbnail artwork is not treated as the app identity. Parent timer/action legibility and child PIN treatment are credible. No confirmed undersized target or low-contrast defect was established in this sample. No horizontal clipping was seen in the selected views. Those scoped observations do not override R1/R2 or certify all 26 families.

Two material findings are frozen. Repair their shared vertical-allocation cause, then submit fresh affected captures bound to the new candidate. This original FAIL must remain historical; it must not be relabeled PASS after code changes. No physical iPad, hosted auth, player picture/sound, security or release gate is closed by this report.
