export const DEFAULT_CONTINUE_WATCHING_MIN_PERCENT = 1;
export const DEFAULT_NEAR_END_PERCENT = 90;
export const DEFAULT_NEAR_END_REMAINING_SECONDS = 30;

export type WatchProgressInput = {
  currentTimeSeconds: number | null;
  durationSeconds: number | null;
  completedAt?: string | null;
  updatedAt?: string | null;
};

export type WatchProgressEligibilityOptions = {
  minPercentWatched?: number;
  nearEndPercent?: number;
  nearEndRemainingSeconds?: number;
};

export type ContinueWatchingVideo<TProgress extends WatchProgressInput = WatchProgressInput> = {
  progress: TProgress | null;
};

function normalizeSeconds(value: number | null | undefined) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0;

  return Math.max(0, value);
}

function normalizePercentThreshold(value: number | undefined, fallback: number) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;

  return Math.min(100, Math.max(0, value));
}

export function calculatePercentWatched(progress: Pick<WatchProgressInput, 'currentTimeSeconds' | 'durationSeconds'>) {
  const durationSeconds = normalizeSeconds(progress.durationSeconds);

  if (durationSeconds <= 0) return 0;

  const currentTimeSeconds = normalizeSeconds(progress.currentTimeSeconds);
  const percentWatched = (currentTimeSeconds / durationSeconds) * 100;

  return Math.min(100, Math.max(0, percentWatched));
}

export function isVideoNearEnd(progress: Pick<WatchProgressInput, 'currentTimeSeconds' | 'durationSeconds'>, options: WatchProgressEligibilityOptions = {}) {
  const durationSeconds = normalizeSeconds(progress.durationSeconds);

  if (durationSeconds <= 0) return false;

  const currentTimeSeconds = normalizeSeconds(progress.currentTimeSeconds);
  const nearEndPercent = normalizePercentThreshold(options.nearEndPercent, DEFAULT_NEAR_END_PERCENT);
  const nearEndRemainingSeconds = normalizeSeconds(options.nearEndRemainingSeconds ?? DEFAULT_NEAR_END_REMAINING_SECONDS);
  const remainingSeconds = Math.max(0, durationSeconds - currentTimeSeconds);

  return calculatePercentWatched(progress) >= nearEndPercent || remainingSeconds <= nearEndRemainingSeconds;
}

export function isContinueWatchingEligible(progress: WatchProgressInput | null | undefined, options: WatchProgressEligibilityOptions = {}) {
  if (!progress || progress.completedAt !== null) return false;

  const minPercentWatched = normalizePercentThreshold(options.minPercentWatched, DEFAULT_CONTINUE_WATCHING_MIN_PERCENT);
  const percentWatched = calculatePercentWatched(progress);

  return percentWatched >= minPercentWatched && !isVideoNearEnd(progress, options);
}

export function orderContinueWatchingVideos<TVideo extends ContinueWatchingVideo>(videos: readonly TVideo[], options: WatchProgressEligibilityOptions = {}) {
  return videos
    .filter((video) => isContinueWatchingEligible(video.progress, options))
    .toSorted((first, second) => {
      const firstUpdatedAt = first.progress?.updatedAt ?? '';
      const secondUpdatedAt = second.progress?.updatedAt ?? '';

      return secondUpdatedAt.localeCompare(firstUpdatedAt);
    });
}
