# Real-device profile handoff safety failure — November 23, 2026

## Exact candidate and disposition
Founder-tested stage https://watchnest-gnwpficxx-avromy.vercel.app, dpl_CfHzBU3X4rHMv7zn3w7tNRQMNk1C, archive5859ade14dc053aac877ec992f9431c170abacf1 / src9c247f77cf64143c320b204587e2f3d1e7f487e4. Physical sibling handoff gate FAIL. Do not promote this stage. Canonical live freshly reread remains77a5017d938ded03b1530c2b72978cef27273d61/dpl_GiRnmGhHRYnnq16jHEUGyxtjRNac. No merge, promotion, aliases, migration, phase2 or family resets.

## Firsthand evidence (preserved)
Founder: “Picture and sound, fullscreen — Ari”
Builder positively verified Parent controls after native protected PIN submission, clicked Ari End now once. Parent controls settled to Stopped by Parent. At command time device status was offline/unconfirmed, last check-in5minutes; do not claim realtime delivery acknowledgement from that status.
Founder attached 3172DE4A-FD83-413B-9FE5-8EA55D13B328.png: actual mobile browser on stage suffix gnwpficxx-avromy.vercel.app, Ari header, “Time’s up for now”, Choose profile. Screenshot10:49. Private family avatar is not copied to repository/public evidence.
Founder: “I went to Miri's profile. I played a video. Then I went back to Ari's profile, and it should not have asked me for a password, but it did. And when I entered the password, it was still not able to, um, still not able to watch the video. So it was still blocked.”
Builder asked: “did entering Miri’s profile require your Parent PIN before you could play her video?”
Founder: “No”

Interpretation: approved audiovisual/fullscreen Founder-reported positive on this stage; visible stopped state and Ari restriction survives return including Parent PIN. Sibling entry without visible Parent PIN is a release-blocking physical observation. Audio cessation, exact fullscreen stop timing/no-resume, recommendation containment and remaining physical controls are not independently established by the screenshot. Do not mark whole physical gate PASS. Parent handoff PIN differs from optional child PIN; no wrong-child-PIN incident occurred.

## Read-only investigation
Fresh shared database reads, no credential/cookie/token/hash values retrieved: v2 child admissions on same device Ari15:43:04/15:43:40 → Miri15:50:41 → Ari15:51:27 UTC. Earlier sessions revoked appropriately. Recent ParentMode on same physical device created15:50:13, revoked15:50:35 UTC before Miri admission. Actual function definition retains transactional device/profile binding and ownership guards. These records confirm transitions and recent Parent authorization but do not identify the authorization method on each admission. They neither disprove the firsthand report nor prove that the source fallback below caused this exact historical sequence.

## Reproduced source defect and narrow repair
Exact5859/a292 source auth/child accepted a residual valid wn_parent, wn_refresh or wn_parent_mode session as implicit authority for a sibling change without a target Parent PIN. This was an intentional old contract, now incompatible with explicit PIN-configured profile handoff safety.
Three new actual-dispatch synthetic tests each FAILED before repair: expected403, received200. Repair permits the implicit verified full-sign-in enrollment fallback only when no Parent PIN is configured. A configured family now requires explicit target Parent PIN on this profile-entry route. Same-profile no-PIN entry remains ordinary; existing credential and abuse throttles, ownership, SQL atomic admission, timer restriction and explicit Parent-management view-as-child route remain intact. Explicit Parent management is still authorized through verified Parent authority; do not claim elimination of all residual Parent privilege or a matched historical RCA.

## Verification and evidence
Four focused suites79/79 PASS; full unit/database422/422 PASS,31files. Typecheck, build, full lint and production dependency audit0 vulnerabilities PASS locally. Existing full browser suite renewed, in progress at implementation checkpoint; hosted CI and exact successor hosted/device acceptance pending.
Independent read-only security review inspected exact5859 delta: narrow source PASS, physicalFAIL retained, exact cause unproven, integrated release HOLD. See ResidualParentHandoffReview.md.
Preserve CI172419/112 and existing hosted results at original scope; they cannot certify changed source. No UI/design/schema changed; keep Concept3 and previous no-PIN repair.

## Deterministic continuation
Finish renewed browser/CI checks and preserve failures; freeze exact successor, independently review it, create isolated production-configured stage only with verified saved manual-promotion guard and canonical pre/post readbacks. Do not reuse old5859 stage as repaired. Use existing Work Cloud Parent context if valid, no blind login loops. Perform no-PIN own return plus explicit sibling handoff and refusal with residual Parent authority on successor; no real credential guessing or stress tests. Then one bounded affected physical safety recheck. No routine design/PR/deployment approval required. Promote exact qualified successor only after all actual gates. Phase2 stays separately gated after canonical promotion. Ari's Parent stop is intentionally still in force; no Allow access, Give Time or Daily command was sent.
