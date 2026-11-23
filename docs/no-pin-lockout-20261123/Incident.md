# Founder correction — no-PIN child entry lockout

## Firsthand evidence (verbatim)

- His daughter **does not have a PIN on her child profile**.
- She was **not entering a wrong PIN**.
- She was simply **trying to access/select her own WatchNest child profile**.
- After repeated attempts, WatchNest displayed a **locked-out / too-many-attempts** message.
- The Founder did not intentionally configure such a lockout and does not know how to clear it.

No exact error text, attempt count, device/session sequence, or lockout duration has yet been established for the actual incident. No wrong-PIN attribution is valid. This correction supersedes any earlier PIN-assumption narrative; legitimate synthetic wrong-PIN security tests remain separate.

## Recovered facts

PR49 remainedopen/draft; latestremote a6eaab7458ed3c4ec1009d8f8304581fb3673fbc preservesapp2fba8871. Canonicalcurrently77a5017d/dplGiR, notthepremiumcandidate. Thefamily'sexactincidentURL/buildhasnotbeenestablished. Both77and2fba contain unconditionalchildentry limit5/900before profile.pin_enabled checking; successfulnoPINselectionconsumesbudget. Source429 text is 'Too many attempts. Please wait before trying again.' This is source-confirmedtext, not a verbatimquoteofunseenFoundererror.

LiveRPCdefinitionread-onlyverified: fixedwindow beginsfirstrequest, incrementsallrequests, sixthdenied; deniedrequests do notextendwindow. Threshold/time are verifiedimplementationsemantics, not establishedFounderattemptcount/duration. A matchingstoredcounterhistory/exactrequesttracehasnotbeenestablished. No realfamilyattemptsgenerated/counterscleared/credentialschanged.

## Execution

NoPINadmissionrepair/regressions assigned separatelyfromParentinspection/recoveryUI. PreserveParentPINsharedthrottle, childPINthrottlewhenactuallyrequired, device/ownership/handoff/atomicadmission/window/timer/approvalprotections. HarmlessnoPINentry mustnotconsultspentcredentialbucket. Generaladmission/networkabusethrottle retainsseparatereason/budget. Parentexplicitrecoverymustbeowned/auditedandmustnotgranttimeorclearanotherfamily'scounter. Existinglegitimatecountersonlivearenotsilentlyreset.

Environmentstartupinitiallyreportedoffline409; subsequentavailableexecutorworked. Continuedfrompreserveddirtyworktree, noreset/newBuilder. All8governancefilesconsumed; currentFounder correctionoverridesearlierassumptions. ExistingrepairedConcept3unchangedexceptboundednewlockoutrepair. Hosted/domain/physicalreleaseholdremains; no routinesignoffneededoncequalified.

## Readback and release boundary

Read-only aggregate queries found five matched PIN-off device/profile limiter rows, maximumattempts3 and zero currently active blocks; no matched legacy family-link rows. No row/key/token was exported and no counter cleared. This snapshot cannot attribute the daughter's historical error or prove her present access. The confirmed defect is an admission throttle, not proof of a disabled Supabase account.

Repair source1c1228fa and test-only successora2aa711a preserve the integrated Concept3 work. CI172passed419unit/database and112browser flows plus build/type/lint/audit0; independent75 safetycases and narrow Parentvisual16assets/64edges passed. All are explicitly local/synthetic/source scopes. Source/candidate identity, deployment hold, Parent recovery semantics and minimum external dependency are in Recovery.md. New recovery controls are not currently live.
