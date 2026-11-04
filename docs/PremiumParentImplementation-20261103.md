# Parent experience implementation — 2026-11-03

## Scope

Changes are limited to `src/components/parent/ParentApp.tsx` and `src/components/parent/Parent.module.css`, plus this receipt. No backend, API, authentication, child-player, timer calculations, or containment code was changed. Shared production color tokens supplied by the primary Builder are consumed by the parent stylesheet.

## Product decisions implemented

- Four primary destinations: **Overview, Library, Requests, Family**. Existing routes are preserved. Library exposes Videos / Collections / Add videos; Family exposes Profiles / Time & discovery / Settings as contextual secondary navigation.
- Add videos remains available in the header throughout the workspace. Small-screen navigation uses four labelled touch destinations without a horizontal primary-nav scroll dependency. Switch profile retains its existing server-side Parent lock call.
- Overview is rebuilt around the family's actual artwork, a calm evergreen library introduction, linked counts, a prioritized attention block, personal child-library summaries, and a direct session-control shortcut. No remote timer state is invented on Overview.
- Video intake now has explicit **Search YouTube** and **Paste video links** modes instead of competing side-by-side forms. Channels/Playlists remain available. Incoming shared URLs reveal link mode. Search, paste lookup, previews, individual selection, approval, child assignment, and collection creation keep their existing API contracts and validation.
- Results expose a selected-video count and a dedicated assignment/approval area. Checkbox selection has a consistent selected state. Library cards, filters, bulk editing, previews, and empty states follow the same parent visual system.
- Collections keep editing and sharing separate. **Share with children** is a disclosure, so every collection no longer expands a duplicate assignment form. Choices are held separately for each collection to prevent a choice in one collection from visually selecting children in another. Editing scrolls and focuses the collection editor, including on phones.
- Family profiles disclose photo/avatar editing so PIN protection and profile-level actions remain easier to find. Existing photo handling, PIN validation, save operations, and View as child remain intact.
- Requests use clearer artwork/action grouping. A zero-request heading does not claim everything is caught up when library attention exists.
- Session controls visually prioritize **End now** while preserving authoritative-status gating, command payloads, device acknowledgements, offline/unavailable wording, clock calculations, and deadline behavior. Device confirmation remains explicit and never implies playback has stopped merely because a command was sent.
- Settings retain mandatory Safe Playback and all existing device/PIN/protection information. The palette, fields, buttons, status states, cards, dialogs, spacing, and responsive rules are coherent across all parent screens.

## QA integration notes

- Every main screen still has one main `h1`.
- Library **Preview**, **Close preview**, **Manage**, **Remove**, and all dialog semantics remain.
- Add tests using pasted URLs must first choose **Paste video links**, unless navigating with `?url=…`.
- Collection sharing tests must first open **Share with children**.
- Profile avatar/upload tests must first open **Photo or avatar**.
- Existing API endpoints and authorization payloads are unchanged. Only collection-specific local selection state was isolated.
- Parent shell/overview/stylesheet and production copy changes require screenshot, keyboard, overflow, and independent visual review against the exact release candidate. This implementation receipt does not claim browser, real-device, Human-Eye, or independent review PASS.

## Local verification

- `npx tsc --noEmit`: PASS on initial implementation.
- `npx eslint src/components/parent/ParentApp.tsx`: PASS.
- Final `npx tsc --noEmit`: PASS.
- Authoritative full-release checks belong in the release QA receipt.
- No physical iPad execution was available to this implementation worker. No physical-device acceptance is claimed.

## Independent visual review repair — R1, 2026-11-04

Inspected actual `ci129-candidate/test-results/visual-evidence/candidate/390x844/parent-collections-full.png` and the matching `1440x1000` raster. Confirmed the collection create form shaded checkbox row contained the checkbox while its video title flowed below it.

Verified source cause: `.main form label:not(.check)` applied `display: grid` with greater specificity than `.videoChoices label`'s horizontal layout. The anonymous title text therefore occupied a separate grid row. The same rule also affected shared child-selection labels inside forms and the Discover toggle.

Repair: give collection-video and shared child-choice labels an explicit `choiceOption` class, wrap their text in a span, and exclude checkbox/switch rows from generic field-label grid styling. Checkbox and title remain one clickable, vertically centered label row with a 48px minimum height; long titles wrap inside that row. Native checkbox semantics, handlers, selection state, assignment requests, and APIs are unchanged.

R1-03 repair: phone-header Add videos and Switch profile now explicitly have minimum 44px height and width. Switch profile has a fixed 44px footprint and both actions resist flex shrinking. Header horizontal padding is 12px at the narrow breakpoint to preserve room for these targets at 360px. Exact 360/390 browser geometry and raster verification is assigned to independent QA; CSS intent alone is not recorded as visual PASS.

Validation after checkbox component fix: scoped ESLint PASS; TypeScript PASS. Header change is stylesheet-only. Required follow-up: recapture collection creation at all four anchors, open sharing/approval child-choice groups, inspect Discover toggle, and measure header targets/no page overflow at 360 and 390.

Frozen source SHA-256:

- ParentApp.tsx: `24a6c9c5c84679a2bc31cb06af1eb7486d2eafbe930361cfea9e03d924bb804e`
- Parent.module.css: `72bd8d64acf52f09589ea5d4722c91c68002b075e883acd5707e614a3676100b`

This receipt records a source repair ready for independent recapture. It does not supersede the reviewer gate or claim physical-iPad acceptance.
