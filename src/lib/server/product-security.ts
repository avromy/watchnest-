import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
  createHash,
} from "node:crypto";
export const digest = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export const opaque = () => randomBytes(32).toString("base64url");
export function hashPin(pin: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(pin, salt, 64).toString("hex")}`;
}
export function verifyPin(pin: string, hash: string) {
  try {
    const [salt, key] = hash.split(":");
    const candidate = scryptSync(pin, salt, 64);
    const expected = Buffer.from(key, "hex");
    return (
      expected.length === candidate.length &&
      timingSafeEqual(expected, candidate)
    );
  } catch {
    return false;
  }
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return (
    !!origin &&
    origin === new URL(request.url).origin &&
    request.headers.get("sec-fetch-site") !== "cross-site"
  );
}
export function metadataFresh(
  video: { metadata_last_checked_at?: string | null },
  maxAgeDays = 1,
  now = Date.now(),
) {
  const checked = Date.parse(video.metadata_last_checked_at || "");
  return (
    Number.isFinite(checked) &&
    checked <= now &&
    checked > now - maxAgeDays * 86400000
  );
}
export function cleanProviderText(value: unknown) {
  return String(value ?? "")
    .normalize("NFKC")
    .replace(/\p{Extended_Pictographic}\uFE0F?/gu, " ")
    .replace(/[\uFE0E\uFE0F\u200D]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s+([:;,.!?])/g, "$1")
    .trim();
}

/** Explicit child projection prevents DB row identifiers/secrets leaking via joins. */
export function childVideoView(video: any) {
  const fresh = metadataFresh(video, 30);
  const progress =
    metadataFresh(video) &&
    video.made_for_kids === false &&
    video.progress?.raw_resume === true &&
    metadataFresh({ metadata_last_checked_at: video.progress.updated_at }, 29)
      ? {
          current_time_seconds: video.progress.current_time_seconds,
          duration_seconds: video.progress.duration_seconds,
          completed_at: video.progress.completed_at,
          updated_at: video.progress.updated_at,
        }
      : undefined;
  return {
    id: video.id,
    youtube_video_id: video.youtube_video_id,
    title: fresh
      ? cleanProviderText(video.title)
      : "Ask Parent to refresh this video",
    channel_title: fresh ? video.channel_title || "" : "",
    thumbnail_url: fresh ? video.thumbnail_url || "" : "",
    duration_seconds: fresh ? video.duration_seconds || 0 : 0,
    tags: video.tags || [],
    added_at: video.added_at,
    collections: video.collections || [],
    made_for_kids: fresh ? video.made_for_kids : null,
    availability_status: fresh ? video.availability_status : "needs_review",
    embeddable_status: fresh ? video.embeddable_status : "unknown",
    ...(progress ? { progress } : {}),
  };
}
