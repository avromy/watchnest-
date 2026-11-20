# Premium Visual Comparator — R2

**FINAL_RESULT: FAIL — one confirmed visual defect; HumanEye V2 coverage incomplete.** Historical CI132 candidate only. No acceptance of a later repair is implied.

Independent pixel review used the current HumanEye V2 authority, https://app.notion.com/p/3ea584c4f74781f5946bef30a54c86c5 (retrieved during this review assignment), candidate rasters, and neutral manifests. No app source or other reviewers’ reports were read. Own R1 defect was revisited against current pixels. No app edits were made.

## Source identity

- Package: `/workspace/scratch/b4fb31747e8d/watchnest-review/ci132-candidate`.
- PR head: `f10e5ff0062a39faea409ea7a9e70c8207d06da9`.
- Executed CI/source commit: `5eaceacaef08f11cc99fab3f470292ca92297f05`.
- Source tree: `beb0742526d1f3797bfe974e46e909f1bc37bad9`.
- Chromium at `http://127.0.0.1:3001`; preview deployment/URL null; physicalDevice false.
- Synthetic API responses and SVG artwork. No genuine YouTube playback, iPad Safari/PWA, or physical-device evidence. Source worktree recorded clean. All 289 main PNG hashes match their manifests; all 1,616 crop hashes match the crop index. Hash checking is not visual consumption.

## Finite defects

| ID | Severity | Exact evidence | Objective observation | Required correction |
|---|---|---|---|---|
| PVC-02 | Major | `test-results/visual-evidence/candidate/{390x844,768x1024,1024x768,1440x1000}/child-times-up-full.png` | The white rounded session card has near-white heading “Time’s up for now” and explanatory copy on its white background. Both are effectively invisible; the dark eyebrow and Choose profile button remain visible, leaving a large apparently empty card and hiding why viewing stopped. Confirmed visually at all four sizes. No numerical contrast ratio is claimed. | Give the heading and body visibly contrasting foregrounds, then recapture and independently review the corrected candidate at all four sizes. |

PVC-01 from own R1 is **visually repaired in the supplied collection form at all four widths**: checkbox and title now share the shaded row; long titles wrap inside it. The rest of the internal approved-video scroller is not captured, so this does not certify unseen rows or interactions.

No additional objective defect was found in the consumed main rasters. This is a finite finding, not a blanket asset-edge or release pass.

## Human visual assessment

The cream, dark green, and muted gold palette, restrained borders, generous card corners, and consistent icon treatment support the intended warm family library. Child navigation and large artwork cards form a clear hierarchy at both tablet orientations; parent forms retain readable labels and contained wrapping on the phone. Parent desktop spacing is orderly. Apart from PVC-02, consumed views show no substantiated overlap, accidental artwork cut, unreadable title, or detached control label. Touch controls appear substantial in the visible layouts; raster inspection does not prove physical touch behavior.

R1 top/bottom capture weakness is improved: the current viewport tiles show the expected actual top, intermediate, and bottom document content and record actual scroll positions. Full-page modal screenshots include background below the viewport overlay; viewport tiles control assessment of the visible modal. That screenshot artifact is not reported as an app defect. At 1024×768 the preview dialog’s lower internal content is not fully evidenced by distinct internal scrolling; it remains a coverage limit.

## Controller coverage receipt

| Gate | Receipt |
|---|---|
| SOURCE_IDENTITY | Exact commits/tree and four manifests above; synthetic local Chromium only. |
| REGION_COVERAGE | 96/96 supplied state×viewport full documents visually consumed, plus all 193/193 supplied readable viewport tiles. These are the supplied 24 states at each of four sizes, not proof of all mandatory app states. |
| BOUNDED_ASSETS | 1,616/1,616 supplied asset identities enumerated and bound by neutral records; **0/1,616 individually certified** against complete readable asset/edge evidence. |
| ASSET_EVIDENCE_CONSUMED | Full-page and tile context consumed for every listed state. No individual A-identity receives an all-edge PASS. All 1,616 source-derived crops remain visually unconsumed. Exact supplied identity inventory is below. |
| READABLE_VIEWS | 289/289 main rasters consumed (96 full, 193 tiles). Added individual crops: 0/1,616 consumed. Nine supplementary legacy PNGs: 0/9 consumed, outside this manifest-bound viewport receipt. |
| STRUCTURAL_RECORDS | Four manifests and crop index parsed; source/hash/viewport/state/scroll and neutral bound/edge structures examined. 1,616 asset records are available; individual optical/edge reconciliation remains incomplete. |
| EDGE_GATES | 0/6,464 individually resolved (four edges × 1,616). Conservative count: contextual looking is not an identity-specific edge receipt. Supplied verdicts remain pending/unresolved. |
| APPLICATION_BINDING | Four manifest identities bind images to the candidate and listed viewport. SVG artwork/player responses are synthetic. Behind-modal and internally clipped assets cannot be certified from nominal bounds. |
| UNRESOLVED_CONFLICTS | No specific structural-versus-pixel contradiction confirmed. Completeness is unresolved; geometry and zero out-of-bounds crop boxes cannot establish artwork contour correctness. |
| HUMAN_GATES | Hierarchy, grouping, spacing rhythm, visible alignment, crop story, contrast and gestalt assessed in all main views. Contrast FAIL in times-up. Complete asset-edge review pending. |
| CONFIRMED_DEFECTS | One: PVC-02. Own R1 PVC-01 repaired in visible current rows. |
| POSSIBLE_CONCERNS | No additional speculative visual defect promoted. Internal scrolling, unseen states, individual edges, physical devices and genuine provider playback are coverage limits. |
| FINAL_RESULT | FAIL, not CLEAN. A later source repair requires fresh affected pixels; final acceptance requires remaining mandatory evidence and complete consumption. |

