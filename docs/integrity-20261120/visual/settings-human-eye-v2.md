# Settings sign-out — bounded Human-Eye V2.0 receipt

2026-11-20. Independent reviewer. Scope: Device access card only, pending and timeout failure states at390×844 and820×1180 in a synthetic local browser. This is a bounded visual review, not an entire-app review. Surrounding Settings cards are contextual pixels and excluded from acceptance.

Protocol: full Final Visual Inspection Blind Protocol V2.0 (`3ea584c4f74781f5946bef30a54c86c5`) consumed earlier in this session. No prior verdict, defect history or Builder rationale used to decide visual findings. Source accessibility review preceded these images and is reported separately; this review is independent but is not represented as a new cold source-blind jury.

## SOURCE_IDENTITY

Application commit `0aac62ea0dd42d1f1301d98a4651d8b8f05e7394`; build `16cAFLfVdU9apUomQC7jN`. ParentApp SHA-256 `de974d847096242dfc27c30f50bac11a10be926483f7952ea24a15469f5a2dd8` independently recomputed and matched source-hashes.json and each geometry record. Parent CSS SHA-256 `2466ba962ac8f55000d36728efa4ef852792db06e44de524821f21abf0889b2a`; global CSS SHA-256 `fd8caa0bef82097053b19c7b4ae70f75b7cf8899af95866ca33d0f07d6239287`.

| Exact source in this directory | Raster | SHA-256 |
|---|---|---|
| logout-pending-390.png | 390×844 | `e283556614b464cd0193fa77f144392b080178ca8a1b8b2c0eb5a38c3b113240` |
| logout-pending-820.png | 820×1180 | `3382d1c90a5d0d3332abee9a15c3706b7bddd7fcf7722265fbc361b72a7a076a` |
| logout-timeout-390.png | 390×844 | `73d0946418bb2e9538b7e76d24db11cd2c833fdc5ab14255d3446bfc5c812014` |
| logout-timeout-820.png | 820×1180 | `5e755e5d539d25429afb9057725d4916a6fb734c6e4a0f6e16228321aa557be5` |

All four final sources were displayed after the geometry rerun. Each independently recomputed image hash matches its adjacent geometry record; actual raster dimensions match recorded viewport dimensions. Current repository HEAD may include later evidence-only commits; acceptance binds the application identity above, not an unspecified current HEAD.

## REGION_COVERAGE 12/12

Each card partitioned deterministically into three complete horizontal bands: panel top→intro paragraph top; intro top→Switch profile button top; Switch profile button top→panel bottom. Entire card width included in every band; all four corners and both side contours inspected. Coordinates in final screenshot space:

| Region | Bounds | Consumption |
|---|---|---|
| pending-390 header | x16.000–374.000, y386.188–453.109 | inspected |
| pending-390 intro | x16.000–374.000, y453.109–543.500 | inspected |
| pending-390 actions/feedback | x16.000–374.000, y543.500–614.219 | inspected |
| pending-820 header | x422.000–788.000, y393.125–464.047 | inspected |
| pending-820 intro | x422.000–788.000, y464.047–554.438 | inspected |
| pending-820 actions/feedback | x422.000–788.000, y554.438–629.156 | inspected |
| timeout-390 header | x16.000–374.000, y118.188–185.109 | inspected |
| timeout-390 intro | x16.000–374.000, y185.109–275.500 | inspected |
| timeout-390 actions/feedback | x16.000–374.000, y275.500–512.891 | inspected |
| timeout-820 header | x422.000–788.000, y393.125–464.047 | inspected |
| timeout-820 intro | x422.000–788.000, y464.047–554.438 | inspected |
| timeout-820 actions/feedback | x422.000–788.000, y554.438–795.828 | inspected |

## BOUNDED_ASSETS 26/26

Panel plus all h2/p/button/svg descendants in each neutral record. IDs stable in source order. Bounds x,y,width,height rounded only for display; JSON retains precision. Text glyph paint rather than element-box height controls visible readability. The SVG icon is included separately from its containing button.

