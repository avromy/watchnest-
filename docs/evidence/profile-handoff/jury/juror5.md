# Frozen independent juror 5 review

**PASS — finite rendered visual scope only.**

Candidate: `a4c94870e723e07648bb7a8ce491cef0b0d1a700`, declared source tree `0ff5a019986798b5a2acbdd038aa607c78c25665`. No Builder reasoning, peer reports, source implementation, defect history or repair history read.

## HumanEyeCoverageReceipt

- SOURCE_IDENTITY: exact manifest binding; 27/27 SHA-256 values independently verified.
- REGION_COVERAGE: 42/42 (header, intro, grid, utilities/footer across nine captures, plus dialog in six captures).
- BOUNDED_ASSETS: 96/96; explicit instance ledger below.
- READABLE_VIEWS: 9/9 crop sheets and 9/9 native PNGs opened and emitted through view_image; 54/54 crop cells byte-verified against nearest-neighbor source pixels.
- STRUCTURAL_RECORDS: 9/9 fully consumed; all rectangle containment calculations independently recomputed.
- EDGE_GATES: 384/384 resolved, with four named edges per asset in JSON.
- APPLICATION_BINDING: WatchNest picker / parent handoff / wrong-PIN; 390x844, 768x1024 and 1024x768 declared viewports; full-page images are taller.
- UNRESOLVED_CONFLICTS: none.
- CONFIRMED_DEFECTS: none.
- POSSIBLE_CONCERNS: none within the supplied finite visual scope.
- FINAL_RESULT: PASS.

## Human gates

- alignment: PASS: card columns/rows, avatar carriers and names line up at each width; modal title, copy, PIN and Cancel share the central axis.
- optical_centering: PASS: distinct bird, cat, bear and rocket silhouettes sit comfortably inside round carriers; modal rocket and logomark have clear margins.
- spacing_rhythm: PASS: repeatable card padding, row/column gaps, title-to-copy and field-to-action spacing; error block adds height without crowding.
- grouping: PASS: each name, avatar and status reads as one profile; Parent Mode remains a secondary action; error stays inside its PIN dialog.
- hierarchy: PASS: Who’s watching leads picker; Open Eli’s library leads dialog; PIN field is conspicuous; current Selected profile differs in words and color.
- crop_story: PASS: no active artwork has an incomplete contour; modal covers background intentionally. Full-page rasters include content below the viewport.
- contrast: PASS by visual inspection: primary and supporting foreground copy is legible, focus ring distinct, wrong-PIN message clear; inactive backdrop is deliberately dim. No numeric WCAG claim.
- visible_facts: PASS: four named profiles; Benny visibly selected; others show Parent handoff. Dialog asks parent for four-digit PIN, names Eli, states time limits are unchanged; error says Parent PIN is not correct. These are visible statements, not proof of enforcement.
- gestalt: PASS: cohesive ink, lavender and peach palette; restrained family-friendly avatars; calm premium composition and clear parent/child handoff purpose.

## Instance and four-edge consumption proof

Every row resolves LEFT, RIGHT, TOP and BOTTOM. Structural clearance supports the decision but does not override pixels. Fully or partly occluded background artwork is resolved as deliberate modal layering, not asserted visible intact. JSON includes rectangles, containers, individual edge decisions and file hashes.

### V01

Consumed native raster: `docs/evidence/profile-handoff/final-pixels/390-handoff.png`; complete structure: `docs/evidence/profile-handoff/final-pixels/390-handoff-structure.json`; readable crop sheet: `docs/evidence/profile-handoff/final-readable/V01.png`. All hashes match.

| Asset | Pixel observation | LEFT / RIGHT / TOP / BOTTOM |
|---|---|---|
| A01 decorative icon | visible intact under intentional backdrop dimming | PASS / PASS / PASS / PASS |
| A02 Miri profile photo | intentionally fully occluded by dialog | PASS / PASS / PASS / PASS |
| A03 decorative icon | intentionally fully occluded by dialog | PASS / PASS / PASS / PASS |
| A04 Ari profile photo | intentionally fully occluded by dialog | PASS / PASS / PASS / PASS |
| A05 decorative icon | intentionally fully occluded by dialog | PASS / PASS / PASS / PASS |
| A06 Benny profile photo | intentionally fully occluded by dialog | PASS / PASS / PASS / PASS |
| A07 Eli profile photo | intentionally fully occluded by dialog | PASS / PASS / PASS / PASS |
| A08 decorative icon | visible intact under intentional backdrop dimming | PASS / PASS / PASS / PASS |
| A09 decorative icon | visible intact under intentional backdrop dimming | PASS / PASS / PASS / PASS |
| A10 decorative icon | visible intact below viewport in full-page raster; viewport visibility not claimed | PASS / PASS / PASS / PASS |
| A11 Eli profile photo | visible intact | PASS / PASS / PASS / PASS |

