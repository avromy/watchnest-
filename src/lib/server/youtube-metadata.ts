import 'server-only';

import type { Video } from '@/types/database';

const YOUTUBE_VIDEOS_API_URL = 'https://www.googleapis.com/youtube/v3/videos';

export type YouTubeAvailabilityStatus = Video['availability_status'];
export type YouTubeEmbeddableStatus = Video['embeddable_status'];

export type YouTubeVideoMetadata = {
  youtube_video_id: string;
  title: string;
  channel_id: string | null;
  channel_title: string | null;
  thumbnail_url: string | null;
  duration: string | null;
  embeddable_status: YouTubeEmbeddableStatus;
  availability_status: YouTubeAvailabilityStatus;
};

export type YouTubeMetadataResult =
  | { ok: true; metadata: YouTubeVideoMetadata }
  | { ok: false; error: string; status?: number };

type FetchLike = typeof fetch;

type YouTubeVideoListResponse = {
  items?: YouTubeVideoListItem[];
  error?: {
    message?: string;
  };
};

type YouTubeVideoListItem = {
  id?: string;
  snippet?: {
    title?: string;
    channelId?: string;
    channelTitle?: string;
    thumbnails?: Record<string, { url?: string; width?: number; height?: number }>;
  };
  contentDetails?: {
    duration?: string;
  };
  status?: {
    embeddable?: boolean;
    privacyStatus?: string;
    uploadStatus?: string;
  };
};

export async function fetchYouTubeVideoMetadata(
  youtubeVideoId: string,
  options: { apiKey?: string; fetchImpl?: FetchLike } = {},
): Promise<YouTubeMetadataResult> {
  const videoId = youtubeVideoId.trim();

  if (!videoId) {
    return { ok: false, error: 'YouTube video ID is required.' };
  }

  const apiKey = options.apiKey ?? process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return { ok: false, error: 'YOUTUBE_API_KEY is not configured.' };
  }

  const url = new URL(YOUTUBE_VIDEOS_API_URL);
  url.searchParams.set('part', 'snippet,contentDetails,status');
  url.searchParams.set('id', videoId);
  url.searchParams.set('key', apiKey);
  url.searchParams.set('maxResults', '1');

  try {
    const fetchImpl = options.fetchImpl ?? fetch;
    const response = await fetchImpl(url, { cache: 'no-store' });
    const payload = (await response.json().catch(() => ({}))) as YouTubeVideoListResponse;

    if (!response.ok) {
      return {
        ok: false,
        error: payload.error?.message ?? 'Unable to fetch YouTube video metadata.',
        status: response.status,
      };
    }

    const item = payload.items?.[0];

    if (!item) {
      return {
        ok: true,
        metadata: {
          youtube_video_id: videoId,
          title: '',
          channel_id: null,
          channel_title: null,
          thumbnail_url: null,
          duration: null,
          embeddable_status: 'unknown',
          availability_status: 'unavailable',
        },
      };
    }

    return { ok: true, metadata: normalizeYouTubeVideoItem(videoId, item) };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unable to fetch YouTube video metadata.',
    };
  }
}

function normalizeYouTubeVideoItem(requestedVideoId: string, item: YouTubeVideoListItem): YouTubeVideoMetadata {
  return {
    youtube_video_id: item.id ?? requestedVideoId,
    title: item.snippet?.title ?? '',
    channel_id: item.snippet?.channelId ?? null,
    channel_title: item.snippet?.channelTitle ?? null,
    thumbnail_url: selectBestThumbnailUrl(item.snippet?.thumbnails),
    duration: item.contentDetails?.duration ?? null,
    embeddable_status: normalizeEmbeddableStatus(item.status?.embeddable),
    availability_status: normalizeAvailabilityStatus(item.status),
  };
}

type YouTubeThumbnailMap = NonNullable<YouTubeVideoListItem['snippet']>['thumbnails'];

function selectBestThumbnailUrl(thumbnails: YouTubeThumbnailMap): string | null {
  if (!thumbnails) return null;

  const preferredNames = ['maxres', 'standard', 'high', 'medium', 'default'];

  for (const name of preferredNames) {
    const url = thumbnails[name]?.url;
    if (url) return url;
  }

  return Object.values(thumbnails).find((thumbnail) => Boolean(thumbnail.url))?.url ?? null;
}

function normalizeEmbeddableStatus(embeddable: boolean | undefined): YouTubeEmbeddableStatus {
  if (embeddable === true) return 'embeddable';
  if (embeddable === false) return 'not_embeddable';
  return 'unknown';
}

function normalizeAvailabilityStatus(status: YouTubeVideoListItem['status']): YouTubeAvailabilityStatus {
  if (!status) return 'needs_review';
  if (status.uploadStatus === 'deleted' || status.uploadStatus === 'rejected') return 'unavailable';
  if (status.privacyStatus === 'private') return 'unavailable';
  return 'available';
}
