# Concept 3 — source UX decision and Parent implementation

Scope: existing WatchNest continuation under Root sole integration/release owner. Founder Concept 3 decision supersedes green-led visual acceptance. This specialist inspected source and prior research; this is not final visual, cold-browser, hosted, physical-device or release acceptance.

## Source findings and chosen changes

Child Home currently duplicates Library through a featured hero, three quick links and four shelves; approved Collections appear after several other sections. Proposed and accepted by Root: a single Library landing with Collections first, approved-video search/grid, local Favorites/Hidden filters, and only Library plus Discover/Ask Parent primary destinations. Existing route URLs may remain compatibility aliases. Root owns Child implementation.

Parent Time controls were under Family → Time & discovery; Overview began with counts. Parent navigation now exposes Overview / Library / Requests / Time / Family. Add videos stays in the header. At desktop width1200+, a compact ink sidebar keeps destinations visible beside a light task workspace; tablet/phone retain one labelled navigation row with five minimum-touch destinations. Family retains Profiles and Settings; Time exposes the existing controls route directly.

Overview now opens with Add videos / Requests / Time controls task links, followed by a compact factual library summary and existing attention/family sections. The old repeated bottom timer shortcut is removed. Counts remain real and derive from existing data; no live timer status is invented on Overview.

Add Videos retains Search YouTube / Paste video links, video/channel/playlist search and all URL handling. Results now precede assignment in reading/tab order. On desktop, selected-child/Collection/approval controls occupy a sticky second column beside results; on phone they follow results with a selected-count internal anchor to reach approval. Parent selects and inspects actual results before assignment. Inline Collection creation and explicit approval remain unchanged.

In Time controls, actual session cards and remote-stop/offline limits remain visible. Less frequent Discover permissions and Available hours are separate disclosures below them. Existing form inputs, save handlers, payloads and constraints are intact. Guided Access explanation remains visible. Safety acknowledgement wording is untouched.

## Parent visual implementation

Shared Concept3 tokens: ink/navy navigation, lavender action/selection, warm-white/light-neutral forms, controlled peach attention accents. No dominant green remains in Parent stylesheet. Child and Parent relate through the same tokens without identical backgrounds. Buttons/fields retain clear focus and minimum44px geometry; phone cards remain single-column. Profile, request, collection, preview and protection states inherit the shared design.

Only these production files were edited by this specialist:
- src/components/parent/ParentApp.tsx
- src/components/parent/Parent.module.css

No commits, pushes, deployments, schema/data/auth/player/CSP/RLS/timer-backend changes performed. All existing API calls, mutation payloads, preview embed construction, session-status polling and timer handlers are preserved. Moving JSX does not establish independent security equivalence; Root's exact-source reviewer must verify it.

## Deliberate QA selector updates

- Parent Library H1: `The family library.` → `Family library`.
- Controls H1: `Time & discovery.` → `Time controls`.
- Settings H1: `Family settings.` → `Family settings`.
- New primary link: `Time` → /parent/controls.
- Discover field tests/captures must first open `Discover permissions`.
- Schedule field tests/captures must first open `Available hours`.
- AddVideos captures/keyboard-flow assertions must account for results-before-approval and the `#video-approval` anchor; handlers/asserted outcome requirements are not to be weakened.
- Changed design/navigation evidence from all earlier candidates is STALE for affected pixels/interactions. Keep old reports as history with their original evidence scopes.

## Specialist source checks

Scoped ESLint PASS and TypeScript `tsc --noEmit` PASS on the in-progress combined workspace; whitespace diff check PASS. These checks are not a frozen-source full-release claim. No long browser suite or independent rendered review performed by this specialist. Root must freeze source, run full automated/regression coverage, inspect actual phone/iPad portrait/landscape/desktop pixels, and submit genuine independent review.

Suggested exact checks: primary navigation reachable with no horizontal clipping at360/390/768/1024/1440; focus-visible for sidebar and all task links; correct active Time route; selected-count anchor reaches assignment at phone; dynamic Collection-create approval area fits short viewport via internal desktop scroll; no duplicate approval button; Discover and schedule disclosure keyboard operation; End now remains first and status/confirmation limits remain truthful. Actual family-iPad media/fullscreen/remote-stop evidence remains OPEN.
