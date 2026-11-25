# WatchNest P0 stability and requested-video Preview recovery

Status: repaired candidate staged; **RELEASE HOLD**. Actual Founder crash attribution, authenticated Parent workflows and exact-candidate physical acceptance remain open. Not Founder Ready.

## Candidate and infrastructure

- Application146a672f5b0744a13869dc29983e5942a0d7a233; src tree464c41e300e38b9c34cb4f6603f4f2019e4141c4; existing premium-ui-ux-20261103 / draft PR49 → product-completion-20260930.
- Configured stage dpl_6smmoFJWQdRMz4uRzfRqfzjMadKB READY, https://watchnest-pq53jywae-avromy.vercel.app . Native source metadata binds146a672f. Guest actual browser /api/session returned role:null, configured:true. Stage Parent sign-in renders normally, no captured entry page errors.
- Canonical https://watchnest-rho.vercel.app remains77a5017d938ded03b1530c2b72978cef27273d61 / dpl_GiRnmGhHRYnnq16jHEUGyxtjRNac. All three production aliases rechecked after new stage READY. Auto-assign domains visibly disabled/manual promotion required. No merge/promotion.
- Supabase existing ysukwpeowpcixdzkexky migration history read: daily20261118192923 and profile handoff20261119042334 present. Neither repeated; no DB/family settings/budget/content writes. Phase2 retirement remains unapplied.

## Separate incident causation

| Environment | Actually observed | Source-confirmed defect and repair | Uncertainty |
|---|---|---|---|
| Live77 / dpl_GiR | Existing trusted-device picker opened; no authenticated Parent/player journey or crash observed in this recovery. Bounded03:39–04:39UTC error/warning/fatal server query empty. | Source contains unguarded optional player localStorage read/write. Local storage-denial reproduction reaches the full route error boundary. New candidate catches optional preference failure and retains volume60. | No live stack/device incident trace ties the Founder's crash to this path. Empty server logs do not establish browser health. Known old profile-switch bypass remains in live; do not waive it. |
| Prior stage decd / dpl_Gy16 | Parent sign-in rendered, no captured entry console error; same separate bounded log query empty. | Same unguarded preference path present, repaired in successor146a672f. Missing preference previously Number(null)→0, silently muting initial sound. Explicit stored zero now remains respected. | No authenticated stage crash reproduced. Cause may differ from live. Device policy/filter, navigation/auth and provider/player failures remain unclassified until actual affected workflows can run. |
| New stage146a672f / dpl_6sm | READY, configured:true, Parent sign-in entry works. Bounded newstage15min server error query empty. | Repair deployed to isolated stage; local denied-storage regression passes. | Hosted playback/Parent incident journeys and physical Safari/iPad acceptance are OPEN. Never call this crash-free or production accepted. |

Storage reproduction: in an authorized synthetic browser context, replace window.localStorage getter with a SecurityError before opening an approved fixture player. Baseline shows “Let’s try that again / WatchNest couldn’t load this page.” `baseline/storage-denied/error-context.md` and `baseline/storage-results.json` preserve the genuine FAIL. Final `startup.spec.ts` verifies ready iframe, absence of route error and no pageerror; null/blank/corrupt preference defaults60, stored0/75 honored; quota-failing writes leave in-memory volume usable. This is an app-render crash reproduction, not proof of the Founder's physical cause.

## Requested-video Parent Preview

Old native details/summary Preview **opened successfully in local baseline390/820 fixtures**. Therefore the reported hosted inert click root cause is not proven. Source revealed a separate concrete weakness: every closed request disclosure mounted an eager unsized provider iframe, with no pending/retry state. This can create unnecessary player load, but memory exhaustion was not measured and is not claimed as RCA.

New explicit Parent-only button opens one responsive modal/player only on demand, with initial Close focus, parent-document Tab/Escape handling, scroll/focus restoration, unmount-on-close, pending/12second slow feedback, Retry and invalid-ID feedback. Conditional frame-load copy does not claim playable picture/sound. Preview makes no approval/assignment/request-resolution call and does not alter Child Player. Parent preview may show YouTube-controlled content; children still use the protected approved-only player. Existing Add Videos/Library previews remain unchanged.

