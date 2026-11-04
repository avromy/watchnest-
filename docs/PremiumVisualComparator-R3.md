# Premium Visual Comparator — R3

**FINAL_RESULT: FAIL — one minor confirmed visual defect; mandatory coverage incomplete.** Exact CI134 synthetic corpus only. The major R2 white-card defect is repaired in the inspected pixels.

Independent review used HumanEye V2 authority https://app.notion.com/p/3ea584c4f74781f5946bef30a54c86c5 (retrieved earlier in this same review assignment), current rasters and neutral evidence records. No app source or other reviewers’ reports were read. Own prior repair target was the only inherited defect context.

## Source identity

| Identity | Value |
|---|---|
| Package | `/workspace/scratch/b4fb31747e8d/watchnest-review/ci134-candidate` |
| PR head | `53bd2f792ffe3993cb9a6d40e40cade4f4871cfc` |
| CI executed/source commit | `eb92aac47accfc054832478d89c1f99572da28bb` |
| Source tree | `d1425daadd6a7d7b34fb5cc132a6b75773204c66` |
| Anchors | 390×844 phone; 768×1024 tablet portrait; 1024×768 tablet landscape; 1440×1000 desktop |
| Runtime | Manifest-bound local Chromium, synthetic API/artwork/player responses; no physical-device or genuine provider playback claim |

Fourteen recursive manifests describe 190 state×viewport captures and 533 main PNGs. The additional nine legacy supplementary PNGs are outside those manifests. All 533 main hashes match the manifests. The added index enumerates 2,696 neutral source-pixel crops; all crop hashes match. Hash checks do not count as pixel inspection.

## Finite defects and repair recheck

| ID | Severity | Exact current evidence | Finding | Required correction |
|---|---|---|---|---|
| PVC-03 | Minor | `test-results/visual-evidence/candidate/{768x1024,1024x768,1440x1000}/player-states/player-synthetic-ready-next-full.png` and `player-synthetic-ended-next-full.png` | The player-header eyebrow “FROM ARI’S LIBRARY” uses dark green text against the nearly black background. It is barely discernible while the neighboring white title is readily readable. Confirmed in both states at all three listed anchors. The eyebrow is absent on the phone captures, so the phone is not included in this defect. No numerical contrast ratio is claimed. | Use a visibly contrasting player-header eyebrow color, scoped to the dark background, and recapture the affected states. |

**PVC-02 repaired:** `child-times-up-full.png` and `player-expired-full.png` now have clearly readable dark headings and body text on the white card at all four anchors. The eight supplied player states per anchor were opened: opening, startup error, monitored startup error, authorization, paused, expired, synthetic ready-next, synthetic ended-next. All white paper-card text inspected is readable, contained, and visually coherent. White-card repair is a pixel conclusion, not a playback-function conclusion.

The supplied PIN dialog and child/parent PIN errors were inspected with full/top/bottom captures at both tablet anchors. Error copy, input, focus ring and Cancel fit within the modal; no objective visual defect found there.

No additional objective visual defect was found in the consumed detail views. Parent approval and collection-sharing forms remain legible and contained on phone and desktop. Expanded avatar choices remain distinct, with a visible selection outline. Child simple-mode artwork cards, long-title wrapping and action grouping remain orderly in the supplied tablet views. Cream, green and gold remain consistent with a warm family library. Raster review cannot establish physical touch behavior.

## Controller coverage receipt

| Gate | Exact receipt |
|---|---|
| SOURCE_IDENTITY | Fourteen manifests share the PR head, executed commit and tree above. No later source/corpus accepted. |
| REGION_COVERAGE | 98/190 supplied state×viewport captures have a visually consumed full image: 4 core time-up + 32 player + 6 PIN entry/error + 56 detail states. All 56 added parent/child detail full pages consumed. This is partial current-corpus coverage. |
| READABLE_VIEWS | 150/533 manifest PNGs visually consumed: 98 full + 52 tiles. Tiles comprise all 12 PIN entry/error tiles and all 40 supplied tiles for tall simple-home/library and expanded profile-avatar/discovery-permission views. Remaining 383 main PNGs unconsumed. Nine supplementary legacy PNGs unconsumed. |
| BOUNDED_ASSETS | 2,696 asset records/index identities enumerated; 0/2,696 individually certified. Contextual viewing does not establish identity-specific contour inspection. |
| ASSET_EVIDENCE_CONSUMED | No individual A-identity receives all-edge PASS. Added crop pixels: 0/2,696 consumed. All records retain unresolved edge verdicts. Exact supplied per-state ranges below; consumed raster files listed separately. |
| STRUCTURAL_RECORDS | 14/14 manifests parsed for source/state/viewport/file/hash and neutral asset record mapping; source/bounds/readable-view/four-edge structures examined. Crop index parsed and hash checked. Per-asset optical reconciliation incomplete. |
| EDGE_GATES | 0/10,784 individually resolved (four × 2,696). |
| APPLICATION_BINDING | Current visual conclusions bind only the listed CI134 files. Synthetic provider/player images do not prove deployed playback, Safari/PWA, or physical-device behavior. |
| UNRESOLVED_CONFLICTS | No specific geometry-versus-pixel contradiction confirmed. Unseen/occluded/internal-scroll assets and unconsumed crops prevent complete reconciliation. |
| HUMAN_GATES | Visible hierarchy, optical spacing, grouping, wrapping, artwork crop story and contrast assessed in consumed views; player eyebrow contrast fails. Whole-corpus and exhaustive artwork-edge gates remain incomplete. |
| CONFIRMED_DEFECTS | One minor: PVC-03. Major PVC-02 repaired in current evidence. |
| POSSIBLE_CONCERNS | No additional speculative visual issue promoted. Unconsumed files and missing later parent special states are evidence gaps. |
| FINAL_RESULT | FAIL, not CLEAN; remaining evidence and review required. |

