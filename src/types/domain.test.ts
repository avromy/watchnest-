import { describe, expect, expectTypeOf, it } from 'vitest';
import type { Parent, Profile, ProfileVideoAssignment, Video, WatchProgress } from './domain';

describe('core domain models', () => {
  it('defines the WatchNest parent/profile/video/assignment/progress model surface', () => {
    expectTypeOf<Parent>().toMatchTypeOf<{
      id: string;
      email: string;
      createdAt: string;
    }>();

    expectTypeOf<Profile>().toMatchTypeOf<{
      id: string;
      parentId: string;
      displayName: string;
      avatarKey: string;
      colorKey: string;
      pinEnabled: boolean;
      pinHash: string | null;
      createdAt: string;
      archivedAt: string | null;
    }>();

    expectTypeOf<Video>().toMatchTypeOf<{
      id: string;
      youtubeVideoId: string;
      title: string;
      availabilityStatus: 'available' | 'unavailable' | 'needs_review';
      embeddableStatus: 'embeddable' | 'not_embeddable' | 'unknown';
    }>();

    expectTypeOf<ProfileVideoAssignment>().toMatchTypeOf<{
      id: string;
      parentId: string;
      profileId: string;
      videoId: string;
      approvedByParentId: string;
      removedAt: string | null;
    }>();

    expectTypeOf<WatchProgress>().toMatchTypeOf<{
      id: string;
      profileId: string;
      videoId: string;
      currentTimeSeconds: number;
      completedAt: string | null;
    }>();

    expect(true).toBe(true);
  });
});
