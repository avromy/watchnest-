# WatchNest — independent returning Parent cold audit

Frozen 2026-11-24. Candidate: https://watchnest-d9wx9j0iw-avromy.vercel.app . Entry: /parent/settings. Work CLOUD Browser cdp, own authenticated tab 7, desktop viewport approximately 1348 × 926. No implementation, specifications, authority, history, or Builder verdict was read before this journal froze. Ordinary context supplied: Parent-controlled family video library. This is the returning-caregiver slice of the Stranger Test, not a whole-product acceptance verdict.

## Executive brief

The Parent surface is understandable and visually coherent. Navigation, readable type, restrained purple/navy palette, clear action labels, request attribution, explicit approval boundaries, and honest playback/device limitations are strong. The most consequential friction discovered was routine maintenance at realistic scale: 93 requests become one long, unfiltered list, and collection editing requires finding videos in a long checkbox list. Two concrete expectation failures merit correction: a child-specific “Manage … library” link opens general profiles, and “Review & organize” opens a prefilled URL form without automatically loading its video despite the visible auto-load promise.

No P0 objective defect was established in the permitted read-only scope. Security, mutation correctness, real iPad playback, role transitions, and timer enforcement were deliberately untested. This report cannot certify those areas or full readiness.

## Evidence convention and limits

E1–E8 refer to native `getScreenshot()` observations in this audit's browser tool transcript, paired with accessibility snapshots and exact UI actions. Screenshots were inspected directly, not reconstructed from DOM or exported. Family photos were not downloaded or added to this report. Settings E1/E2 are safe visual candidates for the root packet. Other screens may contain identifiable family photos; do not export those without approved handling.

Some immediate post-navigation screenshots retained the previous rendered frame even when the AX tree had reached the destination. Conclusions below use settled observations. In particular initial Library blanks resolved to thumbnails; they are not reported as a defect.

Observed: authenticated returning Parent, Settings, Overview, Profiles, Requests, request Preview, request-to-Add review entry, fetched video metadata, Time read-only sections, child library filtering, Manage/Cancel, Collections Edit/Cancel. Not exercised: onboarding, second caregiver, child sessions, role switching, wrong credentials, PINs, recovery, uploads, any save/approval/reject/request/time/access changes, actual playback start, mobile resizing, real iPad, offline enforcement, cross-device behavior. No browser preferences changed. No repair attempted.

## Click-by-click stranger journal

All controls below are exact visible labels; results were checked with fresh accessibility state. Severity is scoped UX severity, not security severity. Next action is the next recorded row unless stated.

