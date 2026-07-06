# Architecture

WatchNest is a Next.js App Router application with TypeScript and Tailwind CSS. Supabase Postgres is the planned source of truth for parents, viewer profiles, video metadata, assignments, and watch progress.

## Boundaries

- Parent mode manages profiles and approved video assignments.
- Viewer mode must only show videos assigned to the selected profile.
- YouTube Data API access must stay server-side.
- Viewer playback must call server-side authorization before a YouTube iframe is rendered.

## Current implementation

- Static scaffold pages live under `src/app`.
- Local sample UI data lives in `src/lib/sample-data.ts`.
- Pure assignment filtering helpers live in `src/lib/assignments.ts`.
- Supabase server data access lives in `src/lib/server/watchnest-data.ts` and `src/lib/supabase/queries.ts`.
