export type Profile = {
  id: string;
  display_name: string;
  avatar_key: string;
  color_key: string;
  experience_mode: "simple" | "standard";
  pin_enabled: boolean;
};
export type LibraryVideo = {
  id: string;
  youtube_video_id: string;
  title: string;
  channel_title: string;
  thumbnail_url: string;
  duration_seconds: number;
  tags: string[];
  profile_ids?: string[];
  made_for_kids?: boolean | null;
  added_at?: string;
  progress?: {
    current_time_seconds: number;
    duration_seconds: number;
    completed_at: string | null;
    updated_at: string;
  };
  collections?: { id: string; title: string }[];
};
export type Collection = {
  id: string;
  title: string;
  description?: string;
  video_ids: string[];
};
export type Request = {
  id: string;
  profile_id: string;
  display_name?: string;
  kind: "video" | "show" | "creator" | "topic";
  message: string;
  status: "pending" | "resolved" | "dismissed";
  created_at: string;
};
