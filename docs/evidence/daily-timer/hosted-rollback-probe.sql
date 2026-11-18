-- Qualification probe only. Root executes after independent review.
-- Execute this entire file as ONE simple-query batch / implicit transaction.
-- No persistent DDL, clock replacement, Parent mutation or real-profile timer mutation.
-- The sole fixture INSERT and all fixture updates are rolled back by the inner
-- exception subtransaction. Only the exact own success marker is caught.
-- Any other error propagates and rolls back the complete outer transaction.
DO $probe$
DECLARE
  parent_key uuid;
  probe_key uuid := gen_random_uuid();
  wrong_parent_key uuid := gen_random_uuid();
  a jsonb;
  b jsonb;
  c jsonb;
  checks jsonb := '[]'::jsonb;
  first_expiry timestamptz;
  first_revision bigint;
  first_reset timestamptz;
  first_start timestamptz;
  span interval;
  denied boolean := false;
  rolled_back boolean := false;
BEGIN
  PERFORM set_config('lock_timeout','5s',true);
  PERFORM set_config('statement_timeout','25s',true);
  SELECT id INTO parent_key FROM public.parents
    WHERE timezone='America/New_York' ORDER BY id LIMIT 1;
  IF parent_key IS NULL THEN RAISE EXCEPTION 'Probe requires an existing New York household'; END IF;
  IF EXISTS(SELECT 1 FROM public.profiles WHERE id=probe_key) THEN
    RAISE EXCEPTION 'Probe UUID collision';
  END IF;
  BEGIN
    INSERT INTO public.profiles(id,parent_id,display_name,avatar_key,color_key)
      VALUES(probe_key,parent_key,'Rollback qualification fixture','default','soft_blue');

    a := public.wn_control_profile_session_v2(parent_key,probe_key,'start',1);
    IF a->>'mode'<>'once' OR (a->>'duration_minutes')::integer<>1
      OR (a->>'expires_at')::timestamptz-(a->>'server_now')::timestamptz<>interval '1 minute'
      OR (a->>'parent_blocked')::boolean THEN
      RAISE EXCEPTION 'FAIL custom_one_minute';
    END IF;
    checks := checks || '"custom_one_minute"'::jsonb;

    a := public.wn_control_profile_session_v2(parent_key,probe_key,'daily',5);
    b := public.wn_resolve_profile_session(parent_key,probe_key,false);
    IF b->>'mode'<>'daily' OR (b->>'daily_allowance_minutes')::integer<>5
      OR (b->>'daily_started')::boolean OR NOT (b->>'ready')::boolean
      OR b->>'expires_at' IS NOT NULL THEN
      RAISE EXCEPTION 'FAIL daily_parent_read_pending_no_activation';
    END IF;
    checks := checks || '"daily_parent_read_pending_no_activation"'::jsonb;
    first_revision := (b->>'revision')::bigint;
    first_reset := (b->>'reset_at')::timestamptz;
    first_start := (b->>'period_start')::timestamptz;
    c := public.wn_control_profile_session_v2(parent_key,probe_key,'daily',5);
    IF (c->>'revision')::bigint<>first_revision
      OR (c->>'reset_at')::timestamptz<>first_reset
      OR (c->>'period_start')::timestamptz<>first_start THEN
      RAISE EXCEPTION 'FAIL same_daily_configuration_idempotent';
    END IF;
    checks := checks || '"same_daily_configuration_idempotent"'::jsonb;

    a := public.wn_resolve_profile_session(parent_key,probe_key,true);
    b := public.wn_resolve_profile_session(parent_key,probe_key,true);
    IF NOT (a->>'daily_started')::boolean
      OR (a->>'expires_at')::timestamptz IS DISTINCT FROM (b->>'expires_at')::timestamptz
      OR (a->>'revision')::bigint IS DISTINCT FROM (b->>'revision')::bigint
      OR (a->>'expires_at')::timestamptz > (a->>'reset_at')::timestamptz
      OR (a->>'expires_at')::timestamptz <= (a->>'server_now')::timestamptz THEN
      RAISE EXCEPTION 'FAIL sequential_child_activation_idempotent';
    END IF;
    checks := checks || '"sequential_child_activation_idempotent_not_concurrency"'::jsonb;

    UPDATE public.profiles SET session_expires_at=clock_timestamp()-interval '1 second'
      WHERE id=probe_key AND parent_id=parent_key;
    a := public.wn_resolve_profile_session(parent_key,probe_key,true);
    b := public.wn_resolve_profile_session(parent_key,probe_key,true);
    IF NOT (a->>'daily_started')::boolean OR (a->>'ready')::boolean
      OR (a->>'expires_at')::timestamptz > (a->>'server_now')::timestamptz
      OR (a->>'revision')::bigint IS DISTINCT FROM (b->>'revision')::bigint
      OR (a->>'expires_at')::timestamptz IS DISTINCT FROM (b->>'expires_at')::timestamptz THEN
      RAISE EXCEPTION 'FAIL exhausted_daily_no_same_period_renewal';
    END IF;
    checks := checks || '"exhausted_daily_no_same_period_renewal"'::jsonb;

    -- Fixture-only stored-boundary movement; real server clock remains intact.
    UPDATE public.profiles SET daily_reset_at=clock_timestamp()-interval '1 second',
      daily_period_start=clock_timestamp()-interval '2 days'
      WHERE id=probe_key AND parent_id=parent_key;
    a := public.wn_resolve_profile_session(parent_key,probe_key,false);
    IF (a->>'daily_started')::boolean OR NOT (a->>'ready')::boolean
      OR a->>'expires_at' IS NOT NULL OR (a->>'daily_allowance_minutes')::integer<>5
      OR (a->>'reset_at')::timestamptz <= (a->>'server_now')::timestamptz
      OR (a->>'period_start')::timestamptz > (a->>'server_now')::timestamptz THEN
      RAISE EXCEPTION 'FAIL passed_boundary_renews_pending_without_autoplay';
    END IF;
    checks := checks || '"passed_boundary_renews_pending_without_autoplay_no_carry"'::jsonb;

    a := public.wn_control_profile_session(parent_key,probe_key,'end',NULL);
    UPDATE public.profiles SET daily_reset_at=clock_timestamp()-interval '1 second'
      WHERE id=probe_key AND parent_id=parent_key;
    a := public.wn_resolve_profile_session(parent_key,probe_key,true);
    IF NOT (a->>'parent_blocked')::boolean OR (a->>'daily_started')::boolean
      OR (a->>'ready')::boolean
      OR a->'profile_state'->>'session_duration_minutes' IS NULL
      OR (a->'profile_state'->>'session_expires_at')::timestamptz > (a->>'server_now')::timestamptz THEN
      RAISE EXCEPTION 'FAIL legacy_end_persists_across_reset_and_denies_old_reader';
    END IF;
    checks := checks || '"legacy_end_persists_across_reset_and_denies_old_reader"'::jsonb;

    IF NOT public.wn_end_profile_session(parent_key,probe_key,true) THEN
      RAISE EXCEPTION 'FAIL legacy_disable_adapter';
    END IF;
    a := public.wn_resolve_profile_session(parent_key,probe_key,true);
    IF a->>'mode'<>'once' OR NOT (a->>'parent_blocked')::boolean
      OR NOT (a->>'limit_disabled')::boolean
      OR a->'profile_state'->>'session_duration_minutes' IS NULL
      OR (a->'profile_state'->>'session_expires_at')::timestamptz > (a->>'server_now')::timestamptz THEN
      RAISE EXCEPTION 'FAIL disable_does_not_unlock_parent_block';
    END IF;
    checks := checks || '"disable_does_not_unlock_parent_block_legacy_denial"'::jsonb;
    a := public.wn_control_profile_session_v2(parent_key,probe_key,'resume',NULL);
    IF (a->>'parent_blocked')::boolean OR a->>'duration_minutes' IS NOT NULL
      OR a->'profile_state'->>'session_duration_minutes' IS NOT NULL
      OR a->>'expires_at' IS NOT NULL THEN
      RAISE EXCEPTION 'FAIL explicit_resume_disabled_limit_allows_unlimited';
    END IF;
    checks := checks || '"explicit_resume_disabled_limit_allows_unlimited"'::jsonb;

    a := public.wn_control_profile_session_v2(parent_key,probe_key,'daily',5);
    a := public.wn_resolve_profile_session(parent_key,probe_key,true);
    a := public.wn_control_profile_session_v2(parent_key,probe_key,'pause',NULL);
    b := public.wn_control_profile_session_v2(parent_key,probe_key,'pause',NULL);
    IF a->>'paused_seconds' IS NULL
      OR a->>'paused_seconds' IS DISTINCT FROM b->>'paused_seconds'
      OR a->>'revision' IS DISTINCT FROM b->>'revision' THEN
      RAISE EXCEPTION 'FAIL repeated_pause_idempotent';
    END IF;
    checks := checks || '"repeated_pause_idempotent"'::jsonb;
    UPDATE public.profiles SET daily_reset_at=clock_timestamp()-interval '1 second'
      WHERE id=probe_key AND parent_id=parent_key;
    a := public.wn_resolve_profile_session(parent_key,probe_key,true);
    IF (a->>'daily_started')::boolean OR (a->>'ready')::boolean
      OR (a->>'paused_seconds')::integer<>300 OR a->>'expires_at' IS NOT NULL THEN
      RAISE EXCEPTION 'FAIL pause_survives_daily_reset';
    END IF;
    a := public.wn_control_profile_session_v2(parent_key,probe_key,'resume',NULL);
    IF NOT (a->>'daily_started')::boolean OR a->>'paused_seconds' IS NOT NULL
      OR (a->>'expires_at')::timestamptz <= (a->>'server_now')::timestamptz
      OR (a->>'expires_at')::timestamptz > (a->>'reset_at')::timestamptz THEN
      RAISE EXCEPTION 'FAIL deliberate_resume_after_reset';
    END IF;
    checks := checks || '"pause_survives_daily_reset_then_deliberate_resume"'::jsonb;

    first_expiry := public.wn_start_profile_session(parent_key,probe_key,1);
    UPDATE public.profiles SET session_expires_at=clock_timestamp()-interval '2 days'
      WHERE id=probe_key AND parent_id=parent_key;
    a := public.wn_resolve_profile_session(parent_key,probe_key,true);
    b := public.wn_resolve_profile_session(parent_key,probe_key,true);
    IF first_expiry IS NULL OR a->>'mode'<>'once'
      OR a->>'daily_allowance_minutes' IS NOT NULL OR a->>'reset_at' IS NOT NULL
      OR (a->>'expires_at')::timestamptz >= (a->>'server_now')::timestamptz
      OR a->>'revision' IS DISTINCT FROM b->>'revision' THEN
      RAISE EXCEPTION 'FAIL one_time_grant_never_recurs_legacy_start_adapter';
    END IF;
    checks := checks || '"one_time_grant_never_recurs_legacy_start_adapter"'::jsonb;

    BEGIN
      PERFORM public.wn_resolve_profile_session(wrong_parent_key,probe_key,true);
    EXCEPTION WHEN SQLSTATE 'P0001' THEN
      IF SQLERRM<>'Profile unavailable' THEN RAISE; END IF;
      denied := true;
    END;
    IF NOT denied THEN RAISE EXCEPTION 'FAIL wrong_parent_ownership_denied'; END IF;
    checks := checks || '"wrong_parent_ownership_denied"'::jsonb;

    SELECT reset_at-period_start INTO span
      FROM public.wn_daily_session_period('2026-03-07 12:01:00+00','America/New_York');
    IF span<>interval '23 hours' THEN RAISE EXCEPTION 'FAIL new_york_spring_dst_23h'; END IF;
    checks := checks || '"new_york_spring_dst_23h"'::jsonb;
    SELECT reset_at-period_start INTO span
      FROM public.wn_daily_session_period('2026-10-31 11:01:00+00','America/New_York');
    IF span<>interval '25 hours' THEN RAISE EXCEPTION 'FAIL new_york_fall_dst_25h'; END IF;
    checks := checks || '"new_york_fall_dst_25h"'::jsonb;
    SELECT period_start,reset_at INTO first_start,first_reset
      FROM public.wn_daily_session_period(clock_timestamp(),'America/New_York');
    IF (first_start AT TIME ZONE 'America/New_York')::time<>time '07:00'
      OR (first_reset AT TIME ZONE 'America/New_York')::time<>time '07:00'
      OR (first_reset AT TIME ZONE 'America/New_York')::date
         <> (first_start AT TIME ZONE 'America/New_York')::date+1 THEN
      RAISE EXCEPTION 'FAIL current_new_york_seven_am';
    END IF;
    checks := checks || '"current_new_york_seven_am"'::jsonb;

    RAISE EXCEPTION USING ERRCODE='WNP01',MESSAGE='WatchNest rollback probe successful';
  EXCEPTION WHEN SQLSTATE 'WNP01' THEN
    IF SQLERRM<>'WatchNest rollback probe successful' THEN RAISE; END IF;
    rolled_back := true;
  END;
  IF NOT rolled_back OR EXISTS(SELECT 1 FROM public.profiles WHERE id=probe_key) THEN
    RAISE EXCEPTION 'FAIL fixture_rollback_absence';
  END IF;
  checks := checks || '"fixture_absent_after_rollback"'::jsonb;
  PERFORM set_config('watchnest.rollback_probe_summary',jsonb_build_object(
    'status','PASS','checks',checks,'check_count',jsonb_array_length(checks),
    'mutations','one_generated_fixture_only_rolled_back',
    'concurrency_scope','sequential activation idempotence only, not concurrent sessions',
    'device_scope','database functional probe only, not physical iPad proof')::text,true);
END
$probe$;
SELECT current_setting('watchnest.rollback_probe_summary',true)::jsonb AS rollback_probe_summary;
