export type NextUpVideo = {
  id: string;
};

export type SelectNextApprovedVideoOptions = {
  skipWatched?: boolean;
  wrap?: boolean;
};

export function selectNextApprovedVideo<TVideo extends NextUpVideo>(
  currentVideoId: string,
  orderedApprovedVideos: readonly TVideo[],
  watchedVideoIds: readonly string[] = [],
  options: SelectNextApprovedVideoOptions = {},
): TVideo | null {
  const currentIndex = orderedApprovedVideos.findIndex((video) => video.id === currentVideoId);

  if (currentIndex === -1 || orderedApprovedVideos.length <= 1) return null;

  const watchedVideoIdSet = options.skipWatched ? new Set(watchedVideoIds) : null;
  const isSelectable = (video: TVideo) => !watchedVideoIdSet?.has(video.id);
  const afterCurrent = orderedApprovedVideos.slice(currentIndex + 1).find(isSelectable);

  if (afterCurrent) return afterCurrent;
  if (!options.wrap) return null;

  return orderedApprovedVideos.slice(0, currentIndex).find(isSelectable) ?? null;
}
