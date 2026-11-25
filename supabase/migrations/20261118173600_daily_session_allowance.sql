-- Daily allowance is an elapsed wall-clock access window, not watch analytics.
-- Existing households stay in their existing one-time/unlimited mode.
alter table public.profiles
  add column if not exists session_mode text not null default 'once'
    check (session_mode in ('once','daily')),
  add column if not exists daily_allowance_minutes smallint
    check (daily_allowance_minutes between 1 and 240),
  add column if not exists daily_period_start timestamptz,
  add column if not exists daily_reset_at timestamptz,
  add column if not exists daily_period_timezone text,
  add column if not exists daily_started boolean not null default false,
  add column if not exists session_parent_blocked boolean not null default false,
  add column if not exists session_limit_disabled boolean not null default false;

alter table public.profiles add constraint profiles_daily_allowance_configured
  check (session_mode <> 'daily' or daily_allowance_minutes is not null);

-- No client clock is accepted by either production RPC. This narrow clock
-- helper permits database-owned deterministic temporal integration fixtures.
create function public.wn_session_clock() returns timestamptz
language sql volatile security invoker set search_path=public
as $$ select clock_timestamp() $$;

create function public.wn_daily_session_period(p_at timestamptz,p_timezone text)
returns table(period_start timestamptz,reset_at timestamptz)
language plpgsql stable security invoker set search_path=public
as $$
declare local_at timestamp; d date; fixed_offset interval; offset_minutes integer; normalized_zone text;
begin
  -- Finite no-slash alias normalization measured from pg_timezone_names /
  -- pg_timezone_abbrevs plus documented legacy SHORT_IDS, against actual
  -- Node24.22.1 / ICU78.3 / tz2026e. Raw abbreviations can have fixed PostgreSQL
  -- meanings which differ from Intl's region/DST meaning. Slash IANA names
  -- pass through unchanged; future Parent writes also canonicalize in the API.
  normalized_zone := case upper(p_timezone)
    when 'ACT' then 'Australia/Darwin'
    when 'AET' then 'Australia/Sydney'
    when 'AGT' then 'America/Buenos_Aires'
    when 'ART' then 'Africa/Cairo'
    when 'AST' then 'America/Anchorage'
    when 'BET' then 'America/Sao_Paulo'
    when 'BST' then 'Asia/Dhaka'
    when 'CAT' then 'Africa/Maputo'
    when 'CET' then 'Europe/Brussels'
    when 'CNT' then 'America/St_Johns'
    when 'CST' then 'America/Chicago'
    when 'CST6CDT' then 'CST6CDT'
    when 'CTT' then 'Asia/Shanghai'
    when 'CUBA' then 'America/Havana'
    when 'EAT' then 'Africa/Nairobi'
    when 'ECT' then 'Europe/Paris'
    when 'EET' then 'Europe/Athens'
    when 'EGYPT' then 'Africa/Cairo'
    when 'EIRE' then 'Europe/Dublin'
    when 'EST' then 'America/Panama'
    when 'EST5EDT' then 'EST5EDT'
    when 'GB' then 'Europe/London'
    when 'GB-EIRE' then 'Europe/London'
    when 'GMT' then 'UTC'
    when 'GMT-0' then 'UTC'
    when 'GMT+0' then 'UTC'
    when 'GMT0' then 'UTC'
    when 'GREENWICH' then 'UTC'
    when 'HONGKONG' then 'Asia/Hong_Kong'
    when 'HST' then 'Pacific/Honolulu'
    when 'ICELAND' then 'Atlantic/Reykjavik'
    when 'IET' then 'America/Indianapolis'
    when 'IRAN' then 'Asia/Tehran'
    when 'ISRAEL' then 'Asia/Jerusalem'
    when 'IST' then 'Asia/Calcutta'
    when 'JAMAICA' then 'America/Jamaica'
    when 'JAPAN' then 'Asia/Tokyo'
    when 'JST' then 'Asia/Tokyo'
    when 'KWAJALEIN' then 'Pacific/Kwajalein'
    when 'LIBYA' then 'Africa/Tripoli'
    when 'MET' then 'Europe/Brussels'
    when 'MIT' then 'Pacific/Apia'
    when 'MST' then 'America/Phoenix'
    when 'MST7MDT' then 'MST7MDT'
    when 'NAVAJO' then 'America/Denver'
    when 'NET' then 'Asia/Yerevan'
    when 'NST' then 'Pacific/Auckland'
    when 'NZ' then 'Pacific/Auckland'
    when 'NZ-CHAT' then 'Pacific/Chatham'
    when 'PLT' then 'Asia/Karachi'
    when 'PNT' then 'America/Phoenix'
    when 'POLAND' then 'Europe/Warsaw'
    when 'PORTUGAL' then 'Europe/Lisbon'
    when 'PRC' then 'Asia/Shanghai'
    when 'PRT' then 'America/Puerto_Rico'
    when 'PST' then 'America/Los_Angeles'
    when 'PST8PDT' then 'PST8PDT'
    when 'ROC' then 'Asia/Taipei'
    when 'ROK' then 'Asia/Seoul'
    when 'SINGAPORE' then 'Asia/Singapore'
    when 'SST' then 'Pacific/Guadalcanal'
    when 'TURKEY' then 'Europe/Istanbul'
    when 'UCT' then 'UTC'
    when 'UNIVERSAL' then 'UTC'
    when 'UTC' then 'UTC'
    when 'VST' then 'Asia/Saigon'
    when 'W-SU' then 'Europe/Moscow'
    when 'WET' then 'Europe/Lisbon'
    when 'ZULU' then 'UTC'
    else p_timezone end;
  -- Intl accepts ISO-style offsets, whose sign is the reverse of PostgreSQL's
  -- textual POSIX zone interpretation. Use the INTERVAL overload for these
  -- exact numeric forms; leave named IANA zones (including Etc/GMT+3) alone.
  if p_timezone ~ '^[+-]([01][0-9]|2[0-3])(:?[0-5][0-9])?$' then
    offset_minutes := substring(p_timezone from 2 for 2)::integer*60 +
      case when length(p_timezone)=3 then 0
           when length(p_timezone)=5 then substring(p_timezone from 4 for 2)::integer
           else substring(p_timezone from 5 for 2)::integer end;
    if left(p_timezone,1)='-' then offset_minutes := -offset_minutes; end if;
    fixed_offset := make_interval(mins=>offset_minutes);
    local_at := p_at at time zone fixed_offset;
  else
    local_at := p_at at time zone normalized_zone;
  end if;
  d := local_at::date - case when local_at::time < time '07:00' then 1 else 0 end;
  if fixed_offset is not null then
    return query select (d + time '07:00') at time zone fixed_offset,
                        ((d + 1) + time '07:00') at time zone fixed_offset;
  else
    return query select (d + time '07:00') at time zone normalized_zone,
                        ((d + 1) + time '07:00') at time zone normalized_zone;
  end if;
