import 'server-only';

import { createSupabaseServerClient, hasSupabaseServerConfig } from '@/lib/supabase/server';
import type { Json, YoutubeSearchCache, YoutubeSearchLog } from '@/types/database';

export type YoutubeSearchResultPayload = Json;

export type CachedYoutubeSearchResults = Pick<
  YoutubeSearchCache,
  'cache_key' | 'normalized_query' | 'raw_query' | 'result_json' | 'created_at' | 'expires_at'
>;

export type WriteYoutubeSearchCacheInput = {
  cacheKey: string;
  normalizedQuery: string;
  rawQuery: string;
  resultJson: YoutubeSearchResultPayload;
  expiresAt: string;
};

export type WriteYoutubeSearchLogInput = Pick<
  YoutubeSearchLog,
  | 'raw_query'
  | 'normalized_query'
  | 'cache_hit'
  | 'youtube_api_called'
  | 'response_status'
  | 'error_code'
  | 'result_count'
  | 'estimated_quota_cost'
>;

type SupabaseClient = ReturnType<typeof createSupabaseServerClient>;

type HelperOptions = {
  supabase?: SupabaseClient;
};

function getSupabase(options?: HelperOptions): SupabaseClient | null {
  if (options?.supabase) return options.supabase;
  if (!hasSupabaseServerConfig()) return null;

  return createSupabaseServerClient();
}

export async function readCachedYoutubeSearchResults(
  cacheKey: string,
  options?: HelperOptions,
): Promise<CachedYoutubeSearchResults | null> {
  const supabase = getSupabase(options);
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('youtube_search_cache')
    .select('cache_key, normalized_query, raw_query, result_json, created_at, expires_at')
    .eq('cache_key', cacheKey)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (error) throw error;

  return data ?? null;
}

export async function writeCachedYoutubeSearchResults(
  input: WriteYoutubeSearchCacheInput,
  options?: HelperOptions,
): Promise<void> {
  const supabase = getSupabase(options);
  if (!supabase) return;

  const { error } = await supabase.from('youtube_search_cache').upsert(
    {
      cache_key: input.cacheKey,
      normalized_query: input.normalizedQuery,
      raw_query: input.rawQuery,
      result_json: input.resultJson,
      expires_at: input.expiresAt,
    },
    { onConflict: 'cache_key' },
  );

  if (error) throw error;
}

export async function writeYoutubeSearchLog(input: WriteYoutubeSearchLogInput, options?: HelperOptions): Promise<void> {
  const supabase = getSupabase(options);
  if (!supabase) return;

  const { error } = await supabase.from('youtube_search_logs').insert(input);

  if (error) throw error;
}
