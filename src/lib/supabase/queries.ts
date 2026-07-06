import { createSupabaseServerClient, hasSupabaseServerConfig } from '@/lib/supabase/server';

export type DbProfileCard = {
  id: string;
  displayName: string;
  avatarColor: string;
};

export type DbVideoCard = {
  id: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string | null;
};

function colorFromKey(colorKey: string) {
  const colors: Record<string, string> = {
    soft_pink: '#f8d7da',
    soft_green: '#d8f3dc',
    soft_blue: '#ddeaf6',
  };

  return colors[colorKey] ?? '#ddeaf6';
}

export async function listProfilesForParent(parentId: string): Promise<DbProfileCard[]> {
  if (!hasSupabaseServerConfig()) return [];

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, color_key')
    .eq('parent_id', parentId)
    .is('archived_at', null)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((profile) => ({
    id: profile.id,
    displayName: profile.display_name,
    avatarColor: colorFromKey(profile.color_key),
  }));
}

export async function listKnownVideosForParent(parentId: string): Promise<DbVideoCard[]> {
  if (!hasSupabaseServerConfig()) return [];

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('profile_video_assignments')
    .select('videos(id, title, channel_title, thumbnail_url)')
    .eq('parent_id', parentId)
    .is('removed_at', null);

  if (error) throw error;

  const seen = new Set<string>();
  const videos: DbVideoCard[] = [];

  for (const row of data ?? []) {
    const video = Array.isArray(row.videos) ? row.videos[0] : row.videos;
    if (!video || seen.has(video.id)) continue;

    seen.add(video.id);
    videos.push({
      id: video.id,
      title: video.title,
      channelTitle: video.channel_title ?? 'Unknown channel',
      thumbnailUrl: video.thumbnail_url,
    });
  }

  return videos;
}

export async function listApprovedVideosForProfile(profileId: string): Promise<DbVideoCard[]> {
  if (!hasSupabaseServerConfig()) return [];

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('profile_video_assignments')
    .select('videos(id, title, channel_title, thumbnail_url, availability_status, embeddable_status)')
    .eq('profile_id', profileId)
    .is('removed_at', null);

  if (error) throw error;

  return (data ?? [])
    .map((row) => (Array.isArray(row.videos) ? row.videos[0] : row.videos))
    .filter((video) => video && video.availability_status === 'available' && ['embeddable', 'unknown'].includes(video.embeddable_status))
    .map((video) => ({
      id: video.id,
      title: video.title,
      channelTitle: video.channel_title ?? 'Unknown channel',
      thumbnailUrl: video.thumbnail_url,
    }));
}

export async function isPlaybackAuthorized(profileId: string, videoId: string) {
  if (!hasSupabaseServerConfig()) return false;

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('profile_video_assignments')
    .select('id')
    .eq('profile_id', profileId)
    .eq('video_id', videoId)
    .is('removed_at', null)
    .maybeSingle();

  if (error) throw error;

  return Boolean(data);
}
