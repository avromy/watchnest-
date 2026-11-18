# CURRENT — staged production build ready; WatchNest sign-in handoff — November18

This current entry supersedes the earlier pending Vercel identity verification and CLI-only blocker. Those failures remain historical below and in immutable10aa2073be724c68302328deaca7907772238fb1. Source/design are unchanged; no new implementation owner.

Owner-authorized fresh Vercel verification succeeded despite a transport submission_failed report: actual UI/API independently showed the staged deployment READY. Staged ID dpl_HH939UpRsidw913WvZocu6qkZv6v, exact source6be0cabd7c53ef6f9d7cfa8ed0014617a36ba436, target production, unique URL https://watchnest-5ens0lo6f-avromy.vercel.app. UI showed STAGED / Assigning Custom Domains Skipped. Its only observed alias was the feature-branch alias; no canonical production domain moved. Fresh API readback independently resolved canonical77a5017/dpl_GiRnmGhHRYnnq16jHEUGyxtjRNac with all3 canonical aliases. No staged ID is missing anymore; Vercel MFA is CLOSED, not the current blocker. CLI was never authorized and is unnecessary for the working supported project-setting route.

Root's live browser stage/api/session returned role:null,configured:true. Parent dashboard redirected to/login. A managed credential attempt for the existing WatchNest Parent account became unavailable after waiting; a fresh live tab again showed the Sign in heading, no auth error and no authenticated session. This does not establish bad credentials. STOP automatic credential requests/direct entry. Minimum owner-only action: sign in to the existing WatchNest Parent account in the handed-over Cloud browser; never send credentials in chat or notifications.

Use the UNIQUE staged URL above, not the feature-branch alias: later documentation-only previews may repoint that alias to a backend-unconfigured preview. Current project autoAssignCustomDomains FALSE MUST remain OFF through staged qualification/release hold; original TRUE remains the recorded setting rollback value. Do not submit another deployment, restore domain auto-assignment, merge or promote now.

After owner sign-in, continue least-privilege hosted read-only/metadata QA on the exact staged build, with no private family/auth artifacts saved. Only after hosted qualification request one consolidated conditional physical-iPad test at the frozen candidate. All final source/automated/independent visual/jury/cold lanes remain PASS within their recorded synthetic limits. Hosted authenticated and physical playback/containment/native-fullscreen remote-stop gates remain OPEN; Founder Ready and terminal production readiness remain BLOCKED.

---

# CURRENT correction — supported staging, owner verification pending — November 18

This entry supersedes the earlier CLI-only blocker and restart instructions. Historical records remain below and at immutable6be0cabd7c53ef6f9d7cfa8ed0014617a36ba436. No code/design change or new implementation owner.

Root verified the documented Vercel project-setting staging route. Actual UI baseline Auto-assign Custom Production Domains was ON. Root updated only autoAssignCustomDomains:false; reloaded Production Environment UI showed checkbox0 and warned that production deployments require manual promotion. Canonical watchnest-rho.vercel.app was listed as a production custom domain. The actual Redeploy confirmation for exact6be0cab Production removed the canonical assigned-domain list and explicitly stated custom domains would not be assigned because auto-assignment was disabled.

Root submitted Redeploy ONCE. Vercel then required email identity verification; the secure verification attempt was rejected as invalid or expired. No automatic credential retry or Resend occurred. The existing verification UI/pending intent awaits the owner. No new staged deployment ID is confirmed: post-challenge canonical API readback still showed77a5017/dpl_GiRnmGhHRYnnq16jHEUGyxtjRNac with all three canonical aliases, and the latest10 production listing had no new6be0cab deployment. Do not repeat Create/Redeploy while this pending intent may resume after verification.

Current project autoAssignCustomDomains is FALSE and MUST remain OFF through verification, staging and release hold. Original TRUE is recorded as the setting rollback value; do not restore it while verification might resume a production build. CLI authorization is no longer necessary for this supported route; the earlier CLI attempt was cancelled without a grant/token. No auth code, auth URL, browser state, personal account image or session directory is preserved.

