# Backlog

## Next: Issue #3 YouTube iframe/player POC

- Add the actual YouTube iframe/player proof of concept inside the guarded playback route.
- Keep custom controls out of scope until the iframe boundary is proven.
- Continue to preserve the rule that unauthorized, removed, unavailable, or non-embeddable videos never render an iframe.

## Completed foundation

- Guarded viewer playback route now exists at `/watch/profile/[profileId]/player/[videoId]`.
- The route checks server-side playback authorization before rendering the placeholder player shell.
- The denial state is used for unassigned, removed, unavailable, or non-embeddable videos and links back to the profile library.

## Later

- Parent YouTube search and URL import with server-side quota/cache handling.
- Supabase Auth and row-level security policies.
- Parent assignment management UI.
- Viewer approved-library search over local approved metadata only.
- Watch progress persistence and Next Up.
