-- Read-only captured existing timer functions before daily migration.
-- Historical baseline only; do not blindly restore after daily adoption: this would weaken persistent-lock compatibility.

CREATE OR REPLACE FUNCTION public.wn_control_profile_session(p_parent uuid, p_profile uuid, p_action text, p_minutes integer DEFAULT NULL::integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
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
$function$
;
-- original ACL: {postgres=X/postgres,service_role=X/postgres}

CREATE OR REPLACE FUNCTION public.wn_end_profile_session(p_parent uuid, p_profile uuid, p_disable boolean)
 RETURNS boolean
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
begin
  update profiles set
    session_duration_minutes=case when p_disable then null else session_duration_minutes end,
    session_expires_at=case when p_disable then null else now() end
    where id=p_profile and parent_id=p_parent and archived_at is null;
  return found;
end
$function$
;
-- original ACL: {postgres=X/postgres,service_role=X/postgres}

CREATE OR REPLACE FUNCTION public.wn_start_profile_session(p_parent uuid, p_profile uuid, p_minutes integer)
 RETURNS timestamp with time zone
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
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
$function$
;
-- original ACL: {postgres=X/postgres,service_role=X/postgres}
