# Premium Visual Comparator R1 — independent cold raster review

Result: **DEFECTS FOUND; COVERAGE INCOMPLETE. CLEAN withheld.**

Reviewed on 2026-11-04 against Final Visual Inspection — Blind Protocol V2.0, retrieved directly from https://app.notion.com/p/3ea584c4f74781f5946bef30a54c86c5 (production effective 2026-09-29). No app source, previous reports, defect history, Founder feedback, other reviewer conclusions, or alternate candidates consumed.

## Candidate and scope

Supplied candidate head: `e60d5ffa187524abe2d658ad137b729c7a491b99`.
All four manifests instead identify executed source/CI commit `21c13e6da49196447210318acc0c11a9a4fb8575`, declare PR head `e60d5ffa187524abe2d658ad137b729c7a491b99`, and source tree `d812b9c1de57db660f09dfd353a89b246f8ad5f5`. This review binds to those exact raster files and their declared CI source; it does not independently establish head-only equivalence. Browser: Chromium. Evidence kind: synthetic-rendered-browser-evidence. Synthetic API responses and SVG artwork; `physicalDevice: false`. No deployed-browser, real iPad Safari/PWA, genuine provider playback, physical device, or production-data clearance is claimed.

All 19 supplied full-document states at each of 390×844, 768×1024, 1024×768, and 1440×1000 were visually inspected: **76 full-document overviews**, plus **12 supplied viewport tiles**. Long full documents are useful for composition but some were reduced in the image viewer; they do not constitute complete readable-scale inspection of every word/asset.

## Confirmed visual defect — finite list

| ID | Severity | Exact state / viewports | Observable defect | Required correction / retest |
|---|---|---|---|---|
| PVC-01 | Low, visual grouping | `parent-collections-full.png`, all four viewports | In Create a collection → Approved videos, each of the three pale rounded selection rows contains a checkbox near the top-left, while its video title sits beneath/outside the shaded row. This repeats for Build a paper rocket, A gentle piano lesson, and Draw a friendly fox even at 1440 px. The row background ends through/above the label rather than grouping the checkbox and its title into one contained selection row. | Make each shaded selectable row contain its checkbox and complete title with consistent padding and alignment. Reinspect the three rows at all four widths, including a long wrapped title. Verify the visible whole-row affordance matches the effective hit area. |

This is a bounded cosmetic/layout finding, not a claim that selection fails. No additional confirmed visual defect is asserted.

## Human gate observations

- Hierarchy and gestalt: coherent warm cream, deep green, soft sage and gold palette; distinctive family-library atmosphere. Primary parent actions and child resume-watching action stand out clearly. Profiles and child navigation are recognizable.
- Alignment, spacing and rhythm: major page margins, cards, primary forms and navigation are orderly in inspected overviews; PVC-01 is the localized grouping exception. Longer settings and controls pages remain systematically grouped, although reading every paragraph requires proper tiles.
- Crop/story and edges: the inspected synthetic rocket/piano/fox subjects have visibly complete central silhouettes in their thumbnail cards; rounded card cropping is consistent. This is sample-level rendered observation, not a per-asset edge clearance. Real video-thumbnail crops are not represented by this synthetic artwork.
- Icons and optical centering: nest mark, profile avatars, search/play/heart/navigation glyphs are recognizable at consumed readable scales. No confirmed malformed icon or unintended clipped subject was found in these views.
- Readability/contrast: major headings and primary controls read clearly in the readable samples. Muted metadata and lengthy instructions were not given exhaustive native-scale/contrast measurement clearance.
- Touch controls: manifests list no small targets for child home/library; visible child buttons and navigation are generous. Parent manifests list small elements including 20×20 inputs and a 119×22 Manage family link (tablet). Element dimensions alone do not establish the full effective label hit area, so these are possible concerns requiring interactive verification, not confirmed touch failures from this raster review.

## Evidence blockers and possible concerns

