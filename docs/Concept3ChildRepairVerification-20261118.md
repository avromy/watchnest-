# Concept3 Child repair verification — 2026-11-18

## Result

**D1, R1 and R2 repaired on the new candidate. Final child signoff HOLD for D2, a new keyboard focus-visibility defect in a long collection shelf.** The original cold FAIL report is unchanged. This is an independent affected-area verification after Builder repair, not a replacement cold-first-impression claim.

Candidate `ea5e2133c6403f49dbbc35c1aa335b200ec4a3f2`; tree `f09e75e131abc5fcdd61c214e1cd0e44fc2fc7d6`; src tree `c384a10590baae806358cca5868fc156f85a1943`. Verified before and after actual browser work. App/config/shared-fixture diff SHA256 is empty `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`. Source tests, docs and evidence in other lanes are not modified by this auditor. No production source/shared tests/shared fixture edits, rebuild, commit or deployment.

Same-process explicitly bound Next16.4.6 `127.0.0.1:3036`; existing new `.next`, build ID `W95Jf9DwyyYtrf0Bq2ZYN`; `.next/BUILD_ID` SHA256 `23c70c4a2ebd7e717fe42044430cce64c7e501a2abbc4d5360ecf23783a2c90c`. Runtime SHA256 `fa9e3004a83b963a77bd990981c91cc9c9722baea3677d4e1509e93dda73525b`; original fixture SHA256 `c37259e3fb7c900fc071f60315671757350786189f65d9a753c3253eb54e7f56`; transpiled fixture SHA256 unchanged `c83998e2882d0355bd1f8b438d69ca238efde39daffd13757d034a6a7dd7c438`. Browser driver/evidence hashes recorded in external `evidence-manifest.json`.

Evidence outside repo: `/workspace/scratch/b4fb31747e8d/concept3-child-repair/`. Actual PNGs01–25 opened via image viewer, not only captured. Independent reviewer `/root/concept3_cold_child`, separate from Builder; retained authority and original journal from first audit. Tested Standard and Simple in fresh separate browser contexts; synthetic API-only access. Simulated phone390×844/tablet768×1024/1024×768. No hosted authentication, physical iPad/Safari, real YouTube result/playback, sibling isolation or persistence PASS.

## Repair findings

| Finding | Actual visible / interaction evidence | Result |
|---|---|---|
|D1 missing age-aware UX|Simple phone10 has one large choice column, larger title, no count, All/Favorites/More; Hidden and sort appear only after opening More03. Portrait11 uses larger two-column cards; landscape12 larger two-column vs Standard06 three-column. More→Hidden→fox→Restore works09. Simple is meaningfully differentiated without losing management functions.|REPAIRED / PASS|
|R1 content reach|Standard phone01 shows two thumbnail/title choices in first viewport. First card y576.6 vs prior750.5. Standard landscape06 shows all3 first-row titles inside768px rather than previous below-fold titles. Simple phone10 shows whole first large thumbnail/title, portrait11 and landscape12 show meaningful choices. Compact title/tools landscape row and horizontal collection shelf reduce pre-content cost.|REPAIRED / PASS|
|R2 request wording|No-discovery Ask Parent13 now has “Send an idea,” not “another way” as the sole form. Form works;14 captured intermediate Sending, not success proof. Actual settled success24 after manual request path proves successful submission. Discover-enabled20 instead correctly offers optional “Ask Parent another way.”|REPAIRED / PASS|
|D2 new objective P2|20 collection synthetic shelf, keyboard Tab19 from first collection focuses Collection20. After700ms settled focus x280..530, shelf x18..372, scrollLeft4719 of max4880. PNG19 shows focus ring/animal-art fragment but focused title clipped outside shelf. Enter does retrieve Collection20 correctly18; not missing content or inaccessible action, but sighted keyboard user cannot read which collection is focused. Normal body width remains390; no document horizontal overflow.|OPEN / HOLD final child signoff pending focus-visibility repair/recheck|

D2 suggested bounded repair: ensure focused shelf item scrolls fully into view, accounting for scroll snap; preserve horizontal shelf and normal focus order. Do not change approval/auth/player behavior. Verify last/first and middle item in both directions with actual settled screenshots and keyboard Enter. No Founder decision needed.

## Actual interaction journal

