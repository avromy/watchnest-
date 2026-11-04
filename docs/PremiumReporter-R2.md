# WatchNest independent adversarial Reporter — R2

Frozen 2026-11-04. **R1 application findings: PASS, all three closed in inspected R2 renders. R2 overall: FAIL for a newly exposed Time’s Up readability defect. Complete-contract acceptance remains BLOCKED.** No other reviewer report was read; no application changes made. This is an independent static rendered recheck, not interactive Stranger testing, physical iPad testing or real media/audio acceptance.

## Candidate binding

Package: `/workspace/scratch/b4fb31747e8d/watchnest-review/ci132-candidate/`. Screenshot references below are relative to `test-results/visual-evidence/candidate/` there.

All four manifests identify source/event commit `5eaceacaef08f11cc99fab3f470292ca92297f05`, PR head `f10e5ff0062a39faea409ea7a9e70c8207d06da9`, source tree `beb0742526d1f3797bfe974e46e909f1bc37bad9`, and fixture source SHA-256 `1ca783a07ac4d5916fc2f0c6bfedf63c7aa9f8481b31a7a594472442bce06275`. This matches the requested application-tree identity. Preview URL/deployment fields are null; the package describes local synthetic Chromium rendering, with no physical-device or provider-playback claim. Event commit and PR head remain separately recorded identities.

Authority: design authority and review contract already consumed in R1. Scope here: own previous findings, evidence corrections and actual newly supplied state pixels. No unseen special-state QA extension is certified.

## R1 disposition

| Finding | R2 verdict | Exact evidence and observation |
| --- | --- | --- |
| R1-01 split collection choices | PASS / CLOSED | `390x844/parent-collections-bottom.png`, `768x1024/parent-collections-bottom.png`, `1440x1000/parent-collections-full.png`: checkbox and title now share one shaded row; long titles wrap within the row. The fieldset has an internally bounded list. This closure concerns grouping, not an unperformed keyboard/inner-scroll test. |
| R1-02 unrelated collection ahead of empty search | PASS / CLOSED | `390x844/child-search-empty-full.png`, `1024x768/child-search-empty-full.png`: no unrelated collection intervenes. “Nothing found,” explanation and Ask Parent action follow search/filter controls. Phone message and action are visible above bottom navigation. Matching-query functional behavior remains separate. |
| R1-03 phone essential targets | PASS / CLOSED | `390x844/parent-dashboard-top.png` visually shows repaired header spacing; corresponding manifest records Add videos 113×44 and Switch profile 44×44 CSS px. These meet the 44×44 requirement at this viewport. No 360px result inferred. |

## New finite defect

**R2-01 — P2, OPEN, required-state readability.** The Time’s Up card uses near-white title/body on a white panel. “Time’s up for now” and “Video has stopped. Ask Parent when you’re ready for more time” are almost invisible. This obscures the reason playback stopped and the child's next-step explanation, although Choose profile remains readable. Evidence: `390x844/child-times-up-full.png`, `768x1024/child-times-up-full.png`, `1024x768/child-times-up-full.png`, `1440x1000/child-times-up-full.png`. Direct pixel inspection confirms the defect at every supplied anchor. Repair the foreground/background contrast in this surrounding UI, preserve player behavior, and re-render all four anchors. Independently verify text contrast and readable hierarchy. A green metadata inventory cannot override these pixels.

No additional application defect is established by this bounded R2 inspection. That statement does not certify uninspected screens or functions.

## Evidence-blocker recheck

**R1 E1 capture integrity — CLOSED for the inspected examples.** Root smooth scrolling is explicitly disabled for capture only, and individual image entries record actual scroll positions. Unlike R1, `390x844/parent-controls-bottom.png` now displays the final Eli schedule and end explanation; `parent-library-bottom.png` displays the final long-title cards and their actions; `parent-collections-bottom.png` displays the collection form. Manifest scroll Y values respectively are 5313, 2972 and 722. Phone Discover results and sent-request bottom crops likewise display their lower content, rather than repeating the top. This establishes repair of those failures, not individual visual approval of all 298 files.

**R1 E2 state coverage — IMPROVED, still BLOCKED.** Each manifest now has 24 states (96 state×viewport units): the prior 19 plus request-sent/pending, Discover results, empty child library, library error, and Time’s Up. The new phone empty/error/results/sent states and all four Time’s Up renders were directly inspected. New portrait-tablet Discover results were also inspected. Empty state explains Ask Parent; results have Ask Parent rather than a play action; sent state offers Send another and pending history. The visible error copy asks the user to try again but exposes Choose profile; no retry behavior was tested. Missing exact-candidate coverage still includes child PIN/error, returning-entry/error, Simple-mode differences, Recently Added selection, Discover disabled, request error/loading, actual profile-switch transitions, Parent URL intake/results/channel/playlist/metadata states, approval/assignment/management/confirmation and save success/error. A separately running extension may resolve these; this report does not pre-approve it.

**R1 E3 viewport/interactions — BLOCKED.** The package still contains four sizes: 390×844, 768×1024, 1024×768, 1440×1000. It does not establish the remainder of the contract matrix, continuous resizing, keyboard/form scroll, effective label hit areas, reduced motion or a complete contrast audit. No physical iPad or native fullscreen/audio acceptance is possible from these synthetic renders.

**R1 E4 neutral assets — preprocessing improved; full Human-Eye PASS still BLOCKED.** Each capture now has neutral `assetEvidence` identities, bounded geometry, readable-view references and left/right/top/bottom records, explicitly labeled pending independent pixel inspection. These are useful routing records, not resolved edge verdicts. This recheck consumed the records for repaired areas and actual pixels listed here; it did not independently resolve every asset in every state/width. The earlier missing-inventory prerequisite is improved; exhaustive consumption/resolution remains incomplete.

## Bounded inspection receipt

SOURCE_IDENTITY: exact tree above. REGION_COVERAGE: targeted R1 repairs plus scroll-bottom examples and new state samples; not 96/96 full-state certification. BOUNDED_ASSETS / EDGE_GATES: neutral manifest records now supplied; full denominator independently resolved is incomplete. ASSET_EVIDENCE_CONSUMED: collection row/control bounds, header targets and actual screenshot regions identified above; no claim that every A identity was consumed. READABLE_VIEWS: repaired lower-page examples verified; full package inspection incomplete. STRUCTURAL_RECORDS: four current manifests. APPLICATION_BINDING: synthetic exact application tree, no hosted deployment claim. UNRESOLVED_CONFLICTS: no remaining observed top/bottom contradiction in the sampled repaired captures; Time’s Up pixels fail readability. HUMAN_GATES: unchanged external and independent acceptance obligations. CONFIRMED_DEFECTS: R2-01 only; R1-01–03 closed. POSSIBLE_CONCERNS: inner collection-list scrolling and missing interactions need functional inspection; full-page bottom-navigation placement is not independently classified as an overlap defect.

FINAL_RESULT: **FAIL** for R2-01; **BLOCKED** for complete contract coverage. Repair/re-render Time’s Up, complete the remaining evidence lanes, and obtain exact-candidate independent rechecks before final jury/release. No implication that a synthetic Time’s Up image proves timer enforcement or real remote stop.
