-- Remote Parent control extends the existing wall-clock access deadline.
-- It records only operational synchronization state, never video/watch telemetry.
alter table public.profiles
  add column if not exists session_state_revision bigint not null default 0,
  add column if not exists session_paused_seconds integer
    check (session_paused_seconds is null or session_paused_seconds between 0 and 86400),
  add column if not exists session_updated_at timestamptz;

alter table public.child_sessions
  add column if not exists device_id uuid references public.household_devices(id) on delete set null,
  add column if not exists timer_last_seen_at timestamptz,
  add column if not exists timer_ack_revision bigint not null default 0,
  add column if not exists timer_playback_active boolean not null default false;

create index if not exists child_sessions_timer_presence_idx
  on public.child_sessions(profile_id, timer_last_seen_at desc)
  where revoked_at is null;

create or replace function public.wn_control_profile_session(
  p_parent uuid,
  p_profile uuid,
  p_action text,
  p_minutes integer default null
) returns jsonb
language plpgsql
security invoker
set search_path=public
as $$
declare
  current_profile profiles;
  deadline timestamptz;
  paused_seconds integer;
begin
  select * into current_profile
    from profiles
    where id=p_profile and parent_id=p_parent and archived_at is null
    for update;
  if not found then raise exception 'Profile unavailable'; end if;
  if p_action not in ('start','extend','pause','resume','end','disable') then
    raise exception 'Invalid session action';
  end if;
  if p_action in ('start','extend') and (p_minutes is null or p_minutes < 1 or p_minutes > 240) then
    raise exception 'Invalid duration';
  end if;

  if p_action='start' then
    deadline := now() + make_interval(mins=>p_minutes);
    update profiles set
      session_duration_minutes=p_minutes,
      session_expires_at=deadline,
      session_paused_seconds=null,
      session_state_revision=session_state_revision+1,
      session_updated_at=now()
      where id=p_profile;
  elsif p_action='extend' then
    if current_profile.session_paused_seconds is not null then
      paused_seconds := least(86400, current_profile.session_paused_seconds + p_minutes*60);
      update profiles set
        session_duration_minutes=coalesce(session_duration_minutes,p_minutes),
        session_paused_seconds=paused_seconds,
        session_state_revision=session_state_revision+1,
        session_updated_at=now()
        where id=p_profile;
    else
      deadline := greatest(coalesce(current_profile.session_expires_at,now()),now()) + make_interval(mins=>p_minutes);
      update profiles set
        session_duration_minutes=coalesce(session_duration_minutes,p_minutes),
        session_expires_at=deadline,
        session_paused_seconds=null,
        session_state_revision=session_state_revision+1,
        session_updated_at=now()
        where id=p_profile;
    end if;
  elsif p_action='pause' then
    if current_profile.session_duration_minutes is null then raise exception 'Timer is not enabled'; end if;
    paused_seconds := greatest(0, floor(extract(epoch from coalesce(current_profile.session_expires_at,now())-now()))::integer);
    update profiles set
      session_expires_at=null,
      session_paused_seconds=paused_seconds,
      session_state_revision=session_state_revision+1,
      session_updated_at=now()
      where id=p_profile;
  elsif p_action='resume' then
    if current_profile.session_duration_minutes is null or coalesce(current_profile.session_paused_seconds,0)<=0 then
      raise exception 'No paused session';
    end if;
    deadline := now() + make_interval(secs=>current_profile.session_paused_seconds);
    update profiles set
      session_expires_at=deadline,
      session_paused_seconds=null,
      session_state_revision=session_state_revision+1,
      session_updated_at=now()
      where id=p_profile;
  elsif p_action='end' then
    update profiles set
      session_duration_minutes=coalesce(session_duration_minutes,20),
      session_expires_at=now(),
      session_paused_seconds=null,
      session_state_revision=session_state_revision+1,
      session_updated_at=now()
      where id=p_profile;
  else
    update profiles set
      session_duration_minutes=null,
      session_expires_at=null,
      session_paused_seconds=null,
      session_state_revision=session_state_revision+1,
      session_updated_at=now()
      where id=p_profile;
  end if;

  select * into current_profile from profiles where id=p_profile;
  return jsonb_build_object(
    'profile_id',current_profile.id,
    'revision',current_profile.session_state_revision,
    'duration_minutes',current_profile.session_duration_minutes,
    'expires_at',current_profile.session_expires_at,
    'paused_seconds',current_profile.session_paused_seconds,
    'updated_at',current_profile.session_updated_at,
    'server_now',now()
  );
end
$$;

create or replace function public.wn_ack_profile_session(
  p_session uuid,
  p_revision bigint,
  p_playback_active boolean
) returns boolean
language plpgsql
security invoker
set search_path=public
as $$
begin
  update child_sessions set
    timer_last_seen_at=now(),
    timer_ack_revision=greatest(timer_ack_revision,p_revision),
    timer_playback_active=p_playback_active
    where id=p_session and revoked_at is null and expires_at>now();
  return found;
end
$$;

revoke all on function public.wn_control_profile_session(uuid,uuid,text,integer),
  public.wn_ack_profile_session(uuid,bigint,boolean) from public,anon,authenticated;
grant execute on function public.wn_control_profile_session(uuid,uuid,text,integer),
  public.wn_ack_profile_session(uuid,bigint,boolean) to service_role;
