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

| Obligation | State / evidence | Next exact action |
|---|---|---|
| Current authority /8projectfiles /AppDevinstructions | COMPLETE recovery; SkillInvocationLedger | Continue designated hierarchy, never old permission request or .old package. |
| Repaired code/migrations/tests | COMPLETE locally; remote durability requires readback | Persist existing branch, check same tree/CI. Never reset good work. |
| Independent source security | COMPLETE bounded report,52independent tests | Hosted provider/cookie/two-household denial/revocation validation after setup. |
| Parent Dashboard policy safety | COMPLETE source/history filtering and own-workflow backend counts | Review/qualify applicable non-MFK metrics and privacy disclosures; present own workflow clearly in real parent UI. No restricted watch reconstruction. |
| Metadata schedule | PREPARED, not live | Verify dedicated project/cost/extensions/jobs/backup, apply4migrations, activate named job, inspect real run. |
| Supabase /Vercel /YouTube | PENDING external account access; partial connector operations qualified | Secure sign-in/consent handoff. Inspect plan cost; no paid creation. Existing unrelated projects untouched. |
| Parent +Miri/Ari/Benny/Eli live access | LIVE profiles; PINs intentionally OFF by default | Verify direct PIN-off entry, server-bound identity and sibling assignment isolation on the current deployment. PIN configuration remains available later in protected Parent controls. |
| Real complete product spine | MISSING hosted evidence | Ingest/preview/approve/assign/login/search/embed/permitted progress/resume/NextUp plus unauthorized denials against exact deployment. |
| Visual package /current specialist coverage | UNRESOLVED qualification; currentV2.0 protocol retrieved | Finish current exact packages and app adaptation; do not silently replace incomplete source with older package. Preserve existing UI while resolving. |
| Human-Eye /Match /Blind Jury /cold Stranger | MISSING current full evidence | Bind complete actual screens/assets/states to exact source/deployment/schema; independent firewalls and explicit evidence consumption. |
| Actual YouTube player /Safari | MISSING | Observe branding/links/pause/end/fullscreen/PiP/autoplay; Founder real-device check only when product ready. Chromium is not iPad. |
| Founder package /release | MISSING | No working URL/credentials claim until real usable family access and acceptance; then concise package. |
| Continuous Learning | COMPLETE project capture; broader proposals unpromoted | Propagate bounded lessons to current Notion project authority; do not mutate unrelated universal manuals blindly. |
| Recovery/deletion | PENDING durable readback/recovery test | Verify GitHub tree, Notion checkpoint, invocation/learning links and continuation; CLEAR only after no unique material remains in chat. |

## Mutation / rollback / recovery

No hosted deployment/database mutation was performed. Migrations are append-only. Before live writes record exact project/environment, last known-good source/schema, backup availability, planned mutation and post-write verification. Freshness rollback uses preceding function definition; retention schedule rollback unschedules only its named job, not extension/other jobs. Reacquire expired third-party metadata officially; never restore expired caches as rollback. Preserve approvals/assignments.

## Next dependency-aware queue

Secure account-owner access → verify no-cost dedicated services +server secrets → actual schema/Auth/metadata job → deployed spine/isolation → bounded UI/dashboard completion → actual player/tablet/failure/accessibility QA → current independent visual/product/security acceptance → real iPad evidence → release/Founder package → durable closeout.

Independent authority recovery/research/receipt work may continue around a blocked account lane. Do not declare whole-project HARD_BLOCKED merely because cost/deploy connector fails. The absence of a live deployment prevents those acceptance claims, not further safe implementation.