| Step | Screen / visible purpose | Action | Expectation | Actual / friction | Severity / evidence |
|---|---|---|---|---|---|
| 1 | Settings; protect Parent Mode and manage device | Open supplied /parent/settings | Existing Parent context reaches settings | Brief “Loading family overview…” then Family settings; authenticated context persisted | Keep; E1 |
| 2 | Three protection cards: required, optional, maximum | Read Protection options | Understand app protection vs iPad setup | Safe Playback always on; explicit warning that selective YouTube blocking is limited; dedicated-device steps readable | Keep; E1 |
| 3 | Protection options | Check this browser | Diagnose this browser without altering settings | Inline result: Safe Playback always on; open Home Screen app; no touch input; restrictions must be confirmed in iPad Settings | Keep; AX |
| 4 | Playback on this device | Ads and YouTube Premium | Expand explanatory help | Explains ads and lack of transferable Premium entitlement | Keep; E2 |
| 5 | Playback on this device | Volume | Expand explanatory help | Explains 60% supported-session default, browser memory, physical iPad buttons | Keep; E2 |
| 6 | Playback on this device | Offline and travel | Expand explanatory help | States internet required for beta, no caching | Keep; E2 |
| 7 | Lower settings | Scroll down | See remaining controls | PIN editor, device access, and playback guidance; large unused right column under shorter card | Cosmetic recommendation; E2 |
| 8 | Persistent navigation | Overview | Busy-parent summary | Family overview with Add, Requests, Time; 96 videos, 7 collections, 93 pending; attention banner; child cards | Keep; E3 |
| 9 | Overview child card | Manage Eli’s library | Open Eli-filtered approved library | Opens general Child profiles with all children and photo/PIN/experience/access controls; not library video management | Objective label/destination mismatch; P1; AX |
| 10 | Profiles | Read without edits | Understand child configuration | Clear Standard vs Simple explanation; distinct device access checks and Parent opening language | Keep; AX; no role entry attempted |
| 11 | Navigation | Requests 93 | Review pending needs | Opens 93 requests, attribution/type/date, Approve, Preview, Review & organize, Not now | Scale friction; P1 recommendation; E4 |
| 12 | Requests first video | Preview | Safe read-only preview | Modal with title, Close preview, YouTube player thumbnail, Retry, explicit no-library-add statement; iframe loaded after initial loading state | Keep; E5; no Play pressed |
| 13 | Preview | Close preview | Return safely to same request list | Modal closes; focus returns to Preview | Keep; AX |
| 14 | First request | Review & organize | Open populated video review and child sharing decision | Opens Add videos with corresponding URL prefilled; no video details loaded | P1 friction; E6 |
| 15 | Add videos | Observe settled form | Auto-load as promised by “Valid links load automatically” | Still URL-only with Load videos; auto-load did not occur from request entry | Objective promise/state mismatch; P2; E6 |
| 16 | Add videos | Load videos | Fetch metadata without approval | Loading state then correct title, channel, 18 min; approval block with all children unchecked and disabled Approve selected videos | Safe default works; AX |
| 17 | Navigation | Time | See child time state | Initial checking text settles to stopped children vs no session timer, last-device information; no controls pressed | Keep; E7 |
| 18 | Time, Eli | Give time or set daily allowance | Inspect available configuration | One-time mode, quick/custom minutes, replacement/renewal warning, stopped-access caveat and wall-clock explanation | Keep; AX |
| 19 | Time | Discover permissions | Inspect discovery policy | Expands per-child Discover videos and allowed topics forms; no changes | IA recommendation: surprising location under Time; AX |
| 20 | Time | Available hours | Inspect schedule | Per-child from/until forms and current Available anytime; no changes | Keep; AX |
| 21 | Navigation | Library | Find approved videos | Family library with search, Child library filter, video cards and Preview/Manage/Remove | Keep; AX |
| 22 | Library | Child library → Eli | Filter read-only list | Three shared videos shown with all assigned children still visible; thumbnails finish loading | Keep; E8 |
| 23 | First filtered video | Manage | Open noncommitted sharing editor | Selects one video and opens “1 selected · Choose who can watch”; all assigned children checked, explicit access-retention warning, Save/Remove/Cancel | Keep; AX |
| 24 | Library editor | Cancel selection | Exit without changes | Editor disappears and selection clears | Keep; AX |
| 25 | Library tabs | Collections | Inspect organization | Two columns: collections list, full create form; 7 collections and checkbox list of 96 approved videos | P1 recommendation at scale; settled screenshot |
| 26 | Geometry Dash | Edit collection | Load current collection without save | Editor changes to Edit collection, current name and 57 selected videos; focus moves to editor | Keep; AX |
| 27 | Collection editor | Cancel edit | Revert only local editor state | Returns empty Create a collection form, selection clears | Keep; AX |
| 28 | Navigation | Family then Settings | Return to safe review page | Settings reached; tab marked deliverable | Keep; AX |

## Objective defects

**D1 — P1, misleading child library shortcut.** Overview advertises “Manage Eli’s library,” reached from a card headed by approved-video/request counts. The destination is `/parent/children`, a general profile settings page. There is no Eli-filtered video-management list there. A competent returning caregiver would reasonably expect the filtered Family library reached later at step 22. Rename this control to manage profile, or route it to the child-filtered library. Only one child's control was clicked; do not assume the rest were tested.

**D2 — P2, request review entry contradicts auto-load copy.** Review & organize transports the correct video URL to Add videos, but does not load details. The form says “Valid links load automatically.” A later explicit Load videos click succeeds. This is an extra predictable step and an inaccurate promise for this specific entry path. Load metadata on arrival for this path, or make the required next action clear. No failure fetching metadata was observed.

**D3 — P3, grammar polish.** Collection list shows “1 videos” for a one-video collection. Minor objective copy error, visible in settled Collections screenshot and AX. No behavioral impact.

## Strong product / UX recommendations (not approved scope)

**R1 — P1: make the Requests backlog operable.** At 93 requests, the interface provides one very long list with no visible search, child filter, type filter, or batch triage. Large vertical spacing means roughly two full items per desktop viewport. Attribution and actions are clear, but younger children's older requests are deeply buried. Add child/type/search filtering and a compact or paged queue; preserve per-item Preview and make destructive/approval semantics clear. This is a usability recommendation, not a failed functional claim.

