# WatchNest independent adversarial Reporter — R1

Frozen review: 2026-11-04. Final result: **FAIL** for the observed presentation defects; **BLOCKED** for complete responsive/Human-Eye/accessibility acceptance. This is a rendered-package review, not interactive Stranger testing or release acceptance. No implementation edits or other reviewers' reports were read. No physical iPad, real audio, provider playback, hosted authorization or native fullscreen result is asserted.

## Exact candidate and evidence boundary

Input root: `/workspace/scratch/b4fb31747e8d/watchnest-review/ci129-candidate/`.
All screenshot references below are relative to `test-results/visual-evidence/candidate/` within that root, unless stated otherwise. Authority consumed: `docs/PremiumDesignAuthority-20261103.md` and `docs/PremiumReviewContract-20261103.md`.

The four manifests identify Chromium synthetic browser fixtures, SVG artwork and `physicalDevice:false`. They record actual source/CI commit `21c13e6da49196447210318acc0c11a9a4fb8575`, source tree `d812b9c1de57db660f09dfd353a89b246f8ad5f5`, clean worktree/empty diff, PR head `e60d5ffa187524abe2d658ad137b729c7a491b99`, and harness SHA-256 `820637e24f2aad8fec398428745671c9dc9211eccce9b1ca927b110e7097a5ee`. These identities are recorded separately: this report does not assume the merge/event commit equals the requested PR head. A controller must establish application-tree equivalence before attaching these results to a different source identity. No preview deployment URL, migration/config identity or independently hashed fixture identity is supplied in these manifests.

## What the pixels establish

The evergreen/ivory/amber direction is coherent across Parent and child surfaces. Main headings, restrained icon family, cards, controls and selected navigation share a recognizable system. Parent Add videos remains prominent; Library/Requests/Family grouping is legible on phone and tablet. Child Home presents an immediate resume action; Library has approved-library search and Favorites; Discover explains that Parent decides what enters the library. The Parent preview dialog fits the inspected phone and portrait-tablet views and explicitly distinguishes a loaded frame from playback proof. Login/recovery and PIN dialog text are readable at their inspected sizes.

This is a promising integrated design, but those observations cannot certify unseen states, scrolling, keyboard behavior or real content crops. Synthetic repeated artwork does not exercise diverse real thumbnail compositions.

## Finite defect register

Severity: P1 blocks a major workflow; P2 materially weakens usability/required acceptance; P3 polish or small explicit-spec deviation. Evidence defects are separated from application defects.

| ID | Severity / status | Exact rendered evidence | Finding and bounded acceptance condition |
| --- | --- | --- | --- |
| R1-01 | P2 application presentation / OPEN | `390x844/parent-collections-full.png`, Create a collection → Approved videos; `1440x1000/parent-collections-full.png`, same panel | Each approved-video choice is visually split into a wide pale checkbox-only bar and its title below/outside that bar. The empty bar reads as an unfinished field and weakens the relationship between selection and video. The three repeated choices demonstrate a component issue rather than an isolated long title. Keep checkbox and corresponding title together inside one clearly grouped row, with comfortable clickable label area; recheck phone and desktop with long titles and selected state. Do not infer a broken label association from pixels alone. |
| R1-02 | P2 task hierarchy / OPEN | `390x844/child-search-empty-full.png`; `1024x768/child-search-empty-full.png`; `1440x1000/child-search-empty-full.png` | A zero-result library query still presents the unrelated Little Makers collection with “2 videos” ahead of “Nothing found.” On phone, that collection consumes the area between filters and the useful no-results response; the initial viewport places the empty-state message beneath the floating navigation. This delays and contradicts the apparent search outcome for a child. Place the query result/empty explanation immediately after filters; either filter collections with the query or clearly separate persistent browsing content below the result. Recheck a matching query, no-result query and cleared query on phone/tablet. |
| R1-03 | P3 explicit touch minimum / OPEN | `390x844/parent-dashboard-top.png`, header Add videos and Switch profile; manifest `390x844/manifest.json`, parent-dashboard inventory | Phone header Add videos is measured 113×43 CSS px and Switch profile 42×48, below the contract's 44×44 minimum. These are essential actions and their narrow geometry is visible in the raster. Increase the actual target dimensions to at least 44×44 and confirm retained spacing at 360 and 390px. Checkbox element dimensions alone were deliberately not classified as defects because an associated larger label may provide the hit area. |

No P0/P1 application defect is proven by these static pixels. No claimed functional/security pass follows from that absence.

## Evidence blockers

