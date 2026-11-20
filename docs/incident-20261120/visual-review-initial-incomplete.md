# Independent blind bounded Human-Eye V2.0 receipt

Date: 2026-11-20. Reviewer: independent visual-inspection agent. No Builder rationale, defect history, repair history, or previous verdicts retrieved. No application edits made.

Protocol consumed: Notion `3ea584c4f74781f5946bef30a54c86c5`, Final Visual Inspection — Blind Protocol V2.0 — PRODUCTION CERTIFIED, effective 2026-09-29. Fetch returned the full protocol with no truncation notice.

## SOURCE_IDENTITY

Exact original screenshot bytes were copied immediately before inspection. SHA-256:

| Source / preserved artifact | Raster size | SHA-256 |
|---|---|---|
| `watchnest/test-results/request-preview-requested--595f3-s-on-390px-without-approval/request-preview.png` → `visual/request-preview-phone390.png` | 390×1013 | `f9918860657874476e1c897a69bff2154c7e48fe1294fbecf0bed290b3f4df33` |
| `watchnest/test-results/request-preview-requested--93c75-s-on-820px-without-approval/request-preview.png` → `visual/request-preview-tablet820.png` | 820×1180 | `b594030cb90e69ae144cda5a4b6011366b70387b120670ed98a83dd20c325a76` |

Only these raster sources and two lossless source crops were visually consumed. No different candidate, live browser, or device was inspected.

## REGION_COVERAGE 6/6

Coordinates are half-open raster regions, origin upper left. Each complete source raster was displayed and inspected, including corners and region boundaries.

| Region | Bounds | Inspection |
|---|---|---|
| P1 phone top/background | x0–390, y0–134 | Dark blurred background; unobstructed modal entry boundary. |
| P2 phone dialog band | x0–390, y134–710 | Full dialog and both side gutters inspected at readable scale. |
| P3 phone bottom/background | x0–390, y710–1013 | Backdrop to y844, then undimmed underlying page below the declared viewport. |
| T1 tablet top/background | x0–820, y0–255 | Dark blurred background and clear top modal separation. |
| T2 tablet dialog band | x0–820, y255–925 | Full dialog and both side gutters inspected at readable scale. |
| T3 tablet bottom/background | x0–820, y925–1180 | Continuous dark background, clear lower modal separation. |

Scope excludes identifying background content intentionally obscured by modal blur; those pixels were inspected for modal boundaries, not background-app correctness.

## BOUNDED_ASSETS 14/14

Finite inventory established from exact rasters. Bounds approximate the visible outer painted extent; they are raster inspection coordinates, not DOM measurements. Every listed asset was inspected in both its source context and the readable dialog crop. L/R/T/B mean LEFT/RIGHT/TOP/BOTTOM rendered edge gate. All text was read, not merely recognized as a text block.

| ID | Raster | Asset | Approximate bounds x,y,w,h | Rendered L/R/T/B |
|---|---|---|---|---|
| A01 | Phone | White dialog surface | 8,134,374,576 | resolved/resolved/resolved/resolved |
| A02 | Phone | “Requested craft video” title | 29,159,263,29 | resolved/resolved/resolved/resolved |
| A03 | Phone | “Close preview” button and label | 29,213,138,46 | resolved/resolved/resolved/resolved |
| A04 | Phone | Black rounded media rectangle | 29,275,332,187 | resolved/resolved/resolved/resolved |
| A05 | Phone | Two-line preview instruction | 29,467,326,40 | resolved/resolved/resolved/resolved |
| A06 | Phone | “Retry preview” button and label | 29,528,138,46 | resolved/resolved/resolved/resolved |
| A07 | Phone | Four-line parent-preview disclosure | 29,580,329,87 | resolved/resolved/resolved/resolved |
| A08 | Tablet | White dialog surface | 24,255,772,670 | resolved/resolved/resolved/resolved |
| A09 | Tablet | “Requested craft video” title | 49,284,263,29 | resolved/resolved/resolved/resolved |
| A10 | Tablet | “Close preview” button and label | 633,280,138,46 | resolved/resolved/resolved/resolved |
| A11 | Tablet | Black rounded media rectangle | 49,342,722,407 | resolved/resolved/resolved/resolved |
| A12 | Tablet | One-line preview instruction | 49,754,479,17 | resolved/resolved/resolved/resolved |
| A13 | Tablet | “Retry preview” button and label | 49,789,138,46 | resolved/resolved/resolved/resolved |
| A14 | Tablet | Two-line parent-preview disclosure | 49,841,714,37 | resolved/resolved/resolved/resolved |

## ASSET_EVIDENCE_CONSUMED

