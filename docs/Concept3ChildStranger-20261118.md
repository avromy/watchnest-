# Concept 3 Child Stranger audit — 2026-11-18

## Verdict

**FAIL — bounded child gate, one objective missing capability.** Simple mode is not differentiated from Standard in the candidate. The older-child tasks are understandable and complete in the synthetic browser. No family-auth, hosted, real YouTube playback, physical iPad/Safari, or release PASS is asserted.

Independent reviewer `/root/concept3_cold_child` did not build this UI, edit app/tests/fixtures, read app source/specifications/Builder notes/prior reviews before freezing the first impressions and cold click journal. Initially read only `e2e/fixtures.ts` to install legitimate synthetic access and `scripts/browser-runtime.mjs` to launch Chromium. First impressions and initial meaningful clicks were frozen in the external evidence folder before authority consumption. Separate fresh browser context exercised Simple mode after that freeze. Parent audit is a separate lane; this report does not certify it.

## Exact candidate and evidence boundary

- Git `bd8d15d7220f5496e73a562c77b34ceb8aae2370`; tree `703feeffd9853782e914a23ff9728361bfe9ede6`; src tree `67fd57e88e9adb42ec2f795e1e6473fba650a40c`.
- Initially observed predecessor HEAD `671b77d5f9293a0c9e1be21463c4fcae5da7e8dd` plus uncommitted candidate. Root subsequently froze those app bytes at the SHA above; reviewer verified final SHA/tree and zero app/config/fixture diff. SHA256 of `git diff -- src public package.json package-lock.json next.config.mjs e2e/fixtures.ts`: `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` (empty). Documentation/evidence in other lanes remains independently dirty.
- Root 3033 unreachable from reviewer execution namespace. With explicit Root authorization, reviewer started existing `.next` using Next 16.4.6 at `http://127.0.0.1:3034`, inside the same persistent Node process as Playwright, explicit hostname 127.0.0.1. No rebuild/restart of Root server, deployment, or app mutation. Build ID `LrtvXS2RPOkTys53kVF1U0`; build-ID SHA256 `50950fe463103fe984f8398c5e178e5398d33203f2d04a5f2eb468c259238cf1`; Next executable SHA256 `db32609884270b06aaceae7df284f683af5e0ec715d9debaf0f9d444230ca74f`; runtime script SHA256 `fa9e3004a83b963a77bd990981c91cc9c9722baea3677d4e1509e93dda73525b`.
- Fixture original SHA256 `c37259e3fb7c900fc071f60315671757350786189f65d9a753c3253eb54e7f56`; TypeScript-transpiled external fixture SHA256 `c83998e2882d0355bd1f8b438d69ca238efde39daffd13757d034a6a7dd7c438`. Route fixture `fixture(page,'child')` and fresh `fixture(simple,'child','simple')`. All identities/media synthetic. Fixture returns Ari for any selected profile and accepts all PINs, so actual sibling identity isolation and credential rejection cannot be certified.
- Actual browser widths: phone390×844, tablet768×1024 portrait, tablet1024×768 landscape. Headless Chromium; no physical-device claim.
- External evidence: `/workspace/scratch/b4fb31747e8d/concept3-cold-child/`; exact hashes in `evidence-manifest.json`. Every PNG01–23 was actually opened through `view_image`; screenshot possession/DOM assertions alone were not used as visual acceptance. 10 captures transitional Opening state; picker confirmation is actual journal +01. Full-page captures21 can contain capture-time white tail; settled viewport22 shows no white-tail defect. No defect inferred from that capture artifact.

## Authority consumed after the cold freeze

`docs/Concept3AuthorityRecovery-20261118.md`; all eight `/workspace/scratch/b4fb31747e8d/project_sources/*.md` materialized from `/Apps/WatchNest/`; installed Stranger v1.1 SKILL via package `e1/skill-6aa085083b008191bdd83d5b75a785e7` (canonical resolution provenance supplied in AuthorityRecovery). This applied the independent rendered discovery, frozen click journal, product-authority reconciliation, adversarial states, objective/recommendation separation and visual packet gates. No claim of independently refetching canonical Dropbox authority. The bounded task uses child personas; parent/admin required coverage is delegated to the separate cold reviewer.

Core promise consumed: only approved individual videos, child-local approved-content search, no open YouTube results, sibling identity security, Simple/Standard age-aware UX, request to Parent without external results. Current Concept3 Premium Family Streaming supersedes green; there is no exact pixel Golden. Routine product decisions are delegated; no Founder decision needed for findings below.

