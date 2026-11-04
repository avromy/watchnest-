# WatchNest independent adversarial Reporter — R3

Frozen 2026-11-04. **R2-01 Time’s Up repair: PASS / CLOSED at all four anchors. New minor findings prevent an unqualified CLEAN verdict; complete acceptance remains BLOCKED.** No other review was read, and no application edits made. This report reviews rendered pixels and supporting manifests; it does not establish real playback, audio, timer enforcement, physical iPad behavior or cold interactive journeys.

## Exact evidence binding

Root: `/workspace/scratch/b4fb31747e8d/watchnest-review/ci134-candidate/`. References below are relative to `test-results/visual-evidence/candidate/` within that root. Fourteen manifests identify PR source `53bd2f792ffe3993cb9a6d40e40cade4f4871cfc`, source/event commit `eb92aac47accfc054832478d89c1f99572da28bb`, and tree `d1425daadd6a7d7b34fb5cc132a6b75773204c66`. Source/event and PR identities are deliberately separate. Parent reports the latest `1f7735c` is application-unchanged; this receipt binds directly to supplied manifests and does not independently prove that later equivalence.

Inventory counted: 190 capture state×viewport units across 14 manifests; 533 PNGs under the candidate visual-evidence directory. The package also contains older docs/evidence PNGs; they are not counted or imported into this receipt. This resolves why a broader raw PNG total can exceed the manifested visual-evidence inventory.

## Repair and paper-state inspection

`390x844/child-times-up-full.png`, `768x1024/child-times-up-full.png`, `1024x768/child-times-up-full.png`, and `1440x1000/child-times-up-full.png` now show dark, readable heading and muted body text on white. Explanation, Choose profile action and Back to Library are legible. R2-01 is closed.

All eight `player-states/*-full.png` states were directly inspected at all four anchors: opening, startup error, monitored startup error, authorization, paused, expired, synthetic-ready-next and synthetic-ended-next (32/32). White paper surfaces have readable headings, body and actions, with no observed clipping in these renders. Startup/authorization display one explanatory alert, monitored startup adds Ask Parent for help, paused/expired have understandable distinct explanations, and ended offers Watch again and an explicit Watch next action. Synthetic-ready frames and ended states are fixture renderings; they prove surrounding presentation only.

Child and Parent PIN error dialogs were inspected at both 768×1024 and 1024×768 (`child-entry/child-pin-error-full.png` and `parent-pin-error-full.png`, 4/4). Each contains one visible error alert, a clearly focused PIN field and Cancel, with readable message and contained dialog. Pixels establish one visible alert; screen-reader announcement behavior was not tested.

## Finite findings

| ID | Severity / status | Exact evidence | Finding and acceptance condition |
| --- | --- | --- | --- |
| R3-01 | P3 readability / OPEN | At each of `768x1024`, `1024x768`, `1440x1000`: `player-states/player-synthetic-ready-next-full.png` and `player-synthetic-ended-next-full.png` | “FROM ARI’S LIBRARY” above the video title uses dark evergreen on the dark player background and is barely readable. Main titles and paper content are repaired, but this informational label still lacks usable contrast. Use an appropriate light foreground in the surrounding player header and verify its contrast and actual pixels at these three anchors. Phone omits this label in the inspected renders. |
| R3-02 | P3 copy polish / OPEN | `390x844/parent-details/parent-url-resolved-full.png`, `parent-approval-assignment-full.png`, `parent-approval-success-full.png`; `1440x1000/parent-details/parent-approval-assignment-full.png` | Singular results/actions say “1 videos found” and “Approve 1 selected videos.” Apply singular/plural agreement (“1 video found,” “Approve 1 selected video”) and recheck one/multiple selection. Selection identity remains visually clear; this is polish, not proven approval failure. |

No new P0–P2 application defect was established by this bounded inspection. The two P3 findings are finite repair items, not a claim of high-severity release failure.

## New workflow evidence and limits