### V02

Consumed native raster: `docs/evidence/profile-handoff/final-pixels/390-picker.png`; complete structure: `docs/evidence/profile-handoff/final-pixels/390-picker-structure.json`; readable crop sheet: `docs/evidence/profile-handoff/final-readable/V02.png`. All hashes match.

| Asset | Pixel observation | LEFT / RIGHT / TOP / BOTTOM |
|---|---|---|
| A01 decorative icon | visible intact | PASS / PASS / PASS / PASS |
| A02 Miri profile photo | visible intact | PASS / PASS / PASS / PASS |
| A03 decorative icon | visible intact | PASS / PASS / PASS / PASS |
| A04 Ari profile photo | visible intact | PASS / PASS / PASS / PASS |
| A05 decorative icon | visible intact | PASS / PASS / PASS / PASS |
| A06 Benny profile photo | visible intact | PASS / PASS / PASS / PASS |
| A07 Eli profile photo | visible intact | PASS / PASS / PASS / PASS |
| A08 decorative icon | visible intact | PASS / PASS / PASS / PASS |
| A09 decorative icon | visible intact | PASS / PASS / PASS / PASS |
| A10 decorative icon | visible intact | PASS / PASS / PASS / PASS |

### V03

Consumed native raster: `docs/evidence/profile-handoff/final-pixels/390-wrong-pin.png`; complete structure: `docs/evidence/profile-handoff/final-pixels/390-wrong-pin-structure.json`; readable crop sheet: `docs/evidence/profile-handoff/final-readable/V03.png`. All hashes match.

| Asset | Pixel observation | LEFT / RIGHT / TOP / BOTTOM |
|---|---|---|
| A01 decorative icon | visible intact under intentional backdrop dimming | PASS / PASS / PASS / PASS |
| A02 Miri profile photo | intentionally fully occluded by dialog | PASS / PASS / PASS / PASS |
| A03 decorative icon | intentionally fully occluded by dialog | PASS / PASS / PASS / PASS |
| A04 Ari profile photo | intentionally fully occluded by dialog | PASS / PASS / PASS / PASS |
| A05 decorative icon | intentionally fully occluded by dialog | PASS / PASS / PASS / PASS |
| A06 Benny profile photo | intentionally fully occluded by dialog | PASS / PASS / PASS / PASS |
| A07 Eli profile photo | intentionally fully occluded by dialog | PASS / PASS / PASS / PASS |
| A08 decorative icon | visible intact under intentional backdrop dimming | PASS / PASS / PASS / PASS |
| A09 decorative icon | visible intact under intentional backdrop dimming | PASS / PASS / PASS / PASS |
| A10 decorative icon | visible intact below viewport in full-page raster; viewport visibility not claimed | PASS / PASS / PASS / PASS |
| A11 Eli profile photo | visible intact | PASS / PASS / PASS / PASS |

### V04

Consumed native raster: `docs/evidence/profile-handoff/final-pixels/768-handoff.png`; complete structure: `docs/evidence/profile-handoff/final-pixels/768-handoff-structure.json`; readable crop sheet: `docs/evidence/profile-handoff/final-readable/V04.png`. All hashes match.

| Asset | Pixel observation | LEFT / RIGHT / TOP / BOTTOM |
|---|---|---|
| A01 decorative icon | visible intact under intentional backdrop dimming | PASS / PASS / PASS / PASS |
| A02 Miri profile photo | intentionally fully occluded by dialog | PASS / PASS / PASS / PASS |
| A03 decorative icon | visible intact under intentional backdrop dimming | PASS / PASS / PASS / PASS |
| A04 Ari profile photo | intentionally fully occluded by dialog | PASS / PASS / PASS / PASS |
| A05 decorative icon | intentionally fully occluded by dialog | PASS / PASS / PASS / PASS |
| A06 Benny profile photo | intentionally fully occluded by dialog | PASS / PASS / PASS / PASS |
| A07 Eli profile photo | intentionally fully occluded by dialog | PASS / PASS / PASS / PASS |
| A08 decorative icon | visible intact under intentional backdrop dimming | PASS / PASS / PASS / PASS |
| A09 decorative icon | visible intact under intentional backdrop dimming | PASS / PASS / PASS / PASS |
| A10 decorative icon | visible intact under intentional backdrop dimming | PASS / PASS / PASS / PASS |
| A11 Eli profile photo | visible intact | PASS / PASS / PASS / PASS |

