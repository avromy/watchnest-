import type { ProfileVideoAssignment, Video } from '@/types/database';

export type ActiveAssignment = Pick<ProfileVideoAssignment, 'profile_id' | 'video_id' | 'removed_at'>;

export function getActiveVideoIdsForProfile(assignments: ActiveAssignment[], profileId: string) {
  return new Set(
    assignments
      .filter((assignment) => assignment.profile_id === profileId && assignment.removed_at === null)
      .map((assignment) => assignment.video_id),
  );
}

export function getApprovedVideosForProfile(videos: Video[], assignments: ActiveAssignment[], profileId: string) {
  const activeVideoIds = getActiveVideoIdsForProfile(assignments, profileId);

  return videos.filter((video) => {
    const isAssigned = activeVideoIds.has(video.id);
    const isAvailable = video.availability_status === 'available';
    const canEmbed = video.embeddable_status === 'embeddable' || video.embeddable_status === 'unknown';

    return isAssigned && isAvailable && canEmbed;
  });
}

export function canProfilePlayVideo(videos: Video[], assignments: ActiveAssignment[], profileId: string, videoId: string) {
  const video = videos.find((item) => item.id === videoId);
  const hasActiveAssignment = assignments.some(
    (assignment) => assignment.profile_id === profileId && assignment.video_id === videoId && assignment.removed_at === null,
  );

  if (!video || !hasActiveAssignment) return false;

  const isAvailable = video.availability_status === 'available';
  const canEmbed = video.embeddable_status === 'embeddable' || video.embeddable_status === 'unknown';

  return isAvailable && canEmbed;
}

export function assertNoDuplicateActiveAssignments(assignments: ActiveAssignment[]) {
  const seen = new Set<string>();

  for (const assignment of assignments) {
    if (assignment.removed_at !== null) continue;

    const key = `${assignment.profile_id}:${assignment.video_id}`;
    if (seen.has(key)) {
      throw new Error(`Duplicate active assignment detected for ${key}`);
    }

    seen.add(key);
  }
}
