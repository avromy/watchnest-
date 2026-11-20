# Frozen independent returning-parent / older-child stranger pass

Frozen 2026-11-20. Candidate supplied by controller: app commit 146a672f5b0744a13869dc29983e5942a0d7a233. Rendered built `.next`, no rebuild, no app edits. Reviewer read only audit skill and setup-only browser runtime, package manifest and synthetic fixture before freeze. No product docs, application source, prior tests or conclusions read. Findings below are immutable blind observations; authority audit is separate.

## Executive brief

Within this finite synthetic browser exploration, parent navigation and older-child library/request tasks were understandable without product instructions. No objective product blocker established. Parent overview immediately presents requests, library and time; request-to-search carries topic correctly; library assignment text is explicit; child favorites, collection selection and request confirmation work visibly. Functional production readiness is NOT certified: fixture returns successful mutations without persistent server state and contains fake YouTube IDs. Actual timed-session behavior, playback, auth, server permissions, refresh persistence and real devices remain untested.

Strong UX recommendation PC-R1: Time controls place a large `End now` button before the collapsed `Give time or set daily allowance` even when status reads `No session timer`. Starting time feels subordinate to ending a nonexistent timer. Consider making the useful start action primary for this state. This is a recommendation, not an objective defect or approved scope.

Later observation PC-L1: Older-child mobile video cards are compact and clear; fixed bottom Library/Ask Parent navigation sits over content in full-page screenshots, as expected for viewport-fixed navigation. No unreachable control was established; do not report screenshot overlay alone as a product defect.

Founder judgment: None required by this limited journey. No new product scope is proposed for mandatory approval.

## Capability / limitations

- Browser: isolated headless Chromium through Playwright, 390×844 phone and 820×1180 tablet emulation. This is synthetic browser evidence, NOT hosted/deployed-browser, real-device, Safari/iOS, or actual YouTube playback certification.
- Port explicitly 3004. No controller port3001 used or killed. Existing `.next` consumed unchanged.
- Separate exec sessions could not reach a separately launched server; same-process child-server fallback worked. Initial Next hostname-less startup hit `uv_interface_addresses`; explicit 127.0.0.1 worked.
- API helper `fixture(page,'parent'/'child')` intercepted all `/api/**`. Mutations return generic `{ok:true}`. Dashboard, profiles, session access and requests read back static data. Thus stale readback is not a product defect.
- Initial root redirect /login is real server behavior without cookies. Synthetic sign-in and PIN UI were explored but do not authenticate against real services. Controller subsequently supplied correct direct synthetic entries `/parent/dashboard` and `/watch/home`.
- No production or real family data. No upload or irreversible real action. No synthetic requested-video fixture created because this bounded pass followed existing topic request.
- Two automation locator failures were harness issues: hidden duplicate Custom minutes fields; then waiting for absent `Give 0 minutes` name. Browser process restarted. Invalid custom-time result is INCONCLUSIVE, not failed app behavior. Only child final runtime errors array was checked; empty. No claim of complete console/network audit.
- Early screenshot13 captured preceding dashboard before Family navigation settled; replaced by23. Other screenshots taken immediately after actions can include transient preceding frames; settled current visuals21–24 are preferred. DOM text was read after screenshot and supported journals. Screens9 and12 were visually inspected and aligned. No synthetic visual fabricated.

## Click-by-click journal

Parent means returning parent; Child means older child Ari. All transitions matched intent unless labeled otherwise. Each row records visible purpose, expected and actual result, friction and next action. Screenshot filenames refer to this directory.