### V05

Consumed native raster: `docs/evidence/profile-handoff/final-pixels/768-picker.png`; complete structure: `docs/evidence/profile-handoff/final-pixels/768-picker-structure.json`; readable crop sheet: `docs/evidence/profile-handoff/final-readable/V05.png`. All hashes match.

| Asset | Pixel observation | LEFT / RIGHT / TOP / BOTTOM |
|---|---|---|
| A01 decorative icon | visible intact | PASS / PASS / PASS / PASS |
| A02 Miri profile photo | visible intact | PASS / PASS / PASS / PASS |
| A03 decorative icon | visible intact | PASS / PASS / PASS / PASS |
| A04 Ari profile photo | visible intact | PASS / PASS / PASS / PASS |
| A05 decorative icon | visible intact | PASS / PASS / PASS / PASS |
| A06 Benny profile photo | visible intact | PASS / PASS / PASS / PASS |
| A07 Eli profile photo | visible intact | PASS / PASS / PASS / PASS |
| A08 decorative icon | visible intact | PASS / PASS / PASS / PASS |
| A09 decorative icon | visible intact | PASS / PASS / PASS / PASS |
| A10 decorative icon | visible intact | PASS / PASS / PASS / PASS |

### V06

Consumed native raster: `docs/evidence/profile-handoff/final-pixels/768-wrong-pin.png`; complete structure: `docs/evidence/profile-handoff/final-pixels/768-wrong-pin-structure.json`; readable crop sheet: `docs/evidence/profile-handoff/final-readable/V06.png`. All hashes match.

| Asset | Pixel observation | LEFT / RIGHT / TOP / BOTTOM |
|---|---|---|
| A01 decorative icon | visible intact under intentional backdrop dimming | PASS / PASS / PASS / PASS |
| A02 Miri profile photo | intentionally fully occluded by dialog | PASS / PASS / PASS / PASS |
| A03 decorative icon | visible intact under intentional backdrop dimming | PASS / PASS / PASS / PASS |
| A04 Ari profile photo | intentionally fully occluded by dialog | PASS / PASS / PASS / PASS |
| A05 decorative icon | intentionally fully occluded by dialog | PASS / PASS / PASS / PASS |
| A06 Benny profile photo | intentionally fully occluded by dialog | PASS / PASS / PASS / PASS |
| A07 Eli profile photo | intentionally fully occluded by dialog | PASS / PASS / PASS / PASS |
| A08 decorative icon | visible intact under intentional backdrop dimming | PASS / PASS / PASS / PASS |
| A09 decorative icon | visible intact under intentional backdrop dimming | PASS / PASS / PASS / PASS |
| A10 decorative icon | visible intact under intentional backdrop dimming | PASS / PASS / PASS / PASS |
| A11 Eli profile photo | visible intact | PASS / PASS / PASS / PASS |

### V07

Consumed native raster: `docs/evidence/profile-handoff/final-pixels/1024-handoff.png`; complete structure: `docs/evidence/profile-handoff/final-pixels/1024-handoff-structure.json`; readable crop sheet: `docs/evidence/profile-handoff/final-readable/V07.png`. All hashes match.

| Asset | Pixel observation | LEFT / RIGHT / TOP / BOTTOM |
|---|---|---|
| A01 decorative icon | visible intact under intentional backdrop dimming | PASS / PASS / PASS / PASS |
| A02 Miri profile photo | visible intact under intentional backdrop dimming | PASS / PASS / PASS / PASS |
| A03 decorative icon | visible intact under intentional backdrop dimming | PASS / PASS / PASS / PASS |
| A04 Ari profile photo | intentionally fully occluded by dialog | PASS / PASS / PASS / PASS |
| A05 decorative icon | intentionally fully occluded by dialog | PASS / PASS / PASS / PASS |
| A06 Benny profile photo | intentionally fully occluded by dialog | PASS / PASS / PASS / PASS |
| A07 Eli profile photo | visible intact under intentional backdrop dimming | PASS / PASS / PASS / PASS |
| A08 decorative icon | visible intact under intentional backdrop dimming | PASS / PASS / PASS / PASS |
| A09 decorative icon | visible intact under intentional backdrop dimming | PASS / PASS / PASS / PASS |
| A10 decorative icon | visible intact under intentional backdrop dimming | PASS / PASS / PASS / PASS |
| A11 Eli profile photo | visible intact | PASS / PASS / PASS / PASS |