| Asset | State/viewport | Identity | Bounds | Rendered edge gate |
|---|---|---|---|---|
| A01 | pending-390 | PANEL: Device access card | 16.000, 386.188, 358.000, 228.031 | L/R/T/B resolved |
| A02 | pending-390 | H2: Device access | 37.000, 407.188, 316.000, 30.094 | L/R/T/B resolved |
| A03 | pending-390 | P: Switch profiles keeps this family iPad connected. Sign out removes WatchNest access from this browser. | 37.000, 453.109, 316.000, 74.391 | L/R/T/B resolved |
| A04 | pending-390 | BUTTON: Switch profile | 37.000, 543.500, 165.000, 46.000 | L/R/T/B resolved |
| A05 | pending-390 | svg: Switch profile arrow icon | 58.000, 557.500, 18.000, 18.000 | L/R/T/B resolved |
| A06 | pending-390 | BUTTON: Signing out… | 202.000, 547.219, 132.000, 46.000 | L/R/T/B resolved |
| A07 | pending-820 | PANEL: Device access card | 422.000, 393.125, 366.000, 236.031 | L/R/T/B resolved |
| A08 | pending-820 | H2: Device access | 447.000, 418.125, 316.000, 30.094 | L/R/T/B resolved |
| A09 | pending-820 | P: Switch profiles keeps this family iPad connected. Sign out removes WatchNest access from this browser. | 447.000, 464.047, 316.000, 74.391 | L/R/T/B resolved |
| A10 | pending-820 | BUTTON: Switch profile | 447.000, 554.438, 165.000, 46.000 | L/R/T/B resolved |
| A11 | pending-820 | svg: Switch profile arrow icon | 468.000, 568.438, 18.000, 18.000 | L/R/T/B resolved |
| A12 | pending-820 | BUTTON: Signing out… | 612.000, 558.156, 132.000, 46.000 | L/R/T/B resolved |
| A13 | timeout-390 | PANEL: Device access card | 16.000, 118.188, 358.000, 394.703 | L/R/T/B resolved |
| A14 | timeout-390 | H2: Device access | 37.000, 139.188, 316.000, 30.094 | L/R/T/B resolved |
| A15 | timeout-390 | P: Switch profiles keeps this family iPad connected. Sign out removes WatchNest access from this browser. | 37.000, 185.109, 316.000, 74.391 | L/R/T/B resolved |
| A16 | timeout-390 | BUTTON: Switch profile | 37.000, 275.500, 165.000, 46.000 | L/R/T/B resolved |
| A17 | timeout-390 | svg: Switch profile arrow icon | 58.000, 289.500, 18.000, 18.000 | L/R/T/B resolved |
| A18 | timeout-390 | BUTTON: Sign out of this device | 37.000, 321.500, 195.000, 46.000 | L/R/T/B resolved |
| A19 | timeout-390 | P: Could not sign out. This browser may still be signed in. Please try again. | 37.000, 367.500, 316.000, 108.391 | L/R/T/B resolved |
| A20 | timeout-820 | PANEL: Device access card | 422.000, 393.125, 366.000, 402.703 | L/R/T/B resolved |
| A21 | timeout-820 | H2: Device access | 447.000, 418.125, 316.000, 30.094 | L/R/T/B resolved |
| A22 | timeout-820 | P: Switch profiles keeps this family iPad connected. Sign out removes WatchNest access from this browser. | 447.000, 464.047, 316.000, 74.391 | L/R/T/B resolved |
| A23 | timeout-820 | BUTTON: Switch profile | 447.000, 554.438, 165.000, 46.000 | L/R/T/B resolved |
| A24 | timeout-820 | svg: Switch profile arrow icon | 468.000, 568.438, 18.000, 18.000 | L/R/T/B resolved |
| A25 | timeout-820 | BUTTON: Sign out of this device | 447.000, 600.438, 195.000, 46.000 | L/R/T/B resolved |
| A26 | timeout-820 | P: Could not sign out. This browser may still be signed in. Please try again. | 447.000, 646.438, 316.000, 108.391 | L/R/T/B resolved |

## ASSET_EVIDENCE_CONSUMED

A01–A06 in pending390 full source + readable crop + geometry; A07–A12 in pending820 equivalents; A13–A19 in timeout390 equivalents; A20–A26 in timeout820 equivalents. All labels and full explanatory/error paragraphs were read. Arrow icons visibly complete. No generic asset coverage inference used.

## READABLE_VIEWS required4 / consumed4

- `readable-logout-pending-390.png`: native lossless crop(14, 384, 376, 617), SHA-256 `b3698fe05abde1a4952ecce76a122114d88e87295149dcd25adbad13bc45552a`; explicitly displayed and consumed. Geometry record `logout-pending-390.geometry.json` SHA-256 `0f274424e932ef4512304a73d48ee8eb20c96550f8e14c4699c46cf6b8e0d00a` consumed in full.
- `readable-logout-pending-820.png`: native lossless crop(420, 391, 790, 632), SHA-256 `8d08fd8bbe8370060b0b73c45d0dd5caea39a2f849d7ae0e7fe053f0d317a2b7`; explicitly displayed and consumed. Geometry record `logout-pending-820.geometry.json` SHA-256 `da3ebb0b9adb7e9466c98d16957748d9ede54954bdf15171bdb28a74e0cb233b` consumed in full.
- `readable-logout-timeout-390.png`: native lossless crop(14, 116, 376, 515), SHA-256 `5614582344c795706086fd328042c0f4e968487ec192ad5bcb8cd0397db94a6d`; explicitly displayed and consumed. Geometry record `logout-timeout-390.geometry.json` SHA-256 `5cf0763e7abea3333a9a6f7e81a495f4e24b5cd4bc7f244c28c4a248bdbdbdec` consumed in full.
- `readable-logout-timeout-820.png`: native lossless crop(420, 391, 790, 798), SHA-256 `4c29fc70bdc6b1301eebecb3626d44884f052acd3bae3f8111060e6ed41c11e9`; explicitly displayed and consumed. Geometry record `logout-timeout-820.geometry.json` SHA-256 `091910d919a6eee0bfdc58c7479a289fd290752c00d0f4614841e19c946ca714` consumed in full.