Directly inspected Parent phone full renders: URL resolved; approval assignment; approval success; YouTube results; channel results; playlist results; search error, empty and loading; collection sharing; discovery-permissions enabled. Desktop approval assignment was also inspected. The assignment screen distinguishes selected videos and children; synthetic success explicitly says one individually selected video approved. Search errors and empty states are readable. Collections keep their checkbox/title rows together. Long-page full images establish composition, with fine print below readable scale left unqualified until its viewport crop is consumed.

Directly inspected portrait-tablet child full renders: Simple Home, Simple Library, matching search, hidden empty, Discover-disabled request and success, timer-expired, timer-paused and profile-switch return. Landscape Simple Library top was also inspected. Search results are immediately after filters; hidden empty has explanatory copy; disabled Discover changes the tab to Ask Parent and exposes a request form without a search-results grid. These are observations of the supplied labeled fixtures, not source verification that the Simple setting was correctly activated or functional proof of disabled search/security enforcement.

**Evidence conflict E-R3-01:** portrait-tablet `child-details/child-library-timer-paused-full.png` and `child-library-timer-expired-full.png` have identical SHA-256 `d27747088a375bbd0cb103395e34ab986885a9d03ff31ea7e34f48c2aaaa1a5d` and both visibly say “Time’s up for now.” The player paused fixture correctly shows “Parent paused WatchNest.” Resolve whether the child-library paused capture fixture was activated correctly and whether the actual library should distinguish these states. Do not treat these two files as proof of two visually distinct outcomes. This is an evidence/semantic concern, not a proven timer implementation defect.

**Incomplete Parent extension:** each supplied Parent-details manifest stops after 18 states at discovery-permissions enabled. Active/final timer and later Parent states are not certified. The reported capture-locator correction for a later CI run is outside this package and this review.

## Coverage receipt and gates

- SOURCE_IDENTITY: exact manifests/tree above; synthetic Chromium, no physical-device claim.
- REGION_COVERAGE / READABLE_VIEWS: 62 actual PNGs directly inspected this round: 4 core Time’s Up, 32 player states, 4 PIN errors, 12 Parent-details views, 10 child-details views. This is 62/533 manifested PNGs, not all 190 capture units or all supplied regions. Prior receipts remain prior-candidate evidence and are not silently recertified.
- BOUNDED_ASSETS / ASSET_EVIDENCE_CONSUMED / EDGE_GATES: neutral per-capture asset and edge records exist in the manifests; complete individual A-identity consumption/edge resolution was not performed. Sampled paper cards, PIN dialogs, labels and action bounds were inspected in actual pixels. No exhaustive Human-Eye CLEAN assertion.
- STRUCTURAL_RECORDS: fourteen manifests enumerated; identity, capture states and paused/expired hashes examined. Geometry did not override pixels.
- APPLICATION_BINDING: supplied source-tree synthetic package only. No hosted configuration, family authorization or real provider-media acceptance.
- UNRESOLVED_CONFLICTS: E-R3-01 paused/expired capture semantics; unverified later-source equivalence.
- HUMAN_GATES: full responsive matrix including narrow/intermediate widths, continuous resizing, keyboard and screen-reader behavior, comprehensive contrast, independent final jury/cold journeys, physical playback/native fullscreen/remote-stop remain outside this receipt.
- CONFIRMED_DEFECTS: R3-01 and R3-02 only. R2-01 closed. Existing R1 repairs were not reopened, but whole-app recertification was not attempted.
- POSSIBLE_CONCERNS: Simple-mode fixture effectiveness and lower-page details require correct state/viewport evidence; do not infer failures from capture labels alone.
- FINAL_RESULT: **PASS for the bounded Time’s Up and paper-state repair check; two P3 items OPEN; BLOCKED for unqualified CLEAN/full acceptance.** Complete the remaining captures, resolve paused-state semantics, repair the finite findings and run exact-candidate independent rechecks. No product release or physical-playback clearance follows from this report.