### V08

Consumed native raster: `docs/evidence/profile-handoff/final-pixels/1024-picker.png`; complete structure: `docs/evidence/profile-handoff/final-pixels/1024-picker-structure.json`; readable crop sheet: `docs/evidence/profile-handoff/final-readable/V08.png`. All hashes match.

| Asset | Pixel observation | LEFT / RIGHT / TOP / BOTTOM |
|---|---|---|
| A01 decorative icon | visible intact | PASS / PASS / PASS / PASS |
| A02 Miri profile photo | visible intact | PASS / PASS / PASS / PASS |
| A03 decorative icon | visible intact | PASS / PASS / PASS / PASS |
| A04 Ari profile photo | visible intact | PASS / PASS / PASS / PASS |
| A05 decorative icon | visible intact | PASS / PASS / PASS / PASS |
| A06 Benny profile photo | visible intact | PASS / PASS / PASS / PASS |
| A07 Eli profile photo | visible intact | PASS / PASS / PASS / PASS |
| A08 decorative icon | visible intact | PASS / PASS / PASS / PASS |
| A09 decorative icon | visible intact | PASS / PASS / PASS / PASS |
| A10 decorative icon | visible intact | PASS / PASS / PASS / PASS |

### V09

Consumed native raster: `docs/evidence/profile-handoff/final-pixels/1024-wrong-pin.png`; complete structure: `docs/evidence/profile-handoff/final-pixels/1024-wrong-pin-structure.json`; readable crop sheet: `docs/evidence/profile-handoff/final-readable/V09.png`. All hashes match.

| Asset | Pixel observation | LEFT / RIGHT / TOP / BOTTOM |
|---|---|---|
| A01 decorative icon | visible intact under intentional backdrop dimming | PASS / PASS / PASS / PASS |
| A02 Miri profile photo | visible intact under intentional backdrop dimming | PASS / PASS / PASS / PASS |
| A03 decorative icon | visible intact under intentional backdrop dimming | PASS / PASS / PASS / PASS |
| A04 Ari profile photo | intentionally fully occluded by dialog | PASS / PASS / PASS / PASS |
| A05 decorative icon | intentionally fully occluded by dialog | PASS / PASS / PASS / PASS |
| A06 Benny profile photo | intentionally fully occluded by dialog | PASS / PASS / PASS / PASS |
| A07 Eli profile photo | visible intact under intentional backdrop dimming | PASS / PASS / PASS / PASS |
| A08 decorative icon | visible intact under intentional backdrop dimming | PASS / PASS / PASS / PASS |
| A09 decorative icon | intentionally partially occluded by dialog | PASS / PASS / PASS / PASS |
| A10 decorative icon | visible intact under intentional backdrop dimming | PASS / PASS / PASS / PASS |
| A11 Eli profile photo | visible intact | PASS / PASS / PASS / PASS |

## Limits

- No physical iPad, authenticated hosted session, backend authorization, media playback, keyboard behavior or real-device usability claim.
- Screenshots are full-page rasters: 390 layouts exceed viewport by 98px, 768 layouts by 15px and 1024 layouts by 7px. This is not horizontal clipping; below-viewport content is not asserted visible without scroll.
- Opaque dialog intentionally covers some background assets, notably A03/A05 at 390; V04 A05 crop includes PIN border; V07/V09 A05 shows dialog surface; V09 A09 is partly covered. These crop contents do not establish broken underlying icon artwork.
- No exact Golden/reference raster supplied; evaluated against minimal supplied product/brand context and current visual protocol.
- Static pixels cannot prove the truth of visible protection/time-limit statements or functional PIN rejection.

## Blind Jury return contract

Mode C, five-member final jury as expressly assigned. This juror completes one independent final review and freezes PASS. Convergence reviewers, broader round count and peer verdicts were not supplied or inspected. No prior candidate was consumed, so material progress is unassessed. No Golden was reused or rebuilt. No regressions found. Peer findings seen before freeze: **NO**.
