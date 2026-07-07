import { describe, expect, it, vi } from 'vitest';

import {
  readCachedYoutubeSearchResults,
  writeCachedYoutubeSearchResults,
  writeYoutubeSearchLog,
} from './youtube-search-data';

vi.mock('server-only', () => ({}));
vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(),
  hasSupabaseServerConfig: vi.fn(() => false),
}));

function createReadClient(result: unknown) {
  const maybeSingle = vi.fn().mockResolvedValue(result);
  const gt = vi.fn(() => ({ maybeSingle }));
  const eq = vi.fn(() => ({ gt }));
  const select = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ select }));

  return { client: { from }, from, select, eq, gt, maybeSingle };
}

function createWriteClient(result: unknown) {
  const upsert = vi.fn().mockResolvedValue(result);
  const insert = vi.fn().mockResolvedValue(result);
  const from = vi.fn(() => ({ upsert, insert }));

  return { client: { from }, from, upsert, insert };
}

describe('youtube search data helpers', () => {
  it('reads a non-expired cached YouTube search result by cache key', async () => {
    const cachedResult = {
      cache_key: 'yt:bluey',
      normalized_query: 'bluey',
      raw_query: ' Bluey ',
      result_json: [{ videoId: 'abc123', title: 'Bluey' }],
      created_at: '2026-07-07T00:00:00.000Z',
      expires_at: '2026-07-08T00:00:00.000Z',
    };
    const mock = createReadClient({ data: cachedResult, error: null });

    await expect(readCachedYoutubeSearchResults('yt:bluey', { supabase: mock.client as never })).resolves.toEqual(cachedResult);

    expect(mock.from).toHaveBeenCalledWith('youtube_search_cache');
    expect(mock.select).toHaveBeenCalledWith('cache_key, normalized_query, raw_query, result_json, created_at, expires_at');
    expect(mock.eq).toHaveBeenCalledWith('cache_key', 'yt:bluey');
    expect(mock.gt).toHaveBeenCalledWith('expires_at', expect.any(String));
  });

  it('returns null when the cache row is missing or expired', async () => {
    const mock = createReadClient({ data: null, error: null });

    await expect(readCachedYoutubeSearchResults('yt:missing', { supabase: mock.client as never })).resolves.toBeNull();
  });

  it('throws Supabase read errors', async () => {
    const error = new Error('read failed');
    const mock = createReadClient({ data: null, error });

    await expect(readCachedYoutubeSearchResults('yt:error', { supabase: mock.client as never })).rejects.toThrow('read failed');
  });

  it('upserts cached YouTube search results on cache key', async () => {
    const mock = createWriteClient({ error: null });

    await writeCachedYoutubeSearchResults(
      {
        cacheKey: 'yt:dinosaurs',
        normalizedQuery: 'dinosaurs',
        rawQuery: 'Dinosaurs',
        resultJson: [{ videoId: 'dino1' }],
        expiresAt: '2026-07-08T00:00:00.000Z',
      },
      { supabase: mock.client as never },
    );

    expect(mock.from).toHaveBeenCalledWith('youtube_search_cache');
    expect(mock.upsert).toHaveBeenCalledWith(
      {
        cache_key: 'yt:dinosaurs',
        normalized_query: 'dinosaurs',
        raw_query: 'Dinosaurs',
        result_json: [{ videoId: 'dino1' }],
        expires_at: '2026-07-08T00:00:00.000Z',
      },
      { onConflict: 'cache_key' },
    );
  });

  it('inserts YouTube search logs', async () => {
    const mock = createWriteClient({ error: null });
    const log = {
      raw_query: 'Bluey',
      normalized_query: 'bluey',
      cache_hit: true,
      youtube_api_called: false,
      response_status: 'ok',
      error_code: null,
      result_count: 3,
      estimated_quota_cost: 0,
    };

    await writeYoutubeSearchLog(log, { supabase: mock.client as never });

    expect(mock.from).toHaveBeenCalledWith('youtube_search_logs');
    expect(mock.insert).toHaveBeenCalledWith(log);
  });
});
