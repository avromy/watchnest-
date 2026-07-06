# WatchNest

Parent-curated video library MVP for approved-only child viewing.

## Core Promise

Only caregiver-approved videos are available inside WatchNest. The viewer does not get WatchNest-provided YouTube browsing, YouTube search, comments, Shorts feeds, or open recommendation surfaces.

## MVP Scope

WatchNest is a responsive web app optimized for iPad Safari and desktop browsers.

Parents can:
- Create profiles.
- Search YouTube from the parent area.
- Paste YouTube URLs.
- Preview videos.
- Approve individual videos.
- Assign videos to one, multiple, or all profiles.
- Remove videos from profiles.

Viewers can:
- Select their profile.
- Browse approved videos only.
- Search within approved videos only.
- Watch approved videos.
- Continue watching.
- Use Next Up.

## Recommended Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Supabase Postgres
- Supabase Auth
- YouTube Data API, server-side only
- YouTube IFrame Player API
- Vercel

## Important Architecture Rules

- Keep YouTube Data API calls server-side.
- Never expose the YouTube API key in the browser.
- Viewer search must only search approved local metadata.
- Viewer playback must be authorized server-side.
- Never return unassigned videos to a viewer profile.
- Store YouTube metadata, not video files.
- Do not download, proxy, or cache YouTube audiovisual content.
- Do not overlay custom controls on top of the YouTube iframe.

## Initial Engineering Priorities

1. Database schema.
2. Profile-specific assignment logic.
3. Viewer library filtering.
4. Server-side playback authorization.
5. YouTube player shell POC.
6. Search/cache/quota POC.

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open the local app:

```bash
http://localhost:3000
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in real values as services are added.

```bash
cp .env.example .env.local
```

Required variables:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
YOUTUBE_API_KEY=
NEXT_PUBLIC_APP_URL=
```

Optional later:

```text
POSTHOG_KEY=
POSTHOG_HOST=
SENTRY_DSN=
```

## Development Notes

The first technical priority is the approved-only data model. A pretty product that leaks videos across profiles is not WatchNest.

Planning, product requirements, technical POCs, Figma design, and build prompts live in the WatchNest Notion workspace.