|#|Persona / screen and visible purpose|Exact action|Expected|Actual / observation / severity|Evidence / next|
|---|---|---|---|---|---|
|1|Parent, root entry|Navigate `/`|Open family space|Redirected /login; no cookies. Setup limitation, not defect.|01; enter synthetic fields|
|2|Parent, sign in|Fill Email synthetic@example.test, Password SyntheticOnly123!, click Sign in|Family entry|Who's watching with four children and Parent Mode. Fixture success only.|02; Parent Mode|
|3|Parent, profile chooser|Click Parent Mode|Parent access gate|4-digit Parent PIN prompt; obvious Cancel.|03; PIN|
|4|Parent, PIN dialog|Fill 4-digit PIN `1234`|Parent space|Family overview with 1 pending request, three principal actions and child summaries.|04; review request|
|5|Parent, overview|Click Review requests|Request detail/action|Ari topic Lego trains; Find a video, Mark as fulfilled, Not now; clear manual return instruction.|05; find|
|6|Parent, inbox|Click Find a video|Search scoped to topic|Add videos, URL q=Lego trains, search input verified Lego trains. Logical transition.|06; search|
|7|Parent, Add videos|Click Search|Results plus approval|Three synthetic already-approved videos, child selection and collection option. Results relevance is fixture-only.|07; library|
|8|Parent, Add videos|Click Library|Approved library|Cards with Preview/Manage/Remove, search and child filter.|08; manage|
|9|Parent, library|Click first Manage|Edit chosen video assignment|One selected, Ari checked, explicit retaining/removing access warning, tags and collections.|09; cancel|
|10|Parent, selection panel|Click Cancel selection|Exit edit without mutation|Selection panel removed; no save attempted.|10 combined; search|
|11|Parent, library|Fill Search approved videos `space dinosaurs`|Empty search state|No matches, Try different search or child, Find videos. Clear recovery.|10; time|
|12|Parent, library|Click Time|Session controls|Four child cards, No session timer, End now, collapsed giving-time controls. PC-R1 recommendation.|11/12; expand Ari|
|13|Parent, time|Click Ari Give time or set daily allowance|Set time panel|One-time vs daily mode, presets, Custom minutes, Give20minutes; explains countdown/background and parent pause.|12; attempted invalid input|
|14|Parent, time|Attempt Custom minutes0|Validation|First locator strict failure, then fill succeeded but missing button-label wait hung; no conclusion. Harness issue.|No proof of validation; restart|
|15|Parent, fresh synthetic direct dashboard tablet|Click Family|Manage profiles|Four profile cards with PIN controls, avatar disclosure, View as. Early13 stale; settled23 correct.|23; child role|
|16|Child, fresh context `/watch/home`|Direct synthetic entry|Permitted library|Three videos, library search, Favorites/Hidden, sort, Little Makers collection, bottom Library/Ask Parent.|14/21; favorite|
|17|Child, library|Click Add Draw a friendly fox to Favorites|Mark chosen video|Mutation captured favorite:true; immediate UI updates.|15 combined; Favorites|
|18|Child, library|Click Favorites|Only favorite videos|One video Draw a friendly fox; clear return All videos.|15; all|
|19|Child, favorites|Click All videos|Full library|Full library available and collection visible.|16 combined; collection|
|20|Child, library|Click2videos Little Makers|Collection contents|Two videos with heading2videos in this collection and back action.|16; ask|
|21|Child, collection|Click Ask Parent|Request composer|What would you love to watch?, topic/show/creator/video and Tell Parent textarea. Clear.|17/22; send|
|22|Child, ask|Fill Tell Parent How to build a paper city; click Send request|Confirmation|Sent to Parent, They'll see your idea in their inbox, Send another. POST topic payload captured.|18; return library|
|23|Child, confirmation|Click Library then Play Build a paper rocket|Open permitted video|Player safely fails to start with back links and Ask Parent for help. Fake video IDs and environment mean real playback inconclusive, not product failure.|19; help|
|24|Child, unavailable player|Click Ask Parent for help|Notify parent / confirm|Your parent can see your request for help in their Inbox. POST video request Playback problem: Build a paper rocket captured.|20; recovery|
|25|Child, unavailable player|Click Back to Library|Recover to library|Three-video library restored. Static fixture resets favorite readback; no persistence conclusion.|21; end|

## Friction map and recommendations

- P0 / Must fix before Founder: None established in this finite synthetic pass.
- P1 / strong recommendation PC-R1: contextually prioritize giving time when there is no timer. Expected effect: busy parent can initiate a session without interpreting an irrelevant destructive-looking primary action.
- Founder judgment: none identified here.
- Later/beta PC-L1: fixed child nav in screenshots must be judged in viewport/scroll context; screenshot artifact alone is not a defect.
- Keep: separate parent/child visual tone; legible Parent overview and request next-step; explicit access consequences in Manage; child's simple Ask Parent composer and confirmation; graceful player failure/help recovery.

## Visual screen review units

Use current screenshot adjacent to this commentary in controller packet. Decision fields for each unit: Approve as is / Approve recommendation / Reject recommendation / Modify/comment.

|Unit/current visual|Role / reach / purpose|Works / confusion / objective defects|Recommendation / severity / disposition|
|---|---|---|---|
|24-parent-tablet-settled.png|Parent / direct dashboard / family triage|Primary destinations clear, request card actionable; no objective defect established.|Keep as is|
|05-requests.png|Parent / Review requests / decide request|Useful find/fulfill/not-now controls and manual followup instruction.|Keep as is; transient image caveat above|
|09-manage-video.png|Parent / Library→Manage / access assignment|Selected child and consequences explicit; long mobile panel but readable.|Keep as is|
|12-ari-give-time.png|Parent / Time→Ari disclosure / start session|Clear presets/mode/semantics; End now dominates no-timer state.|PC-R1, P1 strong recommendation; Founder should judge only if authority requires|
|23-family-tablet-settled.png|Parent / Family / PIN/profile upkeep|Tablet cards coherent; no objective defect seen.|Keep as is|
|21-child-home-settled.png|Child / Library / find permitted content|Calm dark UI, search/collections clear, accessible named actions.|Keep; bottom nav full-page screenshot caveat|
|22-child-ask-settled.png|Child / Ask Parent / suggest content|Simple type and message; no confusion.|Keep as is|
|20-child-help.png|Child / failed player→help / recover|Readable failure, back link and confirmed help dispatch; playback itself uncertified.|Keep recovery; verify real playback separately|

## Founder review guide

1. Scan parent dashboard, library Manage and tablet Family to assess ordinary-parent clarity.
2. Compare Time no-session and expanded state against PC-R1; do not treat recommendation as required repair.
3. Inspect child's library and Ask Parent layout/confirmation.
4. Treat unavailable-player image as synthetic recovery evidence only. Require real environment playback/session evidence separately.

## Frozen checkpoint / next

Completed returning-parent and older-child bounded journeys. Not covered: onboarding, second parent, younger child, real timed-session lifecycle, real credentials, server persistence/authorization, real uploads/devices, actual YouTube playback. Source and production untouched. Do not redo completed steps absent repairs or missing evidence. Next: ask controller for applicable product/design authority and conduct a separate CTO second-pass note; do not rewrite these blind findings. Controller owns durability/upload and global persona coverage.
