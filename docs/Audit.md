# Audit

## Current completed foundation

- The Next.js App Router application foundation exists with TypeScript, Tailwind CSS, shared layout styling, and route scaffolds for parent and viewer flows.
- Supabase schema and seed data exist for the WatchNest core domain, including parents, viewer profiles, YouTube metadata, profile video assignments, and watch progress.
- CI exists and runs type checking, tests, and production build checks for pull requests and pushes.
- Reusable UI states exist for loading, empty, unavailable, and profile/library shell experiences.

## Current approved-only controls

- Viewer libraries are filtered by profile assignments before videos are returned.
- Viewer approved-library search exists and searches local approved metadata only.
- Playback authorization has a server-side helper that checks an active assignment and video availability before allowing play.
- The guarded viewer playback route exists at `/watch/profile/[profileId]/player/[videoId]` and calls the server-side authorization helper before rendering any player shell.
- Authorized playback renders a minimal YouTube iframe POC with the approved video record’s `youtube_video_id`.
- Unauthorized, removed, unavailable, and non-embeddable videos render a calm unavailable state instead of any YouTube iframe.
- The POC intentionally uses the native YouTube iframe controls only; WatchNest does not overlay custom controls.
- The schema prevents duplicate active assignments for the same profile/video pair with a partial unique index.
- The project stores YouTube metadata only; it does not download, proxy, or cache audiovisual content.

## Current parent surfaces

- Parent dashboard scaffolding exists.
- The parent Add Video shell exists for the future search/import flow.
- The parent Profiles shell exists, including create/edit profile scaffolds.

## Known gaps

- Authentication and row-level security policies are not implemented yet.
- YouTube search and URL import are not implemented yet.
- Parent assignment management UI is not implemented yet.
- Watch progress persistence is not implemented yet.
- Custom player controls are not implemented and remain out of scope unless a future product decision changes the native-controls approach.
- Some static scaffold pages still use local sample data while Supabase-backed flows continue to be wired in incrementally.