## Findings and friction map

| ID/class | Evidence and implication | Disposition |
|---|---|---|
| D1 Objective defect / P1 | Fresh Simple fixture produces identical controls/layout to Standard: search, All videos, Favorites, Hidden, sort, full collection/list. Actual portrait15/phone16/landscape18 show no younger-child adaptation. Post-cold source corroboration: no `experience_mode` consumption in child components except model declaration; enum still supports simple/standard. Locked age-aware UX has regressed. | Must fix before child gate PASS; restore meaningful Simple presentation and independently recheck phone + both tablet orientations. No security/backend rewrite required. |
| R1 Strong product recommendation / P1 | Phone first video link starts y750.5; fixed nav starts approximately754 and masks initial thumbnail area. First viewport14 contains no usable video choice/title; child must scroll before choosing a video, despite only3 videos/1collection. Tablet landscape link starts y651.8; thumbnails are partial and titles below768. Portrait displays actual choices, so not globally unreachable. | Compress title/search/filter stack and collection region, or put approved video choices earlier. Objective geometry, but exact arrangement is product judgment. Do not call broken navigation or overlapping unscrollable content: scrolled17 proves cards can be reached. |
| R2 Strong recommendation / P2 | Ask Parent page08 defaults to expanded section labelled “Ask Parent another way” when it is the only request form available in this fixture. Slightly implies a missing primary path. | Rename contextual disclosure when discovery disabled, e.g. “Tell Parent what you’d like.” No blocker. |
| B1 Later/beta qualification | Synthetic auth/child always responds with Ari, including Benny selection; state resets on fixture GET, no actual backend persistence. | Do not diagnose cross-child leak from this fixture or claim authenticated isolation/persistence. Real hosted gates remain open. |
| K1 Keep | Large named animal profiles, clear PIN input/cancel, collection scope, Favorites heart, explicit Hidden+Restore/Undo, empty-search recovery, request confirmation, safe player failure with two recovery routes. | Preserve. |

No P0 security defect was discovered by this bounded simulated review. That is not security certification. Navy/lavender/coral hierarchy is coherent; titles and controls are readable. Missing thumbnails are deliberate fixture data, not a design defect. Cards become reachable by normal scrolling; bottom navigation remains usable. Open YouTube search/results were not exposed in the child paths exercised.

## Click-by-click journal

| #/persona | Visible state / exact action | Expected → actual | Friction / next action / PNG |
|---|---|---|---|
|1 Older / first visit|Who’s watching? named tiles → Ari|Own profile → Ari PIN dialog|Clear identity;02. Enter PIN next.|
|2 Older|4-digit PIN → synthetic1234|Library → Ari library3videos|Automatic completion understandable;03. Fixture accepts any PIN.|
|3 Older|Collections → Little Makers|Collection videos → two assigned videos|Matches. Open rocket next.|
|4 Older|Build a paper rocket link|Player → safe startup error|Fixture/session-access/player limitations;04. Back to Library recovery next.|
|5 Older|Back to Library link|Library → library|Matches. No external destination.|
|6 Older|Heart piano → Favorites|Save/retrieve piano → one piano|Matches05; no server persistence assertion.|
|7 Older|All videos|All cards → three cards|Matches. Overflow fox next.|
|8 Older|Fox ellipsis|Secondary action → Hide|Matches06; hidden inside menu keeps primary watch action clear.|
|9 Older|Hide Draw a friendly fox from your library|Remove locally → toast Hidden/Undo|Matches. First exact Hide automation role query failed because accessible name includes title; harness error, no user defect.|
|10 Older|Hidden tab|Retrieve hidden → fox only|Matches07. Overflow then restore next.|
|11 Older|Fox ellipsis → Restore|Return to main library → restored mutation|Matches; hidden false API payload.|
|12 Older|Ask Parent|Request path → topic/show/creator/video form|Clear purpose, mildly odd “another way” R2;08.|
|13 Older|Tell Parent → Dinosaurs for kids|Editable idea → text retained|Matches. Send request next.|
|14 Older|Send request|Parent queue submission → Sent to Parent|Matches09; actual topic/message mutation captured. No live Parent inbox assertion.|
|15 Older|Profile chip|Picker → Opening then profile picker|Matches;10 transitional. Exact Ari automation query failed because combined accessible name includes profile photo; harness-only.|
|16 Shared device|Benny tile|Benny own library → fixture responds Ari|Cannot test identity with fixture, not app leak finding. No PIN for fixture Benny as visibly indicated.|
|17 Older|Library search → zzzz no video|No local result → Nothing found + Ask Parent for query|Matches11. Clear query recovery next.|
|18 Older|Clear search|Restore list → three videos|Matches; phone14 initial,17 normal scroll prove reach.|
|19 Older|Resize tablet portrait then landscape|Responsive list →2 then3columns|No horizontal overflow;12/13. First content below fold landscape R1.|
|20 Younger / fresh context|Simple fixture → picker Ari → PIN1234|Younger library → same standard UI|D1;15/16/18. Separate context, not cloned older session.|
|21 Younger|Little Makers → search zzzz|Collection miss → Search all videos offered|Matches19.|
|22 Younger|← All videos|Broaden scope preserving query → all-video no result|Matches; query remains visible, clear it to recover.|
|23 Younger|Clear → Ask Parent → Ocean animals → Send (synthetic500)|Failure with idea retained → Synthetic offline, retained text|Matches20. Re-enable fixture then Send next.|
|24 Younger|Send request after route recovery|Success → Sent to Parent|Matches21/settled22. No duplicate server assertion.|
|25 Younger|Library → Favorites|No saved items → No Favorites yet; heart explanation|Matches23; user can return All videos.|

