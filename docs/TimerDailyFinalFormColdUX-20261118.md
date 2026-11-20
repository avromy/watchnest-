# Independent final timer form recheck — 2026-11-18

**PASS — bounded final expanded editor UX and exact dispatch.** No material defect found. The previous proximity recommendation is resolved. **Release authority remains FAIL / HELD** for separate hosted, backend, security and physical gates.

Source `aa2ba2b0c0e9cb977f6dc803e60742c2d4253542`; app tree `1eed93961f1ce9b53d5bf3ec8c77f6909a2e0392`; build `oFLqPPG7G1UKn-j9z5BTR`. Root optimized BUILD_PASS reused read-only on own3023. Chromium390×844; synthetic API fixtures. Prior8669371 compactPASS and earlier source-bound audit/jury history remain unchanged. No broad cold review repeated.

The expanded editor now places policy before presets and custom minutes, with Give/Save immediately after input/helper/validation. Input and primary are visible together. Actual measured gap is **53.75px from input bottom to primary top** (103.75px top-to-top), compared with previous approximately414px top-to-top. The commit control is clear and close to the value being changed.

| Bounded task | Observed result |
|---|---|
| Keyboard disclosure / Tab | Opens with Enter; Tab reaches mode SELECT; closes with Enter |
| Keyboard preset5 | Enter chooses5; numeric field becomes5 |
| Give Time custom1 | Exact `start` with duration1 |
| Invalid0 | Whole-number correction and disabled primary |
| Daily5 using clicked preset | Exact `daily` with duration5 |
| Preset targets | All seven73×46px |
| Expanded overflow | Card356px client/356px scroll; document390px/viewport390px |
| Selected preset versus hover | Selected5 lavender `rgb(184,173,255)` and inset outline; hovered10 pale `rgb(239,236,251)` without outline; selected5 remains after pointer leaves |

Selection was assessed in actual screenshots and computed style. Persistent selection is distinguishable from hover without depending on keyboard focus.

## Closed card

![Closed card](01-closed.png)

Closed-card hierarchy unchanged; final recheck limited to expanded editor.

## Custom1 primary proximity

![Custom1 primary proximity](02-custom1-proximity.png)

Custom input and Start new1minsession are visible together;53.75px clear gap below input including helper.

## Invalid0

![Invalid0](03-invalid0.png)

Inline integer correction and disabled primary.

## Daily5

![Daily5](04-daily5.png)

Pre-action renewal/start/no-rollover copy and Save5min daily allowance.

## Selection versus hover

![Selection versus hover](05-selected5-hover10.png)

Selected5 stays lavender with inset outline; hovered10 only has pale background.

## Persistent selected preset

![Persistent selected preset](06-selected5-nohover.png)

Selected5 remains visually marked when pointer moves away.

Full9-task journal and screenshot hashes are in the JSON companion; standalone harness ../final-form-audit.cjs and successful log ../final-form-audit.log. These observations establish rendered behavior and exact outgoing requests only. Mocked responses do not prove real recurrence or lock persistence. No backend, hosted, real Supabase, physical keyboard/tap reach, playback/sound or fullscreen claim is made. No source edits, builds, shared results writes, agents, external mutations, commits or deployments occurred.

No mandatory repair handed off. Root may integrate this source-bound result before the fresh final jury while retaining remaining release holds.
