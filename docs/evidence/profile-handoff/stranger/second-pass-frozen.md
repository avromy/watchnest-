# Authority-aware second pass frozen
Read AFTER cold-pass-frozen.md: docs/ProfileHandoffAuthority-20261119.md; canonical Stranger manual and Generic Sub-Agent Directive under ../handoff-authority-1. No Root/peer audit reports or jury read. This auditor remains independent of implementation; no source/app/DB/deployment edits.

Synthetic timer adapter in stateful-support.mjs uses presentation response shapes from e2e/daily-timer.spec.ts. Timer actions recorded in second-pass-mutations.json. It deliberately maps one state across all synthetic profiles to exercise render states; it cannot certify profile isolation, timer calculation, persisted budgets, remote communication, API authorization, or physical stop. Original supplied shim's timer save silence is confirmed support limitation by controller. No product defect attributed to it.

| Step | Persona/start | Exact action | Expected | Actual / evidence | Severity / next |
|---|---|---|---|---|---|
| 17 | Parent phone / Time | Load synthetic daily-ready state | Understand allocation | '5 min available today', daily renewal explanation, Pause, End now. 17-stateful-daily-ready.png | None; expand |
| 18 | Parent/Miri editor | Custom minutes 0 | Validation | Whole-number 1–240 alert, disabled action visible. 18-zero-invalid.png | None; decimal |
| 19 | Parent/Miri editor | Custom minutes 1.5 | Validation | Same validation and disabled-looking action. 19-decimal-invalid.png | None; choose preset |
| 20 | Parent/Miri editor | 1 min; Time mode Give Time; Give 1 minute | One-time start | Correct start payload logged; early screen 20 still stale synthetic status. Later polled state confirms controls. | Harness delay; no app claim |
| 21 | Parent/Miri | Pause | Saved time | pause payload logged; after status polling 'Paused · 1 min saved'; Resume button. 22-paused-polled.png | P3 copy defect 'Add 1 minutes'; Resume next |
| 22 | Parent/Miri paused | Resume | Active countdown | '1 min left', one-time session, Pause, End now. 23-resumed.png | Same P3 copy; End next |
| 23 | Parent/Miri active | End now | Parent stopped state | 'Stopped by Parent'; safe explicit text that removing limit won't unlock. 24-parent-stopped.png | Same P3 copy; daily next |
| 24 | Parent/Miri editor | Time mode Daily; custom 5; Save 5 min daily allowance | Daily-ready rendering | '5 min available today', renewal and unused-time copy; request daily/5 logged. 25-daily-saved.png | None; exhausted state |
| 25 | Parent/Miri daily | Synthetic expired snapshot | Understand recovery | 'Time’s up', Add 5 minutes today, End now, explicit next renewal timezone. 26-daily-expired.png | None |
| 26 | Child/Ari library | Ari switch; Benny; Escape | Cancel handoff | Modal closes; Ari remains selected with PIN indicator; no switch. 11-escape-handoff.png | None; browser Back |
| 27 | Child chooser | Browser Back, refresh | Prior browser entry | about:blank because navigation uses replacement from initial entry; refresh remains blank. 12-browser-back.png,13-refresh-after-back.png | Test entry limitation; no defect |

Objective defect S1 (P3): Parent paused/active/stopped one-time session with custom minutes=1 renders button 'Add 1 minutes'. Correct singular is 'Add 1 minute'. Exact screenshot 22-paused-polled.png: Miri; Paused · 1 min saved; Give Time · one-time session; End now, Resume, Add 15 minutes, Add 1 minutes. State has pausedSeconds=60, mode once, no running deadline. Also reproduced active (1 min left, expiresAt synthetic now+60s) and blocked, screens23/24. No P0/P1 objective defect found in this bounded rendered inspection.

Visual review inspected screenshots05,08,12,15,18,22,24,26. Normal navy/lavender/coral/light Parent palette is coherent and legible. Expanded Parent editor is long but immediate stop/resume actions stay above it. No horizontal clipping at390px (measured scrollWidth <= innerWidth+1). 0 screenshot appears empty due HTML number field coercion but explicit error is visible; no invalid save performed. Cold library lacks actual thumbnails by fixture design. No brand reference match or imagery PASS.

Product recommendations: keep target-named handoff modal and unchanged-budget explanation; keep explicit one-time replacing-daily warning; keep Parent stop explanation. Later/beta only: four long phone timer cards may benefit from compact overview if real-family usage shows frequent lower-profile scrolling. Not approved scope and not needed for this repair. Founder judgment questions: none introduced.

Boundary: targeted shared-device handoff/Parent time rendering only. First/second Parent onboarding, account recovery, live provider player, real tablet/phone, hosted persistence and cross-device timing not certified; unchanged auth handlers and DB have separate review lanes. Correct source bind is a4c94870e723e07648bb7a8ce491cef0b0d1a700. Own browser and production server stopped. No production writes.
