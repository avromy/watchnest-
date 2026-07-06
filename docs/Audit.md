# Audit

## Current approved-only controls

- Viewer libraries are filtered by profile assignments before videos are returned.
- Playback authorization has a server-side helper that checks an active assignment and video availability before allowing play.
- The schema prevents duplicate active assignments for the same profile/video pair with a partial unique index.
- The project stores YouTube metadata only; it does not download, proxy, or cache audiovisual content.

## Known gaps

- Authentication and row-level security policies are not implemented yet.
- YouTube search and URL import are not implemented yet.
- The YouTube player shell is intentionally not implemented in this PR.
- The current UI still uses local sample data for static scaffold pages.