This receipt deliberately does not infer missing later mandatory special states from the 24 named captures, or promote synthetic player imagery to deployed-browser/provider/real-device acceptance. Later source edits are outside this historical result. Review stopped before exhaustive crop inspection because the candidate already has a confirmed blocking legibility defect.

## Exact consumed files

Paths below are relative to the package root. Each main PNG listed was actually opened and visually inspected. Manifests were read/parsed. Tall full-page views were complemented by every supplied readable viewport tile.

- `test-results/visual-evidence/candidate/390x844/manifest.json` — SHA-256 `a15dd46771d458b8516ef3367fd438fd3194be2470e35c5372b1fe177ba29014`.
- `test-results/visual-evidence/candidate/768x1024/manifest.json` — SHA-256 `053919b40ba8caaf5cd07326a12174e8cac8a5d5567d68658705d46b5e3d7721`.
- `test-results/visual-evidence/candidate/1024x768/manifest.json` — SHA-256 `36d934983770561e17f77857341f9cc1dcfa0c34dc4932290b17102950cd4dd4`.
- `test-results/visual-evidence/candidate/1440x1000/manifest.json` — SHA-256 `259fab99c6b4a70c843a50dd988ce444bd7c2ff2451badb35057b5481ffd5e70`.
- `asset-crops/index.json` — parsed, hash verified; SHA-256 `02aed11ddaf0b80e2d49839fcd4a2b28496e4fef4c694beb7491dd49e1656aa6`. Crop pixels were not visually consumed.

### 390x844 — 24 states, 81 PNGs