end
$$;

create function public.wn_profile_session_snapshot(p public.profiles,p_now timestamptz)
returns jsonb language sql stable security invoker set search_path=public
as $$
select jsonb_build_object(
  'profile_id',p.id,'revision',p.session_state_revision,
  'duration_minutes',case when p.session_limit_disabled then null else p.session_duration_minutes end,'expires_at',p.session_expires_at,
  'paused_seconds',p.session_paused_seconds,'updated_at',p.session_updated_at,
  'server_now',p_now,'mode',p.session_mode,
  'daily_allowance_minutes',p.daily_allowance_minutes,
  'period_start',p.daily_period_start,'reset_at',p.daily_reset_at,
  'daily_started',p.daily_started,'parent_blocked',p.session_parent_blocked,
  'timezone',p.daily_period_timezone,'limit_disabled',p.session_limit_disabled,
  'ready',p.session_mode='daily' and not p.daily_started
    and p.session_paused_seconds is null and not p.session_parent_blocked,
  'profile_state',jsonb_build_object(
    'session_duration_minutes',p.session_duration_minutes,
    'session_expires_at',p.session_expires_at,
    'session_paused_seconds',p.session_paused_seconds,
    'session_state_revision',p.session_state_revision,
    'session_updated_at',p.session_updated_at,'session_mode',p.session_mode,
    'daily_allowance_minutes',p.daily_allowance_minutes,
    'daily_period_start',p.daily_period_start,'daily_reset_at',p.daily_reset_at,
    'daily_period_timezone',p.daily_period_timezone,'daily_started',p.daily_started,
    'session_parent_blocked',p.session_parent_blocked,
    'session_limit_disabled',p.session_limit_disabled));
