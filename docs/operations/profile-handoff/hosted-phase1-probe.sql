-- Root-reviewed qualification probe AFTER phase 1, BEFORE phase 2.
-- Execute this entire file as ONE simple-query batch/implicit transaction.
-- No DDL, phase-2 trigger, Auth account, real household lookup or real-family
-- mutation. Every fixture row is created inside the rollback subtransaction.
-- Root must first inspect external triggers on parents/profiles/devices/sessions.
DO $probe$
DECLARE
  p uuid:=gen_random_uuid();
  foreign_p uuid:=gen_random_uuid();
  a uuid:=gen_random_uuid();
  b uuid:=gen_random_uuid();
  foreign_b uuid:=gen_random_uuid();
  d uuid:=gen_random_uuid();
  sibling_d uuid:=gen_random_uuid();
  s uuid;
  first_s uuid;
  sibling_s uuid;
  checks jsonb:='[]'::jsonb;
  before_a jsonb;
  before_b jsonb;
  rolled_back boolean:=false;
  signature text:='public.wn_admit_device_child_session(uuid,uuid,uuid,boolean,text,text,timestamp with time zone,boolean,text,boolean)';
BEGIN
  PERFORM set_config('lock_timeout','5s',true);
  PERFORM set_config('statement_timeout','25s',true);
  IF EXISTS(SELECT 1 FROM pg_trigger WHERE tgname='child_sessions_require_device_handoff_admission' AND NOT tgisinternal) THEN
    RAISE EXCEPTION 'Probe is phase-1-only; legacy retirement is already active';
  END IF;
  IF EXISTS(SELECT 1 FROM public.parents WHERE id IN(p,foreign_p))
    OR EXISTS(SELECT 1 FROM public.profiles WHERE id IN(a,b,foreign_b))
    OR EXISTS(SELECT 1 FROM public.household_devices WHERE id IN(d,sibling_d))
  THEN RAISE EXCEPTION 'Synthetic fixture UUID collision'; END IF;

  BEGIN
    INSERT INTO public.parents(id,email,parent_pin_hash)
      VALUES(p,'watchnest-handoff-probe-'||p::text||'@example.invalid','synthetic-parent-snapshot'),
        (foreign_p,'watchnest-handoff-probe-'||foreign_p::text||'@example.invalid','synthetic-foreign-snapshot');
    INSERT INTO public.profiles(id,parent_id,display_name)
      VALUES(a,p,'Rollback fixture A'),(b,p,'Rollback fixture B'),(foreign_b,foreign_p,'Rollback fixture other family');
    INSERT INTO public.household_devices(id,parent_id,token_hash,expires_at)
      VALUES(d,p,'rollback-device-'||d::text,clock_timestamp()+interval '1 hour'),
        (sibling_d,p,'rollback-device-'||sibling_d::text,clock_timestamp()+interval '1 hour');

    s:=public.wn_admit_device_child_session(d,p,a,false,null,'probe-null-'||p::text,clock_timestamp()+interval '1 hour',null,null,null);
    IF s IS NOT NULL THEN RAISE EXCEPTION 'FAIL null_parent_not_permission'; END IF;
    checks:=checks||'"null_parent_not_permission"'::jsonb;
    s:=public.wn_admit_device_child_session(d,p,a,false,null,'probe-unbound-'||p::text,clock_timestamp()+interval '1 hour',false,null,false);
    IF s IS NOT NULL THEN RAISE EXCEPTION 'FAIL unbound_device_requires_parent'; END IF;
    checks:=checks||'"unbound_device_requires_parent"'::jsonb;

    PERFORM set_config('watchnest.device_handoff_admission','probe-prior-value',true);
    first_s:=public.wn_admit_device_child_session(d,p,a,false,null,'probe-first-'||p::text,clock_timestamp()+interval '1 hour',true,'synthetic-parent-snapshot',true);
    IF first_s IS NULL OR NOT EXISTS(SELECT 1 FROM public.child_sessions WHERE id=first_s AND device_id=d AND profile_id=a AND admission_version=2 AND revoked_at IS NULL) THEN
      RAISE EXCEPTION 'FAIL parent_initial_handoff_v2';
    END IF;
    checks:=checks||'"parent_initial_handoff_v2"'::jsonb;
    IF current_setting('watchnest.device_handoff_admission',true) IS DISTINCT FROM 'probe-prior-value' THEN
      RAISE EXCEPTION 'FAIL admission_marker_exact_restore';
    END IF;
    checks:=checks||'"admission_marker_exact_restore"'::jsonb;

    s:=public.wn_admit_device_child_session(d,p,a,false,null,'probe-same-'||p::text,clock_timestamp()+interval '1 hour',false,null,false);
    IF s IS NULL THEN RAISE EXCEPTION 'FAIL same_profile_no_parent'; END IF;
    checks:=checks||'"same_profile_no_parent"'::jsonb;
    IF NOT EXISTS(SELECT 1 FROM public.child_sessions WHERE id=first_s AND revoked_at IS NOT NULL) THEN
      RAISE EXCEPTION 'FAIL same_profile_old_token_revoked';
    END IF;
    checks:=checks||'"same_profile_old_token_revoked"'::jsonb;
    first_s:=s;

    PERFORM public.wn_control_profile_session_v2(p,a,'start',1);
    PERFORM public.wn_control_profile_session_v2(p,a,'end',null);
    SELECT to_jsonb(x) INTO before_a FROM public.profiles x WHERE id=a;
    SELECT to_jsonb(x) INTO before_b FROM public.profiles x WHERE id=b;
    s:=public.wn_admit_device_child_session(d,p,b,false,null,'probe-bypass-'||p::text,clock_timestamp()+interval '1 hour',false,null,false);
    IF s IS NOT NULL THEN RAISE EXCEPTION 'FAIL stopped_child_sibling_bypass_denied'; END IF;
    checks:=checks||'"stopped_child_sibling_bypass_denied"'::jsonb;
    IF (public.wn_resolve_profile_session(p,a,false)->>'parent_blocked')::boolean IS DISTINCT FROM true THEN
      RAISE EXCEPTION 'FAIL parent_end_not_cleared';
    END IF;
    checks:=checks||'"parent_end_not_cleared"'::jsonb;

    sibling_s:=public.wn_admit_device_child_session(sibling_d,p,b,false,null,'probe-other-device-'||p::text,clock_timestamp()+interval '1 hour',true,'synthetic-parent-snapshot',true);
    IF sibling_s IS NULL THEN RAISE EXCEPTION 'FAIL legitimate_sibling_other_device'; END IF;
    checks:=checks||'"legitimate_sibling_other_device"'::jsonb;
    s:=public.wn_admit_device_child_session(d,p,b,false,null,'probe-stale-parent-'||p::text,clock_timestamp()+interval '1 hour',true,'obsolete-parent-snapshot',true);
    IF s IS NOT NULL THEN RAISE EXCEPTION 'FAIL stale_parent_pin_snapshot_denied'; END IF;
    checks:=checks||'"stale_parent_pin_snapshot_denied"'::jsonb;

    UPDATE public.profiles SET pin_enabled=true,pin_hash='synthetic-child-snapshot' WHERE id=b;
    s:=public.wn_admit_device_child_session(d,p,b,false,null,'probe-stale-child-'||p::text,clock_timestamp()+interval '1 hour',true,'synthetic-parent-snapshot',true);
    IF s IS NOT NULL THEN RAISE EXCEPTION 'FAIL stale_child_pin_snapshot_denied'; END IF;
    checks:=checks||'"stale_child_pin_snapshot_denied"'::jsonb;
    s:=public.wn_admit_device_child_session(d,p,b,true,'synthetic-child-snapshot','probe-parent-handoff-'||p::text,clock_timestamp()+interval '1 hour',true,'synthetic-parent-snapshot',true);
    IF s IS NULL OR NOT EXISTS(SELECT 1 FROM public.household_devices WHERE id=d AND active_profile_id=b) THEN
      RAISE EXCEPTION 'FAIL parent_sibling_handoff';
    END IF;
    checks:=checks||'"parent_sibling_handoff"'::jsonb;
    IF NOT EXISTS(SELECT 1 FROM public.child_sessions WHERE id=first_s AND revoked_at IS NOT NULL)
      OR NOT EXISTS(SELECT 1 FROM public.child_sessions WHERE id=sibling_s AND revoked_at IS NULL) THEN
      RAISE EXCEPTION 'FAIL local_old_token_revoked_other_device_preserved';
    END IF;
    checks:=checks||'"local_old_token_revoked_other_device_preserved"'::jsonb;
    UPDATE public.profiles SET pin_enabled=false,pin_hash=null WHERE id=b;
    IF (SELECT to_jsonb(x) FROM public.profiles x WHERE id=a) IS DISTINCT FROM before_a
      OR (SELECT to_jsonb(x) FROM public.profiles x WHERE id=b) IS DISTINCT FROM before_b THEN
      RAISE EXCEPTION 'FAIL handoff_does_not_transfer_or_mutate_profile_time';
    END IF;
    checks:=checks||'"handoff_does_not_transfer_or_mutate_profile_time"'::jsonb;

    s:=public.wn_admit_device_child_session(d,p,a,false,null,'probe-old-profile-'||p::text,clock_timestamp()+interval '1 hour',false,null,false);
    IF s IS NOT NULL THEN RAISE EXCEPTION 'FAIL old_profile_replay_denied'; END IF;
    checks:=checks||'"old_profile_replay_denied"'::jsonb;
    s:=public.wn_admit_device_child_session(d,foreign_p,foreign_b,false,null,'probe-wrong-parent-'||p::text,clock_timestamp()+interval '1 hour',true,'synthetic-foreign-snapshot',true);
    IF s IS NOT NULL THEN RAISE EXCEPTION 'FAIL wrong_device_parent_denied'; END IF;
    checks:=checks||'"wrong_device_parent_denied"'::jsonb;
    s:=public.wn_admit_device_child_session(d,p,foreign_b,false,null,'probe-foreign-profile-'||p::text,clock_timestamp()+interval '1 hour',true,'synthetic-parent-snapshot',true);
    IF s IS NOT NULL THEN RAISE EXCEPTION 'FAIL foreign_profile_denied'; END IF;
    checks:=checks||'"foreign_profile_denied"'::jsonb;

    UPDATE public.household_devices SET revoked_at=clock_timestamp() WHERE id=d;
    s:=public.wn_admit_device_child_session(d,p,b,false,null,'probe-revoked-device-'||p::text,clock_timestamp()+interval '1 hour',true,'synthetic-parent-snapshot',true);
    IF s IS NOT NULL THEN RAISE EXCEPTION 'FAIL revoked_device_denied'; END IF;
    checks:=checks||'"revoked_device_denied"'::jsonb;
    UPDATE public.household_devices SET revoked_at=null,expires_at=clock_timestamp()-interval '1 second' WHERE id=d;
    s:=public.wn_admit_device_child_session(d,p,b,false,null,'probe-expired-device-'||p::text,clock_timestamp()+interval '1 hour',true,'synthetic-parent-snapshot',true);
    IF s IS NOT NULL THEN RAISE EXCEPTION 'FAIL expired_device_denied'; END IF;
    checks:=checks||'"expired_device_denied"'::jsonb;

    s:=public.wn_admit_child_session(b,false,null,'probe-legacy-'||p::text,clock_timestamp()+interval '1 hour');
    IF s IS NULL OR NOT EXISTS(SELECT 1 FROM public.child_sessions WHERE id=s AND admission_version=1) THEN
      RAISE EXCEPTION 'FAIL phase1_legacy_admission_still_compatible';
    END IF;
    checks:=checks||'"phase1_legacy_admission_still_compatible"'::jsonb;
    IF has_function_privilege('anon',signature,'execute')
      OR has_function_privilege('authenticated',signature,'execute')
      OR NOT has_function_privilege('service_role',signature,'execute')
      OR (SELECT prosecdef FROM pg_proc WHERE oid=signature::regprocedure) THEN
      RAISE EXCEPTION 'FAIL invoker_service_only_admission';
    END IF;
    checks:=checks||'"invoker_service_only_admission"'::jsonb;

    RAISE EXCEPTION USING errcode='WNH01',message='watchnest-profile-handoff-rollback-success';
  EXCEPTION WHEN SQLSTATE 'WNH01' THEN
    IF SQLERRM<>'watchnest-profile-handoff-rollback-success' THEN RAISE; END IF;
    rolled_back:=true;
  END;
  IF NOT rolled_back OR EXISTS(SELECT 1 FROM public.parents WHERE id IN(p,foreign_p))
    OR EXISTS(SELECT 1 FROM public.profiles WHERE id IN(a,b,foreign_b))
    OR EXISTS(SELECT 1 FROM public.household_devices WHERE id IN(d,sibling_d))
    OR EXISTS(SELECT 1 FROM public.child_sessions WHERE token_hash LIKE 'probe-%-'||p::text)
  THEN RAISE EXCEPTION 'FAIL fixture_rollback_absence'; END IF;
  checks:=checks||'"fixture_rollback_absence"'::jsonb;
  PERFORM set_config('watchnest.profile_handoff_probe_result',
    jsonb_build_object('scope','hosted phase-1 SQL only; not HTTP/media/physical or native concurrency',
      'checks',checks,'passed',jsonb_array_length(checks),'fixture_rows_remaining',0)::text,true);
END
$probe$;
SELECT current_setting('watchnest.profile_handoff_probe_result')::jsonb AS qualification;
