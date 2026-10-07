-- Final family beta: household playback containment and child-owned hiding.
alter table public.parents
  add column if not exists safe_playback_enabled boolean not null default true;

create table if not exists public.profile_hidden_videos (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  video_id uuid not null references public.videos(id) on delete cascade,
  hidden_at timestamptz not null default now(),
  primary key (profile_id, video_id)
);

alter table public.profile_hidden_videos enable row level security;
revoke all on public.profile_hidden_videos from anon, authenticated;
grant all on public.profile_hidden_videos to service_role;

create index if not exists profile_hidden_videos_profile_hidden_idx
  on public.profile_hidden_videos (profile_id, hidden_at desc);
create index if not exists profile_hidden_videos_video_idx
  on public.profile_hidden_videos (video_id);
