create extension if not exists pgcrypto;

create table if not exists public.parents (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.parents(id) on delete cascade,
  display_name text not null,
  avatar_key text not null default 'default',
  color_key text not null default 'soft_blue',
  pin_enabled boolean not null default false,
  pin_hash text,
  created_at timestamptz not null default now(),
  archived_at timestamptz
);

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  youtube_video_id text not null unique,
  title text not null,
  channel_id text,
  channel_title text,
  thumbnail_url text,
  duration_seconds integer,
  availability_status text not null default 'available',
  embeddable_status text not null default 'unknown',
  metadata_last_checked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.profile_video_assignments (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.parents(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  video_id uuid not null references public.videos(id) on delete cascade,
  approved_by_parent_id uuid not null references public.parents(id) on delete cascade,
  approved_at timestamptz not null default now(),
  removed_at timestamptz,
  removal_reason text
);

create unique index if not exists profile_video_assignments_one_active_assignment
  on public.profile_video_assignments(profile_id, video_id)
  where removed_at is null;

create table if not exists public.watch_progress (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  video_id uuid not null references public.videos(id) on delete cascade,
  current_time_seconds integer not null default 0,
  duration_seconds integer,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(profile_id, video_id)
);

create table if not exists public.youtube_search_cache (
  id uuid primary key default gen_random_uuid(),
  cache_key text not null unique,
  normalized_query text not null,
  raw_query text not null,
  result_json jsonb not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create table if not exists public.youtube_search_logs (
  id uuid primary key default gen_random_uuid(),
  raw_query text not null,
  normalized_query text not null,
  cache_hit boolean not null default false,
  youtube_api_called boolean not null default false,
  response_status text,
  error_code text,
  result_count integer,
  estimated_quota_cost integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.parents(id) on delete set null,
  actor_type text not null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists profiles_parent_id_idx on public.profiles(parent_id);
create index if not exists assignments_parent_id_idx on public.profile_video_assignments(parent_id);
create index if not exists assignments_profile_id_idx on public.profile_video_assignments(profile_id);
create index if not exists assignments_video_id_idx on public.profile_video_assignments(video_id);
create index if not exists watch_progress_profile_id_idx on public.watch_progress(profile_id);
create index if not exists youtube_search_cache_key_idx on public.youtube_search_cache(cache_key);
