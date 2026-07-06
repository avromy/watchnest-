export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Parent = {
  id: string;
  email: string;
  created_at: string;
};

export type Profile = {
  id: string;
  parent_id: string;
  display_name: string;
  avatar_key: string;
  color_key: string;
  pin_enabled: boolean;
  pin_hash: string | null;
  created_at: string;
  archived_at: string | null;
};

export type Video = {
  id: string;
  youtube_video_id: string;
  title: string;
  channel_id: string | null;
  channel_title: string | null;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  availability_status: 'available' | 'unavailable' | 'needs_review';
  embeddable_status: 'embeddable' | 'not_embeddable' | 'unknown';
  metadata_last_checked_at: string | null;
  created_at: string;
};

export type ProfileVideoAssignment = {
  id: string;
  parent_id: string;
  profile_id: string;
  video_id: string;
  approved_by_parent_id: string;
  approved_at: string;
  removed_at: string | null;
  removal_reason: string | null;
};

export type WatchProgress = {
  id: string;
  profile_id: string;
  video_id: string;
  current_time_seconds: number;
  duration_seconds: number | null;
  completed_at: string | null;
  updated_at: string;
};
