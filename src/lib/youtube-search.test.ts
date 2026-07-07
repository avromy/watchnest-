import { describe, expect, it } from 'vitest';
import { normalizeYouTubeSearchQuery, normalizeYouTubeSearchResults, validateYouTubeSearchQuery } from './youtube-search';

describe('YouTube parent search helpers', () => {
  it('normalizes explicit search input', () => {
    expect(normalizeYouTubeSearchQuery('  Calm   Animals for Kids  ')).toBe('calm animals for kids');
  });

  it('validates empty and overly long queries', () => {
    expect(validateYouTubeSearchQuery('')).toBe('missing_query');
    expect(validateYouTubeSearchQuery('a'.repeat(121))).toBe('query_too_long');
    expect(validateYouTubeSearchQuery('calm animals')).toBeNull();
  });

  it('returns safe normalized video search results only', () => {
    expect(
      normalizeYouTubeSearchResults([
        {
          id: { kind: 'youtube#video', videoId: 'abc123' },
          snippet: {
            title: '  A Good Video  ',
            channelId: 'channel-1',
            channelTitle: '  Helpful Channel ',
            publishedAt: '2026-07-06T00:00:00Z',
            thumbnails: { medium: { url: 'https://img.example/medium.jpg' } },
          },
        },
        { id: { kind: 'youtube#channel', videoId: 'not-video' } },
      ]),
    ).toEqual([
      {
        youtubeVideoId: 'abc123',
        title: 'A Good Video',
        channelId: 'channel-1',
        channelTitle: 'Helpful Channel',
        thumbnailUrl: 'https://img.example/medium.jpg',
        publishedAt: '2026-07-06T00:00:00Z',
      },
    ]);
  });
});