- `test-results/visual-evidence/candidate/390x844/parent-sign-in-full.png`
- `test-results/visual-evidence/candidate/390x844/parent-password-recovery-full.png`
- `test-results/visual-evidence/candidate/390x844/parent-dashboard-full.png`
- `test-results/visual-evidence/candidate/390x844/parent-dashboard-top.png`
- `test-results/visual-evidence/candidate/390x844/parent-dashboard-middle-1.png`
- `test-results/visual-evidence/candidate/390x844/parent-dashboard-bottom.png`
- `test-results/visual-evidence/candidate/390x844/parent-library-full.png`
- `test-results/visual-evidence/candidate/390x844/parent-library-top.png`
- `test-results/visual-evidence/candidate/390x844/parent-library-middle-1.png`
- `test-results/visual-evidence/candidate/390x844/parent-library-middle-2.png`
- `test-results/visual-evidence/candidate/390x844/parent-library-middle-3.png`
- `test-results/visual-evidence/candidate/390x844/parent-library-bottom.png`
- `test-results/visual-evidence/candidate/390x844/parent-preview-dialog-full.png`
- `test-results/visual-evidence/candidate/390x844/parent-preview-dialog-top.png`
- `test-results/visual-evidence/candidate/390x844/parent-preview-dialog-middle-1.png`
- `test-results/visual-evidence/candidate/390x844/parent-preview-dialog-middle-2.png`
- `test-results/visual-evidence/candidate/390x844/parent-preview-dialog-middle-3.png`
- `test-results/visual-evidence/candidate/390x844/parent-preview-dialog-bottom.png`
- `test-results/visual-evidence/candidate/390x844/parent-add-video-full.png`
- `test-results/visual-evidence/candidate/390x844/parent-add-video-top.png`
- `test-results/visual-evidence/candidate/390x844/parent-add-video-bottom.png`
- `test-results/visual-evidence/candidate/390x844/parent-collections-full.png`
- `test-results/visual-evidence/candidate/390x844/parent-collections-top.png`
- `test-results/visual-evidence/candidate/390x844/parent-collections-bottom.png`
- `test-results/visual-evidence/candidate/390x844/parent-inbox-full.png`
- `test-results/visual-evidence/candidate/390x844/parent-inbox-top.png`
- `test-results/visual-evidence/candidate/390x844/parent-inbox-bottom.png`
- `test-results/visual-evidence/candidate/390x844/parent-children-full.png`
- `test-results/visual-evidence/candidate/390x844/parent-children-top.png`
- `test-results/visual-evidence/candidate/390x844/parent-children-middle-1.png`
- `test-results/visual-evidence/candidate/390x844/parent-children-middle-2.png`
- `test-results/visual-evidence/candidate/390x844/parent-children-bottom.png`
- `test-results/visual-evidence/candidate/390x844/parent-controls-full.png`
- `test-results/visual-evidence/candidate/390x844/parent-controls-top.png`
- `test-results/visual-evidence/candidate/390x844/parent-controls-middle-1.png`
- `test-results/visual-evidence/candidate/390x844/parent-controls-middle-2.png`
- `test-results/visual-evidence/candidate/390x844/parent-controls-middle-3.png`
- `test-results/visual-evidence/candidate/390x844/parent-controls-middle-4.png`
- `test-results/visual-evidence/candidate/390x844/parent-controls-middle-5.png`
- `test-results/visual-evidence/candidate/390x844/parent-controls-middle-6.png`
- `test-results/visual-evidence/candidate/390x844/parent-controls-bottom.png`
- `test-results/visual-evidence/candidate/390x844/parent-settings-full.png`
- `test-results/visual-evidence/candidate/390x844/parent-settings-top.png`
- `test-results/visual-evidence/candidate/390x844/parent-settings-middle-1.png`
- `test-results/visual-evidence/candidate/390x844/parent-settings-middle-2.png`
- `test-results/visual-evidence/candidate/390x844/parent-settings-bottom.png`
- `test-results/visual-evidence/candidate/390x844/family-profile-picker-full.png`
- `test-results/visual-evidence/candidate/390x844/family-profile-picker-top.png`
- `test-results/visual-evidence/candidate/390x844/family-profile-picker-bottom.png`
- `test-results/visual-evidence/candidate/390x844/parent-pin-dialog-full.png`
- `test-results/visual-evidence/candidate/390x844/parent-pin-dialog-top.png`
- `test-results/visual-evidence/candidate/390x844/parent-pin-dialog-bottom.png`
- `test-results/visual-evidence/candidate/390x844/child-home-full.png`
- `test-results/visual-evidence/candidate/390x844/child-home-top.png`
- `test-results/visual-evidence/candidate/390x844/child-home-middle-1.png`
- `test-results/visual-evidence/candidate/390x844/child-home-middle-2.png`
- `test-results/visual-evidence/candidate/390x844/child-home-middle-3.png`
- `test-results/visual-evidence/candidate/390x844/child-home-bottom.png`
- `test-results/visual-evidence/candidate/390x844/child-library-full.png`
- `test-results/visual-evidence/candidate/390x844/child-library-top.png`
- `test-results/visual-evidence/candidate/390x844/child-library-middle-1.png`
- `test-results/visual-evidence/candidate/390x844/child-library-bottom.png`
- `test-results/visual-evidence/candidate/390x844/child-favorites-full.png`
- `test-results/visual-evidence/candidate/390x844/child-favorites-top.png`
- `test-results/visual-evidence/candidate/390x844/child-favorites-bottom.png`
- `test-results/visual-evidence/candidate/390x844/child-collection-full.png`
- `test-results/visual-evidence/candidate/390x844/child-search-empty-full.png`
- `test-results/visual-evidence/candidate/390x844/child-search-empty-top.png`
- `test-results/visual-evidence/candidate/390x844/child-search-empty-bottom.png`
- `test-results/visual-evidence/candidate/390x844/child-request-form-full.png`
- `test-results/visual-evidence/candidate/390x844/child-request-form-top.png`
- `test-results/visual-evidence/candidate/390x844/child-request-form-bottom.png`
- `test-results/visual-evidence/candidate/390x844/child-request-sent-pending-full.png`
- `test-results/visual-evidence/candidate/390x844/child-request-sent-pending-top.png`
- `test-results/visual-evidence/candidate/390x844/child-request-sent-pending-bottom.png`
- `test-results/visual-evidence/candidate/390x844/child-discover-results-full.png`
- `test-results/visual-evidence/candidate/390x844/child-discover-results-top.png`
- `test-results/visual-evidence/candidate/390x844/child-discover-results-bottom.png`
- `test-results/visual-evidence/candidate/390x844/child-empty-library-full.png`
- `test-results/visual-evidence/candidate/390x844/child-library-error-full.png`
- `test-results/visual-evidence/candidate/390x844/child-times-up-full.png`

