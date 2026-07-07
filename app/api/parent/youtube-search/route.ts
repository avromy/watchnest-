import { NextResponse } from 'next/server';
import 'server-only';

import { createSupabaseServerClient, hasSupabaseServerConfig } from '@/lib/supabase/server';
import {
  normalizeYouTubeSearchQuery,
  normalizeYouTubeSearchResults,
  validateYouTubeSearchQuery,
  type YouTubeSearchErrorCode,
  type YouTubeSearchResult,
} from '@/lib/youtube-search';

export const dynamic = 'force-dynamic';

type CacheRow = {
  result_json: YouTubeSearchResult[];
};

type SearchLog = {
  rawQuery: string;
  normalizedQuery: string;
  cacheHit: boolean;
  youtubeApiCalled: boolean;
  responseStatus: string;
  errorCode: YouTubeSearchErrorCode | null;
  resultCount: number;
  estimatedQuotaCost: number;
};

const CACHE_TTL_MS = 1000 * 60 * 60;
const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';

function cacheKeyForQuery(normalizedQuery: string) {
  return `youtube-search:v1:${normalizedQuery}`;
}

async function readCachedResults(cacheKey: string): Promise<YouTubeSearchResult[] | null> {
  if (!hasSupabaseServerConfig()) return null;

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('youtube_search_cache')
    .select('result_json')
    .eq('cache_key', cacheKey)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle<CacheRow>();

  if (error) {
    console.error('parent_youtube_search_cache_read_error', { cacheKey, error: error.message });
    return null;
  }

  return data?.result_json ?? null;
}

async function writeCachedResults(cacheKey: string, rawQuery: string, normalizedQuery: string, results: YouTubeSearchResult[]) {
  if (!hasSupabaseServerConfig()) return;

  const supabase = createSupabaseServerClient();
  const expiresAt = new Date(Date.now() + CACHE_TTL_MS).toISOString();
  const { error } = await supabase.from('youtube_search_cache').upsert(
    {
      cache_key: cacheKey,
      normalized_query: normalizedQuery,
      raw_query: rawQuery,
      result_json: results,
      expires_at: expiresAt,
    },
    { onConflict: 'cache_key' },
  );

  if (error) {
    console.error('parent_youtube_search_cache_write_error', { cacheKey, error: error.message });
  }
}

async function logSearch(log: SearchLog) {
  console.info('parent_youtube_search', log);

  if (!hasSupabaseServerConfig()) return;

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from('youtube_search_logs').insert({
    raw_query: log.rawQuery,
    normalized_query: log.normalizedQuery,
    cache_hit: log.cacheHit,
    youtube_api_called: log.youtubeApiCalled,
    response_status: log.responseStatus,
    error_code: log.errorCode,
    result_count: log.resultCount,
    estimated_quota_cost: log.estimatedQuotaCost,
  });

  if (error) {
    console.error('parent_youtube_search_log_error', { error: error.message });
  }
}

async function fetchYouTubeResults(normalizedQuery: string): Promise<YouTubeSearchResult[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error('youtube_api_unavailable');

  const params = new URLSearchParams({
    key: apiKey,
    part: 'snippet',
    q: normalizedQuery,
    type: 'video',
    maxResults: '10',
    safeSearch: 'strict',
    videoEmbeddable: 'true',
  });

  const response = await fetch(`${YOUTUBE_SEARCH_URL}?${params.toString()}`, { cache: 'no-store' });
  if (!response.ok) throw new Error('youtube_api_error');

  const payload = (await response.json()) as { items?: Parameters<typeof normalizeYouTubeSearchResults>[0] };
  return normalizeYouTubeSearchResults(payload.items ?? []);
}

export async function POST(request: Request) {
  let rawQuery = '';

  try {
    const body = (await request.json()) as { query?: unknown };
    rawQuery = typeof body.query === 'string' ? body.query : '';
  } catch {
    rawQuery = '';
  }

  const normalizedQuery = normalizeYouTubeSearchQuery(rawQuery);
  const validationError = validateYouTubeSearchQuery(normalizedQuery);

  if (validationError) {
    await logSearch({
      rawQuery,
      normalizedQuery,
      cacheHit: false,
      youtubeApiCalled: false,
      responseStatus: 'validation_error',
      errorCode: validationError,
      resultCount: 0,
      estimatedQuotaCost: 0,
    });

    return NextResponse.json({ error: validationError, results: [] }, { status: 400 });
  }

  const cacheKey = cacheKeyForQuery(normalizedQuery);
  const cachedResults = await readCachedResults(cacheKey);
  if (cachedResults) {
    await logSearch({
      rawQuery,
      normalizedQuery,
      cacheHit: true,
      youtubeApiCalled: false,
      responseStatus: 'ok',
      errorCode: null,
      resultCount: cachedResults.length,
      estimatedQuotaCost: 0,
    });

    return NextResponse.json({ query: normalizedQuery, cacheHit: true, results: cachedResults });
  }

  try {
    const results = await fetchYouTubeResults(normalizedQuery);
    await writeCachedResults(cacheKey, rawQuery, normalizedQuery, results);
    await logSearch({
      rawQuery,
      normalizedQuery,
      cacheHit: false,
      youtubeApiCalled: true,
      responseStatus: 'ok',
      errorCode: null,
      resultCount: results.length,
      estimatedQuotaCost: 100,
    });

    return NextResponse.json({ query: normalizedQuery, cacheHit: false, results });
  } catch (error) {
    const errorCode: YouTubeSearchErrorCode = error instanceof Error && error.message === 'youtube_api_unavailable' ? 'youtube_api_unavailable' : 'youtube_api_error';
    await logSearch({
      rawQuery,
      normalizedQuery,
      cacheHit: false,
      youtubeApiCalled: errorCode !== 'youtube_api_unavailable',
      responseStatus: 'error',
      errorCode,
      resultCount: 0,
      estimatedQuotaCost: errorCode === 'youtube_api_unavailable' ? 0 : 100,
    });

    return NextResponse.json({ error: errorCode, results: [] }, { status: 502 });
  }
}
