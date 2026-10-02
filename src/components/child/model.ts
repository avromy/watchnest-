export type Profile = {
  id: string;
  display_name: string;
  avatar_key: string;
  color_key: string;
  experience_mode: "simple" | "standard";
  pin_enabled: boolean;
  photo_url?: string | null;
  available_from_minute?: number | null;
  available_until_minute?: number | null;
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
  favorite?: boolean;
};
export type Collection = {
  id: string;
  title: string;
  description?: string;
  video_ids: string[];
};
export async function api<T>(
  url: string,
  body?: unknown,
  options?: { keepalive?: boolean },
): Promise<T> {
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

// Shared across player component lifecycles in this browser app. Replays must
// wait for cleanup/ENDED writes from the prior instance. This does not sequence
// independent tabs; the database's final valid arriving write is authoritative.
let bookmarkQueue: Promise<void> = Promise.resolve();
export function serializeBookmark(write: () => Promise<void>): Promise<void> {
  const next = bookmarkQueue.then(write, write);
  bookmarkQueue = next.catch(() => {});
  return next;
}

/** Await already-queued lifecycle cleanup before requesting a resume snapshot. */
export function waitForBookmarks(): Promise<void> {
  return bookmarkQueue;
}
