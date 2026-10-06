# Final family beta — device protection and immersive playback candidate (2026-10-06)

## Current amendment state

The exact preceding production candidate remains live and recoverable while the
device-protection/immersive-playback successor is being qualified. The successor
adds three Parent-facing protection levels, best-effort fullscreen from the
original child card tap, a deterministic full-viewport WatchNest player,
eligible non-MFK immediate playback, and a one-tap fallback. It does not change
the Safe Playback sandbox or authorization boundary. Exact decisions and the
pre-amendment iPad evidence binding are in
`docs/DeviceProtectionPlaybackAmendment-20261006.md`.

Affected prior player and containment acceptance is stale for the successor
until its exact commit and deployment pass local, hosted, independent, and final
physical-iPad acceptance. Unaffected data/auth/security evidence remains valid.

The first fresh-context Stranger review rejected the frozen candidate for two
mobile Parent Settings defects: displaced Safe Playback feedback and an
offscreen active Settings navigation item. Both are repaired in the successor;
new 390 px regression checks verify adjacent status and visible active
navigation. The first FAIL remains recorded and cannot be promoted to PASS
without a fresh review of the repaired commit.

The first Human-Eye review independently found the same two defects plus a
1024×768 player overflow: the route rendered 808 px tall and pushed its Safe
Playback note below the initial viewport. The repaired viewport reservation
keeps the complete immersive surface at 1024×768; the exact raster and an
automated scroll-height assertion now cover the regression. The original
Human-Eye FAIL is preserved until the repaired commit receives a fresh pass.

## Exact binding

- Working URL: https://watchnest-rho.vercel.app
- Production commit: `646d67b6e1b0bd15bcd01888cba93fb4daf6892d`
- Production tree: `feebbaf8336b5e26b96901a3d6462ab7f10c1ab1`
- Production deployment: `dpl_HjEH8DasFG4adQ1UqEt4r7pJ2hPS` (READY, target `production`, alias confirmed)
- Rollback deployment: `dpl_EYQ26gv4KazVkMiLsarYiWGe8mG8` / commit `d9df9a81637a2b23c6def20bfda78d73e2863580`
- Hosted schema: `20261005000000_final_family_beta` plus follow-up hidden-video FK index; Safe Playback is ON for the Founder household.
- GitHub: PR #35 merged into the configured production branch `product-completion-20260930`. The exact successor passed typecheck, lint, 182 tests, production build, and 12/12 browser flows.
- Independent security: PASS. Independent Stranger: PASS. Human-Eye V2.0: PASS for six exact rendered product rasters, with the synthetic-fixture limitation preserved.

## Current OS / infrastructure-autonomy refresh

Consumed live on 2026-10-05: AI Project Operating System — START HERE; Existing
Project OS Migration; Operating-System Router — Universal; HQ + Builder Project
Launch System; Current Skill & System Registry; AI Operating System — Master
Control Layer; and Autonomous Infrastructure & Credential Operations V1.1
(effective 2026-10-05). This project remains an EXISTING GOVERNED PROJECT in
Builder (Work), with HQ-owned acceptance and independent reviewer separation.

V1.1 incident response found no unreadable or invalid secret. The live failure
was configuration **scope**, not credential value: the public production domain
had been manually assigned to preview deployment `dpl_HF2fKpkNVKTwEy1C2ZBTJg2r9jYq`
(`target: null`), while all five required variables were correctly restricted
to the `production` target. Live `/api/session` returned `configured:false` and
Founder login POSTs returned 503 before Supabase Auth or household lookup.

Repair: merge the already-qualified PR into Vercel's configured production
branch, producing deployment `dpl_EYQ26gv4KazVkMiLsarYiWGe8mG8` at merge commit
`d9df9a81637a2b23c6def20bfda78d73e2863580`. Vercel moved
`watchnest-rho.vercel.app` to that production-target artifact. Post-repair
`/api/session` returns `configured:true`; a same-origin negative login reaches
Supabase Auth and returns the normal generic 400 response rather than setup 503;
runtime errors are empty. No secret was decrypted, exposed, rotated, or copied.

Read-only hosted integrity proves one confirmed, password-backed, non-banned
Auth user linked to the one Parent/household; family code, configured Parent PIN,
Safe Playback ON, four active profiles, 18 approved videos, 18 active assignments,
one Collection, and Miri's two assignments are preserved. No family data was
recreated or mutated.

## Founder real-device evidence and player refinement