### 768x1024 — 24 states, 67 PNGs

- `test-results/visual-evidence/candidate/768x1024/parent-sign-in-full.png`
- `test-results/visual-evidence/candidate/768x1024/parent-password-recovery-full.png`
- `test-results/visual-evidence/candidate/768x1024/parent-dashboard-full.png`
- `test-results/visual-evidence/candidate/768x1024/parent-dashboard-top.png`
- `test-results/visual-evidence/candidate/768x1024/parent-dashboard-bottom.png`
- `test-results/visual-evidence/candidate/768x1024/parent-library-full.png`
- `test-results/visual-evidence/candidate/768x1024/parent-library-top.png`
- `test-results/visual-evidence/candidate/768x1024/parent-library-middle-1.png`
- `test-results/visual-evidence/candidate/768x1024/parent-library-middle-2.png`
- `test-results/visual-evidence/candidate/768x1024/parent-library-bottom.png`
- `test-results/visual-evidence/candidate/768x1024/parent-preview-dialog-full.png`
- `test-results/visual-evidence/candidate/768x1024/parent-preview-dialog-top.png`
- `test-results/visual-evidence/candidate/768x1024/parent-preview-dialog-middle-1.png`
- `test-results/visual-evidence/candidate/768x1024/parent-preview-dialog-middle-2.png`
- `test-results/visual-evidence/candidate/768x1024/parent-preview-dialog-bottom.png`
- `test-results/visual-evidence/candidate/768x1024/parent-add-video-full.png`
- `test-results/visual-evidence/candidate/768x1024/parent-add-video-top.png`
- `test-results/visual-evidence/candidate/768x1024/parent-add-video-bottom.png`
- `test-results/visual-evidence/candidate/768x1024/parent-collections-full.png`
- `test-results/visual-evidence/candidate/768x1024/parent-collections-top.png`
- `test-results/visual-evidence/candidate/768x1024/parent-collections-bottom.png`
- `test-results/visual-evidence/candidate/768x1024/parent-inbox-full.png`
- `test-results/visual-evidence/candidate/768x1024/parent-children-full.png`
- `test-results/visual-evidence/candidate/768x1024/parent-children-top.png`
- `test-results/visual-evidence/candidate/768x1024/parent-children-bottom.png`
- `test-results/visual-evidence/candidate/768x1024/parent-controls-full.png`
- `test-results/visual-evidence/candidate/768x1024/parent-controls-top.png`
- `test-results/visual-evidence/candidate/768x1024/parent-controls-middle-1.png`
- `test-results/visual-evidence/candidate/768x1024/parent-controls-middle-2.png`
- `test-results/visual-evidence/candidate/768x1024/parent-controls-bottom.png`
- `test-results/visual-evidence/candidate/768x1024/parent-settings-full.png`
- `test-results/visual-evidence/candidate/768x1024/parent-settings-top.png`
- `test-results/visual-evidence/candidate/768x1024/parent-settings-middle-1.png`
- `test-results/visual-evidence/candidate/768x1024/parent-settings-bottom.png`
- `test-results/visual-evidence/candidate/768x1024/family-profile-picker-full.png`
- `test-results/visual-evidence/candidate/768x1024/family-profile-picker-top.png`
- `test-results/visual-evidence/candidate/768x1024/family-profile-picker-bottom.png`
- `test-results/visual-evidence/candidate/768x1024/parent-pin-dialog-full.png`
- `test-results/visual-evidence/candidate/768x1024/parent-pin-dialog-top.png`
- `test-results/visual-evidence/candidate/768x1024/parent-pin-dialog-bottom.png`
- `test-results/visual-evidence/candidate/768x1024/child-home-full.png`
- `test-results/visual-evidence/candidate/768x1024/child-home-top.png`
- `test-results/visual-evidence/candidate/768x1024/child-home-middle-1.png`
- `test-results/visual-evidence/candidate/768x1024/child-home-middle-2.png`
- `test-results/visual-evidence/candidate/768x1024/child-home-middle-3.png`
- `test-results/visual-evidence/candidate/768x1024/child-home-bottom.png`
- `test-results/visual-evidence/candidate/768x1024/child-library-full.png`
- `test-results/visual-evidence/candidate/768x1024/child-library-top.png`
- `test-results/visual-evidence/candidate/768x1024/child-library-middle-1.png`
- `test-results/visual-evidence/candidate/768x1024/child-library-bottom.png`
- `test-results/visual-evidence/candidate/768x1024/child-favorites-full.png`
- `test-results/visual-evidence/candidate/768x1024/child-favorites-top.png`
- `test-results/visual-evidence/candidate/768x1024/child-favorites-bottom.png`
- `test-results/visual-evidence/candidate/768x1024/child-collection-full.png`
- `test-results/visual-evidence/candidate/768x1024/child-search-empty-full.png`
- `test-results/visual-evidence/candidate/768x1024/child-request-form-full.png`
- `test-results/visual-evidence/candidate/768x1024/child-request-form-top.png`
- `test-results/visual-evidence/candidate/768x1024/child-request-form-bottom.png`
- `test-results/visual-evidence/candidate/768x1024/child-request-sent-pending-full.png`
- `test-results/visual-evidence/candidate/768x1024/child-request-sent-pending-top.png`
- `test-results/visual-evidence/candidate/768x1024/child-request-sent-pending-bottom.png`
- `test-results/visual-evidence/candidate/768x1024/child-discover-results-full.png`
- `test-results/visual-evidence/candidate/768x1024/child-discover-results-top.png`
- `test-results/visual-evidence/candidate/768x1024/child-discover-results-bottom.png`
- `test-results/visual-evidence/candidate/768x1024/child-empty-library-full.png`
- `test-results/visual-evidence/candidate/768x1024/child-library-error-full.png`
- `test-results/visual-evidence/candidate/768x1024/child-times-up-full.png`