A01, A02, A03, A04, A05, A06, A07 consumed in full phone source and phone dialog crop. A08, A09, A10, A11, A12, A13, A14 consumed in full tablet source and tablet dialog crop. The black media rectangles contain no visible player artwork or controls; only their container contours can be resolved.

## READABLE_VIEWS required 2 / consumed 2

Lossless native-scale crops, no resampling:

- `visual/readable-dialog-phone390.png`: source box (8,134)–(382,710), 374×576; SHA-256 `3e78bb75fce57603717c4650c4f7c347085eee699ecdede0ed66de36d6a94b45`.
- `visual/readable-dialog-tablet820.png`: source box (24,255)–(796,925), 772×670; SHA-256 `4b806bc810960a336231fb1424a6238933d40ae6413f4efa24736decd47611ee`.

Both crops were explicitly displayed and read after the originals. The complete title, both button labels, instruction, and entire disclosure were legible with no observed text truncation.

## STRUCTURAL_RECORDS required 2 / consumed 0

No neutral per-viewport capture/containment record was supplied. This reviewer did not retrieve implementation reasoning or inspect source to invent one. Raster coordinates above are inspection records and do not substitute for a neutral structural record. The phone declared viewport height (844) differs from raster height (1013), making capture-method provenance especially material. Structural/source binding coverage remains unresolved.

## EDGE_GATES resolved 56 / required 56 (visible raster only)

All four visible outer edges of each inventoried asset are present. Both dialog outlines, both media outlines, both close buttons, and both retry buttons have complete visible corners/contours. No visible horizontal text clipping or label intrusion. These gates resolve the supplied raster appearance only. They do not resolve offscreen browser layout, embedded video internals, or actual playback.

## APPLICATION_BINDING

Supplied by controller, not independently verified from capture provenance:

- Candidate application commit `146a672f5b0744a13869dc29983e5942a0d7a233`.
- RequestPreview blob `343374c1046b8cf1beb7a294d895455893ba154b`.
- Existing Parent.module.css unchanged (controller statement).
- Parent request-video preview dialog; phone declared 390×844 and tablet declared 820×1180.
- Synthetic video-frame content, not evidence of deployed YouTube behavior.

Exact raster identity is verified by hashes. Binding these rasters to the supplied application/blob and capture conditions remains an unverified assertion pending neutral controller records.

## UNRESOLVED_CONFLICTS

No observed contradiction between rendered contours and supplied structural clearance, because structural clearance was not supplied. Two coverage gaps remain: per-viewport neutral structural records and capture-to-candidate provenance. Phone source is a 390×1013 raster for a declared 390×844 viewport; its lower 169 pixels cannot establish viewport-overlay correctness without the capture method.

## HUMAN_GATES

| Gate | Bounded visual finding |
|---|---|
| Alignment | Dialog content left edges align. Tablet close button shares the title row; phone wraps it to its own row without overlap. |
| Optical centering | Dialogs appear horizontally centered. Phone visible dialog extends y134–710, centered within declared y0–844 viewport; tablet centered within 1180px raster. |
| Spacing/rhythm | Clear title-to-media progression. Instruction and disclosure sit close to adjacent media/button, but remain distinct and readable. No confirmed spacing defect. |
| Grouping | White surface clearly groups title, close action, media, guidance, retry, and parent disclosure. |
| Hierarchy | Bold dark title is strongest text. Media dominates the tablet. Close/retry actions use consistent outlines and colored labels. |
| Crop/story | Container contours complete. Black synthetic media supplies no story or subject to judge and no player-content acceptance evidence. |
| Contrast | Title, body copy, and button labels are visually legible against white. No numerical WCAG claim made. |
| Gestalt | Coherent, restrained dialog at both supplied sizes; no visible overlap, malformed corner, or clipped action. |

## CONFIRMED_DEFECTS

0 confirmed defects within the bounded static-dialog layout inspection.

## POSSIBLE_CONCERNS

1. Phone full raster has an abrupt horizontal transition at y844 from dimmed backdrop to undimmed underlying page. It is below the declared viewport and may be a full-page capture artifact; do not classify as an in-viewport product defect without capture provenance.
2. Both media areas are fully black and contain no visible Play control, while adjacent text asks the user to use YouTube’s Play button. Synthetic media prevents determination of whether a real player would present that control. This remains an evidence limitation, not a confirmed implementation defect.

## FINAL_RESULT

COVERAGE UNRESOLVED — CLEAN prohibited by V2.0 completeness gate. Bounded static visual inspection found no confirmed layout/contour/readability defects, but required neutral structural records and verified capture/application binding are missing. This receipt provides no playback, security, functional, deployed-browser, actual-device, or release acceptance. Material candidate changes invalidate affected findings.
