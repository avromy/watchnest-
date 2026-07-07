# Architecture

WatchNest is a Next.js App Router application with TypeScript and Tailwind CSS. Supabase Postgres is the source-of-truth target for parents, viewer profiles, video metadata, assignments, and watch progress; the schema and seed data already exist, while some UI surfaces still use local sample data during incremental wiring.

## Boundaries

- Parent mode manages profiles and approved video assignments.
- Viewer mode must only show videos assigned to the selected profile.
- Viewer approved-library search must search approved local metadata only, not the open YouTube catalog.
- YouTube Data API access must stay server-side.
- Viewer playback must call server-side authorization before a YouTube iframe is rendered.
- A denied playback request must never render a YouTube iframe.
- WatchNest stores YouTube metadata only and relies on YouTube’s native iframe playback controls.

## Current implementation

- The app foundation exists under `src/app` with shared layout styling, parent routes, viewer routes, and reusable loading/unavailable/empty shell states.
- Local sample UI data lives in `src/lib/sample-data.ts` for scaffold pages that are not fully Supabase-backed yet.
- Pure assignment filtering and playback eligibility helpers live in `src/lib/assignments.ts`.
- Supabase server data access lives in `src/lib/server/watchnest-data.ts` and `src/lib/supabase/queries.ts`.
- Supabase schema and seed data live in the Supabase project files and define the core WatchNest entities and starter records.
- CI lives in `.github/workflows/ci.yml` and runs type checking, tests, and production build validation.
- The parent Add Video shell lives at `src/app/parent/add-video/page.tsx` for the future YouTube search/import workflow.
- The parent Profiles shell lives under `src/app/parent/profiles`, including create and edit profile scaffolds.
- Viewer approved-library search lives at `src/app/watch/profile/[profileId]/search/page.tsx` and is constrained to approved library metadata.
- The guarded playback page lives at `src/app/watch/profile/[profileId]/player/[videoId]/page.tsx` and checks `isProfileAuthorizedToPlayVideo(profileId, videoId)` before rendering playback UI.
- Authorized playback renders a minimal YouTube iframe POC using the approved video record’s `youtube_video_id`.

## Playback flow

1. The viewer opens `/watch/profile/[profileId]/player/[videoId]` from their approved library or approved-library search results.
2. The server route calls `isProfileAuthorizedToPlayVideo(profileId, videoId)` before rendering player UI.
3. If the assignment is missing, removed, unavailable, or not embeddable, the page renders an unavailable state and a Back to Library link.
4. If authorized, the page renders the player shell, title/metadata when available, and the YouTube iframe POC.
5. The iframe uses YouTube’s native controls; WatchNest does not overlay custom player controls.
