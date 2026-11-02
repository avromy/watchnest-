-- Supabase's optional automatic-RLS event trigger must not be exposed as an RPC.
-- Keep the platform-owned trigger and its implementation intact.
do $$ begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke execute on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end $$;

create index if not exists audit_events_parent_idx on public.audit_events(parent_id);
create index if not exists child_requests_parent_idx on public.child_requests(parent_id);
create index if not exists child_requests_profile_parent_idx on public.child_requests(profile_id,parent_id);
create index if not exists child_sessions_profile_idx on public.child_sessions(profile_id);
create index if not exists collections_parent_idx on public.collections(parent_id);
create index if not exists family_videos_video_idx on public.family_videos(video_id);
create index if not exists assignments_profile_parent_idx on public.profile_video_assignments(profile_id,parent_id);
create index if not exists assignments_approver_idx on public.profile_video_assignments(approved_by_parent_id);
create index if not exists viewing_events_profile_parent_idx on public.viewing_events(profile_id,parent_id);
create index if not exists viewing_events_video_idx on public.viewing_events(video_id);
create index if not exists watch_progress_video_idx on public.watch_progress(video_id);