|Step|Persona/action|Expected → actual|Evidence|
|1|Standard clean picker Ari→PIN1234|Library → Standard library|01|
|2|Fresh Simple picker Ari→PIN1234|Age-aware library → larger choices/count hidden|02 then settled top10|
|3|Simple More open/close|Hidden+sort disclosure → visible operable popover then collapsed|03|
|4|Resize both modes portrait+landscape|Responsive readable choices → Standard2/3 vs Simple2/2; phone Simple1|04–07,10–12|
|5|Simple search piano|Approved local match → piano only|Actual body journal;08|
|6|Heart piano→clear→Favorites|One saved piano → one saved piano with filled heart|08|
|7|All videos→fox overflow→Hide→More→Hidden|Hide/retrieve → fox only, Undo toast|09|
|8|Fox overflow→Restore→All videos|Unhide →3 videos again|10–12 show restored library|
|9|Ask Parent→Animal drawing→Send|Send idea → Sending then success before picker|13/14 intermediate; settled success explicitly verified in24 separate path|
|10|Profile chip→Benny|Picker→child library|15 shows four choices; fixture responds Ari intentionally. Actual sibling identity/security remains unqualified.|
|11|Standard Little Makers→search rocket→rocket|Approved collection match→player|Safe player failure16; actual YouTube playback not qualified.|
|12|Fresh20collections fixture→focus Collection01→19Tab|Last item readable/retrievable → focused title clipped D2|17 immediate,19 settled; Enter opens Collection20 in18|
|13|Fresh discovery-enabled synthetic Animals boundary→Discover|Compact bounded form → readable phone form|20|
|14|Type draw animals→Search|Requestable match → synthetic result card|21; no playable external-result link|
|15|Result Ask Parent with static fixture|Mutation accepted; expected pending cannot be represented by original GET[]|22 remains Ask Parent due fixture; not app defect|
|16|Result Ask Parent with stateful request route|Pending request → Waiting for Parent disabled|25, disabled true actual; stateful synthetic only|
|17|Library miss zzzz→Ask Parent for query→Send|Prefilled manual request→Sent to Parent|24 settled screenshot|

Additional synthetic route definitions are harness-only:20 collections copy the legitimate existing collection/video_ids with generated labels and ids; Discover profile adds `discover_enabled:true,discovery_topics:['Animals']`; result has synthetic title/id/token; stateful request route returns pending video request after POST. No real family API was mutated. Original fixture always maps sibling selection to Ari and accepts any PIN; do not diagnose sibling leak or credential acceptance from it. A driver lexical-scope ReferenceError aborted the first Discover setup before capture; restarted fresh browser, corrected driver import only, and captured actual20–25. This is a harness issue, not a product defect.

## Actual pixel consumption ledger / screen packet

|PNG units actually opened|Visible judgment|
|---|---|
|01 Standard phone|All/Favorites/Hidden single row; both first titles visible.|
|02 Simple phone;03 More|Large card; More contains Hidden/sort. Initial02 was captured during layout adjustment; settled10 confirms full library title.|
|04/06 Standard tablet|Readable portrait grid and compact landscape row; first landscape titles visible.|
|05/07 Simple tablet|Large two-column cards;05 had prior scroll position from control interaction. Repeated with scroll0 in11/12; no title clipping defect.|
|08 Favorites;09 Hidden|Filled heart, isolated hidden item, clear Undo/Restore path.|
|10/11/12 Simple settled phone/portrait/landscape|Meaningful age adaptation and readable current library title confirmed.|
|13 no-discovery form;14 Sending|Correct Send an idea label;14 treated as intermediate, no false success claim.|
|15 profile picker|Clear four names/locks, Parent Mode separated.|
|16 player recovery|Safe failure/recovery remains.|
|17/19 long shelf focus;18 selected result|Focused last card title visibly clipped; correct target opens on Enter. D2.|
|20/21/22/23 Discover|Compact phone/landscape bounded search; synthetic results request-only. Static request fixture cannot show pending.|
|24 manual success;25 stateful pending|Sent to Parent visible; Waiting for Parent disabled visible.|

The repair improves the original core hierarchy substantially. Preserve meaningful age modes, horizontal organization and clear request/recovery semantics. D2 is the only new objective defect found in this verification. Original full cold report, authority, limitations, and original FAIL remain historical evidence. A new source/build after D2 repair invalidates this affected shelf evidence and needs independent actual-pixel recheck. Release gates remain separate.