**R2 — P1: searchable collection membership.** The collection editor exposes 96 titles in an internally scrolling checkbox list. Editing a 57-video collection requires remembering titles and scanning through ungrouped entries. Add search plus selected-only filtering and a visible selection count; consider a read-only collection detail view before editing. Nested scrolling and dense text reduce confidence at scale.

**R3 — P2: place Discover policy where a caregiver will seek it.** Search topic/channel permissions appear as a collapsed section under Time. They are conceptually content policy, not viewing time. Surface them under Family/child controls or cross-link them explicitly from Library or child profile pages. Current safety copy (“Every video still needs your approval”) is good.

**R4 — P2: prioritize settings for repeat visits.** The extensive iPad protection explanation occupies nearly the whole initial viewport; Parent PIN and device access sit below. Keep transparent limitations, but consider a concise status summary with expandable setup details. On desktop the lower left card continues while much of the right column is empty. This is visual/IA refinement rather than broken layout.

## Screen-by-screen visual review notes

These notes accompany native screenshots in the audit transcript; no exported image packet is claimed.

| Unit | Purpose / reach | Works | Confusion / recommendation | Disposition |
|---|---|---|---|---|
| E1 Settings top | Direct entry | Strong hierarchy, three distinct protection levels, legible cards, clear always-on state | Dense prose dominates repeat-use settings; optional level describes limitations more than an actionable option | Keep content; consider R4 |
| E2 Settings lower | Expand help, scroll | PIN and signout separated; comfortable type and borders; no misleading ad-free/offline claim | Narrow left help card and mostly empty right area; long page | Later visual refinement |
| E3 Overview | Overview nav | Useful three-action row; request count and attention callout; family photo recognition | Repeats 93 requests in several places; card library shortcut mismatch D1 | Fix D1; otherwise strong |
| Profiles | D1 destination | Roles and child configuration clearly labeled; Simple explanation useful | Long repeated cards, no actual library management despite previous entry label | D1; no photo export |
| E4 Requests | Requests nav | Thumbnails, attribution, title and readable grouped action row | Large spacing plus no filters makes 93 items burdensome; dates and metadata could be more compact | R1 |
| E5 Preview | Preview | Large centered modal, explicit Close, useful boundary explanation, real YouTube frame | Retry displayed even in loaded state; acceptable but secondary information adds height | Keep; playback not tested |
| E6 Add/request review | Review & organize | Correct prefilled URL; straightforward paste/search choices; safe unchecked approval defaults after load | Cold expectation was a ready review surface; auto-load promise inconsistent | D2 |
| E7 Time | Time nav, settled state | Clear child cards, stopped state, offline/check-in evidence, low ambiguity on scope | Page mixes timing with content-discovery policy; substantial caveat text | R3; enforcement untested |
| E8 Library | Library then Eli filter | Three-column cards, search and child filter, titles/channel/assignments, visible safe Manage/Cancel | Generic Family library heading while filter selected; reasonable because filter stays visible | Keep |
| Collections | Collections tab | Clear two-column organization and explicit Edit/Cancel; focus moves to editor | Long internal checkbox list and list/editor layout feel administrative; singular grammar D3 | R2 / D3 |

## Friction map and review guide

- Must fix P0: none established within read-only scope; this is not proof of absence outside scope.
- Objective correction queue: D1 child shortcut; D2 request entry load promise; D3 singular grammar.
- Strong recommendations: R1 queue scale, R2 collection scale, R3 Discover location, R4 repeat-use settings hierarchy.
- Later/beta observations: real iPad device restrictions remain manually confirmed; offline, Premium, and remote timer limitations are candidly explained. These claims were read, not independently verified.
- Keep: persistent navigation, request attribution, explicit preview no-add boundary, safe unchecked approval defaults, readable time statuses, Cancel selection and Cancel edit behavior.

For root synthesis: inspect D1 and D2 first, then compare backlog and collection usability at the observed real scale. Do not ask the Founder to arbitrate routine label/routing/grammar fixes. Product recommendations require controlling authority before becoming scope. The remaining independent persona reviewers and authority audit must determine broader acceptance. No Founder-only judgment question arose in this slice.

## Freeze receipt

Stranger skill read in full before use. Read-only journal frozen before implementation/authority inspection. No source inspected. No repairs. No saves, approvals/rejections, content edits, new requests, uploads, profile/role changes, recovery/signout, credentials/PIN entry, End/Give/Allow/Daily changes, or browser preferences changed. Only local read-only filters, help disclosures, preview modal, metadata load, and canceled editors were used. Parent pass released to root before any role review.
