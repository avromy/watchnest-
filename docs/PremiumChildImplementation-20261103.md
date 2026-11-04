# Premium child experience implementation receipt

Workstream: existing WatchNest application, premium UI/UX continuation. Builder scope is limited to `src/components/child/ChildLibrary.tsx`, `ChildLogin.tsx`, and new `ChildExperience.css`. This receipt is implementation evidence, not independent approval or physical-device acceptance.

## Decisions implemented

- Warm screening-room direction with shared evergreen, ivory, ink, muted and amber tokens from `premium-tokens.css`; styles scoped to `.premium-child-library` and `.premium-profile-picker`.
- Child Home introduces a featured item selected exclusively from the existing approved, nonhidden library. Existing resume eligibility (`made_for_kids === false`, progress available and incomplete) remains intact. Clear Watch now/Keep watching route uses the existing immersive activation handler and existing player URL.
- Home includes three direct browsing routes (All videos, Favorites and Discover/Ask Parent), existing Continue Watching, Favorites, Collections and Recently Added shelves.
- Library has full-width search, clear All videos/Favorites/Hidden filters, Newest/A–Z sort, visible result count, collection browsing and tailored empty states.
- Cards use spacious artwork and titles with separate 44px favorite control. Hide is a secondary action behind an accessible 44px More options disclosure. Undo and restore remain available.
- Discover clearly distinguishes requests from playable approved items, adds no-results feedback and request history presentation. Added-to-library state derives from current assigned videos, not request resolution alone. Resolved requests without a current assignment can be requested again. Text requests refresh request history after sending.
- Profile picker uses warm personal tiles, clear individual entry and protected Parent Mode. PIN dialog retains four-digit submission/authentication and adds Escape, keyboard focus containment and return to the opener.
- Time’s Up uses a calm pause state while retaining denied playback, profile switch and Parent request access.
- Tablet two-column browsing, desktop four-column browsing and mobile bottom navigation remain explicit. Primary controls and secondary video actions are at least44px. Reduced-motion preference disables the new movement transitions.

## Preserved boundaries

No edits to ChildPlayer, player lifecycle, iframe, containment, backend, schema, authentication endpoints, server authorization, session timer logic or assignment semantics. Existing APIs and direct playback activation are retained. No new external services, assets or fonts.

## Builder checks

TypeScript `npx tsc --noEmit`: passed after final child refinements. Targeted `npx eslint src/components/child/ChildLibrary.tsx src/components/child/ChildLogin.tsx`: passed. `git diff --check` for the child implementation files: passed. Main release owner records final combined-candidate results and SHA.

## Independent qualification still required

Independent browser screenshots, responsive/Human-Eye, cold UX review, functional/security regression, final exact-candidate checks and release qualification are owned by the main release workstream. No physical iPad evidence is claimed. Final commit/deployment and acceptance receipts must be bound by the release owner after freeze.

## Independent QA correction

Executable QA found that a successful text request cleared its message and collapsed the Discover-enabled request disclosure, hiding Sent to Parent. The disclosure now stays open while `sent` is true. Send another and navigation retain their existing reset of the success state; request endpoints and payloads are unchanged. This material source correction invalidates affected prior request-flow evidence until rerun against the corrected candidate.

## Independent visual review correction R1-02

Inspected actual CI129 candidate child-search-empty-full screenshots at390x844 and1024x768. They show an unrelated Collections shelf above the zero-result state. The shelf is now rendered only when the trimmed library query is empty. Matching and zero-result searches therefore place their results immediately after the search/filter controls. Clearing the query restores ordinary collection browsing. Video matching, assigned-video authorization, request actions and player code are unchanged. The affected child Library search screenshots require rerun on the corrected candidate; no new visual PASS is claimed by this implementation receipt.

## Rendered review correction R2: expired/paused card readability

Inspected actual CI132390x844 child-times-up-full.png. The dark player shell foreground (#f8fbf9) inherited into a white session-block panel, making its heading and explanatory copy almost invisible. Release owner explicitly approved a bounded presentation scope correction to the earlier file freeze: `src/app/watch/watch.css`, only `.child-player-shell .time-up-card` and its heading/paragraph/eyebrow descendants. These selectors now define shared white surface, ink heading, muted body and evergreen eyebrow colors, covering expired and paused messaging. ChildPlayer source, media styling, lifecycle, containment and backend remain unchanged. Existing all-state/four-viewport visual evidence requires rerender; no raster PASS is claimed until independent review of the repaired candidate.

### Same-cause message-panel audit

Source audit confirms that the same inherited pale foreground affects the initial Opening your video panel, authorization/startup error heading and help confirmation, All finished heading and Next in your library heading: each uses a direct-child `.panel` on the dark shell. Release owner expanded the bounded scope to this proven shared class. Final selectors are `.child-player-shell > .panel` for white background/ink foreground, its h1/h2/h3 descendants for ink, direct paragraph children excluding eyebrow/error for muted text, and eyebrow descendants for evergreen. Error alert colors remain governed by their existing error rule. No geometry, visibility, overlay, media-mount, frame, control or lifecycle styling changed. QA must add startup-failure, authorization/error, paused and ended/next captures and rerender all four viewport inventories.

## PIN error duplicate-announcement correction

Independent detail capture identified the same PIN error simultaneously rendered in the picker-level role=alert and modal role=alert. Source confirmed both used the shared error state without a modal guard. The picker-level error now renders only when neither a child PIN nor Parent Mode dialog is open; dialog errors retain their existing role=alert. API requests, PIN submission/reset behavior and authentication remain unchanged. QA must verify exactly one alert for incorrect child and Parent PINs, plus the global error on nonmodal child entry failure.

## R3 contrast and session-copy corrections

Inspected CI1341024x768 player-synthetic-ended-next-full raster and source: the player-heading eyebrow retained global dark evergreen on the dark shell. Added only `.child-player-heading .eyebrow` amber foreground; this selector excludes white-card eyebrows. ChildPlayer source/lifecycle is unchanged. ChildLibrary blocked-session copy now distinguishes sessionAccess.state paused (Parent paused WatchNest; Parent can resume when it is time to watch again) from expired (existing Time’s up and explanatory copy). The existing enabled/!allowed gate, timer and APIs are unchanged. QA must assert exact paused/expired copy and rerender affected player/library states at all four viewports before new visual acceptance.
