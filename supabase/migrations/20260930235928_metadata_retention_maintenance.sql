-- Service-only maintenance; scheduling is a separate, verified release action.
-- Purge at 29 days to leave a safety margin before the API's 30-day deadline.
-- Approval IDs, assignments, parent tags, collections and requests are preserved.
create function public.wn_metadata_maintenance() returns void
language plpgsql security invoker set search_path=public as $$
begin
  update videos set title='Video needs refresh',channel_id=null,channel_title=null,
    thumbnail_url=null,duration_seconds=null,made_for_kids=null,
    availability_status='needs_review',embeddable_status='unknown',metadata_last_checked_at=null
    where metadata_last_checked_at is null
      or metadata_last_checked_at > now()
      or metadata_last_checked_at <= now()-interval '29 days';
  delete from youtube_search_cache where expires_at<=now();
  delete from login_limits where window_started<=now()-interval '2 days';
  delete from child_sessions where expires_at<=now()-interval '1 day'
    or revoked_at<=now()-interval '1 day';
end $$;
revoke all on function public.wn_metadata_maintenance() from public,anon,authenticated;
grant execute on function public.wn_metadata_maintenance() to service_role;
