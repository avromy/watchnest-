-- A trusted device is not authority to choose a different child's identity.
-- This additive migration leaves timers, approvals and other devices untouched.
-- Phase 1 remains compatible with the current production application's legacy
-- admission. Retiring legacy admission is a SEPARATE post-promotion operation.
alter table public.child_sessions
  add column admission_version smallint not null default 1
    check (admission_version in (1,2));

alter table public.household_devices
  add column active_profile_id uuid,
  add constraint household_devices_active_profile_family_fk
    foreign key(active_profile_id,parent_id)
    references public.profiles(id,parent_id);

-- Carry only an unambiguous existing live identity. Missing/ambiguous history
-- stays NULL and requires a deliberate Parent handoff; NULL is not free entry.
with unambiguous as (
  select s.device_id, min(s.profile_id::text)::uuid as profile_id
  from public.child_sessions s
  join public.household_devices d on d.id=s.device_id
  join public.profiles p on p.id=s.profile_id and p.parent_id=d.parent_id
  where s.revoked_at is null and s.expires_at>clock_timestamp()
    and d.revoked_at is null and d.expires_at>clock_timestamp()
    and p.archived_at is null
  group by s.device_id
  having count(distinct s.profile_id)=1
)
update public.household_devices d
  set active_profile_id=u.profile_id
  from unambiguous u where d.id=u.device_id;

create or replace function public.wn_admit_device_child_session(
  p_device uuid,
  p_parent uuid,
  p_profile uuid,
  p_expected_pin_enabled boolean,
  p_expected_pin_hash text,
  p_token_hash text,
  p_expires timestamptz,
  p_parent_authorized boolean,
  p_expected_parent_pin_hash text,
  p_bypass_child_pin boolean default false
) returns uuid
language plpgsql
security invoker
set search_path=public
as $$
declare
  v_parent parents;
  v_device household_devices;
  v_profile profiles;
  v_session uuid;
  v_now timestamptz;
  v_previous_admission text;
begin
  -- Match the lock order used by Parent security changes: Parent before device
  -- before profile before sessions. A changed PIN invalidates its verification
  -- snapshot rather than turning stale verification into a switch grant.
  select * into v_parent from parents where id=p_parent for update;
  if not found then return null; end if;

  select * into v_device from household_devices
    where id=p_device and parent_id=p_parent for update;
  if not found then return null; end if;

  v_now:=clock_timestamp();
  if v_device.revoked_at is not null or v_device.expires_at<=v_now
    or p_expires is null or p_expires<=v_now
    or p_token_hash is null or length(p_token_hash)=0
  then return null; end if;

  if p_parent_authorized is true then
    if v_parent.parent_pin_hash is distinct from p_expected_parent_pin_hash
    then return null; end if;
  elsif p_bypass_child_pin is true
    or v_device.active_profile_id is distinct from p_profile
  then return null; end if;

  select * into v_profile from profiles
    where id=p_profile and parent_id=p_parent and archived_at is null
    for update;
  if not found
    or v_profile.pin_enabled is distinct from p_expected_pin_enabled
    or (v_profile.pin_enabled and v_profile.pin_hash is distinct from p_expected_pin_hash)
  then return null; end if;

  -- Replacement is atomic with the binding. Old tabs/tokens cannot keep the
  -- previous identity alive on this device. A legitimate sibling on another
  -- device and every profile's time allowance are unaffected.
  update child_sessions set revoked_at=v_now
    where device_id=p_device and revoked_at is null;
  update household_devices set active_profile_id=p_profile where id=p_device;
  -- The transaction-local marker is NOT a credential. It distinguishes this
  -- reviewed service-only path from old deployed RPCs/direct inserts after the
  -- separate retirement trigger is enabled. Always restore the prior value.
  v_previous_admission:=current_setting('watchnest.device_handoff_admission',true);
  perform set_config('watchnest.device_handoff_admission','2',true);
  insert into child_sessions(profile_id,device_id,token_hash,expires_at,admission_version)
    values(p_profile,p_device,p_token_hash,p_expires,2)
    returning id into v_session;
  perform set_config('watchnest.device_handoff_admission',coalesce(v_previous_admission,''),true);
  return v_session;
end
$$;

revoke all on function public.wn_admit_device_child_session(uuid,uuid,uuid,boolean,text,text,timestamptz,boolean,text,boolean)
  from public,anon,authenticated;
grant execute on function public.wn_admit_device_child_session(uuid,uuid,uuid,boolean,text,text,timestamptz,boolean,text,boolean)
  to service_role;