## STRUCTURAL_RECORDS required4 / consumed4

Adjacent `logout-{pending,timeout}-{390,820}.geometry.json` records include viewport/scroll, panel, h2/p/button/svg rectangles, disabled attributes, alert role, scroll/client widths, overflow styles, candidate/build identity and exact image hash. Produced by source-neutral DOM extraction in fourth test; reviewer added capture-only test code, did not alter production source. Controller reran the test against same final build; reviewer consumed resulting records and pixels.

Programmatic verification: all four panels entirely inside respective viewports; every listed element rectangle lies inside its panel; document/body widths equal viewport width; image dimensions/hashes agree. SVG uses overflow hidden, automatically requiring contour inspection: rendered arrow remains visibly complete on all four edges in all four states. No structural clearance substitutes for rendered contour integrity.

## EDGE_GATES resolved104 / required104

All four LEFT/RIGHT/TOP/BOTTOM gates resolved for all26 inventoried assets from source rasters/readable crops and neutral records. No cropped text, button, icon, alert or card contour observed. All alert text and card bottom padding visible. Rounded card and error-box outlines complete.

## APPLICATION_BINDING

Each final geometry file derives actual `.next/BUILD_ID` and actual product.ts/ParentApp SHA-256 at capture. `applicationCommitReference` records the supplied candidate reference and `referenceSourceHashesMatch:true` proves both captured source hashes match that reference package; it does not mislabel a future changed source as the old candidate. Actual source hashes, build ID and screenshot hashes independently matched. Controller separately supplies exact candidate/build provenance. `render-manifest.json` lists final source and derived-view hashes plus geometry hashes. Derived readable crops were regenerated with2px exterior context to preserve fractional card-edge paint; manifest refreshed. These are synthetic local browser renders with clock-controlled15001ms timeout and injected network hold. No hosted, provider, physical-device or production-session claim.

## UNRESOLVED_CONFLICTS

0 within this finite visual scope. Screenshot/geometry/source binding agrees. Separate keyboard focus, screen-reader announcement, physical touch and backend authorization scopes were not tested here and are not included in CLEAN.

## HUMAN_GATES

| Gate | Finding |
|---|---|
| Alignment | Heading, introductory copy, primary action and error panel consistently align to card inset. Pending sign-out sits alongside Switch profile; normal longer sign-out wraps below it without collision. |
| Optical centering | Text within both visible action styles is optically balanced. SVG arrow is centered with Switch profile label. |
| Spacing/rhythm | Complete internal padding and separation maintained when timeout adds a line-wrapped action plus alert. Neighboring cards remain separated. |
| Grouping | Device access heading, explanation, actions and failure remain clearly one card. |
| Hierarchy | Heading leads; action labels identifiable; pale red error surface draws attention after failure. Pending label deliberately subdued but readable. |
| Crop/story | Card and changed state fully present; explanatory text accurately distinguishes switching profiles from signing out. |
| Contrast | Visually readable text against card/error surfaces; disabled pending label visibly muted. No numerical contrast certification claimed. |
| Gestalt | Coherent and stable across both target widths; no confirmed visual confusion, overlap or malformed contour. |

## CONFIRMED_DEFECTS

0 confirmed visual defects in these26 assets / four states.

## POSSIBLE_CONCERNS / ACCESSIBILITY LIMITS

No unresolved visual concern inside the finite inspected card scope. Source/native DOM supports disabled pending action, role=alert error and enabled retry. Geometry records show Switch profile165×46px and enabled sign-out195×46px; nominal touch target size is adequate, but no physical touch test was performed. Retry and Switch profile boxes touch at their vertical boundary with no extra gap, but visible labels have internal padding and no observed overlap; no spacing defect confirmed. Keyboard focus after disable/failure, keyboard retry, screen-reader announcement of pending name/error, zoom/reflow beyond these widths and actual assistive technology remain untested. No claim that these tests passed.

The controller reports focused4/4 functional browser tests and capture-only rerun1/1 pass; source assertions inspected include disabled pending/single request,15s abort, enabled retry, honest alert, no client pageerror, retained Settings route on failure and login navigation after retry. This reviewer did not execute or independently certify the functional suite.

## FINAL_RESULT

CLEAN — narrowly for exact static pending/timeout Device access card renders above: region coverage12/12, bounded assets26/26, readable views4/4, structural records4/4, edge gates104/104, zero conflicts, zero confirmed visual defects. This receipt does not certify entire Settings, entire app, backend/auth/security, hosted behavior, keyboard/AT, provider playback, real-device behavior or release readiness. Candidate/rendering changes invalidate affected evidence.

Final provenance follow-up: all four fresh geometry records consumed after capture helper correction; actual file hashes/build ID/reference match verified. Final screenshot hashes unchanged from the inspected rasters, so rendered observations remain exact. No outstanding requirement within this finite visual scope. Keyboard/AT/physical-device/entire-app acceptance remains outside it.
