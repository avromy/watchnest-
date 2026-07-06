import { describe, expect, it } from 'vitest';
import { assertNoDuplicateActiveAssignments, canProfilePlayVideo, getApprovedVideosForProfile } from './assignments';
import type { ActiveAssignment } from './assignments';
import type { Video } from '@/types/database';

const videos: Video[] = [
  {
    id: 'video-a',
    youtube_video_id: 'a',
    title: 'Video A',
    channel_id: null,
    channel_title: null,
    thumbnail_url: null,
    duration_seconds: null,
    availability_status: 'available',
    embeddable_status: 'embeddable',
    metadata_last_checked_at: null,
    created_at: '2026-07-06T00:00:00.000Z',
  },
  {
    id: 'video-b',
    youtube_video_id: 'b',
    title: 'Video B',
    channel_id: null,
    channel_title: null,
    thumbnail_url: null,
    duration_seconds: null,
    availability_status: 'available',
    embeddable_status: 'embeddable',
    metadata_last_checked_at: null,
    created_at: '2026-07-06T00:00:00.000Z',
  },
  {
    id: 'video-c',
    youtube_video_id: 'c',
    title: 'Video C',
    channel_id: null,
    channel_title: null,
    thumbnail_url: null,
    duration_seconds: null,
    availability_status: 'unavailable',
    embeddable_status: 'embeddable',
    metadata_last_checked_at: null,
    created_at: '2026-07-06T00:00:00.000Z',
  },
];

const assignments: ActiveAssignment[] = [
  { profile_id: 'emma', video_id: 'video-a', removed_at: null },
  { profile_id: 'noah', video_id: 'video-b', removed_at: null },
  { profile_id: 'emma', video_id: 'video-c', removed_at: null },
  { profile_id: 'emma', video_id: 'video-b', removed_at: '2026-07-06T00:00:00.000Z' },
];

describe('profile assignment authorization helpers', () => {
  it('returns only active, available videos for the selected profile', () => {
    expect(getApprovedVideosForProfile(videos, assignments, 'emma').map((video) => video.id)).toEqual(['video-a']);
  });

  it('denies playback for unassigned videos', () => {
    expect(canProfilePlayVideo(assignments, 'emma', 'video-b')).toBe(false);
  });

  it('allows playback for active assignments', () => {
    expect(canProfilePlayVideo(assignments, 'noah', 'video-b')).toBe(true);
  });

  it('detects duplicate active assignments', () => {
    expect(() =>
      assertNoDuplicateActiveAssignments([
        { profile_id: 'emma', video_id: 'video-a', removed_at: null },
        { profile_id: 'emma', video_id: 'video-a', removed_at: null },
      ]),
    ).toThrow('Duplicate active assignment detected');
  });
});
