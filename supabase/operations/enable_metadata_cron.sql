-- RUN ONLY in the dedicated WatchNest Supabase project after all migrations.
-- Requires pg_cron support. No HTTP/API key, network request or paid add-on.
-- Do not disable pg_cron to roll back: that would destroy unrelated schedules.
create extension if not exists pg_cron with schema pg_catalog;
select cron.schedule('watchnest-metadata-retention','17 * * * *',
  'select public.wn_metadata_maintenance();');
-- Execute once immediately, then inspect cron.job and cron.job_run_details.
select public.wn_metadata_maintenance();
-- Rollback of scheduling only:
-- select cron.unschedule('watchnest-metadata-retention');
