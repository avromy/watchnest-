-- Raw, short-lived functional bookmarks only. Historical telemetry is retained
-- for explicit disposition but is never read by the product or used for metrics.
alter table public.watch_progress add column raw_resume boolean not null default false;
create or replace function public.wn_record_progress(
  p_session uuid, p_video uuid, p_current integer, p_watched integer, p_completed boolean
) returns void language plpgsql security invoker set search_path=public as $$
declare s child_sessions; p profiles; v videos;
begin
  if p_watched is distinct from 0 then raise exception 'Viewing metrics disabled'; end if;
  if p_current is null or p_current < 0 or p_current > 86400 or p_completed is null then raise exception 'Invalid raw bookmark'; end if;
  select * into s from child_sessions where id=p_session and revoked_at is null and expires_at>now() for update;
  if not found then raise exception 'Session expired'; end if;
  select * into p from profiles where id=s.profile_id and archived_at is null;
  if not found then raise exception 'Profile unavailable'; end if;
  perform 1 from profile_video_assignments where parent_id=p.parent_id and profile_id=p.id and video_id=p_video and removed_at is null for share;
  if not found then raise exception 'Not assigned'; end if;
  -- Keep classification/freshness stable until the bookmark transaction ends.
  select * into v from videos where id=p_video for share;
  if not found or v.availability_status <> 'available' or v.embeddable_status <> 'embeddable' then raise exception 'Video unavailable'; end if;
  if v.made_for_kids is distinct from false or v.metadata_last_checked_at is null
    or v.metadata_last_checked_at > now() or v.metadata_last_checked_at <= now()-interval '1 day' then return; end if;
  -- Raw ENDED removes the functional bookmark. It does not assert watched or
  -- write completion timestamps/events, percentages, durations or watch totals.
  if p_completed then
    delete from watch_progress where profile_id=p.id and video_id=p_video and raw_resume=true;
    return;
  end if;
  insert into watch_progress(profile_id,video_id,current_time_seconds,duration_seconds,completed_at,raw_resume)
    values(p.id,p_video,p_current,null,null,true)
    on conflict(profile_id,video_id) do update set current_time_seconds=excluded.current_time_seconds,
      duration_seconds=null,completed_at=null,raw_resume=true,updated_at=now();
end $$;
revoke all on function public.wn_record_progress(uuid,uuid,integer,integer,boolean) from public,anon,authenticated;
grant execute on function public.wn_record_progress(uuid,uuid,integer,integer,boolean) to service_role;

create or replace function public.wn_metadata_maintenance() returns void
language plpgsql security invoker set search_path=public as $$
begin
  update videos set title='Video needs refresh',channel_id=null,channel_title=null,
    thumbnail_url=null,duration_seconds=null,made_for_kids=null,
    availability_status='needs_review',embeddable_status='unknown',metadata_last_checked_at=null
    where metadata_last_checked_at is null or metadata_last_checked_at > now()
      or metadata_last_checked_at <= now()-interval '29 days';
  delete from watch_progress where raw_resume=true and
    (updated_at > now() or updated_at <= now()-interval '29 days');
  delete from youtube_search_cache where expires_at<=now();
  delete from login_limits where window_started<=now()-interval '2 days';
  delete from child_sessions where expires_at<=now()-interval '1 day' or revoked_at<=now()-interval '1 day';
end $$;
revoke all on function public.wn_metadata_maintenance() from public,anon,authenticated;
grant execute on function public.wn_metadata_maintenance() to service_role;
