export type Profile = {
  id: string;
  display_name: string;
  avatar_key: string;
  color_key: string;
  experience_mode: "simple" | "standard";
  pin_enabled: boolean;
};
export type Video = {
  id: string;
  youtube_video_id: string;
  title: string;
  channel_title: string;
  thumbnail_url: string;
  duration_seconds: number;
  made_for_kids?: boolean | null;
  tags: string[];
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
export async function api<T>(url: string, body?: unknown, options?: {keepalive?: boolean}): Promise<T> {
  const res = await fetch(url, {
    method: body ? "POST" : "GET",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
    keepalive: options?.keepalive,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Please try again in a moment.");
  return data;
}
export const avatarColors: Record<string, string> = {
  mint: "#E0EEE5",
  yellow: "#F4CD6E",
  coral: "#F3C4B5",
  blue: "#D8E7F1",
  forest: "#D0E3D7",
};
export function duration(seconds: number) {
  return seconds
    ? `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`
    : "";
}

/** Count real forward playback, never a seek or a suspended/background timer. */
export function playedSeconds(
  current: number,
  previous: number,
  elapsed: number,
  playing: boolean,
  hidden: boolean,
): number {
  const delta = current - previous;
  return playing &&
    !hidden &&
    Number.isFinite(delta) &&
    Number.isFinite(elapsed) &&
    delta > 0 &&
    elapsed > 0 &&
    elapsed < 3 &&
    delta <= elapsed * 2.2 + 0.2
    ? Math.min(delta, elapsed)
    : 0;
}