The Founder reached an approved video on an iPhone with Safe Playback ON, tapped
the YouTube external/exit control once, and no external destination opened. The
Founder remained in WatchNest. This is real-device iPhone evidence bound only to
the preceding production candidate `d9df9a81637a2b23c6def20bfda78d73e2863580`,
deployment `dpl_EYQ26gv4KazVkMiLsarYiWGe8mG8`, production household configuration,
and Safe Playback ON. Browser/version was not separately reported. It is not
iPad certification and is not promoted to the successor's audiovisual evidence.

The successor centralizes direct-embed and IFrame API parameters. It keeps
native controls, fullscreen, keyboard controls, captions preference and volume;
adds supported `iv_load_policy=3`; and preserves `playsinline=1` plus `rel=0`.
It deliberately omits deprecated `modestbranding`/`showinfo` and does not set
`controls=0`, `fs=0`, or `disablekb=1`. Prior player-chrome screenshots and
parameter assertions are stale for this successor. Fresh exact-source regression
proves the parameter contract and Safe Playback ON/OFF inverse; responsive player
rasters were regenerated at 390×844 and 1024×768 and passed deterministic visual
inspection. Hosted `/api/session` returns `configured:true`, the public HTML is
bound to deployment `dpl_HjEH8DasFG4adQ1UqEt4r7pJ2hPS`, and the deployment has no
runtime errors in the observed post-release window.

## Release state

The final family beta successor is deployed and the production setup defect remains repaired. Safe Playback is Parent-controlled and default ON. The exact-source browser regression executes title, logo, app/deep-link, and `window.open` attempts inside the exact sandbox and proves that the child page does not navigate and no tab opens. Safe Playback OFF is separately verified to remove containment without changing video authorization.

One evidence item remains genuinely device-bound: on the authenticated family iPad, confirm that a normal YouTube-player exit tap cannot leave the production WatchNest child player. The cloud browser cannot receive the temporary HttpOnly child-session cookie, while the terminal browser cannot reach Vercel; neither limitation is promoted to real-device proof. Terminal state remains pending only this minimum Founder observation. No routine QA is delegated to the Founder.

## Human-Eye V2.0 coverage receipt

- SOURCE_IDENTITY: `de1e82f5443fbfe6e315eb47e5f30014d1d1b653` / production deployment above
- REGION_COVERAGE: 6/6
- BOUNDED_ASSETS: 6/6 — A01 profile picker, A02 child Home, A03 Parent overview, A04 Children, A05 Settings, A06 Add Videos
- ASSET_EVIDENCE_CONSUMED: A01–A06
- READABLE_VIEWS: 6 required / 6 consumed
- STRUCTURAL_RECORDS: 6 required / 6 consumed
- EDGE_GATES: 24 resolved / 24 required
- APPLICATION_BINDING: exact rendered Next.js candidate with synthetic API fixtures; not claimed as authenticated-device or YouTube-thumbnail evidence
- UNRESOLVED_CONFLICTS: 0
- HUMAN_GATES: alignment, optical centering, spacing/rhythm, grouping, hierarchy, contrast, crop/story, and gestalt PASS
- CONFIRMED_DEFECTS: 0 after Hide placement, Privacy Safe-state copy, and Dashboard grammar repairs
- POSSIBLE_CONCERNS: sparse approved libraries naturally produce open space; no functional or hierarchy defect
- FINAL_RESULT: PASS for product visual acceptance

## Honest platform limits

- YouTube Premium/ad entitlement is not exposed to WatchNest; ad-free playback is not promised. Parent OAuth is not treated as Premium transfer.
- Initial player volume is 60% where the IFrame API honors it; iPad system volume remains authoritative.
- Ordinary YouTube media is not downloaded, cached, proxied, or rehosted; offline/Travel Mode is platform-limited.
- No official YouTube Kids approved-library import API was found. WatchNest provides assisted multi-link migration without scraping.
- Exact minute budgets are not claimed for Made-for-Kids/unknown content; access windows remain the compliant control.
- Shorts are excluded for explicit Shorts URLs; official search provides no authoritative Shorts flag for perfect classification.
- `npm audit` reports an upstream high-severity `braces` advisory through development-only Tailwind 3 tooling with no non-breaking patched release. It is not in the production runtime; no forced Tailwind 4 migration was introduced.

---

# WatchNest UX redesign — Founder Review Ready (2026-10-02)

## Terminal state

`WATCHNEST_UX_REDESIGN_FOUNDER_REVIEW_READY`

