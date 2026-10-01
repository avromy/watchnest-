/** Functional raw bookmarks, never watched percentages or completion inference. */
export type WatchProgressInput = {
  currentTimeSeconds: number | null;
  rawResume?: boolean;
  updatedAt?: string | null;
};
export type ContinueWatchingVideo = { progress: WatchProgressInput | null };
export function isContinueWatchingEligible(
  progress: WatchProgressInput | null | undefined,
  now = Date.now(),
) {
  if (
    !progress?.rawResume ||
    !Number.isFinite(progress.currentTimeSeconds) ||
    (progress.currentTimeSeconds ?? 0) <= 0
  )
    return false;
  const updated = Date.parse(progress.updatedAt || "");
  return (
    Number.isFinite(updated) && updated <= now && updated > now - 29 * 86400000
  );
}
export function orderContinueWatchingVideos<T extends ContinueWatchingVideo>(
  videos: readonly T[],
  now = Date.now(),
) {
  return videos
    .filter((v) => isContinueWatchingEligible(v.progress, now))
    .toSorted((a, b) =>
      (b.progress?.updatedAt || "").localeCompare(a.progress?.updatedAt || ""),
    );
}