### 1024x768 — 24 states, 85 PNGs

- `test-results/visual-evidence/candidate/1024x768/parent-sign-in-full.png`
- `test-results/visual-evidence/candidate/1024x768/parent-sign-in-top.png`
- `test-results/visual-evidence/candidate/1024x768/parent-sign-in-bottom.png`
- `test-results/visual-evidence/candidate/1024x768/parent-password-recovery-full.png`
- `test-results/visual-evidence/candidate/1024x768/parent-dashboard-full.png`
- `test-results/visual-evidence/candidate/1024x768/parent-dashboard-top.png`
- `test-results/visual-evidence/candidate/1024x768/parent-dashboard-middle-1.png`
- `test-results/visual-evidence/candidate/1024x768/parent-dashboard-bottom.png`
- `test-results/visual-evidence/candidate/1024x768/parent-library-full.png`
- `test-results/visual-evidence/candidate/1024x768/parent-library-top.png`
- `test-results/visual-evidence/candidate/1024x768/parent-library-middle-1.png`
- `test-results/visual-evidence/candidate/1024x768/parent-library-middle-2.png`
- `test-results/visual-evidence/candidate/1024x768/parent-library-bottom.png`
- `test-results/visual-evidence/candidate/1024x768/parent-preview-dialog-full.png`
- `test-results/visual-evidence/candidate/1024x768/parent-preview-dialog-top.png`
- `test-results/visual-evidence/candidate/1024x768/parent-preview-dialog-middle-1.png`
- `test-results/visual-evidence/candidate/1024x768/parent-preview-dialog-middle-2.png`
- `test-results/visual-evidence/candidate/1024x768/parent-preview-dialog-bottom.png`
- `test-results/visual-evidence/candidate/1024x768/parent-add-video-full.png`
- `test-results/visual-evidence/candidate/1024x768/parent-add-video-top.png`
- `test-results/visual-evidence/candidate/1024x768/parent-add-video-bottom.png`
- `test-results/visual-evidence/candidate/1024x768/parent-collections-full.png`
- `test-results/visual-evidence/candidate/1024x768/parent-collections-top.png`
- `test-results/visual-evidence/candidate/1024x768/parent-collections-bottom.png`
- `test-results/visual-evidence/candidate/1024x768/parent-inbox-full.png`
- `test-results/visual-evidence/candidate/1024x768/parent-inbox-top.png`
- `test-results/visual-evidence/candidate/1024x768/parent-inbox-bottom.png`
- `test-results/visual-evidence/candidate/1024x768/parent-children-full.png`
- `test-results/visual-evidence/candidate/1024x768/parent-children-top.png`
- `test-results/visual-evidence/candidate/1024x768/parent-children-middle-1.png`
- `test-results/visual-evidence/candidate/1024x768/parent-children-bottom.png`
- `test-results/visual-evidence/candidate/1024x768/parent-controls-full.png`
- `test-results/visual-evidence/candidate/1024x768/parent-controls-top.png`
- `test-results/visual-evidence/candidate/1024x768/parent-controls-middle-1.png`
- `test-results/visual-evidence/candidate/1024x768/parent-controls-middle-2.png`
- `test-results/visual-evidence/candidate/1024x768/parent-controls-middle-3.png`
- `test-results/visual-evidence/candidate/1024x768/parent-controls-bottom.png`
- `test-results/visual-evidence/candidate/1024x768/parent-settings-full.png`
- `test-results/visual-evidence/candidate/1024x768/parent-settings-top.png`
- `test-results/visual-evidence/candidate/1024x768/parent-settings-middle-1.png`
- `test-results/visual-evidence/candidate/1024x768/parent-settings-bottom.png`
- `test-results/visual-evidence/candidate/1024x768/family-profile-picker-full.png`
- `test-results/visual-evidence/candidate/1024x768/family-profile-picker-top.png`
- `test-results/visual-evidence/candidate/1024x768/family-profile-picker-bottom.png`
- `test-results/visual-evidence/candidate/1024x768/parent-pin-dialog-full.png`
- `test-results/visual-evidence/candidate/1024x768/parent-pin-dialog-top.png`
- `test-results/visual-evidence/candidate/1024x768/parent-pin-dialog-bottom.png`
- `test-results/visual-evidence/candidate/1024x768/child-home-full.png`
- `test-results/visual-evidence/candidate/1024x768/child-home-top.png`
- `test-results/visual-evidence/candidate/1024x768/child-home-middle-1.png`
- `test-results/visual-evidence/candidate/1024x768/child-home-middle-2.png`
- `test-results/visual-evidence/candidate/1024x768/child-home-middle-3.png`
- `test-results/visual-evidence/candidate/1024x768/child-home-middle-4.png`
- `test-results/visual-evidence/candidate/1024x768/child-home-middle-5.png`
- `test-results/visual-evidence/candidate/1024x768/child-home-middle-6.png`
- `test-results/visual-evidence/candidate/1024x768/child-home-bottom.png`
- `test-results/visual-evidence/candidate/1024x768/child-library-full.png`
- `test-results/visual-evidence/candidate/1024x768/child-library-top.png`
- `test-results/visual-evidence/candidate/1024x768/child-library-middle-1.png`
- `test-results/visual-evidence/candidate/1024x768/child-library-middle-2.png`
- `test-results/visual-evidence/candidate/1024x768/child-library-middle-3.png`
- `test-results/visual-evidence/candidate/1024x768/child-library-bottom.png`
- `test-results/visual-evidence/candidate/1024x768/child-favorites-full.png`
- `test-results/visual-evidence/candidate/1024x768/child-favorites-top.png`
- `test-results/visual-evidence/candidate/1024x768/child-favorites-bottom.png`
- `test-results/visual-evidence/candidate/1024x768/child-collection-full.png`
- `test-results/visual-evidence/candidate/1024x768/child-collection-top.png`
- `test-results/visual-evidence/candidate/1024x768/child-collection-bottom.png`
- `test-results/visual-evidence/candidate/1024x768/child-search-empty-full.png`
- `test-results/visual-evidence/candidate/1024x768/child-search-empty-top.png`
- `test-results/visual-evidence/candidate/1024x768/child-search-empty-bottom.png`
- `test-results/visual-evidence/candidate/1024x768/child-request-form-full.png`
- `test-results/visual-evidence/candidate/1024x768/child-request-form-top.png`
- `test-results/visual-evidence/candidate/1024x768/child-request-form-bottom.png`
- `test-results/visual-evidence/candidate/1024x768/child-request-sent-pending-full.png`
- `test-results/visual-evidence/candidate/1024x768/child-request-sent-pending-top.png`
- `test-results/visual-evidence/candidate/1024x768/child-request-sent-pending-bottom.png`
- `test-results/visual-evidence/candidate/1024x768/child-discover-results-full.png`
- `test-results/visual-evidence/candidate/1024x768/child-discover-results-top.png`
- `test-results/visual-evidence/candidate/1024x768/child-discover-results-bottom.png`
- `test-results/visual-evidence/candidate/1024x768/child-empty-library-full.png`
- `test-results/visual-evidence/candidate/1024x768/child-empty-library-top.png`
- `test-results/visual-evidence/candidate/1024x768/child-empty-library-bottom.png`
- `test-results/visual-evidence/candidate/1024x768/child-library-error-full.png`
- `test-results/visual-evidence/candidate/1024x768/child-times-up-full.png`

