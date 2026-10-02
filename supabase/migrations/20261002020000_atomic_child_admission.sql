create or replace function public.wn_admit_child_session(
  p_profile uuid,
  p_expected_pin_enabled boolean,
  p_expected_pin_hash text,
  p_token_hash text,
  p_expires timestamptz
) returns uuid
language plpgsql
security invoker
set search_path=public
as $$
declare
  v_profile profiles;
  v_session uuid;
begin
  select * into v_profile
  from profiles
  where id=p_profile and archived_at is null
  for update;

  if not found
    or v_profile.pin_enabled is distinct from p_expected_pin_enabled
    or (v_profile.pin_enabled and v_profile.pin_hash is distinct from p_expected_pin_hash)
  then
    return null;
  end if;

  insert into child_sessions(profile_id,token_hash,expires_at)
  values(v_profile.id,p_token_hash,p_expires)
  returning id into v_session;
  return v_session;
end
$$;

create or replace function public.wn_update_profile_security(
  p_parent uuid,
  p_profile uuid,
  p_pin_enabled boolean,
  p_pin_hash text,
  p_replace_hash boolean
) returns boolean
language plpgsql
security invoker
set search_path=public
as $$
declare
  v_profile profiles;
  v_effective_hash text;
  v_changed boolean;
begin
  select * into v_profile
  from profiles
  where id=p_profile and parent_id=p_parent and archived_at is null
  for update;
  if not found then return false; end if;

  v_effective_hash=case when p_replace_hash then p_pin_hash else v_profile.pin_hash end;
  if p_pin_enabled and v_effective_hash is null then
    raise exception 'Set a passcode first';
  end if;

  v_changed=v_profile.pin_enabled is distinct from p_pin_enabled
    or (p_replace_hash and v_profile.pin_hash is distinct from p_pin_hash);

  update profiles
  set pin_enabled=p_pin_enabled,
      pin_hash=v_effective_hash
  where id=v_profile.id;

  if v_changed then
    update child_sessions
    set revoked_at=now()
    where profile_id=v_profile.id and revoked_at is null;
  end if;
  return true;
end
$$;

revoke all on function public.wn_admit_child_session(uuid,boolean,text,text,timestamptz) from public,anon,authenticated;
revoke all on function public.wn_update_profile_security(uuid,uuid,boolean,text,boolean) from public,anon,authenticated;
grant execute on function public.wn_admit_child_session(uuid,boolean,text,text,timestamptz) to service_role;
grant execute on function public.wn_update_profile_security(uuid,uuid,boolean,text,boolean) to service_role;