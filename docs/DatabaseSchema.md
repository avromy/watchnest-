# Database Schema

Initial schema: `supabase/migrations/202607060001_initial_schema.sql`.

## Core tables

- `parents`: caregiver accounts.
- `profiles`: child viewer profiles owned by a parent.
- `videos`: YouTube metadata for caregiver-approved candidates. WatchNest stores metadata only, not video files.
- `profile_video_assignments`: active or removed approvals linking profiles to videos.
- `watch_progress`: per-profile progress for assigned videos.
- `youtube_search_cache` and `youtube_search_logs`: future server-side YouTube Data API support; no child browsing UI exists yet.
- `audit_events`: future caregiver/audit trail events.

## Integrity rules

- Profiles cascade delete with their parent.
- Assignments cascade delete with parent, profile, or video.
- Duplicate active assignments are prevented at the database level by the `profile_video_assignments_one_active_assignment` partial unique index on `profile_id` and `video_id` where `removed_at is null`.
- Removed historical assignments may coexist with one active assignment because they have `removed_at` set.
- Watch progress is unique per `profile_id` and `video_id`.

## Seed data

`supabase/seed.sql` creates one parent, three profiles (Emma, Noah, Olivia), sample YouTube metadata rows, sample active assignments, and one unassigned sample video for authorization-denial checks.
