-- Wall-clock child access sessions and bounded, parent-configured discovery.
-- Existing households remain unlimited and discovery-off until Parent opts in.
alter table public.profiles
  add column if not exists session_duration_minutes smallint
    check (session_duration_minutes between 1 and 240),
  add column if not exists session_expires_at timestamptz,
  add column if not exists discover_enabled boolean not null default false,
  add column if not exists discovery_topics text[] not null default '{}',
  add column if not exists discovery_channels jsonb not null default '[]'::jsonb;

alter table public.child_requests
  add column if not exists youtube_video_id text
    check (youtube_video_id is null or youtube_video_id ~ '^[A-Za-z0-9_-]{11}$'),
  add column if not exists video_title text,
  add column if not exists channel_title text,
  add column if not exists thumbnail_url text;

create unique index if not exists child_requests_pending_video_idx
  on public.child_requests (profile_id, youtube_video_id)
  where status = 'pending' and youtube_video_id is not null;

create index if not exists profiles_session_expiry_idx
  on public.profiles (session_expires_at)
  where session_duration_minutes is not null;

create or replace function public.wn_start_profile_session(
  p_parent uuid,
  p_profile uuid,
  p_minutes integer
) returns timestamptz
language plpgsql
security invoker
set search_path=public
as $$
declare deadline timestamptz;
begin
  if p_minutes < 1 or p_minutes > 240 then raise exception 'Invalid duration'; end if;
  deadline := now() + make_interval(mins=>p_minutes);
  update profiles
    set session_duration_minutes=p_minutes, session_expires_at=deadline
    where id=p_profile and parent_id=p_parent and archived_at is null;
  if not found then raise exception 'Profile unavailable'; end if;
  return deadline;
end
$$;

create or replace function public.wn_end_profile_session(
  p_parent uuid,
  p_profile uuid,
  p_disable boolean
) returns boolean
language plpgsql
security invoker
set search_path=public
as $$
begin
  update profiles set
    session_duration_minutes=case when p_disable then null else session_duration_minutes end,
    session_expires_at=case when p_disable then null else now() end
    where id=p_profile and parent_id=p_parent and archived_at is null;
  return found;
end
$$;

revoke all on function public.wn_start_profile_session(uuid,uuid,integer),
  public.wn_end_profile_session(uuid,uuid,boolean) from public,anon,authenticated;
grant execute on function public.wn_start_profile_session(uuid,uuid,integer),
  public.wn_end_profile_session(uuid,uuid,boolean) to service_role;

create or replace function public.wn_approve_child_request(
  p_parent uuid,
  p_request uuid,
  p_video uuid,
  p_profiles uuid[],
  p_collection uuid
) returns void
language plpgsql
security invoker
set search_path=public
as $$
declare
  requested text;
  candidate text;
  child_id uuid;
  v_profile_id uuid;
begin
  select youtube_video_id, profile_id into requested, child_id
    from child_requests
    where id=p_request and parent_id=p_parent and status='pending'
    for update;
  if not found or requested is null then raise exception 'Request unavailable'; end if;
  select youtube_video_id into candidate from videos where id=p_video;
  if candidate is distinct from requested then raise exception 'Video mismatch'; end if;
  if not (child_id=any(p_profiles)) then raise exception 'Requesting child required'; end if;
  if exists(
    select 1 from unnest(p_profiles) x
    where not exists(
      select 1 from profiles
      where id=x and parent_id=p_parent and archived_at is null
    )
  ) then raise exception 'Invalid profiles'; end if;
  if p_collection is not null and not exists(
    select 1 from collections where id=p_collection and parent_id=p_parent
  ) then raise exception 'Invalid collection'; end if;
  insert into family_videos(parent_id,video_id,tags)
    values(p_parent,p_video,'{}')
    on conflict(parent_id,video_id) do nothing;
  foreach v_profile_id in array p_profiles loop
    insert into profile_video_assignments(
      parent_id,profile_id,video_id,approved_by_parent_id
    ) values(p_parent,v_profile_id,p_video,p_parent)
    on conflict(profile_id,video_id) where removed_at is null do nothing;
  end loop;
  if p_collection is not null then
    update collections
      set video_ids=array(select distinct unnest(video_ids||array[p_video]))
      where id=p_collection and parent_id=p_parent;
  end if;
  update child_requests set status='resolved'
    where id=p_request and parent_id=p_parent;
end
$$;

revoke all on function public.wn_approve_child_request(uuid,uuid,uuid,uuid[],uuid)
  from public,anon,authenticated;
grant execute on function public.wn_approve_child_request(uuid,uuid,uuid,uuid[],uuid)
  to service_role;