Minimum next action: owner completes the existing provider identity-verification step, using Resend personally if needed. Then inspect the resulting deployment/listing first; only if no deployment exists and the pending intent is clearly closed may the release owner decide whether another single supported staging submission is needed. Bind actual staged ID/SHA/configuration and verify canonical aliases still77 before hosted read-only qualification. Physical conditional testing comes AFTER hosted qualification of a frozen candidate, not now. All final independent lanes remain PASS only within their synthetic limits; Founder Ready and production promotion remain BLOCKED.

Official basis: https://vercel.com/docs/deployments/promoting-a-deployment (Dashboard staging via Production → Branch Tracking → auto-assignment OFF); https://vercel.com/docs/rest-api/projects/update-an-existing-project (autoAssignCustomDomains boolean).

---

# Hosted and physical release-gate audit — November 17, 2026

Read-only lane; no source, database, credential, configuration, session or deployment
mutation. Root remains the sole release owner. Existing 68dc checkpoint/PR49 is the
resume anchor; newer qualification work requires its own evidence.

## Actual checks

- Supabase project ysukwpeowpcixdzkexky: catalog constraint
  `parents_safe_playback_required` is `CHECK ((safe_playback_enabled = true))`.
  Aggregate only: one household, one true, zero unsafe. No family rows disclosed.
- Production session probe at https://watchnest-rho.vercel.app/api/session returned
  200, role null, configured true. CSP still permits frames only at
  `https://www.youtube-nocookie.com/embed/`; other protections remain present.
- Historical c670 preview https://watchnest-gm7uimcrp-avromy.vercel.app/api/session
  returned 200, role null, configured false. It cannot certify authenticated QA.
- Vercel project prj_tQi2cBAosldposlx61FcwnwDJ8OG/team
  team_dTgQEg6sITPfNF8attwZNXcH has all five existing keys production-only:
  YOUTUBE_API_KEY, NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_URL. Metadata only was retrieved;
  no values decrypted or copied.
- Founder Gmail profile independently resolves avromy@gmail.com. Narrow WatchNest
  mail search since November 4 found only previous action-needed message
  1a1a54142ebc6c4c; no new physical-device result. This is usable notification
  capability, not authorization to send duplicate unchanged requests.
- Current local executor has no Vercel CLI, VERCEL_TOKEN or standard CLI auth file.
  CLI absence is installable; authentication absence is the material boundary.

## Infrastructure alternatives, not an unreadable-secret shortcut

Live Infrastructure Autonomy V1.1 was read at
https://app.notion.com/p/3e6584c4f74781ebbd2cea87b0f1ea95 . It requires supported
secure alternatives before escalation. Existing Supabase skill0.1.2 and current
Vercel deployments-cicd were read/applied; Supabase changelog was checked (recent
CLI3 changes do not affect these read-only MCP queries).

The narrow supported route is an authenticated, reviewed CLI staged production
build: `vercel deploy --prod --skip-domain`, then hosted authorization/functionality
QA, then promotion only after ALL release gates pass. It uses the existing
production environment without copying privileged credentials to unrelated
previews and without changing the canonical alias during staging.

The available create_deployment connector schema lacks the staging/skip-domain
control. Supplying target production without that control risks automatic alias
movement and is not a safe substitute. No imaginary meta field or malformed
nested gitSource was used to bypass that limitation. The connector exposes no
Vercel CLI-auth token operation; Edge Config tokens are unrelated and must not
be substituted. Installing a CLI alone would not supply authenticated identity.

Project-specific safe rotation is not a reason to rotate functioning production
keys just to create a preview: all consumers would require secure propagation,
and rotation does not itself solve scoped Vercel staging authentication. No
production credential was rotated, exposed, or globally extended to previews.
A secure owner/provider sign-in for the staged-deployment path is the remaining
access alternative if no existing approved runtime credential becomes available.
The Builder should prepare reviewed source/commands first and request only the
secure human-only authentication step, never tokens/passwords in chat.

