# Fresh Parent stranger test — 2026-11-04

## Frozen first impressions (before fixtures/source)

Evidence inspected: ci135 synthetic browser renders at 390×844: parent-sign-in-full, parent-dashboard-top, parent-inbox-top, parent-add-video-full. This is a preliminary corpus; final verdict requires final candidate rendered and interactive evidence.

The calm cream/green palette and clear large headings feel reassuring. Sign in is immediately understandable; show password and recovery are available without hunting. No visible new-account path means a truly unregistered parent cannot infer how to join, though an invited parent's login may be the intended entry.

As a returning busy parent, I see a Requests badge and “1 waiting for you.” I expect Requests to let me decide what my child can watch quickly. The inbox topic request says “Lego trains,” with “Find a video” and “Not now.” I expect Find a video to preserve this topic, give me results, let me inspect one, choose the child, approve it, and return to a visibly resolved request. “Not now” sounds temporary, not a permanent rejection.

As a low-confidence new parent, I would press Add videos (or the large Add to the library button), use Paste video links because I already know a video my child likes, preview it before approval, assign it to one child, then verify it appears in the library. I expect a malformed link to produce a specific recoverable explanation without losing my work. I expect no approval from merely opening a preview. “Move existing family picks” is not self-explanatory; I would avoid it on my first session.

## Independently chosen tasks

1. Returning busy parent: log in, open Requests, follow the existing Lego trains request to search, inspect a result, and approve it for the requesting child; verify request outcome and library availability.
2. Low-confidence new parent: open Add videos, paste a mistaken link, recover with a valid known link, preview, approve to one child, and verify the library confirmation/presence.
3. Login confidence: enter credentials, reveal/hide password, submit, and verify landing state.

## Acceptance boundary

These impressions are frozen before fixture access. Assertions below will exercise synthetic browser paths only. This document does not certify provider integration, live data, physical devices, or interactive acceptance from static imagery.

## CI137 observed execution — initial failures retained

Application candidate: da6edbb4436fc6f455eaef87ace5df61c3e62396. Raw untouched browser result: ../watchnest-review/ci137-cold/test-results/browser-results.json; actual Parent failure/intermediate PNGs inspected individually. No application source/design documents read for these judgments.

- Busy Parent reached request-derived Lego trains search, result, and preview. Low-confidence Parent retained malformed input with a clear “Paste a YouTube video link, then choose Load videos” error; corrected input automatically loaded a result; preview opened and closed without approving; Miri-only assignment visible. These partial actions passed browser assertions.
- Both approval attempts timed out because my test assumed preview implied selecting the video, and used obsolete plural button text. Actual screenshots show “Choose videos below,” unchecked “Select this video,” and disabled “Approve selected videos.” This is principally test adaptation, not broken approval. Narrow correction: explicitly select the result, then click exact singular “Approve 1 selected video.” Frozen task/outcome assertions remain.
- Discoverability friction (moderate, nonblocking until completion evidence): on 390px phone the assignment/approval panel appears above a lone half-width result card. Selecting a child leaves approval disabled until the separately located video checkbox below. Preview closes without selection. A low-confidence Parent can mistake their preview/child choice for sufficient preparation. The UI does explain “Choose videos below”; no irreversible mistake observed.
- Login show/hide and submit executed, then rendered a coherent “Who’s watching?” family picker at /watch, rather than the test-assumed dashboard. This assumption was not established in frozen first impressions. Parent Mode lies below the initial 844px viewport in the inspected picker. Authentication response contract needs validation before calling this an application defect; my synthetic response supplied only {ok:true}.

Current verdict: INTERACTIVE COMPLETION NOT YET ESTABLISHED. Initial CI failures preserved; no pass from static screenshots. No provider/player playback or production persistence claim.

### CI137 login adapter receipt

QA checked the access contract: successful direct /login deliberately routes to /watch; response role does not choose the destination. {ok:true} is valid. My exact dashboard URL expectation is withdrawn as unsupported, while the observed extra Parent navigation step remains a discoverability observation. Rerun now asserts the family picker, captures it full-page, follows the visible Parent Mode control, and still requires arrival in the Parent dashboard. This preserves the practical task (sign in and reach Parent work) and does not alter application behavior.

## CI138 independent outcome review

Read raw browser-results.json and actual busy-parent-after-approval, busy-parent-request-outcome, new-parent-library-outcome, and login failure PNGs.

