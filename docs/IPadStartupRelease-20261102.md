# Frozen iPad startup repair — release receipt — 2026-11-02

## State

`WATCHNEST_IPAD_STARTUP_REPAIR_DEPLOYED_PHYSICAL_CONFIRMATION_REQUIRED`

Not `WATCHNEST_IPAD_PLAYBACK_RESTORED`; not Founder Ready. Exact physical
trigger and iPad picture/sound remain unverified. Builder 2 is the sole active
implementation owner; predecessor is historical/recovery only.

## Exact candidate and deployment

- Application/source: `77a5017d938ded03b1530c2b72978cef27273d61`.
- Source tree: `1e8948c714aab722b98f68dcfaf8540ac2d78d41`.
- Production branch: `product-completion-20260930` (main is older foundation).
- Production: `dpl_GiRnmGhHRYnnq16jHEUGyxtjRNac`, READY, exact commit verified.
- Canonical: https://watchnest-rho.vercel.app
- Project: `prj_tQi2cBAosldposlx61FcwnwDJ8OG`.
- Database: existing `ysukwpeowpcixdzkexky`; no schema/data/config mutations.
- Last migration remains `20261027134442_mandatory_safe_playback`.
- Rollback: `dpl_HAF2T6KASXZMTaQ86Z4LhKY5QD8i` / source `1bd5f18`.
  Baseline has known startup FAIL; it is not represented as family-usable.
  Never roll back mandatory Safe Playback enforcement.

This evidence-only successor does not change the frozen production application
or require another deployment. Follow exact application SHA above.

## Root cause and repair boundary

Verified source defects: unnecessary full-iframe-load prerequisite for API
attachment; no terminal latch after containment teardown; unbounded readiness
after construction. The photographed generic startup error is from promise
rejection, not the direct guard error. A late construction failure can overwrite
a guard error. The actual physical sequence is unknown.

Repair attaches the official API before full-document load, ignores only readable
initial about:blank, arms subsequent-load rejection before insertion, validates
the same expected iframe/origin/embed path, uses stopped/disposed/remote-block
checks and bounded readiness, and removes frames on construction/readiness
failure. No arbitrary second-load exemption or direct unmonitored fallback.
Sandbox/CSP, individual approval, sibling isolation, Parent Mode, native Play,
manual fullscreen, remote session control and Discover & Request are preserved.

## Evidence

GitHub CI run 125, run ID `41495076636`, job `125447764275`, exact source
`77a5017`: PASS lint, typecheck, 200/200 tests, optimized build, 32/32 browser
flows and production dependency audit (zero vulnerabilities). Browser suite
includes seven new startup regressions; real readiness deadline exercised in
20.3 seconds. Browser player/provider data are synthetic, not real YouTube or
physical-iPad certification.

Prior CI 124 on `8921d30`: 31/32 browser flows, readiness-timeout test failed
under virtual clock. Preserved as failed evidence; no production release followed
that run. Test-only successor uses actual browser time; application bytes did
not change. Local Chromium launch failed SIGTRAP before any case executed.
Local build/tests needed an unshipped memory-telemetry workaround because /proc
metrics are unavailable. Clean remote CI required neither workaround.

Independent technical reviewer `startup_review`: PASS for exact ChildPlayer
SHA-256 `9323dfeaf7f811be72328bb0cfdbb0f6d3453b69ae7f96acfbce7ea67bd3b42e`,
conditional on browser success, which subsequently passed. Reviewer found and
required repair of detached/replaced-frame failure suppression and exceptions
in onReady before deadline clearance. Both were repaired and covered.

Separate cold security reviewer `security_release_review`: qualified source
PASS, no new P0/P1 found. No physical/device/provider certification. Inherited
first-nonblank-load trust limit remains documented in
`IPadStartupRecovery-20261102.md`; load/CSP/polling are not native navigation
delegates or proof of zero-duration unapproved playback.

Hosted readback after production alias switch:

- Exact source/deployment/production aliases verified via authenticated Vercel.
- `/api/session`: HTTP 200, role null, configured true.
- Unauthenticated child player and parent dashboard APIs: HTTP 401.
- `/login`: HTTP 200 and sign-in content.
- Embed-only CSP: `frame-src https://www.youtube-nocookie.com/embed/`.
- Referrer policy and disabled PiP permission unchanged.
- Exact deployment warning/error/fatal runtime log query: no matching logs.
- Hosted database mandatory true constraint and household true verified.
- No reset or recreation of credentials, children, content, assignments or timers.
- Authenticated live family player is NOT verified; ordinary browser opens login.

## Skill coverage receipt

Current attached eight WatchNest governance files and live Founder Workspace,
CTO handoff, Master Registry, Project OS and Universal Router consumed.
Access-First Preflight V1.1, Infrastructure V1.1, Founder Attention, Continuous
Learning, Vercel deployments-cicd, Supabase and Browser instructions applied.
Product Intelligence applied as a background learning lens. Founder Ready
applied and remains BLOCKED on physical acceptance, not a READY verdict.

Independent source technical/security gates passed for the frozen application.
Synthetic responsive/loading/error regressions passed; no substantial UI design,
branding, icon, typography or reference-fidelity mutation occurred, so new
visual production/Match Check/Blind Jury cycles were not triggered. Existing
unaffected historical visual evidence is preserved, not recertified. Real
Safari/PWA/audio/native fullscreen gates remain open. No full family-beta
Skill Coverage PASS is claimed.

Learning is preserved in project recovery docs and linked from live Continuous
Learning authority as PROJECT/DOMAIN calibration, without changing universal
skill rules. No private family facts or credentials propagated.

## Minimum Founder-only observation and resume

One consolidated physical-iPad session against the frozen production URL:

1. Open the existing family profile and an already approved video; tap YouTube's
   native in-frame Play. Confirm picture and sound. If startup fails, STOP and
   report the exact visible message/device context. Do not run later gates.
2. Only after playback succeeds, tap a related/More Videos recommendation in
   normal playback and native manual fullscreen. No external YouTube and no
   unapproved video may play.
3. With approved playback fullscreen, use Parent phone Controls → End now.
   Picture and sound must stop; playback must remain denied.

Pending gates: physical approved playback, recommendations normal/fullscreen,
remote fullscreen teardown. Discover & Request has unchanged synthetic PASS;
no new real-device qualification is claimed.

If all pass: bind evidence to this exact deployment, reconcile final family-beta
coverage and close remaining acceptance without asking routine permission.
If any fails: reopen only affected startup/containment/native-shutdown lane;
preserve exact failure and same source before repair. If official PWA controls
cannot enforce the requirement, establish that with evidence and investigate
the narrowest thin native navigation/media-lifecycle correction; do not disable
protections or silently redefine the promise.

Founder action is unavoidable because no physical family iPad is available to
these tools. No other implementation/CI/deployment action is waiting for the
Founder. Source is frozen while awaiting that observation.

Deletion status: DO NOT DELETE YET while physical acceptance and final family
usability remain unresolved. Core recovery state is durable; this chat is not
the sole record.
