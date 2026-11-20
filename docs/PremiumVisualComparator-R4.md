# Premium Visual Comparator — R4

**Scoped anchor convergence: PASS. Confirmed objective visual defects remaining in this recheck: 0. Whole-corpus HumanEye CLEAN is not issued by this report.**

This is an independent pixel recheck of own prior findings and newly completed later states. It does not adopt other reviewers’ votes or certify their consumption. No other reports, app source, or new review history were read. Current HumanEye V2 authority remains https://app.notion.com/p/3ea584c4f74781f5946bef30a54c86c5, retrieved earlier in this review assignment.

## Exact candidate

| Field | Identity |
|---|---|
| Package | `/workspace/scratch/b4fb31747e8d/watchnest-review/ci136-candidate` |
| App/PR head | `da6edbb4436fc6f455eaef87ace5df61c3e62396` |
| CI executed commit | `c624704e0ed074356ff0826fd3c539cb48b917e3` |
| Tree | `bb562b7c878d6e3be904b318a54e8546892fce52` |
| Anchors | 390×844; 768×1024; 1024×768; 1440×1000 |
| Evidence | Local synthetic Chromium; physicalDevice false |

Fourteen recursive manifests enumerate 212 captures and 609 PNGs; the package’s other nine PNGs are legacy supplementary images. All 609 manifest PNG hashes were checked and match. Hash verification does not count as visual consumption.

## Findings

| Prior issue / required check | Pixel result |
|---|---|
| PVC-01 collection labels | Repaired in visible approved-video rows at all four anchors. Checkboxes and labels share the shaded rows; long titles wrap within them. Unseen internal-scroll rows are outside this conclusion. |
| PVC-02 time-up white-card contrast | Repaired at all four anchors in core time-up and player-expired. Headings, explanation and action are clearly visible. |
| PVC-03 dark player eyebrow | Repaired in ready-next and ended-next at all three affected tablet/desktop anchors. “FROM ARI’S LIBRARY” is now a readable gold against dark green. Phone continues to omit that eyebrow. |
| Paused versus expired player copy | All four anchors visibly distinguish “Parent paused WatchNest” from “Time’s up for now”; explanations fit without overlap. |
| Paused versus expired library copy | All four anchors now visibly distinguish the paused title and resume explanation from expired title and return-later explanation. |
| Later parent timer states | Active, paused and expired full pages inspected at phone and desktop, with readable top and middle-1 tiles for each. Time/status, End now, Add 15 minutes, Pause/Resume and Turn timer off remain contained and readable. |
| Later parent empty/error states | Sign-in error, library empty, collections empty, inbox empty, children empty and dashboard error inspected at phone and desktop. No objective clipping, overlap, unreadable message, or detached action found. |

The newly supplied timer/empty/error states close the specific R3 absence for those parent state names at the supplied phone/desktop anchors. They do not establish unrecorded variants or interactions. No new finite visual defect was found in this scoped convergence check.

The inspected layouts retain the warm cream/green/gold family-library treatment. Collection rows and session cards have clear grouping. White player cards retain readable text; the repaired eyebrow now belongs visibly to the video header. Phone timer controls wrap into a stable arrangement without colliding with status copy. Actual remote effects, provider playback and physical touch behavior are not inferred from the pictures.

## Coverage receipt and limits

| Gate | Receipt |
|---|---|
| SOURCE_IDENTITY | Bound to the exact head, executed commit, tree and manifests above. |
| REGION_COVERAGE | 50/212 supplied captures have an actually consumed full page in this R4 pass. All 18 newly later parent full pages consumed (9 states × phone/desktop), plus the 32 targeted repair/copy full pages across four anchors. |
| READABLE_VIEWS | 62/609 manifest PNGs actually opened: 50 full + 12 parent timer top/middle-1 tiles. Remaining 547 manifest PNGs and nine legacy PNGs not visually consumed by this R4 pass. Prior-round viewing is not current-round consumption. |
| BOUNDED_ASSETS | 2,915 neutral asset entries enumerated from manifests; 0 individually certified by this report. |
| ASSET_EVIDENCE_CONSUMED | Only contextual rasters listed below. No individual A-ID crop or all-edge verdict is claimed; no crop pixels consumed. |
| STRUCTURAL_RECORDS | 14 manifests parsed for identities, state/file inventory, neutral asset mappings and hashes. Per-asset optical/edge reconciliation not completed here. |
| EDGE_GATES | 0/11,660 individually resolved in this report. Other reviewers’ edge receipts are neither read nor adopted. |
| APPLICATION_BINDING | Synthetic local rendering only. No hosted browser, Safari/PWA, physical-device, or genuine provider evidence claimed. |
| UNRESOLVED_CONFLICTS | No specific structural-versus-pixel contradiction found in consumed views; whole-corpus reconciliation is outside this scoped pass. |
| HUMAN_GATES | Targeted contrast, wrapping, spacing, grouping, hierarchy, state readability and visible contours inspected. No remaining objective defect in that scope. |
| CONFIRMED_DEFECTS | 0 current; PVC-01/02/03 repaired in targeted current pixels. |
| POSSIBLE_CONCERNS | None promoted to a defect. Coverage limits remain explicit. |
| FINAL_RESULT | Scoped anchor convergence PASS; whole-corpus CLEAN withheld by this reviewer’s incomplete consumption. Await supplemental widths for any claim beyond four anchors. |