Parent-details manifests end at discovery-permissions-enabled: each has 18 states. No final timer-and-later parent-state sequence is present in these manifests. This review does not infer those states from core controls screenshots, a locator-repair statement, or a pending CI run. It also does not import R2 pixel consumption as current CI134 consumption. Internal scrolling and modal-background captures require appropriate viewport evidence; bounds alone cannot certify visible contours. No physical-device, provider, deployed-browser or full accessibility acceptance is claimed.

## Exact consumed metadata

All paths below are relative to the CI134 package root.

- `test-results/visual-evidence/candidate/1024x768/child-details/manifest.json` — SHA-256 `d740c187428413d412ebe82e1aa75840852b2f5c8de0d4524455f5f0963d2320`.
- `test-results/visual-evidence/candidate/1024x768/child-entry/manifest.json` — SHA-256 `2d1dd48c3427f863f063b0382030cff96ddc5d10f1343f3688f45ef9ed829c10`.
- `test-results/visual-evidence/candidate/1024x768/manifest.json` — SHA-256 `640d89aafb41a153cdf0397583f4e5524a29ff87375bf64416402577edc55c61`.
- `test-results/visual-evidence/candidate/1024x768/player-states/manifest.json` — SHA-256 `9586d3872408a39a39083d5dab3e0d84bf4ce3a2d931b158724a9708aee897f7`.
- `test-results/visual-evidence/candidate/1440x1000/manifest.json` — SHA-256 `c8bca21f4a6d65c897d6536569fa356ae15493a1aca36776cb7d2d39b52e14f1`.
- `test-results/visual-evidence/candidate/1440x1000/parent-details/manifest.json` — SHA-256 `c5adb32238db099353e2dfb1edd789a09159cb82432b50d4528535b3c70bfe33`.
- `test-results/visual-evidence/candidate/1440x1000/player-states/manifest.json` — SHA-256 `a7aec907a2ce894d98f7ea6d7c037343c0c2c263f10f00b978731c106009caf1`.
- `test-results/visual-evidence/candidate/390x844/manifest.json` — SHA-256 `746f285b3165753224caf86b2a4aaa0391df88fe194bc5839c6a62afd9ca2e7a`.
- `test-results/visual-evidence/candidate/390x844/parent-details/manifest.json` — SHA-256 `f4a10525907f95ec09f478279503f2785a5fa71e60739ab67ecee8590ff55087`.
- `test-results/visual-evidence/candidate/390x844/player-states/manifest.json` — SHA-256 `f8c034ceabce9f5754b814073066ca56031a316c506044a8718394e5347309fa`.
- `test-results/visual-evidence/candidate/768x1024/child-details/manifest.json` — SHA-256 `c217eddf455129da2cdfc964185a6f9c775c054a4358498948caa40436a1207a`.
- `test-results/visual-evidence/candidate/768x1024/child-entry/manifest.json` — SHA-256 `5df40b20514155bfbefb3da8e329b435263052643a15749e3c2b43ac934cd361`.
- `test-results/visual-evidence/candidate/768x1024/manifest.json` — SHA-256 `1b129e8e2c8ad3ab1e439b7c41f73dd68a3db258d8ed693b5c9844c377f6eba5`.
- `test-results/visual-evidence/candidate/768x1024/player-states/manifest.json` — SHA-256 `ab72e6aa6e8b6e925ece335f3bf482d2745daa66f9481087445183391f254f53`.
- `asset-crops/index.json` — SHA-256 `c66a33747d0353f5a53db333ef30acdb080d0778608334d3d4f460e6e4959d16`; index parsed, crop pixels unconsumed.

## Exact visually consumed rasters