| ID | Status | Evidence and missing acceptance |
| --- | --- | --- |
| E1 | BLOCKED: readable-region capture integrity | `390x844/parent-collections-top.png` and `parent-collections-bottom.png` have the identical manifest SHA-256 `ba28d8373ae9…` although the manifest declares a 1570px document and 844px viewport. Both show the page beginning, not the collection form at the document bottom. `390x844/parent-controls-bottom.png` still shows the first Miri timer and header area of the declared 6337px document; `parent-controls-middle-7.png` is nearly the same top region. `390x844/parent-library-bottom.png` still shows header/filter/first-row content for a 3820px document; `1024x768/child-library-bottom.png` likewise shows the library heading and first row. Full-page images exist, but long pages downscale and the promised readable crops do not supply their lower regions. Recapture after verified scroll settling or create coordinate-bound native-scale crops from full rasters. Confirm first/middle/final content in each crop. This is an evidence defect; smooth-scroll timing is a hypothesis, not a diagnosed application bug. |
| E2 | BLOCKED: mandatory state coverage | Four manifests contain the same 19 states: sign-in, password recovery, dashboard, library, preview dialog, add-video idle search, Collections, Inbox, children, controls, settings, profile picker, Parent PIN, child Home, library, Favorites, collection, empty search, request composer. Missing exact-candidate raster states include child PIN/error; returning-entry/error; Simple-mode differences; Recently Added selection; Discover disabled and result/selection states; request send success and error; loading/retry/error and empty library; actual child-to-child/Parent switch outcomes; Time’s Up; URL intake; search/channel/playlist results and metadata error/no-results; approval/assignment/management; edit/confirmation dialogs and save success/error. The list is finite by workflow family, not a claim that missing UI fails. Older unmanifested `docs/evidence` images were not imported as current evidence. |
| E3 | BLOCKED: viewport and interaction coverage | Supplied matrix is only 390×844, 768×1024, 1024×768 and 1440×1000. Contract also requires 360 stress, 412×915, 820×1180, 1180×820, 1280×800, 1440×900, intermediates 520/640/900 and continuous resizing. Keyboard/form scrolling, focus sequence, reduced motion, effective clickable-label target sizes and calculated contrast are not established by screenshots or a control inventory. Manifest no-overflow fields are useful supporting observations, not raster coverage or an accessibility audit. |
| E4 | BLOCKED: Human-Eye preprocessing | No neutral A01…An bounded-asset inventory with per-region, per-viewport edge resolution was supplied. Source-derived readable crops and resolved containment edges cannot be tallied completely, especially with E1. This lane cannot issue CLEAN/Human-Eye PASS. |

## Inspection coverage receipt

- SOURCE_IDENTITY: exact manifest identities above; requested-head equivalence and hosted deployment binding unresolved.
- REGION_COVERAGE: partial; all 19 named phone screen/state families received direct pixel inspection via full or viewport renders. Tablet/desktop inspection sampled integrated Home/Library/search-empty/Discover, Parent dashboard/library/add-video/Collections/children/controls/settings, picker/login and preview. This is not a claim of 76/76 fully inspected state×viewport units.
- BOUNDED_ASSETS: total denominator unavailable; mark, four profile icons, synthetic thumbnails, hero art, navigation icons and preview bounds seen in sampled rasters; not a complete asset receipt.
- ASSET_EVIDENCE_CONSUMED: actual PNG pixels through image viewer, plus corresponding manifests as supporting structural records. A01…An mapping unavailable.
- READABLE_VIEWS: incomplete; lower-page crops fail E1. Full-page rasters supplied supplementary page composition only.
- STRUCTURAL_RECORDS: four manifests consumed for identity, state inventory, widths/heights, named controls, image-alt and overflow metadata. No source/CSS checks substituted for raster review.
- EDGE_GATES: unresolved for unseen/lower/stress states; sampled dialogs/hero/card boundaries show no demonstrated clipping defect.
- APPLICATION_BINDING: synthetic source-tree package only; no deployment/DB fixture claim.
- UNRESOLVED_CONFLICTS: capture region labels conflict with actual pixels (E1); source-vs-PR identity needs controller confirmation.
- HUMAN_GATES: physical device, genuine playback/audio, final jury, rendered cold journeys and complete accessibility remain outside this receipt.
- CONFIRMED_DEFECTS: R1-01–03; no invented backend/media defect.
- POSSIBLE_CONCERNS: full-page fixed/sticky navigation may render at misleading mid-document positions; verify through correct viewport captures before classifying overlap as an app bug. Phone Parent library card titles wrap heavily; missing readable lower crops prevent a confident action-density judgment.
- FINAL_RESULT: **FAIL** for finite observed UI issues; **BLOCKED** for complete contract acceptance.

Repair the three bounded findings, correct the evidence capture, complete missing workflow/viewport coverage, then obtain a fresh exact-candidate recheck. Material UI changes invalidate affected evidence. This review neither releases WatchNest nor clears its separately pending physical playback gates.