1. Missing deterministic bounded-asset A01…An inventory and per-asset LEFT/RIGHT/TOP/BOTTOM records. Capture-level region labels are not substitutes for asset-level containment evidence. Artwork edge clearance is therefore unresolved for the complete candidate.
2. Readable tile positioning is not trustworthy. Example: `390x844/parent-collections-bottom.png` visibly begins at the page header and ends near Create a collection, whereas the full document continues through the entire creation form and Save collection. `768x1024/parent-collections-bottom.png` likewise begins at the header and ends before the final save action. `child-library-top.png` at all four widths begins already within the scrolled library rather than the full-document header. Full-document child-library navigation appears over different document regions; this could reflect capture/scroll timing. Do not classify it as an app navigation defect without controlled browser reproduction. The evidence package needs real scroll-position verification and complete source-derived readable tiles.
3. Only 12 of the 180 non-full viewport rasters were visually consumed in this pass. The remaining 168 cannot receive implicit clearance. Complete full-document overview coverage does not satisfy V2 readable evidence consumption.
4. Actual source equivalence between the CI commit and supplied PR head is declared by metadata only. Controller must retain exact tested-tree binding and invalidate affected evidence after material changes.

## V2 Coverage Receipt

| Required field | Receipt |
|---|---|
| SOURCE_IDENTITY | Exact raster package `ci129-candidate`; CI commit/tree and declared PR head above. All 256 manifest-listed PNG file SHA-256 values recomputed and matched their manifests. Hash checking is not visual consumption. |
| REGION_COVERAGE n/n | 76/76 supplied state/viewport documents visually consumed at overview scale. Complete readable region coverage **not established**, due unconsumed tiles and incorrect apparent tile positions. |
| BOUNDED_ASSETS n/n | Unavailable: authoritative bounded-asset denominator/inventory missing. No numeric per-asset completeness claim. |
| ASSET_EVIDENCE_CONSUMED A01…An | No A-series inventory supplied; no A-series clearance asserted. Exact consumed raster inventory below. |
| READABLE_VIEWS required/consumed | 180 non-full PNGs supplied / 12 consumed; expected-position validity fails in cited samples. 76 full-document overviews additionally consumed. |
| STRUCTURAL_RECORDS required/consumed | Four manifests parsed; capture-level control/overflow/inventory metadata sampled. Required asset-specific structural denominator unavailable; asset edge records not supplied/consumed. |
| EDGE_GATES resolved/required | Complete-candidate denominator unavailable; 0 complete per-asset four-edge gates certified. |
| APPLICATION_BINDING | Four manifest viewports; synthetic Chromium; CI source/tree and declared PR head above; no physical device/provider binding. |
| UNRESOLVED_CONFLICTS | Tile region labels conflict with apparent raster scroll position. Full-document navigation placement cannot distinguish capture timing from app behavior. |
| HUMAN_GATES | Hierarchy, alignment, optical centering, spacing/rhythm, grouping, crop/story, contrast, gestalt assessed to the limited coverage stated; PVC-01 confirmed. Exhaustive readable/asset clearance withheld. |
| CONFIRMED_DEFECTS | 1: PVC-01. |
| POSSIBLE_CONCERNS | Effective parent checkbox/link touch areas; capture/nav placement ambiguity; synthetic art cannot certify real-thumbnail crop quality. |
| FINAL_RESULT | **DEFECTS FOUND / COVERAGE INCOMPLETE — NOT CLEAN.** |

## Exact consumed files

All following paths are relative to `/workspace/scratch/b4fb31747e8d/watchnest-review/ci129-candidate/test-results/visual-evidence/candidate/`. Only the four manifests and these 88 rasters were consumed as review content. Accessibility YAMLs, ZIP contents, prior reports, and app code were not read. Other PNG bytes were read solely to verify manifest hashes.

### 390x844