- `test-results/visual-evidence/candidate/1024x768/child-entry/child-pin-dialog-full.png`
- `test-results/visual-evidence/candidate/1024x768/child-entry/child-pin-dialog-top.png`
- `test-results/visual-evidence/candidate/1024x768/child-entry/child-pin-dialog-bottom.png`
- `test-results/visual-evidence/candidate/1024x768/child-entry/child-pin-error-full.png`
- `test-results/visual-evidence/candidate/1024x768/child-entry/child-pin-error-top.png`
- `test-results/visual-evidence/candidate/1024x768/child-entry/child-pin-error-bottom.png`
- `test-results/visual-evidence/candidate/1024x768/child-entry/parent-pin-error-full.png`
- `test-results/visual-evidence/candidate/1024x768/child-entry/parent-pin-error-top.png`
- `test-results/visual-evidence/candidate/1024x768/child-entry/parent-pin-error-bottom.png`
- `test-results/visual-evidence/candidate/1024x768/child-times-up-full.png`
- `test-results/visual-evidence/candidate/1024x768/player-states/player-opening-full.png`
- `test-results/visual-evidence/candidate/1024x768/player-states/player-startup-error-full.png`
- `test-results/visual-evidence/candidate/1024x768/player-states/player-monitored-startup-error-full.png`
- `test-results/visual-evidence/candidate/1024x768/player-states/player-authorization-full.png`
- `test-results/visual-evidence/candidate/1024x768/player-states/player-paused-full.png`
- `test-results/visual-evidence/candidate/1024x768/player-states/player-expired-full.png`
- `test-results/visual-evidence/candidate/1024x768/player-states/player-synthetic-ready-next-full.png`
- `test-results/visual-evidence/candidate/1024x768/player-states/player-synthetic-ended-next-full.png`
- `test-results/visual-evidence/candidate/1440x1000/child-times-up-full.png`
- `test-results/visual-evidence/candidate/1440x1000/player-states/player-opening-full.png`
- `test-results/visual-evidence/candidate/1440x1000/player-states/player-startup-error-full.png`
- `test-results/visual-evidence/candidate/1440x1000/player-states/player-monitored-startup-error-full.png`
- `test-results/visual-evidence/candidate/1440x1000/player-states/player-authorization-full.png`
- `test-results/visual-evidence/candidate/1440x1000/player-states/player-paused-full.png`
- `test-results/visual-evidence/candidate/1440x1000/player-states/player-expired-full.png`
- `test-results/visual-evidence/candidate/1440x1000/player-states/player-synthetic-ready-next-full.png`
- `test-results/visual-evidence/candidate/1440x1000/player-states/player-synthetic-ended-next-full.png`
- `test-results/visual-evidence/candidate/390x844/child-times-up-full.png`
- `test-results/visual-evidence/candidate/390x844/player-states/player-opening-full.png`
- `test-results/visual-evidence/candidate/390x844/player-states/player-startup-error-full.png`
- `test-results/visual-evidence/candidate/390x844/player-states/player-monitored-startup-error-full.png`
- `test-results/visual-evidence/candidate/390x844/player-states/player-authorization-full.png`
- `test-results/visual-evidence/candidate/390x844/player-states/player-paused-full.png`
- `test-results/visual-evidence/candidate/390x844/player-states/player-expired-full.png`
- `test-results/visual-evidence/candidate/390x844/player-states/player-synthetic-ready-next-full.png`
- `test-results/visual-evidence/candidate/390x844/player-states/player-synthetic-ended-next-full.png`
- `test-results/visual-evidence/candidate/768x1024/child-entry/child-pin-dialog-full.png`
- `test-results/visual-evidence/candidate/768x1024/child-entry/child-pin-dialog-top.png`
- `test-results/visual-evidence/candidate/768x1024/child-entry/child-pin-dialog-bottom.png`
- `test-results/visual-evidence/candidate/768x1024/child-entry/child-pin-error-full.png`
- `test-results/visual-evidence/candidate/768x1024/child-entry/child-pin-error-top.png`
- `test-results/visual-evidence/candidate/768x1024/child-entry/child-pin-error-bottom.png`
- `test-results/visual-evidence/candidate/768x1024/child-entry/parent-pin-error-full.png`
- `test-results/visual-evidence/candidate/768x1024/child-entry/parent-pin-error-top.png`
- `test-results/visual-evidence/candidate/768x1024/child-entry/parent-pin-error-bottom.png`
- `test-results/visual-evidence/candidate/768x1024/child-times-up-full.png`
- `test-results/visual-evidence/candidate/768x1024/player-states/player-opening-full.png`
- `test-results/visual-evidence/candidate/768x1024/player-states/player-startup-error-full.png`
- `test-results/visual-evidence/candidate/768x1024/player-states/player-monitored-startup-error-full.png`
- `test-results/visual-evidence/candidate/768x1024/player-states/player-authorization-full.png`
- `test-results/visual-evidence/candidate/768x1024/player-states/player-paused-full.png`
- `test-results/visual-evidence/candidate/768x1024/player-states/player-expired-full.png`
- `test-results/visual-evidence/candidate/768x1024/player-states/player-synthetic-ready-next-full.png`
- `test-results/visual-evidence/candidate/768x1024/player-states/player-synthetic-ended-next-full.png`
- `test-results/visual-evidence/candidate/1024x768/child-details/child-library-loading-full.png`
- `test-results/visual-evidence/candidate/1024x768/child-details/child-simple-home-full.png`
- `test-results/visual-evidence/candidate/1024x768/child-details/child-simple-library-full.png`
- `test-results/visual-evidence/candidate/1024x768/child-details/child-search-results-full.png`
- `test-results/visual-evidence/candidate/1024x768/child-details/child-hidden-empty-full.png`
- `test-results/visual-evidence/candidate/1024x768/child-details/child-discover-disabled-request-full.png`
- `test-results/visual-evidence/candidate/1024x768/child-details/child-discover-disabled-success-full.png`
- `test-results/visual-evidence/candidate/1024x768/child-details/child-library-timer-expired-full.png`
- `test-results/visual-evidence/candidate/1024x768/child-details/child-library-timer-paused-full.png`
- `test-results/visual-evidence/candidate/1024x768/child-details/child-profile-switch-return-full.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-details/parent-url-intake-full.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-details/parent-url-resolved-full.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-details/parent-approval-assignment-full.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-details/parent-approval-success-full.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-details/parent-youtube-search-results-full.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-details/parent-add-preview-dialog-full.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-details/parent-channels-results-full.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-details/parent-channels-videos-full.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-details/parent-playlists-results-full.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-details/parent-playlists-videos-full.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-details/parent-search-empty-full.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-details/parent-search-error-full.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-details/parent-search-loading-full.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-details/parent-collection-edit-full.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-details/parent-collection-share-full.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-details/parent-collection-share-success-full.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-details/parent-profile-photo-avatar-settings-full.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-details/parent-discovery-permissions-enabled-full.png`
- `test-results/visual-evidence/candidate/390x844/parent-details/parent-url-intake-full.png`
- `test-results/visual-evidence/candidate/390x844/parent-details/parent-url-resolved-full.png`
- `test-results/visual-evidence/candidate/390x844/parent-details/parent-approval-assignment-full.png`
- `test-results/visual-evidence/candidate/390x844/parent-details/parent-approval-success-full.png`
- `test-results/visual-evidence/candidate/390x844/parent-details/parent-youtube-search-results-full.png`
- `test-results/visual-evidence/candidate/390x844/parent-details/parent-add-preview-dialog-full.png`
- `test-results/visual-evidence/candidate/390x844/parent-details/parent-channels-results-full.png`
- `test-results/visual-evidence/candidate/390x844/parent-details/parent-channels-videos-full.png`
- `test-results/visual-evidence/candidate/390x844/parent-details/parent-playlists-results-full.png`
- `test-results/visual-evidence/candidate/390x844/parent-details/parent-playlists-videos-full.png`
- `test-results/visual-evidence/candidate/390x844/parent-details/parent-search-empty-full.png`
- `test-results/visual-evidence/candidate/390x844/parent-details/parent-search-error-full.png`
- `test-results/visual-evidence/candidate/390x844/parent-details/parent-search-loading-full.png`
- `test-results/visual-evidence/candidate/390x844/parent-details/parent-collection-edit-full.png`
- `test-results/visual-evidence/candidate/390x844/parent-details/parent-collection-share-full.png`
- `test-results/visual-evidence/candidate/390x844/parent-details/parent-collection-share-success-full.png`
- `test-results/visual-evidence/candidate/390x844/parent-details/parent-profile-photo-avatar-settings-full.png`
- `test-results/visual-evidence/candidate/390x844/parent-details/parent-discovery-permissions-enabled-full.png`
- `test-results/visual-evidence/candidate/768x1024/child-details/child-library-loading-full.png`
- `test-results/visual-evidence/candidate/768x1024/child-details/child-simple-home-full.png`
- `test-results/visual-evidence/candidate/768x1024/child-details/child-simple-library-full.png`
- `test-results/visual-evidence/candidate/768x1024/child-details/child-search-results-full.png`
- `test-results/visual-evidence/candidate/768x1024/child-details/child-hidden-empty-full.png`
- `test-results/visual-evidence/candidate/768x1024/child-details/child-discover-disabled-request-full.png`
- `test-results/visual-evidence/candidate/768x1024/child-details/child-discover-disabled-success-full.png`
- `test-results/visual-evidence/candidate/768x1024/child-details/child-library-timer-expired-full.png`
- `test-results/visual-evidence/candidate/768x1024/child-details/child-library-timer-paused-full.png`
- `test-results/visual-evidence/candidate/768x1024/child-details/child-profile-switch-return-full.png`
- `test-results/visual-evidence/candidate/1024x768/child-details/child-simple-home-top.png`
- `test-results/visual-evidence/candidate/1024x768/child-details/child-simple-home-middle-1.png`
- `test-results/visual-evidence/candidate/1024x768/child-details/child-simple-home-middle-2.png`
- `test-results/visual-evidence/candidate/1024x768/child-details/child-simple-home-middle-3.png`
- `test-results/visual-evidence/candidate/1024x768/child-details/child-simple-home-middle-4.png`
- `test-results/visual-evidence/candidate/1024x768/child-details/child-simple-home-middle-5.png`
- `test-results/visual-evidence/candidate/1024x768/child-details/child-simple-home-middle-6.png`
- `test-results/visual-evidence/candidate/1024x768/child-details/child-simple-home-bottom.png`
- `test-results/visual-evidence/candidate/1024x768/child-details/child-simple-library-top.png`
- `test-results/visual-evidence/candidate/1024x768/child-details/child-simple-library-middle-1.png`
- `test-results/visual-evidence/candidate/1024x768/child-details/child-simple-library-middle-2.png`
- `test-results/visual-evidence/candidate/1024x768/child-details/child-simple-library-middle-3.png`
- `test-results/visual-evidence/candidate/1024x768/child-details/child-simple-library-bottom.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-details/parent-profile-photo-avatar-settings-top.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-details/parent-profile-photo-avatar-settings-bottom.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-details/parent-discovery-permissions-enabled-top.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-details/parent-discovery-permissions-enabled-middle-1.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-details/parent-discovery-permissions-enabled-middle-2.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-details/parent-discovery-permissions-enabled-bottom.png`
- `test-results/visual-evidence/candidate/390x844/parent-details/parent-profile-photo-avatar-settings-top.png`
- `test-results/visual-evidence/candidate/390x844/parent-details/parent-profile-photo-avatar-settings-middle-1.png`
- `test-results/visual-evidence/candidate/390x844/parent-details/parent-profile-photo-avatar-settings-middle-2.png`
- `test-results/visual-evidence/candidate/390x844/parent-details/parent-profile-photo-avatar-settings-middle-3.png`
- `test-results/visual-evidence/candidate/390x844/parent-details/parent-profile-photo-avatar-settings-bottom.png`
- `test-results/visual-evidence/candidate/390x844/parent-details/parent-discovery-permissions-enabled-top.png`
- `test-results/visual-evidence/candidate/390x844/parent-details/parent-discovery-permissions-enabled-middle-1.png`
- `test-results/visual-evidence/candidate/390x844/parent-details/parent-discovery-permissions-enabled-middle-2.png`
- `test-results/visual-evidence/candidate/390x844/parent-details/parent-discovery-permissions-enabled-middle-3.png`
- `test-results/visual-evidence/candidate/390x844/parent-details/parent-discovery-permissions-enabled-middle-4.png`
- `test-results/visual-evidence/candidate/390x844/parent-details/parent-discovery-permissions-enabled-middle-5.png`
- `test-results/visual-evidence/candidate/390x844/parent-details/parent-discovery-permissions-enabled-middle-6.png`
- `test-results/visual-evidence/candidate/390x844/parent-details/parent-discovery-permissions-enabled-bottom.png`
- `test-results/visual-evidence/candidate/768x1024/child-details/child-simple-home-top.png`
- `test-results/visual-evidence/candidate/768x1024/child-details/child-simple-home-middle-1.png`
- `test-results/visual-evidence/candidate/768x1024/child-details/child-simple-home-middle-2.png`
- `test-results/visual-evidence/candidate/768x1024/child-details/child-simple-home-middle-3.png`
- `test-results/visual-evidence/candidate/768x1024/child-details/child-simple-home-bottom.png`
- `test-results/visual-evidence/candidate/768x1024/child-details/child-simple-library-top.png`
- `test-results/visual-evidence/candidate/768x1024/child-details/child-simple-library-middle-1.png`
- `test-results/visual-evidence/candidate/768x1024/child-details/child-simple-library-bottom.png`