- Low-confidence task: PASS in browser. Malformed link recovery, preview without approval, explicit selection, Miri-only mutation, and final library presence succeeded. Actual final library card says “Lego train adventure” / “Miri”; other existing cards say Ari. This is synthetic transport persistence, not real backend/provider proof.
- Busy Parent task: FAIL — moderate genuine workflow gap. Actual success banner says “1 individually selected video approved.” Result says Already approved / Ari. Returning to Requests still shows “1 little request” and Lego trains, with only Find a video / Not now. No clear fulfilled/done action exists in the observed inbox; “Not now” contradicts successful fulfillment. I will not use dismissal to manufacture a pass or withdraw the frozen request outcome expectation. The only observed mutation is approval; no request update. Product should carry request context through approval and fulfill it, or provide an explicit fulfilled control.
- Login: password controls and sign-in succeeded; Parent Mode opened a centered, focused PIN modal with clear instruction “Enter the 4-digit Parent PIN.” This is an intelligible protective extra step, not an authentication failure. Narrow adapter now enters synthetic PIN 1234 via the visible “4-digit PIN” field before requiring dashboard. Extra user actions are preserved: sign in → scroll to Parent Mode → click → enter PIN. Dashboard completion still needs runtime evidence.

Disposition: reject complete busy-Parent task acceptance pending product correction and exact-candidate rerun. Low-confidence task accepted only within the synthetic browser boundary. No static-only acceptance.


## Bounded product repair rerun pending

Release owner accepted the CI138 missing-fulfillment defect and authorized an explicit Mark as fulfilled control for non-video requests using the existing PATCH resolved contract. QA adapted only the busy Parent journey to click that visible action after approval and returning to Requests, then require a resolved request mutation and disappearance of the pending topic. A new after-fulfillment PNG is captured; the original before-fulfillment screenshot and failed CI138 expectation remain preserved. This records an extra user action rather than claiming automatic fulfillment. This amendment is Builder test adaptation, not fresh independent acceptance. Exact-candidate execution and independent post-repair review remain required.

## Final CI139 post-repair qualification — 2026-11-04

Exact candidate: `c670d55a9bf22aa493f685fa62f79fda89151247`. Actual run: CI139. Evidence root: `/workspace/scratch/b4fb31747e8d/watchnest-review/ci139-candidate/`. Read actual `test-results/browser-results.json` (all three independently chosen Parent tests passed, no retry) and viewed actual completed journey screenshots with the image viewer. This is a post-repair review by the original cold tester, not a new first impression. CI137/138 failures and the frozen expectations above remain part of the record. No other reviewer's verdict was consulted.

### Actual task journals

1. Returning busy Parent: Overview → Requests → Lego trains / Find a video → prefilled topic search → result → Preview → Close preview → Ari → explicit Select this video → Approve 1 selected video → success banner / Already approved Ari → Requests → explicit Mark as fulfilled → You're all caught up / empty request panel. Browser approval payload: `youtube_video_ids:[newvideo123]`, `profile_ids:[00000000-0000-4000-8000-000000000002]`. Passing test separately requires an `/api/parent/requests` mutation with `status:resolved` and absence of the Lego trains heading. Actual before image clearly says “After adding a video, return here to mark this request as fulfilled,” alongside the new control; actual after image removes the request and badge. **PASS with one explicit extra fulfillment action.** The initial automatic-resolution expectation is not presented as met; the previously unfinishable task is now clearly finishable.
2. Low-confidence Parent: Add videos → Paste video links → mistaken non-YouTube link → retained input plus recoverable explanation → correct known link → automatically loaded result → Preview → Close preview → Miri only → explicit Select this video → Approve → Videos. Actual approval payload contains Miri's id `00000000-0000-4000-8000-000000000001`, not Ari's. Actual final library displays Lego train adventure / Miri, alongside the existing Ari videos. **PASS.** Preview is a synthetic loaded frame; no playback claim.
3. Login confidence: enter email/password → Show password → Hide password → Sign in → family picker → scroll / Parent Mode → clear focused Parent PIN prompt → enter synthetic 1234 → Parent dashboard. Actual final rendered dashboard shows Overview selected and the family library heading. **PASS with documented picker and PIN steps.** This verifies browser UI handling of mocked successful authentication, not real account authentication.

### Final independent verdict and limits

**PASS for these three tasks within the CI139 synthetic rendered browser boundary.** The material missing-fulfillment finding is resolved by a visible, intelligible manual completion action and tested mutation/outcome. No remaining blocker identified within my chosen tasks. Nonblocking friction remains: approval controls precede the separate video selection; a lone result occupies half the phone width; Parent Mode is below the initial picker fold. The fuller sequence is usable but costs more steps than my initial busy-parent expectation.

Evidence uses synthetic family data, mocked API transport and player frame, SVG/fallback artwork, desktop automated browser with a 390×844 viewport. No live provider, real backend durability, physical phone, regional video availability, playback, full product/security, or production/release acceptance is claimed. Material application changes require affected journey evidence to be rerun. This report contains no release authorization.
