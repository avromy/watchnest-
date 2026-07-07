import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { fetchYouTubeVideoMetadata } from './youtube-metadata';

const jsonResponse = (body: unknown, init: { ok?: boolean; status?: number } = {}) =>
  ({
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: async () => body,
  }) as Response;

describe('fetchYouTubeVideoMetadata', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('fetches and normalizes YouTube video metadata', async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () =>
      jsonResponse({
        items: [
          {
            id: 'abc123',
            snippet: {
              title: 'Kid-safe science',
              channelId: 'channel-1',
              channelTitle: 'Science Nest',
              thumbnails: {
                default: { url: 'https://img.youtube.com/default.jpg' },
                high: { url: 'https://img.youtube.com/high.jpg' },
              },
            },
            contentDetails: { duration: 'PT4M12S' },
            status: { embeddable: true, privacyStatus: 'public', uploadStatus: 'processed' },
          },
        ],
      }),
    );

    const result = await fetchYouTubeVideoMetadata(' abc123 ', { apiKey: 'test-key', fetchImpl });

    expect(result).toEqual({
      ok: true,
      metadata: {
        youtube_video_id: 'abc123',
        title: 'Kid-safe science',
        channel_id: 'channel-1',
        channel_title: 'Science Nest',
        thumbnail_url: 'https://img.youtube.com/high.jpg',
        duration: 'PT4M12S',
        embeddable_status: 'embeddable',
        availability_status: 'available',
      },
    });

    const requestedUrl = new URL(String(fetchImpl.mock.calls[0]?.[0]));
    expect(requestedUrl.searchParams.get('key')).toBe('test-key');
    expect(requestedUrl.searchParams.get('part')).toBe('snippet,contentDetails,status');
    expect(requestedUrl.searchParams.get('id')).toBe('abc123');
  });

  it('reads the API key from the server environment', async () => {
    vi.stubEnv('YOUTUBE_API_KEY', 'env-key');
    const fetchImpl = vi.fn<typeof fetch>(async () => jsonResponse({ items: [] }));

    await fetchYouTubeVideoMetadata('video-id', { fetchImpl });

    const requestedUrl = new URL(String(fetchImpl.mock.calls[0]?.[0]));
    expect(requestedUrl.searchParams.get('key')).toBe('env-key');
  });

  it('returns unavailable metadata when YouTube does not return an item', async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () => jsonResponse({ items: [] }));

    await expect(fetchYouTubeVideoMetadata('missing-id', { apiKey: 'test-key', fetchImpl })).resolves.toEqual({
      ok: true,
      metadata: {
        youtube_video_id: 'missing-id',
        title: '',
        channel_id: null,
        channel_title: null,
        thumbnail_url: null,
        duration: null,
        embeddable_status: 'unknown',
        availability_status: 'unavailable',
      },
    });
  });

  it('safely reports configuration, API, and network errors', async () => {
    await expect(fetchYouTubeVideoMetadata('abc123', { apiKey: '', fetchImpl: vi.fn() })).resolves.toEqual({
      ok: false,
      error: 'YOUTUBE_API_KEY is not configured.',
    });

    await expect(
      fetchYouTubeVideoMetadata('abc123', {
        apiKey: 'test-key',
        fetchImpl: vi.fn(async () => jsonResponse({ error: { message: 'quota exceeded' } }, { ok: false, status: 403 })),
      }),
    ).resolves.toEqual({ ok: false, error: 'quota exceeded', status: 403 });

    await expect(
      fetchYouTubeVideoMetadata('abc123', {
        apiKey: 'test-key',
        fetchImpl: vi.fn(async () => {
          throw new Error('network down');
        }),
      }),
    ).resolves.toEqual({ ok: false, error: 'network down' });
  });
});