- Working URL: https://watchnest-rho.vercel.app
- Exact application commit: `dfa009cdebb181173108f8a6ab636ff2ab0d4771`
- Exact production deployment: `dpl_J8apogrsymnFPYvPTvtT8kVrPv5Q` (READY)
- CI: GitHub Actions run 74 / `37048418159` — PASS (lint, typecheck, unit, build, E2E, high-severity production dependency audit)
- Rollback candidate: `dpl_5U6Pybp2tVLLKj9FyeXtYwtzzxhs` / `0f0269a2954948edb54680ad68c4a3680e7e8862`
- Runtime errors: none in final observation window.
- Temporary verification device, Parent Mode, and child sessions: exact token hashes deleted; post-cleanup counts all zero.

## Final acceptance binding

- Founder real-device playback evidence: picture and sound played.
- Founder-set Parent PIN: verified through the real Parent Mode flow without recording the PIN value in project evidence.
- Human-Eye: PASS on the exact candidate; 0 confirmed application-controlled defects.
- Stranger/cold review: PASS; prior tablet-nav, implementation-copy, and title-glyph blockers closed.
- Security/regression: PASS; household-device binding, Parent Mode revocation, sibling isolation, Parent PIN mutation protection, and MFK safeguards remain intact.
- Exact 1024 evidence: Parent navigation is one intentional row; Miri Home titles contain no replacement glyphs and no horizontal overflow.
- Managed verification proxy does not render cross-origin YouTube thumbnail pixels; production player playback and real-device audio/video evidence remain separately valid.

## Policy boundary

WatchNest enforces optional access windows with wall-clock authorization. It does not reconstruct watch-duration telemetry for Made-for-Kids or unknown-classification content. Exact daily minute accounting is therefore intentionally not claimed.

# Product/UX acceptance reopened — 2026-10-02

CURRENT: the exact qualified playback baseline remains the parent of branch `ux-redesign-20261002`; Founder real-device evidence confirms picture and sound played. Playback/security evidence remains valid where unaffected. Product/UX/visual acceptance is reopened because recurring family use exposed setup architecture, internal taxonomy and unnecessary steps.

The successor candidate in this branch implements the recurring-device profile picker, Parent Mode protection, private photos/avatars, four-digit child PIN UX, one adaptive child experience, Collections-only taxonomy, Home/Library/Ask Parent, approved-only Favorites, Parent Preview/View as Child, channel/playlist discovery, bulk Collection assignment, multi-URL intake, duplicate intelligence, policy-safe access windows and PWA launch. Hosted additive migration `20261002035922_household_device_ux` is applied to project `ysukwpeowpcixdzkexky`; post-write counts remain 1 Parent / 4 profiles / 35 videos / 5 assignments / 1 Collection. No production application deployment has yet been changed.

Local gate: typecheck PASS; lint PASS; 170 tests/22 files PASS; production build PASS; 11 Playwright flows PASS across desktop/tablet/mobile. Generated visual evidence is diagnostic until exact deployed Human-Eye/Stranger review. Exact commit/tree/deployment/CI will replace this paragraph after remote readback. See [UXRedesign-20261002.md](UXRedesign-20261002.md).

# Playback acceptance reopened — 2026-10-02

CURRENT: repair commit `267828ded150d4a565e9548458d4127f9d2a8f06`, tree `962e823767d0613a8283303ca3958db42fac3313`, CI run 61 and deployment `dpl_3qW2FtxMorGVUpCYqhdSuZmeskaZ` are exact and READY. Live inspection proved the direct production embed architecture but rejected the original PBS KIDS asset for a YouTube country restriction. That asset is unavailable with soft-removed assignments. Replacement official PBS KIDS upload `bfYpGhz1zdY` is assigned only to Miri; Ari is empty/denied and Miri receives a normal embedded Play surface. Audience status is unknown, so tracking/resume fails closed.

Cold review of that deployed repair returned FAIL: actual iPad audiovisual playback remains unverified, direct iframe load was overstated as readiness, Parent Preview needed explicit verification guidance, protected Parent chrome flashed before redirect, and Parent Library overflowed at iPad portrait width. The successor commit containing this checkpoint repairs every deterministic UI finding and extends responsive regression. It is not accepted until exact successor CI/deployment and fresh cold review complete. YouTube native links/recommendations are an explicitly disclosed provider boundary; official rules prohibit obscuring them.

