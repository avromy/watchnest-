import { assignments, getVideosForProfile, profiles, videos } from '@/lib/sample-data';

export function listViewerProfiles() {
  return profiles;
}

export function getParentDashboard() {
  return { profiles, videos };
}

export function getViewerHome(profileId: string) {
  const profile = profiles.find((item) => item.id === profileId);

  if (!profile) {
    return null;
  }

  return {
    profile,
    videos: getVideosForProfile(profileId),
  };
}

export function isVideoAssignedToProfile(profileId: string, videoId: string) {
  return assignments.some((assignment) => assignment.profileId === profileId && assignment.videoId === videoId);
}
