import { describe, expect, it } from 'vitest';
import { extractYouTubeVideoId } from './youtube';

const videoId = 'dQw4w9WgXcQ';

describe('extractYouTubeVideoId', () => {
  it.each([
    ['standard watch URL', `https://www.youtube.com/watch?v=${videoId}`],
    ['watch URL with extra parameters', `https://youtube.com/watch?feature=share&v=${videoId}&t=42s`],
    ['short URL', `https://youtu.be/${videoId}`],
    ['embed URL', `https://www.youtube.com/embed/${videoId}`],
    ['shorts URL', `https://youtube.com/shorts/${videoId}`],
    ['mobile YouTube URL', `https://m.youtube.com/watch?v=${videoId}`],
  ])('extracts the ID from a %s', (_label, url) => {
    expect(extractYouTubeVideoId(url)).toBe(videoId);
  });

  it.each([
    ['plain text', 'not a url'],
    ['non-YouTube host', `https://example.com/watch?v=${videoId}`],
    ['unsupported YouTube path', `https://www.youtube.com/playlist?list=${videoId}`],
    ['missing watch parameter', 'https://www.youtube.com/watch'],
    ['empty short URL path', 'https://youtu.be/'],
    ['too-short video ID', 'https://youtu.be/abc123'],
    ['invalid video ID characters', 'https://www.youtube.com/embed/dQw4w9WgXc!'],
    ['nested embed path', `https://www.youtube.com/embed/${videoId}/extra`],
    ['non-web protocol', `ftp://www.youtube.com/watch?v=${videoId}`],
  ])('rejects an invalid URL: %s', (_label, url) => {
    expect(extractYouTubeVideoId(url)).toBeNull();
  });
});
