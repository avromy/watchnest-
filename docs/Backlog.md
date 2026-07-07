# Backlog

## Next

- Wire parent Add Video shell to YouTube search and URL import with server-side quota/cache handling.
- Add parent assignment management UI for approving and removing videos per viewer profile.
- Implement Supabase Auth and row-level security policies.
- Persist watch progress and build Next Up behavior.
- Keep custom controls out of scope while the product relies on the native YouTube iframe controls.
- Continue to preserve the rule that unauthorized, removed, unavailable, or non-embeddable videos never render an iframe.

## Completed foundation

- App foundation exists as a Next.js App Router project with TypeScript, Tailwind CSS, and the initial parent/viewer route structure.
- Supabase schema and seed data exist for the core WatchNest data model.
- CI exists for type checking, tests, and production builds.
- Guarded viewer playback route exists at `/watch/profile/[profileId]/player/[videoId]`.
- The route checks server-side playback authorization before rendering any player shell.
- Authorized playback renders a minimal YouTube iframe POC using the approved video’s `youtube_video_id`.
- The POC relies on YouTube’s native iframe controls and does not add WatchNest custom-control overlays.
- The denial state is used for unassigned, removed, unavailable, or non-embeddable videos and links back to the profile library.
- Parent Add Video shell exists for the future search/import workflow.
- Parent Profiles shell exists, including create and edit profile scaffolds.
- Viewer approved-library search exists and searches only approved local metadata.
- Reusable UI states exist for loading, empty, unavailable, and library/profile shell states.

## Later

- Improve parent dashboard insights once assignment and progress data are fully connected.
- Add richer viewer home personalization based on assigned videos and progress.
- Add operational monitoring for YouTube quota/cache behavior after import is implemented.