## Visual screen-by-screen packet / actual consumption journal

All references below are current actual PNGs in external evidence folder, not proposed renderings. The packet is also available as adjacent visual/commentary HTML `visual-packet.html`. All units were opened and inspected. No synthetic screenshot is presented as real family or hosted evidence.

| Visuals | Purpose / works / concern / disposition |
|---|---|
|01 picker;02 PIN|Large named choices, visible locks, clear focused PIN; keep.|
|03 library phone;14 initial viewport;17 scrolled|Content browsing; coherent hierarchy but no initial video choice; R1 strong recommendation.17 resolves four-edge/bottom reach concern by showing actual scrolled titles.|
|04 player recovery|Safe failure offers library/help; keep error UI; actual picture/sound unqualified.|
|05 Favorites|One saved card makes state clear; controls reachable by scroll; keep.|
|06 overflow;07 Hidden|Clear Hide/Undo/Restore; toast is temporarily over title region in07, feedback/undo visible; no sustained obstruction proved; keep.|
|08 Ask form;09 sent|Request meaning clear and confirmation explicit; R2 wording improvement.|
|10 transition|Opening state during profile navigation; only a loading-state record, not picker final certification.|
|11 empty search|Preserves query, offers Ask Parent; keep.|
|12 tablet portrait;13 landscape|Clear2/3column grid, no overflow; landscape meaningful video content below fold R1.|
|15/16/18 Simple|No age-aware simplification vs Standard; D1 must fix.|
|19 collection miss|Offers scope-broadening action; keep.|
|20 request failure;21 success;22 settled viewport|Entered idea survives failure, retry succeeds.22 resolves white tail seen only in full-page21; no white-tail defect.|
|23 empty Favorites|Heart instruction and navigation readable; keep.|

## Persona results, CTO actions and review guide

Older child can identify a profile, enter PIN, find collection/video, favorite/retrieve, hide/restore, ask, and recover from local miss/player failure. Scope **PASS with recommendations**, subject to synthetic limitations. Younger child can operate large controls but is given the same full management/search complexity; **FAIL D1**. Shared-device picker is understandable; actual isolation/persistence **UNQUALIFIED**, because fixture cannot emulate it. Parent review is outside this bounded lane and must be combined separately.

Builder next steps: restore meaningful Simple mode, reduce pre-content vertical cost (preferably for both child modes), retain clear recovery/Undo patterns. A fresh independent affected-area reviewer must verify the repair against the new source/fixture/build identity. No routine Founder decision needed. This frozen reviewer must not self-repair or silently rewrite this FAIL to PASS.

Review order after repair: Simple phone initial viewport → Simple tablet portrait/landscape → first playable choice reach → one video recovery → favorite/hide/restore → request error/retry. Hosted authentication, actual YouTube approved picture/sound, physical iPad Safari/native fullscreen containment and parent End-now picture/sound stop remain separate open acceptance gates.

Project learning: a visual rewrite can silently drop experience-mode branching even while all standard happy paths remain functional. Candidate-bound child review should compare both configured modes in fresh contexts, with actual visible first-viewport content, not only no-overflow assertions. Route this PROJECT/PROCESS observation through Root’s current learning authority; no global authority mutation performed by reviewer.