- `390x844/manifest.json`
- `390x844/parent-sign-in-full.png`
- `390x844/parent-password-recovery-full.png`
- `390x844/parent-dashboard-full.png`
- `390x844/parent-library-full.png`
- `390x844/parent-preview-dialog-full.png`
- `390x844/parent-add-video-full.png`
- `390x844/parent-collections-full.png`
- `390x844/parent-inbox-full.png`
- `390x844/parent-children-full.png`
- `390x844/parent-controls-full.png`
- `390x844/parent-settings-full.png`
- `390x844/family-profile-picker-full.png`
- `390x844/parent-pin-dialog-full.png`
- `390x844/child-home-full.png`
- `390x844/child-library-full.png`
- `390x844/child-favorites-full.png`
- `390x844/child-collection-full.png`
- `390x844/child-search-empty-full.png`
- `390x844/child-request-form-full.png`
- `390x844/child-home-top.png`
- `390x844/child-library-top.png`
- `390x844/parent-collections-bottom.png`

### 768x1024

- `768x1024/manifest.json`
- `768x1024/parent-sign-in-full.png`
- `768x1024/parent-password-recovery-full.png`
- `768x1024/parent-dashboard-full.png`
- `768x1024/parent-library-full.png`
- `768x1024/parent-preview-dialog-full.png`
- `768x1024/parent-add-video-full.png`
- `768x1024/parent-collections-full.png`
- `768x1024/parent-inbox-full.png`
- `768x1024/parent-children-full.png`
- `768x1024/parent-controls-full.png`
- `768x1024/parent-settings-full.png`
- `768x1024/family-profile-picker-full.png`
- `768x1024/parent-pin-dialog-full.png`
- `768x1024/child-home-full.png`
- `768x1024/child-library-full.png`
- `768x1024/child-favorites-full.png`
- `768x1024/child-collection-full.png`
- `768x1024/child-search-empty-full.png`
- `768x1024/child-request-form-full.png`
- `768x1024/child-home-top.png`
- `768x1024/child-library-top.png`
- `768x1024/parent-collections-bottom.png`

### 1024x768

- `1024x768/manifest.json`
- `1024x768/parent-sign-in-full.png`
- `1024x768/parent-password-recovery-full.png`
- `1024x768/parent-dashboard-full.png`
- `1024x768/parent-library-full.png`
- `1024x768/parent-preview-dialog-full.png`
- `1024x768/parent-add-video-full.png`
- `1024x768/parent-collections-full.png`
- `1024x768/parent-inbox-full.png`
- `1024x768/parent-children-full.png`
- `1024x768/parent-controls-full.png`
- `1024x768/parent-settings-full.png`
- `1024x768/family-profile-picker-full.png`
- `1024x768/parent-pin-dialog-full.png`
- `1024x768/child-home-full.png`
- `1024x768/child-library-full.png`
- `1024x768/child-favorites-full.png`
- `1024x768/child-collection-full.png`
- `1024x768/child-search-empty-full.png`
- `1024x768/child-request-form-full.png`
- `1024x768/child-home-top.png`
- `1024x768/child-library-top.png`
- `1024x768/parent-collections-bottom.png`

### 1440x1000

- `1440x1000/manifest.json`
- `1440x1000/parent-sign-in-full.png`
- `1440x1000/parent-password-recovery-full.png`
- `1440x1000/parent-dashboard-full.png`
- `1440x1000/parent-library-full.png`
- `1440x1000/parent-preview-dialog-full.png`
- `1440x1000/parent-add-video-full.png`
- `1440x1000/parent-collections-full.png`
- `1440x1000/parent-inbox-full.png`
- `1440x1000/parent-children-full.png`
- `1440x1000/parent-controls-full.png`
- `1440x1000/parent-settings-full.png`
- `1440x1000/family-profile-picker-full.png`
- `1440x1000/parent-pin-dialog-full.png`
- `1440x1000/child-home-full.png`
- `1440x1000/child-library-full.png`
- `1440x1000/child-favorites-full.png`
- `1440x1000/child-collection-full.png`
- `1440x1000/child-search-empty-full.png`
- `1440x1000/child-request-form-full.png`
- `1440x1000/child-home-top.png`
- `1440x1000/child-library-top.png`
- `1440x1000/parent-collections-bottom.png`

