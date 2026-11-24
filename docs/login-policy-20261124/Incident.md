# Existing Parent sign-in validation defect — November24,2026

## Exact actual hosted evidence
Founder resumed sameBuilder. Fresh PR49 head6a4a1ca104249e96a44302cc750a7bad3968fcc0 (docs), frozen runtime81c56380a7d78c61485c4f8628a1f5a20c3a19b6, exact isolated productionconfigured stage dpl_Hhrt3UMETpP6qJMhumTnHUt6w7LH / https://watchnest-g5a882nq0-avromy.vercel.app READY. Canonical fresh77a5017d938ded03b1530c2b72978cef27273d61/dpl_GiRnmGhHRYnnq16jHEUGyxtjRNac unchanged.

Same Work CLOUD /parent/dashboard first redirected to /login, no positiveParent. One nativeprotected Email/Password browserAuth request on actualform returnedsubmitted. Fresh AX stayed/login with exactvisibleerror “Use a password with at least 12 characters.” Credentialvalues notread/logged/copied/exported; no session/cookie transfer/connectedChrome. This is a demonstrated applicationvalidationblocker, distinct from prior tooltimeout/interruption. Submitted doesnotproveauthenticated. No furtherrealaccountattempt wasmade at thischeckpoint. The suppliedcredential's correctness and provideracceptance remainUNKNOWN; do not assertlegacypasswordvalidity or exactcredentiallength.

## Reproduced cause
Server auth/parent validates shared login/signup password.length<12 before signInWithPassword. Existingcredential input is rejected before provider verification, using creationpolicy asloginpolicy. update-password has a separate12guard.
Three actualdispatchsyntheticregressions failedbeforefix: expected200 validproviderlegacy,401 providerreject,403 unconfirmedaccount; allgot400 sharedguard. Failure retained in evidence/login-policy/Red.txt. No realcredential guessing/accountmutation.

## Narrow repair / protected behavior
Require nonempty bounded max200 logincredential; delegate correctness to existing provider. Apply12minimum only to signup and preserveupdate-password12minimum. No trimming or passwordtransformation. No changes to origin checks, founderemailboundary, accountconfirmation/getUserverification, rate10, cookies/deviceownership, child/ParentPIN, SafePlayback, approvals, siblings, timer/GiveTime/Daily7AM. No reset/update/rotation/migration/familysetting/content/time/counterchange. Noauthstrengthwaiver/newaccount.

Seven regressions cover provideracceptedshortexistingcredential, rejectedshort/no cookies or familywrites, signup/update12, empty/oversizedloginandunconfirmedaccount. Scoped72/72, full430unit/database31files, type/buildPASS. Lint0errors/3pre-existing archivalmjsunusedwarnings. Productionaudit0 vulnerabilities. Independent source/security reviewer inspected exactguarddelta, independentlyran31dispatchtestsPASS, boundedcompatibilityPASS; no authenticatedhosted/devicePASS. UnchangedrenderedConcept3 retained.

OfficialAPIreview: https://supabase.com/docs/reference/javascript/auth-signinwithpassword ; currentchangelog https://supabase.com/changelog.md reviewed; no relevant APIchange introduced by thisfix. Sourcecall contractunchanged. Supabase0.1.2 instructions/securitychecklistconsumed.

## Release and continuation
Old81stage mustnot be promoted. Freezeexactsuccessor andCI, createisolatedproductionconfiguredstageunderpreviousverifiedmanualpromotionguard with canonicalbefore/immediate/READYchecks. Hostedvalidationmust use/login?parent=1 so successfulParentlogin goesParentsettings ratherthanpicker; positiveParentUI separatelyverify. Do notreuseloginvalues fromoldform orlogsecrets. A freshprotectedexistingaccountentryafterfix isnecessary onlywhen noParentsession exists; neverblindlyrepeatfailedoldbuildlogin or askFounderchange passwordtoaccommodateappbug.
Original5859 physicalhandoffFAIL stillFAIL; successorneedsactualhostednoPIN/Preview/session/timer/handoff/isolation andboundedaffectedphysical/finalgates. Historicallive/priorstagecrashes remain separatelyunresolved, not disproven. No canonicalpromotion/merge/phase2. Ari explicitParentstopintentionallyuntouched.

Workspace maintenance removedscratchcheckout; re-cloned SAME repository/branch and npmci fromlockfile; no newimplementationowner/branch. Recovery/sourceevidence remainsGitHubauthority. Preservefailure and actualhostederror; serverlogabsence/CI cannotcertifyhistoricalcrashrepair.
