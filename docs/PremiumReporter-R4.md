# WatchNest independent adversarial Reporter — R4

Frozen 2026-11-04. **All previous R1–R3 application findings and the paused/expired evidence conflict are CLOSED in the inspected candidate. One newly covered empty-state defect remains: R4-01, P2. Anchor convergence is FAIL until that bounded repair receives an independent recheck.** Full release/coverage acceptance remains separate and BLOCKED by the limits below.

No other review or Human-Eye verdict was read. This receipt records my own direct pixel observations. No application edits were made. Synthetic pixels do not establish hosted behavior, physical iPad/audio/provider playback, native fullscreen or real remote stop.

## Exact candidate

Root `/workspace/scratch/b4fb31747e8d/watchnest-review/ci136-candidate/`; screenshot references below are relative to `test-results/visual-evidence/candidate/` there. Fourteen manifests identify PR application source `da6edbb4436fc6f455eaef87ace5df61c3e62396` and tree `bb562b7c878d6e3be904b318a54e8546892fce52`. Event/source commit is separately recorded in those manifests; this report binds the requested PR application/tree identity rather than equating event and PR commits.

Inventory: 212 capture state×viewport units, 609 PNGs in manifested visual-evidence directories. The broader 618-PNG package includes nine docs/evidence images not treated as current exact-candidate evidence. Current matrix remains 390×844, 768×1024, 1024×768 and 1440×1000. Forthcoming supplemental evidence is not included in this frozen receipt.

## Closure of prior finite findings

| Prior item | Disposition and actual pixel evidence |
| --- | --- |
| R1-01 collection selection grouping | CLOSED: `390x844/parent-collections-bottom.png` shows checkbox and title in shared rows, including wrapped long titles. |
| R1-02 child empty-search hierarchy | CLOSED: `390x844/child-search-empty-full.png` places Nothing found and Ask Parent directly below query/filter controls, without unrelated Collections. |
| R1-03 phone essential targets | CLOSED: `390x844/parent-dashboard-top.png` retains spaced header actions. Current corresponding manifest records Add videos 113×44, Switch profile 44×44 CSS px; geometry supports this specific closure. |
| R2-01 Time’s Up white-on-white | CLOSED: all four `{viewport}/child-times-up-full.png` renders directly inspected; heading, explanation and action remain readable. |
| R3-01 dark library eyebrow | CLOSED: `768x1024/player-states/player-synthetic-ready-next-full.png`, `1024x768/player-states/player-synthetic-ended-next-full.png`, `1440x1000/player-states/player-synthetic-ready-next-full.png` now use a legible amber label above the white title. These are representative repaired uses across three affected sizes, not exhaustive recertification of every player frame. |
| R3-02 approval singular grammar | CLOSED: `390x844/parent-details/parent-approval-assignment-full.png` and `1440x1000/parent-details/parent-approval-assignment-bottom.png` show “1 video found” and “Approve 1 selected video.” |
| E-R3-01 paused/expired conflict | CLOSED for rendered semantic distinction: state captures moved to `player-states/`. `768x1024/player-states/child-library-timer-paused-full.png` now says Parent paused WatchNest and explains Parent can resume; `child-library-timer-expired-full.png` says Time’s up for now and explains videos remain for later. Landscape paused was also directly inspected. These images are visibly different; no real enforcement proof is implied. |

## Finite new finding

**R4-01 — P2, OPEN: Parent Profiles has no empty state or recovery guidance.**

Evidence: `390x844/parent-details/parent-children-empty-full.png` and `1440x1000/parent-details/parent-children-empty-full.png`. Both show the ordinary “Each one, their own space” heading and “Choose a photo or avatar, manage PINs, and check each child’s experience” introduction, followed by an otherwise blank content area. No message states that there are no profiles, whether data failed to load, or how the Parent should proceed. The newly covered Library, Collections and Inbox empty renders provide clear explanations; Profiles leaves the Parent unable to distinguish an empty result from an unfinished/broken screen.

Bounded acceptance: add a truthful zero-profile state with appropriate existing safe recovery/navigation guidance. Do not invent a profile-creation capability or change APIs to satisfy this visual fix. Capture phone and desktop with zero profiles and normal populated profiles, then obtain independent recheck. If the synthetic zero-profile response is outside the supported product model, document the actual supported recovery state and provide its rendered evidence instead of certifying this blank frame.

This is the only new confirmed defect from this round. No additional P0/P1 or functional/security failure is established by static pixels.

## Later-state inspection

The Parent-details manifests now include 27 states each, resolving the earlier inventory truncation after discovery permissions. Direct phone inspection of active, paused and expired timer top/middle crops shows distinct “15 min left,” “Paused · 10 min saved,” and “Time’s up” labels, with respective Pause/Resume/Give time controls. No-child-check-in messaging remains explicit. This is truthful presentation in a fixture, not demonstrated remote stop.

Phone sign-in error gives a readable credential correction message; dashboard error offers Try again; empty Library offers Find videos; empty Collections explains an empty collection can be created; empty Inbox explains where requests arrive. Their content is contained and readable in the inspected full renders. Profiles is the exception registered above.

The correction to failed scroll capture remains visible in `390x844/parent-collections-bottom.png`, which now shows the actual lower form rather than repeating the top. No new capture-region contradiction was observed in the consumed samples.

## Exact coverage and limitations

SOURCE_IDENTITY: requested PR/tree above, synthetic Chromium package. REGION_COVERAGE / READABLE_VIEWS: **28 PNGs directly inspected this round**: three repaired eyebrow uses, two approval assignment views, three child-library timer views, seven Parent empty/error views (six phone plus desktop Profiles), six Parent timer crops, three prior phone regression views, and four Time’s Up views. This is a targeted convergence recheck, not 609/609 raster inspection or 212/212 capture approval.

BOUNDED_ASSETS / ASSET_EVIDENCE_CONSUMED / EDGE_GATES: neutral per-capture asset records exist, but complete A-identity-by-identity edge resolution was not performed in this lane. Actual sampled control/card/dialog/text pixels support the stated closures. STRUCTURAL_RECORDS: fourteen manifests enumerated; current header target metadata consumed. No source/CSS checking substituted for visible evidence. APPLICATION_BINDING: local synthetic package only, no hosted deployment/provider or household claim.

UNRESOLVED_CONFLICTS: no remaining paused/expired visual conflict in consumed evidence; zero-profile supported-model clarification remains part of R4-01 if that fixture is asserted invalid. HUMAN_GATES: supplemental width/resizing inspection, interaction and keyboard/accessibility evidence, independent final jury/cold journeys and physical playback gates remain separate. The supplied availability of other reviewers' receipts does not convert this bounded report into their coverage or verdict.

CONFIRMED_DEFECTS: **R4-01 only**. POSSIBLE_CONCERNS: unconsumed Parent later-state viewport crops and supplemental sizes remain unqualified. FINAL_RESULT: **FAIL for anchor convergence due to R4-01; previous finite findings PASS/CLOSED; full acceptance BLOCKED.** Repair the zero-profile presentation and independently recheck the exact resulting candidate before declaring convergence clear. Material mutations invalidate affected evidence.