$$;

create function public.wn_resolve_profile_session(
  p_parent uuid,p_profile uuid,p_activate boolean default false
) returns jsonb language plpgsql security invoker set search_path=public
as $$
declare p profiles; t timestamptz; z text; a timestamptz; b timestamptz;
begin
  select * into p from profiles where id=p_profile and parent_id=p_parent
    and archived_at is null for update;
  if not found then raise exception 'Profile unavailable'; end if;
  t := wn_session_clock();
  if p.session_mode='daily' then
    -- Parent timezone changes take effect at the existing stored boundary,
    -- not as an opportunistic second allowance within the current period.
    if p.daily_reset_at is null or t >= p.daily_reset_at then
      select timezone into z from parents where id=p_parent;
      z := coalesce(z,'America/New_York');
      select period_start,reset_at into a,b from wn_daily_session_period(t,z);
      update profiles set daily_period_start=a,daily_reset_at=b,daily_period_timezone=z,
        daily_started=false,session_duration_minutes=daily_allowance_minutes,
        session_expires_at=case when session_parent_blocked then t else null end,
        session_paused_seconds=case when session_paused_seconds is not null
          then daily_allowance_minutes*60 else null end,
        session_state_revision=session_state_revision+1,session_updated_at=t
        where id=p_profile returning * into p;
    end if;
    if p_activate and not p.daily_started and not p.session_parent_blocked
      and p.session_paused_seconds is null then
      update profiles set daily_started=true,
        session_expires_at=least(t+make_interval(mins=>daily_allowance_minutes),daily_reset_at),
        session_state_revision=session_state_revision+1,session_updated_at=t
        where id=p_profile returning * into p;
    end if;
  end if;
  return wn_profile_session_snapshot(p,t);
end
$$;

-- Versioned implementation plus compatible legacy adapters below. Both old and
-- new applications observe deny markers for a deliberate Parent block.
create function public.wn_control_profile_session_v2(
  p_parent uuid,p_profile uuid,p_action text,p_minutes integer default null
) returns jsonb language plpgsql security invoker set search_path=public
as $$
declare p profiles; t timestamptz; z text; a timestamptz; b timestamptz;
  seconds integer; deadline timestamptz;
