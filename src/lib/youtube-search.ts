export type YouTubeSearchResult = {
  youtubeVideoId: string;
  title: string;
  channelId: string | null;
  channelTitle: string | null;
  thumbnailUrl: string | null;
  publishedAt: string | null;
};

export type YouTubeSearchResponse = {
  query: string;
  cacheHit: boolean;
  results: YouTubeSearchResult[];
};

export type YouTubeSearchErrorCode = 'missing_query' | 'query_too_long' | 'youtube_api_unavailable' | 'youtube_api_error';

const MAX_QUERY_LENGTH = 120;

export function normalizeYouTubeSearchQuery(query: string): string {
  return query.trim().replace(/\s+/g, ' ').toLowerCase();
}

export function validateYouTubeSearchQuery(query: string): YouTubeSearchErrorCode | null {
  if (!query) return 'missing_query';
  if (query.length > MAX_QUERY_LENGTH) return 'query_too_long';
  return null;
}

type YouTubeSearchItem = {
  id?: {
    kind?: string;
    videoId?: string;
  };
  snippet?: {
    title?: string;
    channelId?: string;
    channelTitle?: string;
    publishedAt?: string;
    thumbnails?: Record<string, { url?: string }>;
  };
};

function bestThumbnailUrl(thumbnails: Record<string, { url?: string }> | undefined): string | null {
  if (!thumbnails) return null;

  const orderedKeys = ['medium', 'high', 'default'];
  for (const key of orderedKeys) {
    const url = thumbnails[key]?.url;
    if (url) return url;
  }

  return Object.values(thumbnails).find((thumbnail) => thumbnail.url)?.url ?? null;
}

export function normalizeYouTubeSearchResults(items: YouTubeSearchItem[]): YouTubeSearchResult[] {
  return items
    .filter((item) => item.id?.kind === 'youtube#video' && Boolean(item.id.videoId))
    .map((item) => ({
      youtubeVideoId: item.id?.videoId ?? '',
      title: item.snippet?.title?.trim() || 'Untitled video',
      channelId: item.snippet?.channelId ?? null,
      channelTitle: item.snippet?.channelTitle?.trim() || null,
      thumbnailUrl: bestThumbnailUrl(item.snippet?.thumbnails),
      publishedAt: item.snippet?.publishedAt ?? null,
    }));
}
