-- PHASE 2: DO NOT APPLY with phase 1 or merely for a preview/staged deployment.
-- Apply ONLY after the exact qualified device-handoff application is promoted
-- to all canonical production aliases and its new admission path is verified.
-- CLI-generated as a migration, deliberately moved OUT of automatic migrations.
-- This retires legacy child tokens/admission across retained old deployment
-- origins. Keep those deployment artifacts for forensics, not permissive rollback.
-- After cutover rollback must retain the new guarded admission or fail closed;
-- do not remove this trigger/revive v1 tokens/restore unsafe legacy child entry.
begin;
set local lock_timeout='5s';

-- Drain in-flight legacy INSERT/UPDATE transactions before revocation. The
-- same transaction installs the insertion barrier and revokes every v1 token:
-- pre-lock commits are included; post-commit queued inserts hit the barrier.
lock table public.child_sessions in share row exclusive mode;

create or replace function public.wn_require_device_handoff_admission()
returns trigger
language plpgsql
security invoker
set search_path=public
as $$
begin
  if new.admission_version is distinct from 2
    or current_setting('watchnest.device_handoff_admission',true) is distinct from '2'
  then
    raise exception 'This WatchNest build can no longer start child sessions. Open the current WatchNest app.'
      using errcode='28000';
  end if;
  return new;
end
$$;

revoke all on function public.wn_require_device_handoff_admission()
  from public,anon,authenticated;
grant execute on function public.wn_require_device_handoff_admission()
  to service_role;

drop trigger if exists child_sessions_require_device_handoff_admission
  on public.child_sessions;
create trigger child_sessions_require_device_handoff_admission
  before insert on public.child_sessions
  for each row execute function public.wn_require_device_handoff_admission();

-- Do not touch profile budgets, approvals, PINs, family settings or v2 sessions.
update public.child_sessions set revoked_at=clock_timestamp()
  where admission_version=1 and revoked_at is null;
commit;