### 1440x1000 — 24 states, 56 PNGs

- `test-results/visual-evidence/candidate/1440x1000/parent-sign-in-full.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-password-recovery-full.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-dashboard-full.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-dashboard-top.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-dashboard-bottom.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-library-full.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-library-top.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-library-middle-1.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-library-bottom.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-preview-dialog-full.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-preview-dialog-top.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-preview-dialog-middle-1.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-preview-dialog-bottom.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-add-video-full.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-add-video-top.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-add-video-bottom.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-collections-full.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-collections-top.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-collections-bottom.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-inbox-full.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-children-full.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-children-top.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-children-bottom.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-controls-full.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-controls-top.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-controls-middle-1.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-controls-middle-2.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-controls-bottom.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-settings-full.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-settings-top.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-settings-bottom.png`
- `test-results/visual-evidence/candidate/1440x1000/family-profile-picker-full.png`
- `test-results/visual-evidence/candidate/1440x1000/parent-pin-dialog-full.png`
- `test-results/visual-evidence/candidate/1440x1000/child-home-full.png`
- `test-results/visual-evidence/candidate/1440x1000/child-home-top.png`
- `test-results/visual-evidence/candidate/1440x1000/child-home-middle-1.png`
- `test-results/visual-evidence/candidate/1440x1000/child-home-middle-2.png`
- `test-results/visual-evidence/candidate/1440x1000/child-home-bottom.png`
- `test-results/visual-evidence/candidate/1440x1000/child-library-full.png`
- `test-results/visual-evidence/candidate/1440x1000/child-library-top.png`
- `test-results/visual-evidence/candidate/1440x1000/child-library-bottom.png`
- `test-results/visual-evidence/candidate/1440x1000/child-favorites-full.png`
- `test-results/visual-evidence/candidate/1440x1000/child-collection-full.png`
- `test-results/visual-evidence/candidate/1440x1000/child-search-empty-full.png`
- `test-results/visual-evidence/candidate/1440x1000/child-request-form-full.png`
- `test-results/visual-evidence/candidate/1440x1000/child-request-form-top.png`
- `test-results/visual-evidence/candidate/1440x1000/child-request-form-bottom.png`
- `test-results/visual-evidence/candidate/1440x1000/child-request-sent-pending-full.png`
- `test-results/visual-evidence/candidate/1440x1000/child-request-sent-pending-top.png`
- `test-results/visual-evidence/candidate/1440x1000/child-request-sent-pending-bottom.png`
- `test-results/visual-evidence/candidate/1440x1000/child-discover-results-full.png`
- `test-results/visual-evidence/candidate/1440x1000/child-discover-results-top.png`
- `test-results/visual-evidence/candidate/1440x1000/child-discover-results-bottom.png`
- `test-results/visual-evidence/candidate/1440x1000/child-empty-library-full.png`
- `test-results/visual-evidence/candidate/1440x1000/child-library-error-full.png`
- `test-results/visual-evidence/candidate/1440x1000/child-times-up-full.png`