## Manifest coverage ledger

| Manifest directory | State | Full image consumed | PNGs consumed / supplied | A-identities supplied, all individually unresolved |
|---|---|---|---|---|
| test-results/visual-evidence/candidate/1024x768/child-details | child-library-loading | yes | 1/1 | none (0) |
| test-results/visual-evidence/candidate/1024x768/child-details | child-simple-home | yes | 9/9 | A001…A084 (84) |
| test-results/visual-evidence/candidate/1024x768/child-details | child-simple-library | yes | 6/6 | A001…A059 (59) |
| test-results/visual-evidence/candidate/1024x768/child-details | child-search-results | yes | 1/3 | A001…A026 (26) |
| test-results/visual-evidence/candidate/1024x768/child-details | child-hidden-empty | yes | 1/3 | A001…A011 (11) |
| test-results/visual-evidence/candidate/1024x768/child-details | child-discover-disabled-request | yes | 1/3 | A001…A008 (8) |
| test-results/visual-evidence/candidate/1024x768/child-details | child-discover-disabled-success | yes | 1/3 | A001…A009 (9) |
| test-results/visual-evidence/candidate/1024x768/child-details | child-library-timer-expired | yes | 1/1 | A001…A008 (8) |
| test-results/visual-evidence/candidate/1024x768/child-details | child-library-timer-paused | yes | 1/1 | A001…A008 (8) |
| test-results/visual-evidence/candidate/1024x768/child-details | child-profile-switch-return | yes | 1/3 | A001…A010 (10) |
| test-results/visual-evidence/candidate/1024x768/child-entry | child-pin-dialog | yes | 3/3 | A001…A011 (11) |
| test-results/visual-evidence/candidate/1024x768/child-entry | child-pin-error | yes | 3/3 | A001…A011 (11) |
| test-results/visual-evidence/candidate/1024x768/child-entry | parent-pin-error | yes | 3/3 | A001…A010 (10) |
| test-results/visual-evidence/candidate/1024x768 | parent-sign-in | no | 0/3 | A001…A002 (2) |
| test-results/visual-evidence/candidate/1024x768 | parent-password-recovery | no | 0/1 | A001…A002 (2) |
| test-results/visual-evidence/candidate/1024x768 | parent-dashboard | no | 0/4 | A001…A029 (29) |
| test-results/visual-evidence/candidate/1024x768 | parent-library | no | 0/5 | A001…A020 (20) |
| test-results/visual-evidence/candidate/1024x768 | parent-preview-dialog | no | 0/5 | A001…A021 (21) |
| test-results/visual-evidence/candidate/1024x768 | parent-add-video | no | 0/3 | A001…A009 (9) |
| test-results/visual-evidence/candidate/1024x768 | parent-collections | no | 0/3 | A001…A008 (8) |
| test-results/visual-evidence/candidate/1024x768 | parent-inbox | no | 0/3 | A001…A008 (8) |
| test-results/visual-evidence/candidate/1024x768 | parent-children | no | 0/4 | A001…A052 (52) |
| test-results/visual-evidence/candidate/1024x768 | parent-controls | no | 0/6 | A001…A020 (20) |
| test-results/visual-evidence/candidate/1024x768 | parent-settings | no | 0/4 | A001…A009 (9) |
| test-results/visual-evidence/candidate/1024x768 | family-profile-picker | no | 0/3 | A001…A010 (10) |
| test-results/visual-evidence/candidate/1024x768 | parent-pin-dialog | no | 0/3 | A001…A010 (10) |
| test-results/visual-evidence/candidate/1024x768 | child-home | no | 0/9 | A001…A084 (84) |
| test-results/visual-evidence/candidate/1024x768 | child-library | no | 0/6 | A001…A059 (59) |
| test-results/visual-evidence/candidate/1024x768 | child-favorites | no | 0/3 | A001…A026 (26) |
| test-results/visual-evidence/candidate/1024x768 | child-collection | no | 0/3 | A001…A018 (18) |
| test-results/visual-evidence/candidate/1024x768 | child-search-empty | no | 0/3 | A001…A011 (11) |
| test-results/visual-evidence/candidate/1024x768 | child-request-form | no | 0/3 | A001…A008 (8) |
| test-results/visual-evidence/candidate/1024x768 | child-request-sent-pending | no | 0/3 | A001…A009 (9) |
| test-results/visual-evidence/candidate/1024x768 | child-discover-results | no | 0/3 | A001…A009 (9) |
| test-results/visual-evidence/candidate/1024x768 | child-empty-library | no | 0/3 | A001…A011 (11) |
| test-results/visual-evidence/candidate/1024x768 | child-library-error | no | 0/1 | none (0) |
| test-results/visual-evidence/candidate/1024x768 | child-times-up | yes | 1/1 | A001…A001 (1) |
| test-results/visual-evidence/candidate/1024x768/player-states | player-opening | yes | 1/1 | A001…A001 (1) |
| test-results/visual-evidence/candidate/1024x768/player-states | player-startup-error | yes | 1/1 | A001…A001 (1) |
| test-results/visual-evidence/candidate/1024x768/player-states | player-monitored-startup-error | yes | 1/1 | A001…A001 (1) |
| test-results/visual-evidence/candidate/1024x768/player-states | player-authorization | yes | 1/1 | A001…A001 (1) |
| test-results/visual-evidence/candidate/1024x768/player-states | player-paused | yes | 1/1 | A001…A001 (1) |
| test-results/visual-evidence/candidate/1024x768/player-states | player-expired | yes | 1/1 | A001…A001 (1) |
| test-results/visual-evidence/candidate/1024x768/player-states | player-synthetic-ready-next | yes | 1/1 | A001…A002 (2) |
| test-results/visual-evidence/candidate/1024x768/player-states | player-synthetic-ended-next | yes | 1/1 | A001…A001 (1) |
| test-results/visual-evidence/candidate/1440x1000 | parent-sign-in | no | 0/1 | A001…A002 (2) |
| test-results/visual-evidence/candidate/1440x1000 | parent-password-recovery | no | 0/1 | A001…A002 (2) |
| test-results/visual-evidence/candidate/1440x1000 | parent-dashboard | no | 0/3 | A001…A029 (29) |
| test-results/visual-evidence/candidate/1440x1000 | parent-library | no | 0/4 | A001…A020 (20) |
| test-results/visual-evidence/candidate/1440x1000 | parent-preview-dialog | no | 0/4 | A001…A021 (21) |
| test-results/visual-evidence/candidate/1440x1000 | parent-add-video | no | 0/3 | A001…A009 (9) |
| test-results/visual-evidence/candidate/1440x1000 | parent-collections | no | 0/3 | A001…A008 (8) |
| test-results/visual-evidence/candidate/1440x1000 | parent-inbox | no | 0/1 | A001…A008 (8) |
| test-results/visual-evidence/candidate/1440x1000 | parent-children | no | 0/3 | A001…A052 (52) |
| test-results/visual-evidence/candidate/1440x1000 | parent-controls | no | 0/5 | A001…A020 (20) |
| test-results/visual-evidence/candidate/1440x1000 | parent-settings | no | 0/3 | A001…A009 (9) |
| test-results/visual-evidence/candidate/1440x1000 | family-profile-picker | no | 0/1 | A001…A010 (10) |
| test-results/visual-evidence/candidate/1440x1000 | parent-pin-dialog | no | 0/1 | A001…A010 (10) |
| test-results/visual-evidence/candidate/1440x1000 | child-home | no | 0/5 | A001…A084 (84) |
| test-results/visual-evidence/candidate/1440x1000 | child-library | no | 0/3 | A001…A059 (59) |
| test-results/visual-evidence/candidate/1440x1000 | child-favorites | no | 0/1 | A001…A026 (26) |
| test-results/visual-evidence/candidate/1440x1000 | child-collection | no | 0/1 | A001…A018 (18) |
| test-results/visual-evidence/candidate/1440x1000 | child-search-empty | no | 0/1 | A001…A011 (11) |
| test-results/visual-evidence/candidate/1440x1000 | child-request-form | no | 0/3 | A001…A008 (8) |
| test-results/visual-evidence/candidate/1440x1000 | child-request-sent-pending | no | 0/3 | A001…A009 (9) |
| test-results/visual-evidence/candidate/1440x1000 | child-discover-results | no | 0/3 | A001…A009 (9) |
| test-results/visual-evidence/candidate/1440x1000 | child-empty-library | no | 0/1 | A001…A011 (11) |
| test-results/visual-evidence/candidate/1440x1000 | child-library-error | no | 0/1 | none (0) |
| test-results/visual-evidence/candidate/1440x1000 | child-times-up | yes | 1/1 | A001…A001 (1) |
| test-results/visual-evidence/candidate/1440x1000/parent-details | parent-url-intake | yes | 1/3 | A001…A009 (9) |
| test-results/visual-evidence/candidate/1440x1000/parent-details | parent-url-resolved | yes | 1/4 | A001…A010 (10) |
| test-results/visual-evidence/candidate/1440x1000/parent-details | parent-approval-assignment | yes | 1/4 | A001…A010 (10) |
| test-results/visual-evidence/candidate/1440x1000/parent-details | parent-approval-success | yes | 1/4 | A001…A010 (10) |
| test-results/visual-evidence/candidate/1440x1000/parent-details | parent-youtube-search-results | yes | 1/4 | A001…A010 (10) |
| test-results/visual-evidence/candidate/1440x1000/parent-details | parent-add-preview-dialog | yes | 1/4 | A001…A011 (11) |
| test-results/visual-evidence/candidate/1440x1000/parent-details | parent-channels-results | yes | 1/3 | A001…A010 (10) |
| test-results/visual-evidence/candidate/1440x1000/parent-details | parent-channels-videos | yes | 1/4 | A001…A010 (10) |
| test-results/visual-evidence/candidate/1440x1000/parent-details | parent-playlists-results | yes | 1/3 | A001…A010 (10) |
| test-results/visual-evidence/candidate/1440x1000/parent-details | parent-playlists-videos | yes | 1/4 | A001…A010 (10) |
| test-results/visual-evidence/candidate/1440x1000/parent-details | parent-search-empty | yes | 1/3 | A001…A009 (9) |
| test-results/visual-evidence/candidate/1440x1000/parent-details | parent-search-error | yes | 1/3 | A001…A009 (9) |
| test-results/visual-evidence/candidate/1440x1000/parent-details | parent-search-loading | yes | 1/3 | A001…A009 (9) |
| test-results/visual-evidence/candidate/1440x1000/parent-details | parent-collection-edit | yes | 1/3 | A001…A008 (8) |
| test-results/visual-evidence/candidate/1440x1000/parent-details | parent-collection-share | yes | 1/3 | A001…A008 (8) |
| test-results/visual-evidence/candidate/1440x1000/parent-details | parent-collection-share-success | yes | 1/3 | A001…A008 (8) |
| test-results/visual-evidence/candidate/1440x1000/parent-details | parent-profile-photo-avatar-settings | yes | 3/3 | A001…A052 (52) |
| test-results/visual-evidence/candidate/1440x1000/parent-details | parent-discovery-permissions-enabled | yes | 5/5 | A001…A020 (20) |
| test-results/visual-evidence/candidate/1440x1000/player-states | player-opening | yes | 1/1 | A001…A001 (1) |
| test-results/visual-evidence/candidate/1440x1000/player-states | player-startup-error | yes | 1/1 | A001…A001 (1) |
| test-results/visual-evidence/candidate/1440x1000/player-states | player-monitored-startup-error | yes | 1/1 | A001…A001 (1) |
| test-results/visual-evidence/candidate/1440x1000/player-states | player-authorization | yes | 1/1 | A001…A001 (1) |
| test-results/visual-evidence/candidate/1440x1000/player-states | player-paused | yes | 1/1 | A001…A001 (1) |
| test-results/visual-evidence/candidate/1440x1000/player-states | player-expired | yes | 1/1 | A001…A001 (1) |
| test-results/visual-evidence/candidate/1440x1000/player-states | player-synthetic-ready-next | yes | 1/1 | A001…A002 (2) |
| test-results/visual-evidence/candidate/1440x1000/player-states | player-synthetic-ended-next | yes | 1/1 | A001…A001 (1) |
| test-results/visual-evidence/candidate/390x844 | parent-sign-in | no | 0/1 | A001…A001 (1) |
| test-results/visual-evidence/candidate/390x844 | parent-password-recovery | no | 0/1 | A001…A001 (1) |
| test-results/visual-evidence/candidate/390x844 | parent-dashboard | no | 0/4 | A001…A026 (26) |
| test-results/visual-evidence/candidate/390x844 | parent-library | no | 0/6 | A001…A020 (20) |
| test-results/visual-evidence/candidate/390x844 | parent-preview-dialog | no | 0/6 | A001…A021 (21) |
| test-results/visual-evidence/candidate/390x844 | parent-add-video | no | 0/3 | A001…A009 (9) |
| test-results/visual-evidence/candidate/390x844 | parent-collections | no | 0/3 | A001…A008 (8) |
| test-results/visual-evidence/candidate/390x844 | parent-inbox | no | 0/3 | A001…A008 (8) |
| test-results/visual-evidence/candidate/390x844 | parent-children | no | 0/5 | A001…A052 (52) |
| test-results/visual-evidence/candidate/390x844 | parent-controls | no | 0/9 | A001…A020 (20) |
| test-results/visual-evidence/candidate/390x844 | parent-settings | no | 0/5 | A001…A009 (9) |
| test-results/visual-evidence/candidate/390x844 | family-profile-picker | no | 0/3 | A001…A010 (10) |
| test-results/visual-evidence/candidate/390x844 | parent-pin-dialog | no | 0/3 | A001…A010 (10) |
| test-results/visual-evidence/candidate/390x844 | child-home | no | 0/6 | A001…A067 (67) |
| test-results/visual-evidence/candidate/390x844 | child-library | no | 0/4 | A001…A047 (47) |
| test-results/visual-evidence/candidate/390x844 | child-favorites | no | 0/3 | A001…A022 (22) |
| test-results/visual-evidence/candidate/390x844 | child-collection | no | 0/1 | A001…A016 (16) |
| test-results/visual-evidence/candidate/390x844 | child-search-empty | no | 0/3 | A001…A011 (11) |
| test-results/visual-evidence/candidate/390x844 | child-request-form | no | 0/3 | A001…A008 (8) |
| test-results/visual-evidence/candidate/390x844 | child-request-sent-pending | no | 0/3 | A001…A009 (9) |
| test-results/visual-evidence/candidate/390x844 | child-discover-results | no | 0/3 | A001…A009 (9) |
| test-results/visual-evidence/candidate/390x844 | child-empty-library | no | 0/1 | A001…A011 (11) |
| test-results/visual-evidence/candidate/390x844 | child-library-error | no | 0/1 | none (0) |
| test-results/visual-evidence/candidate/390x844 | child-times-up | yes | 1/1 | A001…A001 (1) |
| test-results/visual-evidence/candidate/390x844/parent-details | parent-url-intake | yes | 1/3 | A001…A009 (9) |
| test-results/visual-evidence/candidate/390x844/parent-details | parent-url-resolved | yes | 1/4 | A001…A010 (10) |
| test-results/visual-evidence/candidate/390x844/parent-details | parent-approval-assignment | yes | 1/4 | A001…A010 (10) |
| test-results/visual-evidence/candidate/390x844/parent-details | parent-approval-success | yes | 1/4 | A001…A010 (10) |
| test-results/visual-evidence/candidate/390x844/parent-details | parent-youtube-search-results | yes | 1/4 | A001…A010 (10) |
| test-results/visual-evidence/candidate/390x844/parent-details | parent-add-preview-dialog | yes | 1/4 | A001…A011 (11) |
| test-results/visual-evidence/candidate/390x844/parent-details | parent-channels-results | yes | 1/3 | A001…A010 (10) |
| test-results/visual-evidence/candidate/390x844/parent-details | parent-channels-videos | yes | 1/4 | A001…A010 (10) |
| test-results/visual-evidence/candidate/390x844/parent-details | parent-playlists-results | yes | 1/3 | A001…A010 (10) |
| test-results/visual-evidence/candidate/390x844/parent-details | parent-playlists-videos | yes | 1/4 | A001…A010 (10) |
| test-results/visual-evidence/candidate/390x844/parent-details | parent-search-empty | yes | 1/3 | A001…A009 (9) |
| test-results/visual-evidence/candidate/390x844/parent-details | parent-search-error | yes | 1/3 | A001…A009 (9) |
| test-results/visual-evidence/candidate/390x844/parent-details | parent-search-loading | yes | 1/3 | A001…A009 (9) |
| test-results/visual-evidence/candidate/390x844/parent-details | parent-collection-edit | yes | 1/3 | A001…A008 (8) |
| test-results/visual-evidence/candidate/390x844/parent-details | parent-collection-share | yes | 1/4 | A001…A008 (8) |
| test-results/visual-evidence/candidate/390x844/parent-details | parent-collection-share-success | yes | 1/4 | A001…A008 (8) |
| test-results/visual-evidence/candidate/390x844/parent-details | parent-profile-photo-avatar-settings | yes | 6/6 | A001…A052 (52) |
| test-results/visual-evidence/candidate/390x844/parent-details | parent-discovery-permissions-enabled | yes | 9/9 | A001…A020 (20) |
| test-results/visual-evidence/candidate/390x844/player-states | player-opening | yes | 1/1 | A001…A001 (1) |
| test-results/visual-evidence/candidate/390x844/player-states | player-startup-error | yes | 1/1 | A001…A001 (1) |
| test-results/visual-evidence/candidate/390x844/player-states | player-monitored-startup-error | yes | 1/1 | A001…A001 (1) |
| test-results/visual-evidence/candidate/390x844/player-states | player-authorization | yes | 1/1 | A001…A001 (1) |
| test-results/visual-evidence/candidate/390x844/player-states | player-paused | yes | 1/1 | A001…A001 (1) |
| test-results/visual-evidence/candidate/390x844/player-states | player-expired | yes | 1/1 | A001…A001 (1) |
| test-results/visual-evidence/candidate/390x844/player-states | player-synthetic-ready-next | yes | 1/1 | A001…A002 (2) |
| test-results/visual-evidence/candidate/390x844/player-states | player-synthetic-ended-next | yes | 1/1 | A001…A001 (1) |
| test-results/visual-evidence/candidate/768x1024/child-details | child-library-loading | yes | 1/1 | none (0) |
| test-results/visual-evidence/candidate/768x1024/child-details | child-simple-home | yes | 6/6 | A001…A084 (84) |
| test-results/visual-evidence/candidate/768x1024/child-details | child-simple-library | yes | 4/4 | A001…A059 (59) |
| test-results/visual-evidence/candidate/768x1024/child-details | child-search-results | yes | 1/3 | A001…A026 (26) |
| test-results/visual-evidence/candidate/768x1024/child-details | child-hidden-empty | yes | 1/1 | A001…A011 (11) |
| test-results/visual-evidence/candidate/768x1024/child-details | child-discover-disabled-request | yes | 1/3 | A001…A008 (8) |
| test-results/visual-evidence/candidate/768x1024/child-details | child-discover-disabled-success | yes | 1/3 | A001…A009 (9) |
| test-results/visual-evidence/candidate/768x1024/child-details | child-library-timer-expired | yes | 1/1 | A001…A008 (8) |
| test-results/visual-evidence/candidate/768x1024/child-details | child-library-timer-paused | yes | 1/1 | A001…A008 (8) |
| test-results/visual-evidence/candidate/768x1024/child-details | child-profile-switch-return | yes | 1/3 | A001…A010 (10) |
| test-results/visual-evidence/candidate/768x1024/child-entry | child-pin-dialog | yes | 3/3 | A001…A011 (11) |
| test-results/visual-evidence/candidate/768x1024/child-entry | child-pin-error | yes | 3/3 | A001…A011 (11) |
| test-results/visual-evidence/candidate/768x1024/child-entry | parent-pin-error | yes | 3/3 | A001…A010 (10) |
| test-results/visual-evidence/candidate/768x1024 | parent-sign-in | no | 0/1 | A001…A002 (2) |
| test-results/visual-evidence/candidate/768x1024 | parent-password-recovery | no | 0/1 | A001…A002 (2) |
| test-results/visual-evidence/candidate/768x1024 | parent-dashboard | no | 0/3 | A001…A029 (29) |
| test-results/visual-evidence/candidate/768x1024 | parent-library | no | 0/5 | A001…A020 (20) |
| test-results/visual-evidence/candidate/768x1024 | parent-preview-dialog | no | 0/5 | A001…A021 (21) |
| test-results/visual-evidence/candidate/768x1024 | parent-add-video | no | 0/3 | A001…A009 (9) |
| test-results/visual-evidence/candidate/768x1024 | parent-collections | no | 0/3 | A001…A008 (8) |
| test-results/visual-evidence/candidate/768x1024 | parent-inbox | no | 0/1 | A001…A008 (8) |
| test-results/visual-evidence/candidate/768x1024 | parent-children | no | 0/3 | A001…A052 (52) |
| test-results/visual-evidence/candidate/768x1024 | parent-controls | no | 0/5 | A001…A020 (20) |
| test-results/visual-evidence/candidate/768x1024 | parent-settings | no | 0/4 | A001…A009 (9) |
| test-results/visual-evidence/candidate/768x1024 | family-profile-picker | no | 0/3 | A001…A010 (10) |
| test-results/visual-evidence/candidate/768x1024 | parent-pin-dialog | no | 0/3 | A001…A010 (10) |
| test-results/visual-evidence/candidate/768x1024 | child-home | no | 0/6 | A001…A084 (84) |
| test-results/visual-evidence/candidate/768x1024 | child-library | no | 0/4 | A001…A059 (59) |
| test-results/visual-evidence/candidate/768x1024 | child-favorites | no | 0/3 | A001…A026 (26) |
| test-results/visual-evidence/candidate/768x1024 | child-collection | no | 0/1 | A001…A018 (18) |
| test-results/visual-evidence/candidate/768x1024 | child-search-empty | no | 0/1 | A001…A011 (11) |
| test-results/visual-evidence/candidate/768x1024 | child-request-form | no | 0/3 | A001…A008 (8) |
| test-results/visual-evidence/candidate/768x1024 | child-request-sent-pending | no | 0/3 | A001…A009 (9) |
| test-results/visual-evidence/candidate/768x1024 | child-discover-results | no | 0/3 | A001…A009 (9) |
| test-results/visual-evidence/candidate/768x1024 | child-empty-library | no | 0/1 | A001…A011 (11) |
| test-results/visual-evidence/candidate/768x1024 | child-library-error | no | 0/1 | none (0) |
| test-results/visual-evidence/candidate/768x1024 | child-times-up | yes | 1/1 | A001…A001 (1) |
| test-results/visual-evidence/candidate/768x1024/player-states | player-opening | yes | 1/1 | A001…A001 (1) |
| test-results/visual-evidence/candidate/768x1024/player-states | player-startup-error | yes | 1/1 | A001…A001 (1) |
| test-results/visual-evidence/candidate/768x1024/player-states | player-monitored-startup-error | yes | 1/1 | A001…A001 (1) |
| test-results/visual-evidence/candidate/768x1024/player-states | player-authorization | yes | 1/1 | A001…A001 (1) |
| test-results/visual-evidence/candidate/768x1024/player-states | player-paused | yes | 1/1 | A001…A001 (1) |
| test-results/visual-evidence/candidate/768x1024/player-states | player-expired | yes | 1/1 | A001…A001 (1) |
| test-results/visual-evidence/candidate/768x1024/player-states | player-synthetic-ready-next | yes | 1/1 | A001…A002 (2) |
| test-results/visual-evidence/candidate/768x1024/player-states | player-synthetic-ended-next | yes | 1/1 | A001…A001 (1) |

Only the explicit raster consumption list above is claimed visually reviewed. Zero crop pixels were inspected; no artwork-edge CLEAN claim.
