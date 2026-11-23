# No-PIN incident: recovery and release state

The Founder says his daughter has no child PIN and was only selecting her own profile. Do not describe this as wrong-PIN guessing. The exact error, attempt count, device sequence, duration, and incident build are unknown. The source-defined429 text is "Too many attempts. Please wait before trying again."

## Confirmed defect and repair

Live77 and held2fba both charged successful no-PIN admission to a five-attempt credential bucket before checking the authoritative PIN flag. A count-aware synthetic regression reproduces five successful entries followed by429. The stored function uses a fixed900-second window; these implementation numbers are not the daughter's established attempt count or wait.

Application1c1228faef321e8cc3a4b30429a64e6897977575 and test-only successora2aa711a082d3063de0ac1b753687177bb99ea5d share src9c247f77cf64143c320b204587e2f3d1e7f487e4. PIN-free entry no longer consults the credential bucket; a separate120/60 device admission-abuse limit remains, with an accurate device-rate message. Child PIN guesses and the shared Parent PIN budget remain protected. Child entry now shows pending feedback without opening a PIN dialog and disables competing Parent entry during pending admission.

Parent Family profiles now offer Access on this device / Check access and an explicit Open [child]'s library as Parent action. Status reads verify Parent identity, profile ownership and same-family valid device; they return no key or attempt counter and skip metadata/device cleanup writes. The action audits a recovery request before admission; audit failure blocks it. It clears no counter/PIN/time restriction. Separate downstream tests show Parent stop and access-window restrictions still block playback after recovery. These controls are in the held candidate, not yet in production.

## Immediate family status

Read-only aggregate snapshots found no active PIN-off blocks among matched device/profile keys (five rows, maximumattempts3), and no matched legacy family-link rows. That does not prove the historical error did not happen or guarantee present access. No child identity was inferred, no real attempts generated and no counter or credential reset. Current live code has a Parent Family 'View as [name]' path, but no new live recovery or safe timer-bypass claim is made from source alone. Do not prescribe an undocumented wait or clear counters through SQL.

## Evidence and limits

419 full local unit/database tests pass. Independent75 targeted source/SQL/authorization tests pass; new stateful admission33 and recovery ownership/audit tests are included in the broader suite. Parent9 rendered workflows and isolated7 no-PIN browser cases pass. Final Parent capture2/2 passes; independent finite Human-Eye CLEAN16assets/6regions/2readable/2neutral/64edges,0defects/conflicts. First browser launch/config and strict-alert harness failures are preserved; fixed harnesses were rerun, no application failures hidden. No synthetic test is hosted or iPad proof. CI172/run45088393241 completed successfully: all3jobs,419unit/database tests,112browser flows, build/lint/type and production dependency audit0. CImerge5be75e97 tree de2b47e6 exactly equals a2aa711a; fetched source/config/test diff exit0. Later Parentcapture additions change only test metadata/fixture alignment and passed2/2 locally, not application source.

## Production and next dependency

Canonicalstill77a5017d938ded03b1530c2b72978cef27273d61/dpl_GiRnmGhHRYnnq16jHEUGyxtjRNac. PR49 remains the sole release path. No new deployment, alias experiment, schema migration, family write or phase2 retirement. Cloud Browser again shows Vercel Login for production settings; no authenticated provider context verified. Connector flag projection remains insufficient to prove safe isolated production-configured staging. No repeated login request made.

First resolve provider access and verify manual alias-assignment safeguards without risking canonical domains. Then qualify the exact integrated candidate through authenticated hosted no-PIN/Parent recovery/Preview/session flows. Only after hosted qualification perform the bounded family-iPad safety check and remaining final independent acceptance, then autonomously merge/promote and verifycanonical source/data integrity. Keep phase2 separately gated and rollback guardedv2/failclosed after phase2. No release or Founder Ready claim now.

Resume by reading this file, Incident.md, current RunState and exact current PR head. Never reset the preserved dirty worktree or mistake an automatic preview/canceled deployment for release.
