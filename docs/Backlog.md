# Backlog

## Next

- Keep custom controls out of scope until the iframe boundary is proven.
- Continue to preserve the rule that unauthorized, removed, unavailable, or non-embeddable videos never render an iframe.

## Completed foundation

- Guarded viewer playback route now exists at `/watch/profile/[profileId]/player/[videoId]`.
- The route checks server-side playback authorization before rendering any player shell.
- Authorized playback renders a minimal YouTube iframe POC using the approved video’s `youtube_video_id`.
- The POC relies on YouTube’s native iframe controls and does not add WatchNest custom-control overlays.
- The denial state is used for unassigned, removed, unavailable, or non-embeddable videos and links back to the profile library.

## Later

- Parent YouTube search and URL import with server-side quota/cache handling.
- Supabase Auth and row-level security policies.
- Parent assignment management UI.
- Viewer approved-library search over local approved metadata only.
- Watch progress persistence and Next Up.
