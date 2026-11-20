# Cold Stranger pass frozen — 2026-11-19
Candidate: a4c94870e723e07648bb7a8ce491cef0b0d1a700. Node 24.22.3 standalone Playwright Chromium, production Next server 127.0.0.1:3006. Synthetic browser data installed by supplied installReview, its implementation not read. No builder notes, authority, code handlers, peer findings or journey tests read before this freeze. Child tablet 1024×768; Parent phone 390×844. No provider playback attempted.

| Step | Expectation / action | Observed result / friction | Screen |
|---|---|---|---|
| 1 | Child arrives and identifies own library | Four named cards; Benny Selected profile, others Parent handoff. Parent involvement explained. | 01,02 |
| 2 | Open Benny | Direct library; Benny name visible in top-right switch button. No PIN needed. | 03 |
| 3 | Return to chooser using Benny button | Correct chooser; selected Benny retained. | 04 |
| 4 | Try another child, Ari | Clear Parent PIN modal naming Ari, explains handover and unchanged time limit. Auto-focus visible. | 05 |
| 5 | Mistakenly enter child's PIN 1937, Enter | Rejected with explicit 'That Parent PIN is not correct.' No navigation. | 06 |
| 6 | Cancel; reopen Ari; Parent PIN 2468 | Opens Ari library automatically after fourth digit. Clear active name; no separate submit. | 07 |
| 7 | Refresh Ari library | Active Ari retained. | 08 |
| 8 | Explore Ask Parent; return Library | Useful idea request form; Library returns normally. No request sent. | 09,10 |
| 9 | Parent phone overview | Clear Parent space overview, pending request and children list. | 11 |
| 10 | Find time controls | Time tab works, each child has status and expandable controls. Long mobile page but hierarchy readable. Initial frame has old nav highlight; settled frame correct. | 12,15 |
| 11 | Expand Ari; choose 5 min; Give 5 minutes | Preset updates custom input and action label correctly. After save + >1s remains 'No session timer', no success or failure. This needs support-fixture clarification before attributing defect. | 13–15 |
| 12 | Parent Switch profile | Returns chooser, Benny selected on this separate device/context. | 16 |

Visual packet manually inspected: 05 modal, 08 child library, 12 phone initial Time frame, 15 phone settled Time frame. Modal is readable, focused, distinct from dark scrim; tablet layout orderly; phone time cards and controls legible with no horizontal clipping. Child thumbnails are synthetic placeholders so imagery quality is ungraded. Other captured frames are evidence, not all individually reviewed as visual quality decisions.

Cold verdict: profile handoff is understandable and basic mistaken-PIN/cancel/retry/refresh path succeeds. Timer mutation is UNRESOLVED under synthetic support; no whole-product PASS. Not hosted, real device, provider playback, handler authorization or database evidence. No persistence to real family data.
