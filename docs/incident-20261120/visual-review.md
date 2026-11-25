# Independent blind bounded Human-Eye V2.0 final receipt

Date: 2026-11-20. Reviewer: independent visual-inspection agent. No Builder rationale, defect history, repair history, or previous verdicts retrieved. No application edits made. Protocol consumed: Notion `3ea584c4f74781f5946bef30a54c86c5`, production V2.0 effective 2026-09-29; complete fetch with no truncation notice.

This final receipt supersedes the initial incomplete receipt only after consumption of new exact viewport rasters and neutral capture/geometry manifests. Original full-page rasters and the incomplete receipt remain preserved in this directory. Static synthetic-dialog layout is the entire acceptance scope; playback/provider/deployment/device acceptance is excluded.

## SOURCE_IDENTITY

| Final artifact in `visual/` | Raster size | SHA-256 |
|---|---|---|
| `final-phone390-request-preview.png` | 390×844 | `399d26e4b9c9af999b827f1a086b8c7a2b776e7da83ff5e23ccd39ad28cec4d8` |
| `final-tablet820-request-preview.png` | 820×1180 | `b594030cb90e69ae144cda5a4b6011366b70387b120670ed98a83dd20c325a76` |

Both source screenshot bytes and corresponding `final-{phone390,tablet820}-request-preview-manifest.json` files copied immediately upon availability. Their hashes were recomputed and matched their manifests; raster dimensions matched manifest viewport dimensions. A pixel-by-pixel assertion verified that the final phone image equals the exact top390×844 crop of the original390×1013 image and that the final tablet image equals the entire original820×1180 image. Thus no inventoried dialog pixels changed between passes.

Original hashes: phone full-page `f9918860657874476e1c897a69bff2154c7e48fe1294fbecf0bed290b3f4df33`; tablet `b594030cb90e69ae144cda5a4b6011366b70387b120670ed98a83dd20c325a76`. See preserved `visual-review-initial-incomplete.md` for initial gaps and full-page concern.

## REGION_COVERAGE 6/6

Every final source displayed and inspected at native scale, including all frame edges and corners. Half-open bounds, origin upper left:

| Region | Bounds | Finding |
|---|---|---|
| P1 phone top/background | x0–390,y0–134 | Dark blurred backdrop; full upper separation. |
| P2 phone dialog band | x0–390,y134–710 | Full dialog, both gutters, all content inspected. |
| P3 phone bottom/background | x0–390,y710–844 | Dark blurred backdrop continuous to viewport edge. |
| T1 tablet top/background | x0–820,y0–255 | Dark blurred backdrop; full upper separation. |
| T2 tablet dialog band | x0–820,y255–925 | Full dialog, both gutters, all content inspected. |
| T3 tablet bottom/background | x0–820,y925–1180 | Dark blurred backdrop continuous to viewport edge. |

Background pixels reviewed for backdrop/contour integrity; intentionally blurred background content excluded from UI correctness acceptance.

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

## STRUCTURAL_RECORDS required 2 / consumed 2

Both neutral manifest JSON files read in full. Each enumerates viewport, dialog, panel, H2, both BUTTONs, IFRAME, both Ps, overflow widths, build identity, source identities, component/CSS hashes, and screenshot hash. All seven bounded assets per viewport are accounted for by panel plus six element records. Reported dialog exactly covers the viewport; all panel/element rectangles lie inside it. Document/body widths equal viewport widths390 and820. Title/button/media/text box nesting agrees with rendered pixels. Text layout box bounds differ naturally from visible glyph paint bounds in the approximate inventory; no contradiction.

## EDGE_GATES resolved 56 / required 56

Each of14 inventoried assets resolves LEFT/RIGHT/TOP/BOTTOM against both readable raster views and neutral structural records. Both dialog outlines, media outlines, Close buttons and Retry buttons have complete visible rounded corners/contours. All text is fully visible. Media internals are synthetic black areas; this edge clearance applies to their containers, not unrendered provider controls/artwork. No structural clearance overruled a rendered contour.

## APPLICATION_BINDING

Neutral manifests bind both final viewport captures to:

- Source identities: commit `146a672f5b0744a13869dc29983e5942a0d7a233`, source tree `464c41e300e38b9c34cb4f6603f4f2019e4141c4`.
- Build ID `FPvzedrgAp9khP2082u8t`.
- Component SHA-256 `360a4781c67c173d9b90ce2be2ea61ee1013a11bac510cceca5a616f6cafa0db`.
- CSS SHA-256 `2466ba962ac8f55000d36728efa4ef852792db06e44de524821f21abf0889b2a`.
- Exact final screenshot hashes and viewport sizes verified above.
- Evidence explicitly labeled `SYNTHETIC BROWSER / VIEWPORT SCREENSHOT; no hosted/provider/device claim`.

The controller identifies RequestPreview git blob `343374c1046b8cf1beb7a294d895455893ba154b`; this Git blob identifier is not interchangeable with the SHA-256 content hash. No source or app changes were made for this inspection.

## UNRESOLVED_CONFLICTS

0 within this finite static-dialog inspection. Initial phone backdrop discontinuity is outside the actual844px viewport and absent from the final viewport raster; retained as capture-artifact history, not a product defect. Neutral provenance now resolves the initial viewport and binding gaps at the supplied-evidence level. This reviewer did not independently rebuild the app and makes no deployment/device claim.

## HUMAN_GATES

| Gate | Finding |
|---|---|
| Alignment | Content left edges align. Tablet Close shares title row; phone Close wraps cleanly below title. |
| Optical centering | Dialogs visually centered horizontally and vertically within their declared viewports. |
| Spacing/rhythm | Clear title-to-media progression. Guidance and disclosure sit close to adjacent media/button but remain distinct and readable. |
| Grouping | Surface coherently groups title, Close, media, guidance, Retry, disclosure. |
| Hierarchy | Title strongest text; media dominant; button styles consistent. |
| Crop/story | All visible container contours complete. Synthetic black media has no artwork/story to assess. |
| Contrast | Title, body, and labels visibly legible on white; no numerical WCAG claim. |
| Gestalt | Coherent, restrained dialog at both supplied sizes; no visible overlap, clipped action, or malformed corner. |

## CONFIRMED_DEFECTS

0 within the exact static-dialog layout/contour/readability scope.

## POSSIBLE_CONCERNS

No unresolved visual concern within the scoped static layout. Both synthetic media areas lack visible Play controls while the instruction references YouTube Play; actual provider presentation remains untested and cannot be accepted or rejected from synthetic rasters.

## FINAL_RESULT

CLEAN — strictly bounded to the exact two synthetic-browser viewport rasters and static dialog assets identified above. Coverage complete: regions6/6, assets14/14, readable views2/2, neutral structural records2/2, edge gates56/56; no rendered/structural conflicts. This is not playback, provider, functional, security, deployed-browser, actual-device, or release acceptance. Material candidate or relevant rendering changes invalidate affected findings.