Actual local mouse/touch/keyboard open/close/reopen, viewport bounds, frame teardown, slow/retry and zero-mutation assertions pass. Actual authenticated hosted click and provider playback are still OPEN. Cross-origin YouTube key events do not necessarily bubble to parent Escape handler; visible Close remains available.

## Functional sweep and repair

New collection creation in Inbox, bulk collection assignment and bulk removal previously awaited raw api/reload without handled rejection. They now catch failures, surface feedback, stop failed sequences and retain draft/selection. Per-request creation has a pending guard. Independent reviewer caught confirmed creation followed by failed refresh: visible select omitted the created ID while approval sent it. Repaired local confirmed option/title plus explicit refresh-failure wording; regression checks visible selection and approval payload after dashboard503. Bulk removal remains sequential and may partially succeed; no transaction claim.

Existing complete synthetic suite covers Parent navigation/inbox/topic request→lookup→preview→explicit approval, rejection/fulfillment controls, assignments/collections/findability, child local search/Ask Parent/Discover, Parent PIN and sibling handoff, one-time/custom/daily controls, server deadline and remote-stop teardown, mandatory containment/navigation rejection/readiness errors, network/auth denials and responsive widths360–1440. These are local/CI fixture and route tests, not real provider/family acceptance.

## Protected behavior

Server auth/RLS/approval/request ownership/device/profile matching and SQL/timer code untouched. No child playback route for unapproved videos added. No PIN changes, budget transfer, parent-block reset, daily rollover/autoplay or Made-for-Kids-derived tracking. 1/5/10 presets/custom positive minutes, Give Time versus Daily Allowance and local7AM server renewal remain existing tested behavior. Historical real-iPad picture/sound and containment observations remain bound to old ef4 only; historic profile-switch remote-stop failure remains preserved.

## Evidence inventory and scope

- Independent initial source investigation and final source/security report: `source-investigation.md`, `final-review.md`;89 targeted tests, final semantic-formatting equivalence binds reviewed src tree464c41e3.
- Full local396unit/29files PASS; lint/typecheck/build PASS; full npm audit0.95browser flows PASS on pre-final-P2 build. Final rebuilt146a672f19affected tests PASS (includes successful POST/failed-refresh regression);2additional touch+keyboard preview tests PASS. Original test errors retained: initial crash FAIL, then first-recheck16PASS/2harness failures (outdated nonexistent Play button and exact label locator); selectors corrected without dropping assertions about crash/error handling.
- Independent Human-Eye receipt `visual-review.md`: CLEAN only for two source-bound synthetic viewport rasters, regions6/6/assets14/14/edges56/56; initial incomplete receipt retained. Source/build/image/geometry manifests and readable images under visual/.
- Cold rendered review and CI outcomes are recorded in the final Resume/Qualification receipt when complete. No stale historical jury or prior cold verdict is promoted to this changed candidate. High-risk final jury/hosted cold qualification deferred while actual incident investigation may still require changes.

## Release hold, rollback and minimal human boundary

Sign into existing Parent account in the connected browser tab at exactstage /login?parent=1; enter existing PIN directly if prompted. Never send credentials/PINs in chat/email. No auth cookies copied, tokens minted or substitute accounts created. Then Builder independently runs authenticated incident/inbox/preview and allowed workflows, recording live77 and stage separately without changing real children's budgets.

Only after hosted qualification: one actual family-iPad/phone session on the frozen final stage. Verify approved picture AND sound first; stop at failure and record exact displayed error and filter/network context. Then observed recommendation containment, fullscreen Parent End now stops picture/sound and denies resume, Parent-authorized sibling handoff, timer presets/custom and distinct Give Time/Daily controls. Do not invent real-device PASS or ask Founder to perform routine QA.

After all applicable exact-candidate safety/independent gates pass, Founder already authorizes merge and promotion through existing PR49/canonical URL. Follow ProfileHandoffReleasePlan-20261119 and its atomic post-promotion legacy-admission retirement. Before phase2 old77 is compatible rollback; after phase2 rollback must preserve guarded v2 admission or fail closed, never remove barrier/unrevoke old sessions. No new migration required for this incident repair.