## Separate iPad device-filter hypothesis

Founder reported that website/content restrictions may block embed resources.
This remains a hypothesis for the family device, not a verified player regression
or proof that filtering is the sole cause. Apple documents website filtering and
approved-site controls; Google explicitly notes privacy-enhanced embed domains
need network allowlisting. WatchNest source loads the API at www.youtube.com and
the frame at www.youtube-nocookie.com, so allowing only WatchNest's origin is not
proof that the provider's resources are reachable.

Do not switch off Screen Time, broaden a device allowlist, remove CSP/sandbox,
make recommendations playable, or modify player lifecycle on this evidence.
Do not test a bare embed URL as a playback acceptance shortcut: Google documents
that missing enclosing-page Referer can itself produce error153. WatchNest's
iframe currently sets strict-origin-when-cross-origin; no source change made.

When the qualified candidate is frozen, one conditional actual-iPad observation:

1. Record tested source/deployment, iPadOS version and Safari versus installed PWA.
   Open an existing approved video in WatchNest and use native in-frame Play.
2. If startup fails, STOP. Obtain exact visible error/photo plus the device's
   current web-content restriction mode and any provider-block notice. Do not
   request later recommendation/timer tests yet or ask for credentials/history.
   If owner-accessible device/network diagnostics can show the blocked resource,
   distinguish API/frame/media/Referer/provider error from WatchNest guard failure.
3. Only if picture and sound succeed, exercise related/More Videos inline and
   manual native fullscreen; no external YouTube or unapproved playback.
4. Then use the same child's short Parent session and End now from phone during
   approved fullscreen playback. Picture and sound must stop and remain denied.

No physical PASS exists in the recovered records. Chromium fixtures cannot close
these gates. Device exceptions, if eventually proposed, must be narrow and must
not defeat the family's intended protection; material access changes require the
proper authority, not silent repair-by-weakening.

## Official sources consumed and limits

- Apple parental controls: https://support.apple.com/en-us/105121
  (current retrieved guide; UI paths/version differ, do not assume family iPad version).
- Google embed/privacy-enhanced mode:
  https://support.google.com/youtube/answer/171780
- Google iframe API/error taxonomy:
  https://developers.google.com/youtube/iframe_api_reference
- Vercel CLI deploy/staging:
  https://vercel.com/docs/cli/deploy
  https://vercel.com/docs/deployments/promoting-a-deployment
  https://vercel.com/changelog/stage-and-manually-promote-deployments-to-production
- Supabase changelog: https://supabase.com/changelog.md

These sources support capability boundaries, not a diagnosis of the physical
family device. Hosted and physical acceptance remain OPEN; other independent
qualification work should continue while they are unresolved.

## Observed provider UI fallback and access boundary

The connected deployment API does not expose the documented staged-production
skip-domain option. A read-only browser fallback was therefore attempted against
the existing project, not an unrelated account or project. Navigating to
https://vercel.com/avromy/watchnest redirected to the visible **Login – Vercel**
screen at https://vercel.com/login?next=%2Favromy%2Fwatchnest. No signed-in session
was available in that browser. Visible methods were email, Google, GitHub,
ChatGPT, SAML, and Passkey. The actual project dashboard and its deployment
controls were not visible; a UI staging checkbox is therefore **UNOBSERVED**,
not claimed absent or supported.

The complete secure browser-authentication guidance was read. Multiple visible
methods require a secure user choice; the Builder cannot silently choose a
provider. No authentication request or sign-in attempt was made in this lane,
and no credential, agreement, configuration, alias, or deployment was changed.
The login tab was retained for continuation. The integration owner should bundle
only the necessary secure Vercel sign-in choice into the concentrated preflight
if hosted qualification remains blocked after independent lanes finish. An
authenticated existing-project UI may support staging without new CLI tokens,
but that capability must be observed before acting. A CLI token is not presumed
to be the only supported recovery route.