## Exact supplied bounded-asset identity coverage

The ranges below enumerate identities exactly: each A-number is local to its state and viewport. Every range is **enumerated, contextual rasters consumed, individual crop unconsumed, edge verdict unresolved**. No range is an artwork PASS.

| Viewport | State | Supplied A-identities | Count |
|---|---|---|---|
| 390x844 | parent-sign-in | A001…A001 | 1 |
| 390x844 | parent-password-recovery | A001…A001 | 1 |
| 390x844 | parent-dashboard | A001…A025 | 25 |
| 390x844 | parent-library | A001…A019 | 19 |
| 390x844 | parent-preview-dialog | A001…A019 | 19 |
| 390x844 | parent-add-video | A001…A008 | 8 |
| 390x844 | parent-collections | A001…A007 | 7 |
| 390x844 | parent-inbox | A001…A007 | 7 |
| 390x844 | parent-children | A001…A051 | 51 |
| 390x844 | parent-controls | A001…A019 | 19 |
| 390x844 | parent-settings | A001…A008 | 8 |
| 390x844 | family-profile-picker | A001…A009 | 9 |
| 390x844 | parent-pin-dialog | A001…A009 | 9 |
| 390x844 | child-home | A001…A066 | 66 |
| 390x844 | child-library | A001…A046 | 46 |
| 390x844 | child-favorites | A001…A021 | 21 |
| 390x844 | child-collection | A001…A015 | 15 |
| 390x844 | child-search-empty | A001…A010 | 10 |
| 390x844 | child-request-form | A001…A007 | 7 |
| 390x844 | child-request-sent-pending | A001…A008 | 8 |
| 390x844 | child-discover-results | A001…A008 | 8 |
| 390x844 | child-empty-library | A001…A010 | 10 |
| 390x844 | child-library-error | none | 0 |
| 390x844 | child-times-up | none | 0 |
| 768x1024 | parent-sign-in | A001…A002 | 2 |
| 768x1024 | parent-password-recovery | A001…A002 | 2 |
| 768x1024 | parent-dashboard | A001…A028 | 28 |
| 768x1024 | parent-library | A001…A019 | 19 |
| 768x1024 | parent-preview-dialog | A001…A019 | 19 |
| 768x1024 | parent-add-video | A001…A008 | 8 |
| 768x1024 | parent-collections | A001…A007 | 7 |
| 768x1024 | parent-inbox | A001…A007 | 7 |
| 768x1024 | parent-children | A001…A051 | 51 |
| 768x1024 | parent-controls | A001…A019 | 19 |
| 768x1024 | parent-settings | A001…A008 | 8 |
| 768x1024 | family-profile-picker | A001…A009 | 9 |
| 768x1024 | parent-pin-dialog | A001…A009 | 9 |
| 768x1024 | child-home | A001…A083 | 83 |
| 768x1024 | child-library | A001…A058 | 58 |
| 768x1024 | child-favorites | A001…A025 | 25 |
| 768x1024 | child-collection | A001…A017 | 17 |
| 768x1024 | child-search-empty | A001…A010 | 10 |
| 768x1024 | child-request-form | A001…A007 | 7 |
| 768x1024 | child-request-sent-pending | A001…A008 | 8 |
| 768x1024 | child-discover-results | A001…A008 | 8 |
| 768x1024 | child-empty-library | A001…A010 | 10 |
| 768x1024 | child-library-error | none | 0 |
| 768x1024 | child-times-up | none | 0 |
| 1024x768 | parent-sign-in | A001…A002 | 2 |
| 1024x768 | parent-password-recovery | A001…A002 | 2 |
| 1024x768 | parent-dashboard | A001…A028 | 28 |
| 1024x768 | parent-library | A001…A019 | 19 |
| 1024x768 | parent-preview-dialog | A001…A019 | 19 |
| 1024x768 | parent-add-video | A001…A008 | 8 |
| 1024x768 | parent-collections | A001…A007 | 7 |
| 1024x768 | parent-inbox | A001…A007 | 7 |
| 1024x768 | parent-children | A001…A051 | 51 |
| 1024x768 | parent-controls | A001…A019 | 19 |
| 1024x768 | parent-settings | A001…A008 | 8 |
| 1024x768 | family-profile-picker | A001…A009 | 9 |
| 1024x768 | parent-pin-dialog | A001…A009 | 9 |
| 1024x768 | child-home | A001…A083 | 83 |
| 1024x768 | child-library | A001…A058 | 58 |
| 1024x768 | child-favorites | A001…A025 | 25 |
| 1024x768 | child-collection | A001…A017 | 17 |
| 1024x768 | child-search-empty | A001…A010 | 10 |
| 1024x768 | child-request-form | A001…A007 | 7 |
| 1024x768 | child-request-sent-pending | A001…A008 | 8 |
| 1024x768 | child-discover-results | A001…A008 | 8 |
| 1024x768 | child-empty-library | A001…A010 | 10 |
| 1024x768 | child-library-error | none | 0 |
| 1024x768 | child-times-up | none | 0 |
| 1440x1000 | parent-sign-in | A001…A002 | 2 |
| 1440x1000 | parent-password-recovery | A001…A002 | 2 |
| 1440x1000 | parent-dashboard | A001…A028 | 28 |
| 1440x1000 | parent-library | A001…A019 | 19 |
| 1440x1000 | parent-preview-dialog | A001…A019 | 19 |
| 1440x1000 | parent-add-video | A001…A008 | 8 |
| 1440x1000 | parent-collections | A001…A007 | 7 |
| 1440x1000 | parent-inbox | A001…A007 | 7 |
| 1440x1000 | parent-children | A001…A051 | 51 |
| 1440x1000 | parent-controls | A001…A019 | 19 |
| 1440x1000 | parent-settings | A001…A008 | 8 |
| 1440x1000 | family-profile-picker | A001…A009 | 9 |
| 1440x1000 | parent-pin-dialog | A001…A009 | 9 |
| 1440x1000 | child-home | A001…A083 | 83 |
| 1440x1000 | child-library | A001…A058 | 58 |
| 1440x1000 | child-favorites | A001…A025 | 25 |
| 1440x1000 | child-collection | A001…A017 | 17 |
| 1440x1000 | child-search-empty | A001…A010 | 10 |
| 1440x1000 | child-request-form | A001…A007 | 7 |
| 1440x1000 | child-request-sent-pending | A001…A008 | 8 |
| 1440x1000 | child-discover-results | A001…A008 | 8 |
| 1440x1000 | child-empty-library | A001…A010 | 10 |
| 1440x1000 | child-library-error | none | 0 |
| 1440x1000 | child-times-up | none | 0 |

## Supplementary PNGs not visually consumed

- `docs/evidence/child-player-mobile-synthetic.png`
- `docs/evidence/child-player-tablet-synthetic.png`
- `docs/evidence/child-simple-synthetic.png`
- `docs/evidence/child-tablet-synthetic.png`
- `docs/evidence/parent-add-videos-tablet-synthetic.png`
- `docs/evidence/parent-children-synthetic.png`
- `docs/evidence/parent-overview-synthetic.png`
- `docs/evidence/parent-settings-tablet-synthetic.png`
- `docs/evidence/profile-picker-tablet-synthetic.png`

No images outside the exact consumption list above are claimed reviewed. No physical device/provider evidence is claimed.