The forthcoming eight-width/five-state supplement was not available or consumed for this report. This report may accompany independent complete HumanEye receipts and fresh jury work, but cannot replace those gates. No app edits were made.

## Exact consumed metadata

Paths below are relative to the package root.

- `test-results/visual-evidence/candidate/1024x768/child-details/manifest.json` — SHA-256 `4bbfc9e32639431fd9e558039e795558ed203b32db66049c8b4b4fdbab81966e`.
- `test-results/visual-evidence/candidate/1024x768/child-entry/manifest.json` — SHA-256 `4905b25231b03c120d20ed08f582e482e7d199d1babfaa8c6f153d5bc080f204`.
- `test-results/visual-evidence/candidate/1024x768/manifest.json` — SHA-256 `af6ec00d31df8ebcdaac09ea131d12e820faf45d78905bb19c60b8ec8b11f5ec`.
- `test-results/visual-evidence/candidate/1024x768/player-states/manifest.json` — SHA-256 `68068d9454c4a950fff12ab7c2bf7f0463b72500f8ddbf67b20d68fd54c659d5`.
- `test-results/visual-evidence/candidate/1440x1000/manifest.json` — SHA-256 `0c1fa1458c81d7fd2f9584153e6f0644ab9fa54f4edfdc5e1502a09dca395acc`.
- `test-results/visual-evidence/candidate/1440x1000/parent-details/manifest.json` — SHA-256 `9d494583e988a3f296b084d5d1cd3ef2a9c68f9b5cace19eeeaf42681f8d0fbd`.
- `test-results/visual-evidence/candidate/1440x1000/player-states/manifest.json` — SHA-256 `fbb98a43bb23a534f070b161e02fc9dec1992bfaa9a70cf3c336cd05ccb549bc`.
- `test-results/visual-evidence/candidate/390x844/manifest.json` — SHA-256 `f8523c8e77ebd85c7552b0b8881259c933f0a297a09f3e56ffee62467b672574`.
- `test-results/visual-evidence/candidate/390x844/parent-details/manifest.json` — SHA-256 `40057fdc75f24181ed34b2dbf06b8c9ebeb2d8c6cda6e9f3e40a5af01bbe22e5`.
- `test-results/visual-evidence/candidate/390x844/player-states/manifest.json` — SHA-256 `c2878328ae8a81642108ca1149c51286d993323d7dcb6a60c3803b652836e008`.
- `test-results/visual-evidence/candidate/768x1024/child-details/manifest.json` — SHA-256 `0d4dfa76a9d591d1073c25732894922756a55f184b4474d5de02fe0265fe7560`.
- `test-results/visual-evidence/candidate/768x1024/child-entry/manifest.json` — SHA-256 `82b6058235a4cded12276734a366bad09e77b1f440aeb262dfab999b50d1dd96`.
- `test-results/visual-evidence/candidate/768x1024/manifest.json` — SHA-256 `c1e90e630a2792d60a9995e21d066e8807fadcd1336bb3b04d339d5967175483`.
- `test-results/visual-evidence/candidate/768x1024/player-states/manifest.json` — SHA-256 `379b7f57363fec5b53a131172d24e016101523d875b0564be6db3934be444a4e`.

## Exact visually consumed files

