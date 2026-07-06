insert into public.parents (id, email)
values ('00000000-0000-4000-8000-000000000001', 'parent@example.com')
on conflict (email) do nothing;

insert into public.profiles (id, parent_id, display_name, avatar_key, color_key)
values
  ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000001', 'Emma', 'default', 'soft_pink'),
  ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000001', 'Noah', 'default', 'soft_green'),
  ('00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000001', 'Olivia', 'default', 'soft_blue')
on conflict (id) do nothing;

insert into public.videos (id, youtube_video_id, title, channel_id, channel_title, thumbnail_url, duration_seconds, availability_status, embeddable_status)
values
  ('00000000-0000-4000-8000-000000000201', 'video-a-placeholder', 'Bluey: Keepy Uppy', 'channel-bluey', 'Bluey Official', null, 420, 'available', 'embeddable'),
  ('00000000-0000-4000-8000-000000000202', 'video-b-placeholder', 'Science Volcano', 'channel-science', 'Science Time', null, 360, 'available', 'embeddable'),
  ('00000000-0000-4000-8000-000000000203', 'video-c-placeholder', 'Music Time', 'channel-music', 'Music Club', null, 300, 'available', 'embeddable')
on conflict (youtube_video_id) do nothing;

insert into public.profile_video_assignments (parent_id, profile_id, video_id, approved_by_parent_id)
values
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000001'),
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000001'),
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000001'),
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000203', '00000000-0000-4000-8000-000000000001')
on conflict do nothing;
