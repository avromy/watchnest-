-- Defense in depth: eligibility is checked again within the write transaction.
-- No existing data is deleted; rollback is the previous function definition.
create or replace function public.wn_record_progress(
  p_session uuid, p_video uuid, p_current integer, p_watched integer, p_completed boolean
) returns void language plpgsql security invoker set search_path=public as $$
declare s child_sessions; p profiles; v videos; seconds integer;
begin
  select * into s from child_sessions where id=p_session and revoked_at is null and expires_at>now() for update;
  if not found then raise exception 'Session expired'; end if;
  select * into p from profiles where id=s.profile_id and archived_at is null;
  if not found then raise exception 'Profile unavailable'; end if;
  perform 1 from profile_video_assignments where parent_id=p.parent_id and profile_id=p.id and video_id=p_video and removed_at is null for share;
  if not found then raise exception 'Not assigned'; end if;
  select * into v from videos where id=p_video for share;
  if not found or v.availability_status <> 'available' or v.embeddable_status <> 'embeddable' then raise exception 'Video unavailable'; end if;
  if v.made_for_kids is distinct from false
    or v.metadata_last_checked_at is null
    or v.metadata_last_checked_at > now()
    or v.metadata_last_checked_at <= now()-interval '1 day' then return; end if;
  seconds=least(greatest(p_watched,0),60,greatest(0,floor(extract(epoch from now()-coalesce(s.last_progress_at,s.created_at)))::integer));
  insert into watch_progress(profile_id,video_id,current_time_seconds,duration_seconds,completed_at)
    values(p.id,p_video,least(greatest(p_current,0),v.duration_seconds),v.duration_seconds,case when p_completed and p_current>=v.duration_seconds*.95 then now() else null end)
    on conflict(profile_id,video_id) do update set current_time_seconds=excluded.current_time_seconds,duration_seconds=excluded.duration_seconds,completed_at=excluded.completed_at,updated_at=now();
  if seconds>0 then insert into viewing_events(parent_id,profile_id,video_id,watched_seconds) values(p.parent_id,p.id,p_video,seconds); end if;
  update child_sessions set last_progress_at=now() where id=s.id;
end $$;
revoke all on function public.wn_record_progress(uuid,uuid,integer,integer,boolean) from public,anon,authenticated;
grant execute on function public.wn_record_progress(uuid,uuid,integer,integer,boolean) to service_role;