Founder real-device evidence confirms authentication, Miri's populated library and player-route navigation but shows playback failure. The prior real-playback gate is STALE/FAIL. Exact pre-repair deployment `dpl_5TTgS86tuebcM48Q8PHUQJVEojKZ` at source `5482e56842d0dc3dd7945030dcf934b44130a125` remains the rollback target.

The repair candidate is the commit containing this checkpoint. It removes the unnecessary YouTube IFrame JavaScript API dependency from Made-for-Kids playback, preserves direct official privacy-enhanced embedding and explicit client identity, falls back to direct playback when optional non-MFK resume bootstrap fails, classifies actual player errors, and adds Parent Library Preview. Local lint, typecheck, 167 tests, production build and ten browser tests pass. Deployment/live audiovisual/iPad/visual/independent evidence remains pending and must bind the repaired candidate. See [PlaybackFailure-20261002.md](PlaybackFailure-20261002.md).

# Previous hosted checkpoint — 2026-10-02

LATEST: runtime candidate `abd02f0a95e4fc6dc4d52acc86feea8e9b5b7132`, tree `21a4410e020d3a113554121ed7aadbaa51c0a494`, CI run 57 successful and production deployment `dpl_RmmefptK3oaJcbiKQDtKhjNBCAYk` READY. Hosted migration `20261002020000_atomic_child_admission` is applied. A private server-only YouTube key is configured and real production metadata resolution succeeds without client exposure. All four child profiles intentionally default PIN protection OFF; optional Parent-controlled PINs remain implemented. A real official PBS KIDS Made-for-Kids video is assigned only to Miri; Miri access succeeds, sibling access is denied, and restricted per-child tracking stays disabled with zero rows. See [Qualification-20261002.md](Qualification-20261002.md) for exact evidence and limits.

Independent review found no confirmed P0. The child-session/security-settings race was repaired transactionally and independently rechecked. The remaining release gates are a securely authenticated real Parent UI traversal, live PIN-ON rotation, successful audiovisual playback/escape-path observation, real iPad Safari and complete Human-Eye/Stranger acceptance. Cloud-browser playback is not promotable because its proxy strips the Referer YouTube requires and produces Error 153. Current first unfinished action is secure Parent-session establishment; child PIN creation and Google Cloud setup are not blockers.

## Previous hosted checkpoint — 2026-10-01

LATEST: owner has completed confirmed Parent sign-in and all four locked profiles exist live. LiveParent-20261001.md records bounded authenticated-render, persisted identity and anonymous HTTP denial evidence. Four personal PINs and YouTube key still require owner-only credential actions. RawResumePolicy-20261001.md controls all earlier analytics statements: derived viewing metrics are disabled for all videos; only bounded raw functional resume under fresh non-Made-for-Kids classification remains. Dashboard shows WatchNest-owned library/request records. Sixth compatible migration must precede successor deployment. Current Notion handoff binds exact candidate/schema/CI/deployment; older setup/account-count/metrics language below is historical and superseded.

Dedicated WatchNest database is configured; see [Hosted database receipts](HostedDatabase-20261001.md). Five source migrations and the separate retention scheduling operation applied. Hourly job1 actually succeeded at 2026-10-01T03:17:00Z. Live RLS/grants inspected. Production is READY at https://watchnest-rho.vercel.app on candidate `12c7051351ebde40fd7ce3ca674bea97be87d920`, deployment `dpl_93GTqMsTLZfpXGxRVb4L6RfouG9q`. Existing Supabase private production environment and exact authentication URLs are saved. This overrides historical unconfigured/pending text below. No Parent account, live child profiles, YouTube key or family usability proof yet. Default Supabase recovery-link compatibility is being repaired; affected tests/deployment must rerun before acceptance.

# Durable run-state / deliverable contract

Recovery successor in this commit verifies refresh credentials with an explicit server refresh grant and real-SDK handler regression coverage. Local150tests/19files plus lint/typecheck/build pass. Independent original review in RecoveryAuthReview-20261001.md; current Notion handoff binds successor rereview/CI/deployment rather than carrying60673a acceptance forward. Current practical owner action is Parent credential creation, not Supabase project creation.

Project: WatchNest; Product/App; avromy/watchnest-. State: IN PROGRESS — account-owner access pending. Not a shipping/Founder Ready terminal. Latest implementation is the commit containing this file on product-completion-20260930, draft PR26. Parent source candidate8bc07527dbe5eac5e4c194aaa327b5a36440f690; main baselinefdb0de994e81b81e92b596332d3fcfc68eb53334 preserved. Notion CTO handoff records exact successor SHA/tree/CI after remote readback.

