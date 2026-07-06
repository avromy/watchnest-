import 'server-only';

import { createSupabaseServerClient, hasSupabaseServerConfig } from '@/lib/supabase/server';
import type { Profile, Video } from '@/types/database';

export type ApprovedVideo = Pick<
  Video,
  | 'id'
  | 'youtube_video_id'
  | 'title'
  | 'channel_id'
  | 'channel_title'
  | 'thumbnail_url'
  | 'duration_seconds'
  | 'availability_status'
  | 'embeddable_status'
>;

export async function getProfilesForParent(parentId: string): Promise<Profile[]> {
  if (!hasSupabaseServerConfig()) return [];

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('parent_id', parentId)
    .is('archived_at', null)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return data ?? [];
}

export async function getApprovedVideosForProfile(profileId: string): Promise<ApprovedVideo[]> {
  if (!hasSupabaseServerConfig()) return [];

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('profile_video_assignments')
    .select(
      'videos(id, youtube_video_id, title, channel_id, channel_title, thumbnail_url, duration_seconds, availability_status, embeddable_status)',
    )
    .eq('profile_id', profileId)
    .is('removed_at', null);

  if (error) throw error;

  return (data ?? [])
    .map((row) => (Array.isArray(row.videos) ? row.videos[0] : row.videos))
    .filter(
      (video): video is ApprovedVideo =>
        Boolean(video) &&
        video.availability_status === 'available' &&
        (video.embeddable_status === 'embeddable' || video.embeddable_status === 'unknown'),
    );
}

export async function isProfileAuthorizedToPlayVideo(profileId: string, videoId: string): Promise<boolean> {
  if (!hasSupabaseServerConfig()) return false;

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('profile_video_assignments')
    .select('id, videos!inner(availability_status, embeddable_status)')
    .eq('profile_id', profileId)
    .eq('video_id', videoId)
    .is('removed_at', null)
    .eq('videos.availability_status', 'available')
    .in('videos.embeddable_status', ['embeddable', 'unknown'])
    .maybeSingle();

  if (error) throw error;

  return Boolean(data);
}
