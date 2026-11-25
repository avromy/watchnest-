# Own active PIN-off entry — browser regression receipt

2026-11-23. Independent test author; production source untouched by this reviewer. Controller source freeze1c1228faef321e8cc3a4b30429a64e6897977575; exact actual build/source hashes in final-binding.json. Built app was frozen before green execution; later test/config-only corrections did not change production application.

Command: `npm run test:e2e -- --config docs/no-pin-lockout-20261123/browser/no-pin.config.mts`. Isolated port3127; worker1; isolated results/ and results.json. Final result7/7PASS in6.0seconds.

| Case | Actual asserted behavior |
|---|---|
| Own active PIN-off + reload | Benny enters directly without a PIN dialog; admission body contains neither passcode nor parentPin; picker reload and admitted-library reload retain expected synthetic profile; one admission. |
| Slow admission + repeated taps | Request deliberately held; own profile disabled; visible role=status Opening library…; Parent Mode disabled; eight real pointer taps send no extra request; after release one successful admission with no credentials. |
| Network rejection + retry | Injected network failure exposes main-region error, restores enabled profile, remains picker without PIN dialog; retry admits with no credentials; zero unhandled pageerror. |
| Offline/reconnect | Browser offline state plus synthetic route internetdisconnected failure exposes error and retryable profile; reconnect retry succeeds; both requests credential-free. Route mocks alone do not certify real network/service-worker behavior. |
| Sibling PIN-off | Eli still requires explicit Parent PIN handoff; no admission before synthetic1234; submitted parentPin and no child passcode. |
| Parent Mode | Explicit PIN dialog remains required; no parent/admission call without entry; cancel restores picker; no reset/clear/unlock call. |
| Remote End now denial | Synthetic authoritative403 denial remains after retry and picker reload; no admission to library; no PIN dialog; no reset/clear/unlock/session-start call. This proves UI honors fixture denial, not real server remote-session enforcement. |

Actual build `aYe4z0JOy0gpJ3IlJFL44`; ChildLogin SHA-256`a8dcb36c915947e2c8d01baced28cb1d2fa7bd7e0dc1f911fe5cfcb4cac48e1e`; ParentApp`481d38751ffe040e815f14e97ac12cda3b0304572235210668a9cf8337fb9a61`; server product`9431d13f8281a9f67076659c6733b3b3082737278bdc3eb9729192e9cbe12bcc`. Final test file SHA-256`2c3c85e04ee2131b18c631fec844b6984b7fe1e3b9d63ae9dd4155854b4e4707`; configuration`435956842850edc322843106e5fcb71e111f87b053f4cfe5873a5d81508f8038`.

Four viewport screenshots and per-image binding JSON materialized here: own-no-pin-home-reloaded, own-no-pin-slow-pending, own-no-pin-network-retry, own-no-pin-parent-ended. Each image SHA-256 was recomputed and matched binding; source/build binding also matched current actual files. Full source/test/result/image hashes in final-binding.json. No Human-Eye CLEAN or independent auth acceptance is claimed for screenshots produced by this test author.

Two harness failures preserved transparently: harness-failure-results(.json) contains7browser launch failures before application actions due .mts/base-default-import configuration losing executablePath; fixed self-contained config using existing WATCHNEST_CHROMIUM runtime. locator-failure-results(.json) contains6PASS/1strict-alert locator failure because Next route announcer is also role=alert; narrowed assertions to semantic main-region alert, retaining exact expected text and behavior. Final7rerun all green; no production repair made for either harness failure.

These are synthetic browser contracts, no real family attempts, no actual auth counter mutation, no provider/deployed/device proof. Own profile PIN-off requests are not wrong-PIN attempts. Backend admission/rate-limit/counter correctness, real Parent recovery audit/authority behavior and independent rendered Parent recovery UI require their own evidence. No claim that counters were cleared or should be cleared. Material source changes invalidate affected green evidence.
