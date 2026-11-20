# WatchNest staged production deployment — November17/18

**READY / STAGED. Not live on canonical production; not Founder Ready.**

## Exact independently read-back identity

- Existing project: `prj_tQi2cBAosldposlx61FcwnwDJ8OG`, WatchNest.
- Staged deployment: `dpl_HH939UpRsidw913WvZocu6qkZv6v`.
- Unique URL: https://watchnest-5ens0lo6f-avromy.vercel.app . Use this URL for sign-in and hosted QA.
- Target: production; state/readyState: READY; source: redeploy.
- Exact Git source: `6be0cabd7c53ef6f9d7cfa8ed0014617a36ba436`, feature branch `premium-ui-ux-20261103`.
- Application/harness equivalent to qualified `38244d2c6ea6b7bb113f3e39338b63cf4eae1e82`; app source tree `461eb4dc14b9a5adb79047d681a8c85478e740ad`. No app/test/package/Next-header changes for staging.
- Only observed staged alias: `watchnest-git-premium-ui-ux-20261103-avromy.vercel.app`. Documentation-only preview pushes may repoint this alias to an unconfigured preview; it is NOT the stable QA URL.

Read-only Vercel deployment and canonical-alias API queries were performed independently immediately before this checkpoint. Root also observed UI Production/STAGED/Assigning Custom Domains Skipped. The production target selects production configuration; it does not prove that canonical traffic moved or that user authentication passed.

## Canonical production and rollback remain unchanged

Canonical https://watchnest-rho.vercel.app resolves to `dpl_GiRnmGhHRYnnq16jHEUGyxtjRNac`, READY, exact application `77a5017d938ded03b1530c2b72978cef27273d61`, production branch `product-completion-20260930`.

All three observed aliases remain on that original deployment:

- `watchnest-rho.vercel.app`
- `watchnest-avromy.vercel.app`
- `watchnest-git-product-completion-20260930-avromy.vercel.app`

Keep that deployment as production rollback. No merge/promotion or family-data/schema mutation occurred here.

## Supported staging route and historical correction

Root recorded project setting baseline autoAssignCustomDomains TRUE, changed only it to FALSE, and verified reloaded UI OFF/manual-promotion warning. The actual production Redeploy confirmation removed canonical assigned domains and stated custom domains would not be assigned. Root submitted once. Earlier identity verification was rejected; owner explicitly authorized a fresh retry. The transport again reported submission_failed, but actual UI and independent deployment API prove successful staging. Pending Vercel verification is CLOSED. The historical CLI attempt was cancelled without a grant/token; no CLI authorization is required now.

Current autoAssignCustomDomains FALSE MUST remain OFF through staging/hold. Original TRUE is the recorded rollback value, not authorization to restore during hold. No new deployment submission is required. No OTP, auth URL, browser state, credential or personal account image is recorded.

## Actual hosted evidence and precise remaining gate

Root live browser observed stage `/api/session` return `{role:null,configured:true}`. Parent dashboard redirected to `/login`. Anonymous read-only stage `/api/parent/dashboard` returned `{"error":"Parent sign-in required."}` and `/api/child/library` returned `{"error":"Child sign-in required."}`. HTTP statuses were not observed and are not claimed. These are configured/anonymous-boundary checks, not authenticated QA, persistence, sibling isolation or provider acceptance.

Managed access to the existing WatchNest Parent account credentials became unavailable after waiting. A fresh live verification tab again showed Sign in, no auth error and no authenticated session. This does not establish invalid credentials. STOP automatic credential requests/direct entry. The minimum owner-only step is manual sign-in to the existing WatchNest Parent account in the handed-over Cloud browser at the UNIQUE staged URL. Never send credentials in chat or notifications.

After sign-in, continue hosted read-only/metadata qualification using existing approved access. Do not save real family screenshots, auth state or secrets, and do not alter approvals/assignments/settings/timers merely for QA. Physical conditional testing is requested only after hosted qualification of the frozen candidate. Approved picture/sound, related/More Videos normal/native-fullscreen containment and Parent-phone End now picture/sound stop/denied-resume remain unproved.

## Qualified evidence that remains valid

Exact382 local lint/typecheck/build/200 unit tests/69 browser tests PASS, CI148 all jobs SUCCESS, targeted independent source/security/visual repair review PASS, five fresh final sampled visual jurors PASS and final Child/Parent cold interactive reports bounded PASS. These results remain synthetic/source-scoped and cannot certify this staged runtime's authenticated or genuine family-iPad paths. ResumeCheckpoint-20261117.md and the current CTO Handoff govern next steps.