## Completed / preserved

Prior end-to-end implementation, product research, UI and tests retained. Resumed independent source/SQL review found and repaired logout admission-throttle interference, missing transactional metadata freshness and dashboard historical-restriction leakage. Service-only metadata-retention function plus bounded rollback-ready scheduler operation prepared and independently tested. Actual hosted activation is not claimed. Security reviewer isolated context; root did not impersonate cold visual reviewer.

## Deliverable and acceptance ledger

| Obligation                                           | State / evidence                                                        | Next exact action                                                                                                                                                                      |
| ---------------------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Current authority /8projectfiles /AppDevinstructions | COMPLETE recovery; SkillInvocationLedger                                | Continue designated hierarchy, never old permission request or .old package.                                                                                                           |
| Repaired code/migrations/tests                       | COMPLETE locally; remote durability requires readback                   | Persist existing branch, check same tree/CI. Never reset good work.                                                                                                                    |
| Independent source security                          | COMPLETE bounded report,52independent tests                             | Hosted provider/cookie/two-household denial/revocation validation after setup.                                                                                                         |
| Parent Dashboard policy safety                       | COMPLETE source/history filtering and own-workflow backend counts       | Review/qualify applicable non-MFK metrics and privacy disclosures; present own workflow clearly in real parent UI. No restricted watch reconstruction.                                 |
| Metadata schedule                                    | PREPARED, not live                                                      | Verify dedicated project/cost/extensions/jobs/backup, apply4migrations, activate named job, inspect real run.                                                                          |
| Supabase /Vercel /YouTube                            | PENDING external account access; partial connector operations qualified | Secure sign-in/consent handoff. Inspect plan cost; no paid creation. Existing unrelated projects untouched.                                                                            |
| Parent +Miri/Ari/Benny/Eli live access               | LIVE profiles; PINs intentionally OFF by default                        | Verify direct PIN-off entry, server-bound identity and sibling assignment isolation on the current deployment. PIN configuration remains available later in protected Parent controls. |
| Real complete product spine                          | MISSING hosted evidence                                                 | Ingest/preview/approve/assign/login/search/embed/permitted progress/resume/NextUp plus unauthorized denials against exact deployment.                                                  |
| Visual package /current specialist coverage          | UNRESOLVED qualification; currentV2.0 protocol retrieved                | Finish current exact packages and app adaptation; do not silently replace incomplete source with older package. Preserve existing UI while resolving.                                  |
| Human-Eye /Match /Blind Jury /cold Stranger          | MISSING current full evidence                                           | Bind complete actual screens/assets/states to exact source/deployment/schema; independent firewalls and explicit evidence consumption.                                                 |
| Actual YouTube player /Safari                        | MISSING                                                                 | Observe branding/links/pause/end/fullscreen/PiP/autoplay; Founder real-device check only when product ready. Chromium is not iPad.                                                     |
| Founder package /release                             | MISSING                                                                 | No working URL/credentials claim until real usable family access and acceptance; then concise package.                                                                                 |
| Continuous Learning                                  | COMPLETE project capture; broader proposals unpromoted                  | Propagate bounded lessons to current Notion project authority; do not mutate unrelated universal manuals blindly.                                                                      |
| Recovery/deletion                                    | PENDING durable readback/recovery test                                  | Verify GitHub tree, Notion checkpoint, invocation/learning links and continuation; CLEAR only after no unique material remains in chat.                                                |

## Mutation / rollback / recovery

No hosted deployment/database mutation was performed. Migrations are append-only. Before live writes record exact project/environment, last known-good source/schema, backup availability, planned mutation and post-write verification. Freshness rollback uses preceding function definition; retention schedule rollback unschedules only its named job, not extension/other jobs. Reacquire expired third-party metadata officially; never restore expired caches as rollback. Preserve approvals/assignments.

## Next dependency-aware queue

Secure account-owner access → verify no-cost dedicated services +server secrets → actual schema/Auth/metadata job → deployed spine/isolation → bounded UI/dashboard completion → actual player/tablet/failure/accessibility QA → current independent visual/product/security acceptance → real iPad evidence → release/Founder package → durable closeout.

Independent authority recovery/research/receipt work may continue around a blocked account lane. Do not declare whole-project HARD_BLOCKED merely because cost/deploy connector fails. The absence of a live deployment prevents those acceptance claims, not further safe implementation.
