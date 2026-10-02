# WatchNest qualification checkpoint — 2026-10-02

## Exact authority

- Runtime candidate: `abd02f0a95e4fc6dc4d52acc86feea8e9b5b7132`; tree `21a4410e020d3a113554121ed7aadbaa51c0a494`.
- Production deployment: `dpl_RmmefptK3oaJcbiKQDtKhjNBCAYk`, READY at <https://watchnest-rho.vercel.app> and bound to that candidate.
- GitHub Actions: run `36953158818` (run 57), successful for the exact candidate.
- Hosted schema includes append-only migration `20261002020000_atomic_child_admission`.
- Current production YouTube credential is stored privately server-side. Its value is absent from source, documentation, evidence and client bundles.

## Completed and reverified

- Local acceptance: 159 tests in 20 files, seven synthetic E2E tests, lint, typecheck and production build pass. Production dependency audit reports zero vulnerabilities.
- All four locked profiles default to PIN protection OFF and can enter without a child PIN. Parent controls can independently enable, change, reset or disable a child PIN.
- PIN state updates and child-session admission now serialize on the same profile row. The hosted transactional migration was applied and rollback-tested. An independent security rereview found no P0/P1 in the repaired candidate.
- A real official PBS KIDS video (`JZW3fNvqGIA`) was resolved through the production YouTube API, approved and assigned only to Miri. Miri's library/player API returns it; Ari, Benny and Eli receive 403 from the same player endpoint.
- The selected video is classified Made for Kids. Progress submission returns `trackingDisabled: true`; hosted `watch_progress` and `viewing_events` contain no rows for it. WatchNest does not reconstruct restricted viewing analytics.
- YouTube thumbnail delivery was normalized to `img.youtube.com`; the repaired production card rendered at natural size 480×360.
- Desktop child-library measurement at 1363×936 found no horizontal overflow; card 397×334, search 620×53 and navigation height 48.
- A cold Stranger review traversed household selection, all four “No passcode needed” states, Ari PIN-off entry, Miri's populated library/search and Ari's empty/denied sibling state. It found no confirmed P0. A separate security reviewer independently verified the exact repaired candidate.

## Evidence boundary

The production iframe reaches YouTube but the cloud-browser proxy removes the Referer/client identity required by YouTube. Direct embed observation therefore produced YouTube Error 153. A request with the production Referer does not contain the Error 153 marker. This explains the automation-environment failure but does **not** prove audiovisual playback on a real device.

The current evidence does not certify:

- successful real YouTube playback or escape-path behavior;
- real iPad Safari behavior;
- the authenticated Parent search/import/approve/assign flow on this exact candidate;
- PIN-ON rendering and live credential rotation;
- populated Parent Dashboard visual acceptance;
- whole-product Human-Eye or full Stranger acceptance.

No P0 is known. Open P1 recommendations are a clearer no-match/clear-search state and context-aware player-error copy. The extra “Open my library” confirmation for PIN-OFF profiles is a Founder product judgment, not a defect.

## First unfinished deterministic action

Establish a secure authenticated Parent browser session, then execute real Parent search, URL import, preview, approval, assignment, dashboard and PIN-ON rotation on the exact deployed candidate. After that, run real iPad Safari playback/escape-path qualification and complete the remaining visual/cold acceptance gates.

Until those human-controlled session/device observations exist, the honest state is **not Founder Review Ready**. Child PIN creation and Google Cloud configuration are no longer blockers.
