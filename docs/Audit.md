# Audit

## Current approved-only controls

- Viewer libraries are filtered by profile assignments before videos are returned.
- Playback authorization has a server-side helper that checks an active assignment and video availability before allowing play.
- The guarded viewer playback route calls the server-side authorization helper before rendering any player shell.
- Unauthorized, removed, unavailable, and non-embeddable videos render a calm unavailable state instead of any YouTube iframe.
- The schema prevents duplicate active assignments for the same profile/video pair with a partial unique index.
- The project stores YouTube metadata only; it does not download, proxy, or cache audiovisual content.

## Known gaps

- Authentication and row-level security policies are not implemented yet.
- YouTube search and URL import are not implemented yet.
- The actual YouTube iframe/player proof of concept remains next and is intentionally not implemented yet.
- Custom player controls are not implemented yet.
- The current UI still uses local sample data for static scaffold pages outside the new guarded server route.
