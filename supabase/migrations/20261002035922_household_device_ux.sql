-- Shared-device UX, private profile photos, favorites, and policy-safe access windows.
-- All access remains server-only through the service role. No public storage policy is added.

alter table public.parents
  add column if not exists parent_pin_hash text,
  add column if not exists timezone text not null default 'America/New_York';

alter table public.profiles
  add column if not exists photo_path text,
  add column if not exists available_from_minute smallint,
  add column if not exists available_until_minute smallint;

alter table public.profiles
  drop constraint if exists profiles_available_from_minute_check,
  add constraint profiles_available_from_minute_check
    check (available_from_minute is null or available_from_minute between 0 and 1439),
  drop constraint if exists profiles_available_until_minute_check,
  add constraint profiles_available_until_minute_check
    check (available_until_minute is null or available_until_minute between 0 and 1439);

create table if not exists public.household_devices (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.parents(id) on delete cascade,
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  last_used_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz
);

create index if not exists household_devices_parent_active
  on public.household_devices(parent_id, expires_at)
  where revoked_at is null;

create table if not exists public.parent_mode_sessions (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.parents(id) on delete cascade,
  device_id uuid not null references public.household_devices(id) on delete cascade,
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz
);

create index if not exists parent_mode_sessions_parent_active
  on public.parent_mode_sessions(parent_id, expires_at)
  where revoked_at is null;

create table if not exists public.profile_favorites (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  video_id uuid not null references public.videos(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(profile_id, video_id)
);

alter table public.household_devices enable row level security;
alter table public.parent_mode_sessions enable row level security;
alter table public.profile_favorites enable row level security;
revoke all on public.household_devices, public.parent_mode_sessions, public.profile_favorites from anon, authenticated;
grant all on public.household_devices, public.parent_mode_sessions, public.profile_favorites to service_role;

-- Private child photos. Server routes upload and mint short-lived signed URLs.
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values(
  'watchnest-profile-photos',
  'watchnest-profile-photos',
  false,
  2097152,
  array['image/jpeg','image/png','image/webp']
)
on conflict(id) do update set
  public=false,
  file_size_limit=excluded.file_size_limit,
  allowed_mime_types=excluded.allowed_mime_types;

-- Service-role-only posture: do not create policies on storage.objects.

create or replace function public.wn_set_parent_pin(
  p_parent uuid,
  p_pin_hash text
) returns boolean
language plpgsql
security invoker
set search_path=public
as $$
begin
  update parents set parent_pin_hash=p_pin_hash where id=p_parent;
  if not found then return false; end if;
  update parent_mode_sessions
    set revoked_at=now()
    where parent_id=p_parent and revoked_at is null;
  return true;
end
$$;

revoke all on function public.wn_set_parent_pin(uuid,text) from public,anon,authenticated;
grant execute on function public.wn_set_parent_pin(uuid,text) to service_role;

-- Existing profiles converge on one adaptive child experience. The historical
-- column remains for backward compatibility but is no longer user-configurable.
update public.profiles set experience_mode='standard' where experience_mode<>'standard';