begin
  if p_action is null or p_action not in ('start','daily','extend','pause','resume','end','disable') then
    raise exception 'Invalid session action';
  end if;
  if p_action in ('start','daily','extend') and
    (p_minutes is null or p_minutes < 1 or p_minutes > 240) then
    raise exception 'Invalid duration';
  end if;
  -- Resolver owns the same row lock until this transaction commits; rollover
  -- and a Parent action therefore cannot overwrite each other.
  select (wn_resolve_profile_session(p_parent,p_profile,false)->>'server_now')::timestamptz into t;
  select * into p from profiles where id=p_profile and parent_id=p_parent
    and archived_at is null for update;
  if not found then raise exception 'Profile unavailable'; end if;
  -- Use the resolver's post-lock instant as this command's linearization
  -- point. A second clock sample could cross7AM after rollover was checked.
  if p_action='start' then
    update profiles set session_mode='once',daily_allowance_minutes=null,
      daily_period_start=null,daily_reset_at=null,daily_period_timezone=null,daily_started=false,
      session_duration_minutes=p_minutes,session_expires_at=t+make_interval(mins=>p_minutes),
      session_paused_seconds=null,session_parent_blocked=false,session_limit_disabled=false,
      session_state_revision=session_state_revision+1,session_updated_at=t
      where id=p_profile returning * into p;
  elsif p_action='daily' then
    if p.session_mode='daily' and p.daily_allowance_minutes=p_minutes then
      return wn_profile_session_snapshot(p,t);
    end if;
    select timezone into z from parents where id=p_parent;
    z := coalesce(z,'America/New_York');
    select period_start,reset_at into a,b from wn_daily_session_period(t,z);
    update profiles set session_mode='daily',daily_allowance_minutes=p_minutes,
      daily_period_start=a,daily_reset_at=b,daily_period_timezone=z,daily_started=false,
      session_duration_minutes=p_minutes,session_limit_disabled=false,
      session_expires_at=case when session_parent_blocked then t else null end,
      session_paused_seconds=case when session_paused_seconds is not null then p_minutes*60 else null end,
      session_state_revision=session_state_revision+1,session_updated_at=t
      where id=p_profile returning * into p;
  elsif p_action='extend' then
    if p.session_paused_seconds is not null or p.session_parent_blocked then
      seconds := least(86400,coalesce(p.session_paused_seconds,
        case when p.session_mode='daily' and not p.daily_started then p.daily_allowance_minutes*60 else 0 end)+p_minutes*60);
      update profiles set session_duration_minutes=case when session_limit_disabled then p_minutes else coalesce(session_duration_minutes,p_minutes) end,
        session_limit_disabled=false,session_paused_seconds=seconds,session_expires_at=case when session_parent_blocked then t else null end,
        session_state_revision=session_state_revision+1,session_updated_at=t
        where id=p_profile returning * into p;
    elsif p.session_mode='daily' and not p.daily_started then
      -- Extending an unstarted daily window starts that day's window, with the
      -- explicit Parent extension, and cannot cross its reset boundary.
      deadline := least(t+make_interval(mins=>p.daily_allowance_minutes+p_minutes),p.daily_reset_at);
      update profiles set daily_started=true,session_expires_at=deadline,
        session_state_revision=session_state_revision+1,session_updated_at=t
        where id=p_profile returning * into p;
    else
      deadline := greatest(coalesce(p.session_expires_at,t),t)+make_interval(mins=>p_minutes);
      if p.session_mode='daily' then deadline := least(deadline,p.daily_reset_at); end if;
      update profiles set session_duration_minutes=case when session_limit_disabled then p_minutes else coalesce(session_duration_minutes,p_minutes) end,
        session_limit_disabled=false,session_expires_at=deadline,session_paused_seconds=null,
        session_state_revision=session_state_revision+1,session_updated_at=t
        where id=p_profile returning * into p;
    end if;
  elsif p_action='pause' then
    if p.session_duration_minutes is null or p.session_limit_disabled then raise exception 'Timer is not enabled'; end if;
    if p.session_paused_seconds is null then
      seconds := case when p.session_mode='daily' and not p.daily_started
        then p.daily_allowance_minutes*60
        else greatest(0,floor(extract(epoch from coalesce(p.session_expires_at,t)-t))::integer) end;
      update profiles set session_expires_at=null,session_paused_seconds=seconds,
        session_state_revision=session_state_revision+1,session_updated_at=t
        where id=p_profile returning * into p;
    end if;
  elsif p_action='resume' then
    if (p.session_duration_minutes is null or p.session_limit_disabled) and p.session_parent_blocked then
      update profiles set session_parent_blocked=false,session_limit_disabled=false,
        session_duration_minutes=null,session_expires_at=null,session_paused_seconds=null,
        session_state_revision=session_state_revision+1,session_updated_at=t
        where id=p_profile returning * into p;
    else
      seconds := case when p.session_mode='daily' and not p.daily_started
        then coalesce(p.session_paused_seconds,p.daily_allowance_minutes*60)
        else coalesce(p.session_paused_seconds,0) end;
      if seconds<=0 then raise exception 'No paused session'; end if;
      deadline := t+make_interval(secs=>seconds);
      if p.session_mode='daily' then deadline := least(deadline,p.daily_reset_at); end if;
      update profiles set session_expires_at=deadline,session_paused_seconds=null,
        session_parent_blocked=false,daily_started=(session_mode='daily'),
        session_state_revision=session_state_revision+1,session_updated_at=t
        where id=p_profile returning * into p;
    end if;
  elsif p_action='end' then
    if p.session_parent_blocked then return wn_profile_session_snapshot(p,t); end if;
    update profiles set session_parent_blocked=true,
      session_limit_disabled=(session_limit_disabled or session_duration_minutes is null),
      session_duration_minutes=coalesce(session_duration_minutes,1),
      session_expires_at=t,session_paused_seconds=null,
      session_state_revision=session_state_revision+1,session_updated_at=t
      where id=p_profile returning * into p;
  else
    -- Removing a time limit does not lift a deliberate ongoing Parent block.
    update profiles set session_mode='once',daily_allowance_minutes=null,
      daily_period_start=null,daily_reset_at=null,daily_period_timezone=null,daily_started=false,
      session_duration_minutes=case when session_parent_blocked then 1 else null end,
      session_expires_at=case when session_parent_blocked then t else null end,
      session_paused_seconds=null,session_limit_disabled=true,
      session_state_revision=session_state_revision+1,session_updated_at=t
      where id=p_profile returning * into p;
  end if;
  return wn_profile_session_snapshot(p,t);
