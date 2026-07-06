# Architecture

WatchNest is a Next.js App Router application with TypeScript and Tailwind CSS. Supabase Postgres is the planned source of truth for parents, viewer profiles, video metadata, assignments, and watch progress.

## Boundaries

- Parent mode manages profiles and approved video assignments.
- Viewer mode must only show videos assigned to the selected profile.
- YouTube Data API access must stay server-side.
- Viewer playback must call server-side authorization before a YouTube iframe is rendered.
- A denied playback request must never render a YouTube iframe.

## Current implementation

- Static scaffold pages live under `src/app`.
- Local sample UI data lives in `src/lib/sample-data.ts`.
- Pure assignment filtering and playback eligibility helpers live in `src/lib/assignments.ts`.
- Supabase server data access lives in `src/lib/server/watchnest-data.ts` and `src/lib/supabase/queries.ts`.
- The guarded playback page lives at `src/app/watch/profile/[profileId]/player/[videoId]/page.tsx` and checks `isProfileAuthorizedToPlayVideo(profileId, videoId)` before rendering the placeholder player shell.

## Playback flow

1. The viewer opens `/watch/profile/[profileId]/player/[videoId]` from their approved library.
2. The server route calls `isProfileAuthorizedToPlayVideo(profileId, videoId)` before rendering player UI.
3. If the assignment is missing, removed, unavailable, or not embeddable, the page renders an unavailable state and a Back to Library link.
4. If authorized, the page renders a minimal placeholder shell and title when available.
5. The actual YouTube iframe/player proof of concept remains the next implementation step.
