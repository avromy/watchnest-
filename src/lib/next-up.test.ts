import { describe, expect, it } from 'vitest';
import { selectNextApprovedVideo } from './next-up';

const approvedVideos = [
  { id: 'video-a', title: 'Video A' },
  { id: 'video-b', title: 'Video B' },
  { id: 'video-c', title: 'Video C' },
  { id: 'video-d', title: 'Video D' },
] as const;

describe('selectNextApprovedVideo', () => {
  it('returns the next approved video after the current video', () => {
    expect(selectNextApprovedVideo('video-b', approvedVideos)?.id).toBe('video-c');
  });

  it('returns null when the current video is the final approved video and wrapping is not enabled', () => {
    expect(selectNextApprovedVideo('video-d', approvedVideos)).toBeNull();
  });

  it('wraps to the first approved video only when wrapping is enabled', () => {
    expect(selectNextApprovedVideo('video-d', approvedVideos, [], { wrap: true })?.id).toBe('video-a');
  });

  it('skips watched videos only when skipWatched is enabled', () => {
    expect(selectNextApprovedVideo('video-a', approvedVideos, ['video-b'])?.id).toBe('video-b');
    expect(selectNextApprovedVideo('video-a', approvedVideos, ['video-b'], { skipWatched: true })?.id).toBe('video-c');
  });

  it('continues searching wrapped videos when watched videos are skipped', () => {
    expect(selectNextApprovedVideo('video-c', approvedVideos, ['video-d', 'video-a'], { skipWatched: true, wrap: true })?.id).toBe(
      'video-b',
    );
  });

  it('returns null when all possible next videos are watched and watched videos are skipped', () => {
    expect(selectNextApprovedVideo('video-b', approvedVideos, ['video-a', 'video-c', 'video-d'], { skipWatched: true, wrap: true })).toBeNull();
  });

  it('returns null when the current video is not in the approved list', () => {
    expect(selectNextApprovedVideo('missing-video', approvedVideos, [], { wrap: true })).toBeNull();
  });
});
