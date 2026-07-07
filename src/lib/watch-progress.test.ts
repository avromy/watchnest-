import { describe, expect, it } from 'vitest';
import { calculatePercentWatched, isContinueWatchingEligible, isVideoNearEnd, orderContinueWatchingVideos } from './watch-progress';

describe('watch progress helpers', () => {
  it('calculates the watched percentage and clamps invalid values', () => {
    expect(calculatePercentWatched({ currentTimeSeconds: 45, durationSeconds: 180 })).toBe(25);
    expect(calculatePercentWatched({ currentTimeSeconds: 250, durationSeconds: 200 })).toBe(100);
    expect(calculatePercentWatched({ currentTimeSeconds: -10, durationSeconds: 200 })).toBe(0);
    expect(calculatePercentWatched({ currentTimeSeconds: 50, durationSeconds: null })).toBe(0);
    expect(calculatePercentWatched({ currentTimeSeconds: 50, durationSeconds: 0 })).toBe(0);
  });

  it('detects videos near the end by percent watched or remaining time', () => {
    expect(isVideoNearEnd({ currentTimeSeconds: 540, durationSeconds: 600 })).toBe(true);
    expect(isVideoNearEnd({ currentTimeSeconds: 571, durationSeconds: 600 })).toBe(true);
    expect(isVideoNearEnd({ currentTimeSeconds: 400, durationSeconds: 600 })).toBe(false);
    expect(isVideoNearEnd({ currentTimeSeconds: 10, durationSeconds: null })).toBe(false);
  });

  it('allows near-end thresholds to be configured', () => {
    expect(isVideoNearEnd({ currentTimeSeconds: 480, durationSeconds: 600 }, { nearEndPercent: 80 })).toBe(true);
    expect(isVideoNearEnd({ currentTimeSeconds: 560, durationSeconds: 600 }, { nearEndRemainingSeconds: 45 })).toBe(true);
  });

  it('marks only in-progress, unfinished, not-near-end videos as continue-watching eligible', () => {
    expect(isContinueWatchingEligible({ currentTimeSeconds: 60, durationSeconds: 600, completedAt: null })).toBe(true);
    expect(isContinueWatchingEligible({ currentTimeSeconds: 0, durationSeconds: 600, completedAt: null })).toBe(false);
    expect(isContinueWatchingEligible({ currentTimeSeconds: 590, durationSeconds: 600, completedAt: null })).toBe(false);
    expect(isContinueWatchingEligible({ currentTimeSeconds: 60, durationSeconds: 600, completedAt: '2026-07-06T00:00:00.000Z' })).toBe(false);
    expect(isContinueWatchingEligible(null)).toBe(false);
  });

  it('orders continue-watching videos by most recently updated progress', () => {
    const ordered = orderContinueWatchingVideos([
      { id: 'older', progress: { currentTimeSeconds: 30, durationSeconds: 300, completedAt: null, updatedAt: '2026-07-06T10:00:00.000Z' } },
      { id: 'near-end', progress: { currentTimeSeconds: 295, durationSeconds: 300, completedAt: null, updatedAt: '2026-07-06T12:00:00.000Z' } },
      { id: 'newer', progress: { currentTimeSeconds: 40, durationSeconds: 300, completedAt: null, updatedAt: '2026-07-06T11:00:00.000Z' } },
      { id: 'unwatched', progress: { currentTimeSeconds: 0, durationSeconds: 300, completedAt: null, updatedAt: '2026-07-06T13:00:00.000Z' } },
    ]);

    expect(ordered.map((video) => video.id)).toEqual(['newer', 'older']);
  });
});
