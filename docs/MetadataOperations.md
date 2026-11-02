# Metadata maintenance release contract

This operation is now enabled on the dedicated WatchNest hosted database; see [exact receipts](HostedDatabase-20261001.md). Immediate execution succeeded and the hourly job is active; an actual scheduled run and ongoing monitoring still need verification.

Current migrations add service-only `wn_metadata_maintenance()`. It clears API metadata at 29 days (one-day safety margin), null/future freshness states and expired search-cache payloads. It preserves WatchNest approval IDs, assignment records, parent tags, collections and requests. Expired/revoked child sessions older than a day and rate-limit buckets older than two days are also removed. It never polls player activity or reconstructs Made-for-Kids tracking.

Apply all migrations first. On a verified dedicated WatchNest project, inspect current extensions/jobs, then execute `supabase/operations/enable_metadata_cron.sql`. Use the supported pg_cron functions, never direct writes to cron.job. Check successful execution immediately and after an hourly schedule. Inspect cron.job_run_details for failure; a paused/unavailable database cannot execute a job, so continued uptime/monitoring remains an operations requirement. Request-path metadata masking and playback freshness checks remain fail-closed independent safeguards, not proof of dormant-data deletion.

Before activation record the schema version, existing job inventory, project ID, database backup/recovery availability and intended mutation. Roll back this one schedule with `cron.unschedule('watchnest-metadata-retention')`; do not drop pg_cron or modify other projects. Purged third-party metadata is reacquired through official YouTube lookup, not restored from an expired cache. Preserve approval/assignment IDs. Never restore expired API payloads as a rollback step.

Periodic refresh/check for unavailable approved videos is a separate quota-budgeted opportunity; this SQL job purges stale metadata, does not call YouTube or claim availability validation. The parent attention queue surfaces stale items for refresh. A YouTube API key and actual hosted cron execution are still required release evidence.

References: https://supabase.com/docs/guides/cron/install ; https://supabase.com/docs/guides/cron/quickstart ; https://developers.google.com/youtube/terms/developer-policies .