end
$$;

create or replace function public.wn_control_profile_session(
  p_parent uuid,p_profile uuid,p_action text,p_minutes integer default null
) returns jsonb language sql security invoker set search_path=public
as $$ select wn_control_profile_session_v2(p_parent,p_profile,p_action,p_minutes) $$;

create or replace function public.wn_start_profile_session(
  p_parent uuid,p_profile uuid,p_minutes integer
) returns timestamptz language sql security invoker set search_path=public
as $$ select (wn_control_profile_session_v2(p_parent,p_profile,'start',p_minutes)->>'expires_at')::timestamptz $$;

create or replace function public.wn_end_profile_session(
  p_parent uuid,p_profile uuid,p_disable boolean
) returns boolean language plpgsql security invoker set search_path=public
as $$
begin
  if not exists(select 1 from profiles where id=p_profile and parent_id=p_parent and archived_at is null) then
    return false;
  end if;
  perform wn_control_profile_session_v2(p_parent,p_profile,
    case when p_disable then 'disable' else 'end' end,null);
  return true;
end
$$;

revoke all on function public.wn_session_clock(),
  public.wn_daily_session_period(timestamptz,text),
  public.wn_profile_session_snapshot(public.profiles,timestamptz),
  public.wn_resolve_profile_session(uuid,uuid,boolean),
  public.wn_control_profile_session_v2(uuid,uuid,text,integer),
  public.wn_control_profile_session(uuid,uuid,text,integer),
  public.wn_start_profile_session(uuid,uuid,integer),
  public.wn_end_profile_session(uuid,uuid,boolean)
  from public,anon,authenticated;
grant execute on function public.wn_session_clock(),
  public.wn_daily_session_period(timestamptz,text),
  public.wn_profile_session_snapshot(public.profiles,timestamptz),
  public.wn_resolve_profile_session(uuid,uuid,boolean),
  public.wn_control_profile_session_v2(uuid,uuid,text,integer),
  public.wn_control_profile_session(uuid,uuid,text,integer),
  public.wn_start_profile_session(uuid,uuid,integer),
  public.wn_end_profile_session(uuid,uuid,boolean)
  to service_role;