- `test-results/visual-evidence/candidate/1024x768/parent-collections-full.png`
- `test-results/visual-evidence/candidate/1024x768/child-times-up-full.png`
- `test-results/visual-evidence/candidate/1024x768/player-states/player-paused-full.png`
- `test-results/visual-evidence/candidate/1024x768/player-states/player-expired-full.png`
- `test-results/visual-evidence/candidate/1024x768/player-states/player-synthetic-ready-next-full.png`
- `test-results/visual-evidence/candidate/1024x768/player-states/player-synthetic-ended-next-full.png`
- `test-results/visual-evidence/candidate/1024x768/player-states/child-library-timer-expired-full.png`
- `test-results/visual-evidence/candidate/1024x768/player-states/child-library-timer-paused-full.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-collections-full.png`
- `test-results/visual-evidence/candidate/1440x1000/child-times-up-full.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-details/parent-remote-timer-active-full.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-details/parent-remote-timer-paused-full.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-details/parent-remote-timer-expired-full.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-details/parent-sign-in-error-full.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-details/parent-library-empty-full.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-details/parent-collections-empty-full.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-details/parent-inbox-empty-full.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-details/parent-children-empty-full.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-details/parent-dashboard-error-full.png`
- `test-results/visual-evidence/candidate/1440x1000/player-states/player-paused-full.png`
- `test-results/visual-evidence/candidate/1440x1000/player-states/player-expired-full.png`
- `test-results/visual-evidence/candidate/1440x1000/player-states/player-synthetic-ready-next-full.png`
- `test-results/visual-evidence/candidate/1440x1000/player-states/player-synthetic-ended-next-full.png`
- `test-results/visual-evidence/candidate/1440x1000/player-states/child-library-timer-expired-full.png`
- `test-results/visual-evidence/candidate/1440x1000/player-states/child-library-timer-paused-full.png`
- `test-results/visual-evidence/candidate/390x844/parent-collections-full.png`
- `test-results/visual-evidence/candidate/390x844/child-times-up-full.png`
- `test-results/visual-evidence/candidate/390x844/parent-details/parent-remote-timer-active-full.png`
- `test-results/visual-evidence/candidate/390x844/parent-details/parent-remote-timer-paused-full.png`
- `test-results/visual-evidence/candidate/390x844/parent-details/parent-remote-timer-expired-full.png`
- `test-results/visual-evidence/candidate/390x844/parent-details/parent-sign-in-error-full.png`
- `test-results/visual-evidence/candidate/390x844/parent-details/parent-library-empty-full.png`
- `test-results/visual-evidence/candidate/390x844/parent-details/parent-collections-empty-full.png`
- `test-results/visual-evidence/candidate/390x844/parent-details/parent-inbox-empty-full.png`
- `test-results/visual-evidence/candidate/390x844/parent-details/parent-children-empty-full.png`
- `test-results/visual-evidence/candidate/390x844/parent-details/parent-dashboard-error-full.png`
- `test-results/visual-evidence/candidate/390x844/player-states/player-paused-full.png`
- `test-results/visual-evidence/candidate/390x844/player-states/player-expired-full.png`
- `test-results/visual-evidence/candidate/390x844/player-states/player-synthetic-ready-next-full.png`
- `test-results/visual-evidence/candidate/390x844/player-states/player-synthetic-ended-next-full.png`
- `test-results/visual-evidence/candidate/390x844/player-states/child-library-timer-expired-full.png`
- `test-results/visual-evidence/candidate/390x844/player-states/child-library-timer-paused-full.png`
- `test-results/visual-evidence/candidate/768x1024/parent-collections-full.png`
- `test-results/visual-evidence/candidate/768x1024/child-times-up-full.png`
- `test-results/visual-evidence/candidate/768x1024/player-states/player-paused-full.png`
- `test-results/visual-evidence/candidate/768x1024/player-states/player-expired-full.png`
- `test-results/visual-evidence/candidate/768x1024/player-states/player-synthetic-ready-next-full.png`
- `test-results/visual-evidence/candidate/768x1024/player-states/player-synthetic-ended-next-full.png`
- `test-results/visual-evidence/candidate/768x1024/player-states/child-library-timer-expired-full.png`
- `test-results/visual-evidence/candidate/768x1024/player-states/child-library-timer-paused-full.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-details/parent-remote-timer-active-top.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-details/parent-remote-timer-active-middle-1.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-details/parent-remote-timer-paused-top.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-details/parent-remote-timer-paused-middle-1.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-details/parent-remote-timer-expired-top.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-details/parent-remote-timer-expired-middle-1.png`
- `test-results/visual-evidence/candidate/390x844/parent-details/parent-remote-timer-active-top.png`
- `test-results/visual-evidence/candidate/390x844/parent-details/parent-remote-timer-active-middle-1.png`
- `test-results/visual-evidence/candidate/390x844/parent-details/parent-remote-timer-paused-top.png`
- `test-results/visual-evidence/candidate/390x844/parent-details/parent-remote-timer-paused-middle-1.png`
- `test-results/visual-evidence/candidate/390x844/parent-details/parent-remote-timer-expired-top.png`
- `test-results/visual-evidence/candidate/390x844/parent-details/parent-remote-timer-expired-middle-1.png`

Only those 62 rasters are claimed visually consumed in R4.
