# WatchNest supplemental small-width independent visual review — 2026-11-04

**Result: INCOMPLETE / CONDITIONAL.** No confirmed application visual defect in the supplied scope. Five assets retain ten unresolved LEFT/RIGHT contour outcomes because fixed bottom-navigation pixels and shadow obscure a strip between recorded viewport positions. This is a finite evidence gap, not an application defect or a CLEAN verdict.

## Authority, independence and candidate binding

Independent fresh Human-Eye pixel review under the live HumanEye V2.0 authority at https://app.notion.com/p/3ea584c4f74781f5946bef30a54c86c5 and `docs/PremiumReviewContract-20261103.md`. No other review verdicts, repair history or Builder findings were used. No application edits were made.

Evidence root: `/workspace/scratch/b4fb31747e8d/watchnest-review/ci138-supplement-cold`. Actual capture checkout is `fc96af972c6a82977409a0cecc31513c0e7e4735`, whole tree `18a16627fa96e80ea17e2674666a55af0ab1a416`; manifest PR head is null. This is **not** the whole tree of candidate `da6edbb4436fc6f455eaef87ace5df61c3e62396`. Controller/QA job `126416038434` establishes equivalent `src` tree `98948406b6e561a24982198bcf69e2b264fcd151` and no material configuration difference. Acceptance is bound to these captures under that stated equivalence limit. A material future application delta invalidates affected evidence until recaptured and reviewed.

Synthetic Chromium fixtures and artwork only. This review does not certify provider playback, deployed hosted backend, physical devices, or overall production readiness.

## Actual pixel consumption

| Scope | Consumption |
|---|---:|
| Widths | 360×800, 412×915, 520×900, 640×900 |
| States at each width | Parent overview, Add videos, profile picker, child Home, child Library |
| State/width combinations | 20/20 |
| Native readable viewport files | 62/62 |
| Readable boards at native image width | 33/33 |
| Additional fullpage overviews | 20/20, on 4 gestalt-only boards |
| Exact asset groups | 385/385 |
| Asset instances mapped individually | 636/636 |
| Native asset boards | 33/33 |
| Large hero representative crops | 2/2, exact native pixels |
| Edge outcomes | 2,534 clear; 10 unresolved; 0 fabricated N/A |

Readable boards: `small-readable-boards/360-01.png` through `360-08.png`; `412-01.png` through `412-08.png`; `520-01.png` through `520-08.png`; `640-01.png` through `640-09.png`. Exact file, region, scroll and source-hash mappings are retained in their index and the receipt. Each state's LEFT/RIGHT/TOP/middle/BOTTOM regions were actually viewed. Fullpage source images were additionally consumed on `small-full-overviews/full-01.png` through `full-04.png` for composition only.

Asset groups were consumed at original detail on `unique-asset-boards-<size>/native-*.png`: 93 groups for 360, 95 for 412, 97 for 520, 100 for 640. Exact pixel/dimension dedup preserves all instance mappings and six pixels of context. Small glyph patches were nearest-neighbor enlarged; this does not invent source detail. Large hero A011 for 520 and 640 was consumed directly at `asset-crops/child-home/<size>/A011.png`; no contour conclusion relies on the large overview boards. Geometry and hashes only bind evidence; actual pixels control each disposition.

## Visual findings

The parent screens retain clear heading/action hierarchy, aligned navigation and form grouping, and comfortable separation across these four widths. Profile cards remain centered and distinguishable with readable names and parent entry. Child Home and Library preserve consistent columns, artwork framing, card control spacing and clear selected navigation. At 360, long synthetic titles visibly clamp where appropriate; this is legible and does not collide with neighboring controls. Contrast, typography rhythm, icon recognition and overall visual cohesion showed no confirmed failure in the inspected raster states.

Some fullpage asset patches intersect fixed bottom navigation. Actual same-state middle viewport pixels expose the complete affected assets at 412, 520 and 640; those dispositions cite those viewport files in the machine receipt. Fullpage occlusion was not mistaken for an intact underlying contour. No concealed DOM asset was automatically declared visible from its bounds.

## Finite unresolved evidence

| State / viewport | Asset IDs | TOP / BOTTOM | LEFT / RIGHT | Required view |
|---|---|---|---|---|
| Child Home / 360×800 | A013 All videos, A014 Favorites, A015 Discover | Clear from actual top and middle-1 pixels | Unresolved across the navigation/shadow strip before scroll720 | Same state, scrollY500 |
| Child Library / 360×800 | A012 first tree thumbnail, A015 first piano thumbnail | Clear from actual top and middle-1 pixels | Unresolved across the navigation/shadow strip before scroll720 | Same state, scrollY500 |

Home icon bounds are y706.1875–730.1875. Library artwork bounds are y662.984375–750.734375. The top capture shows the upper contours; middle-1 begins at document y720 and shows the lower contours. The obscured intervening strip prevents a continuous side-contour judgment. Stitched views or matching geometry cannot establish the missing pixels. Controller/QA has the complete final gap list; no other gaps remain in this bounded shard.

## Receipt and next step

Machine-readable evidence: `docs/evidence/premium-review/20261104/supplement-small-visual-receipt.json`. Every instance has its exact identity, equivalence group, source box/hash, consumed patch/board, manifest bounded-asset record, native region/scroll references, disposition, reason and four separate edge outcomes. All 2,544 required edge outcomes are explicitly accounted for; ten remain unresolved.

Ready-to-paste continuation prompt:

> Independently review the new exact-candidate 360×800 child Home scrollY500 and child Library scrollY500 PNGs. Preserve this review's blind firewall. Verify candidate/source binding and consume the actual native pixels for Home A013/A014/A015 and Library A012/A015. Resolve each LEFT/RIGHT contour separately; TOP/BOTTOM were clear in CI138. Do not infer a pass from geometry or hashes. If the candidate materially changed, recapture/review affected states instead of inheriting this conditional result. Update `docs/PremiumSupplementSmallVisual-20261104.md` and `docs/evidence/premium-review/20261104/supplement-small-visual-receipt.json` with exact new file/hash/scroll mappings and actual outcomes. No overall production/provider/physical-device acceptance claim.
