import { readFileSync } from 'node:fs';
import { join } from 'node:path';
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
  {
    id: 'video-d',
    youtube_video_id: 'd',
    title: 'Video D',
    channel_id: null,
    channel_title: null,
    thumbnail_url: null,
    duration_seconds: null,
    availability_status: 'available',
    embeddable_status: 'not_embeddable',
    metadata_last_checked_at: null,
    created_at: '2026-07-06T00:00:00.000Z',
  },
];

const assignments: ActiveAssignment[] = [
  { profile_id: 'emma', video_id: 'video-a', removed_at: null },
  { profile_id: 'noah', video_id: 'video-b', removed_at: null },
  { profile_id: 'emma', video_id: 'video-c', removed_at: null },
  { profile_id: 'emma', video_id: 'video-b', removed_at: '2026-07-06T00:00:00.000Z' },
  { profile_id: 'emma', video_id: 'video-d', removed_at: null },
];

describe('profile assignment authorization helpers', () => {
  it('returns only active, available videos for the selected profile', () => {
    expect(getApprovedVideosForProfile(videos, assignments, 'emma').map((video) => video.id)).toEqual(['video-a']);
  });

  it('allows playback for an assigned available video', () => {
    expect(canProfilePlayVideo(videos, assignments, 'noah', 'video-b')).toBe(true);
  });

  it('denies playback for unassigned videos', () => {
    expect(canProfilePlayVideo(videos, assignments, 'emma', 'video-b')).toBe(false);
  });

  it('denies playback for removed assignments', () => {
    expect(canProfilePlayVideo(videos, assignments, 'emma', 'video-b')).toBe(false);
  });

  it('denies playback for unavailable videos', () => {
    expect(canProfilePlayVideo(videos, assignments, 'emma', 'video-c')).toBe(false);
  });

  it('denies playback for non-embeddable videos', () => {
    expect(canProfilePlayVideo(videos, assignments, 'emma', 'video-d')).toBe(false);
  });

  it('allows a removed assignment to coexist with an active assignment', () => {
    expect(() =>
      assertNoDuplicateActiveAssignments([
        { profile_id: 'emma', video_id: 'video-a', removed_at: '2026-07-06T00:00:00.000Z' },
        { profile_id: 'emma', video_id: 'video-a', removed_at: null },
      ]),
    ).not.toThrow();
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

describe('database assignment constraints', () => {
  it('documents duplicate active assignment prevention with a partial unique index', () => {
    const migration = readFileSync(join(process.cwd(), 'supabase/migrations/202607060001_initial_schema.sql'), 'utf8');

    expect(migration).toContain('profile_video_assignments_one_active_assignment');
    expect(migration).toContain('on public.profile_video_assignments(profile_id, video_id)');
    expect(migration).toContain('where removed_at is null');
  });
});
