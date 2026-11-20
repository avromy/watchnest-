# Supplemental responsive visual coverage — controller record

Status: **IN PROGRESS; no supplemental CLEAN verdict**.

Evidence: CI138 run41782185535, requested head
`3bc392a30f3b873b4b42ace3871e69a79052b8e4`, actual checkout
`fc96af972c6a82977409a0cecc31513c0e7e4735`, complete tree
`18a16627fa96e80ea17e2674666a55af0ab1a416`. This complete tree differs
from CI136. QA qualification job126416038434 establishes equal `src` tree
`98948406b6e561a24982198bcf69e2b264fcd151` against frozen appda6ed,
with no material configuration difference. The eight manifests have null PR-head
fields; that limitation is retained rather than replaced with invented metadata.

Raw artifact13299527511 SHA256
`f40e4fdbdb5065aa1daf9697f84836f9628e97921751ccbfa40e533f803eb1f2`.
Actual runtime remains synthetic Chromium; no hosted/provider/physical claim.

Forty states cover five surfaces at eight additional viewports: Parent overview,
Add videos, profile picker, child Home and Library;360×800,412×915,520×900,
640×900,820×1180,900×900,1180×820,1280×800. All 157 manifest PNG hashes were
verified. Neutral crops account 1400 asset identities, 5600 edge entries and 871
unique exact-pixel/dimension patches within viewport shards. Thirty-six larger
patches require exact crops, not their overview-board representations.

Two existing independent contexts inspect four widths each. They are independent
bounded reviewers; this does not reset their earlier cold status or claim a new
cold user journey. Controller only reconciles coverage, not pixel excellence.

## Finite evidence register

| ID | Observation | Disposition |
| --- | --- | --- |
| SUPP-EVIDENCE-01 |360 child Home shortcut glyphs A013–A015 are partially obscured by fixed navigation in long/full/top captures; available next tile begins within their contours. | Independent reviewer withheld edge clearance. Requested same-state scroll500 viewport so complete glyphs are visible. No application defect established. |

Later material application changes require affected rerenders/rechecks or explicit
unchanged-file/pixel equivalence. This receipt must not be applied to a newer
candidate without that binding. Final supplemental receipt remains pending.

## Frozen independent coverage

All 40 states and 157 capture-file identities consumed by the two independent
reviewers. Every one of 1400 original asset IDs is present exactly once in the
combined receipts with four named edge fields; controller set validation passed.
All 871 unique patch groups were actually inspected. This structural validation
is not a replacement for independent pixel judgment.

| Scope | States/files | Asset IDs/groups | Actual edge outcomes | Result |
| --- | --- | --- | --- | --- |
|360/412/520/640 |20/82 |636/385 |2534 clear,10 unresolved | INCOMPLETE pending exact views |
|820/900/1180/1280 |20/75 |764/486 |2592 clear, 464 N/A for 116 opacity-zero glyphs | CLEAN within supplied scope |

Combined: 5126 visible edge outcomes clear, 464 explicitly N/A, 10 unresolved;
5600 total entries accounted. Zero confirmed application visual defects.

Finite complete remaining list after all evidence consumption:

- `child-home/360x800/A013`, `A014`, `A015`.
- `child-library/360x800/A012`, `A015`.

Each has TOP and BOTTOM clear, LEFT and RIGHT unresolved because fixed navigation
and shadow obscure a strip between supplied scrolled tiles. Needed evidence is
exact same-state Home scroll500 and Library scroll500 viewport captures. No other
additional capture request remains from either reviewer. Home scroll500 was
already added to CI139; Library scroll500 is a finite evidence-only successor
request. Newer candidate binding and affected delta review are still required.

Frozen reports: `PremiumSupplementSmallVisual-20261104.md` and
`PremiumSupplementLargeVisual-20261104.md`. Their exact machine companions and
source hashes are bound in
[evidence/premium-review/20261104/supplement-controller-receipt.json](evidence/premium-review/20261104/supplement-controller-receipt.json).

FINAL_RESULT: **INCOMPLETE supplemental visual evidence** pending the ten named
edge outcomes. No overall production acceptance or new cold journey is claimed.
