export type Profile = {
  id: string;
  displayName: string;
  avatarColor: string;
};

export type Video = {
  id: string;
  title: string;
  channelTitle: string;
  thumbnailColor: string;
};

export type Assignment = {
  profileId: string;
  videoId: string;
};

export const profiles: Profile[] = [
  { id: 'emma', displayName: 'Emma', avatarColor: '#f8d7da' },
  { id: 'noah', displayName: 'Noah', avatarColor: '#d8f3dc' },
  { id: 'olivia', displayName: 'Olivia', avatarColor: '#ddeaf6' },
];

export const videos: Video[] = [
  { id: 'video-a', title: 'Bluey: Keepy Uppy', channelTitle: 'Bluey Official', thumbnailColor: '#ddeaf6' },
  { id: 'video-b', title: 'Science Volcano', channelTitle: 'Science Time', thumbnailColor: '#d8f3dc' },
  { id: 'video-c', title: 'Music Time', channelTitle: 'Music Club', thumbnailColor: '#fff3b0' },
];

export const assignments: Assignment[] = [
  { profileId: 'emma', videoId: 'video-a' },
  { profileId: 'emma', videoId: 'video-b' },
  { profileId: 'noah', videoId: 'video-b' },
  { profileId: 'olivia', videoId: 'video-c' },
];

export function getVideosForProfile(profileId: string) {
  const allowedIds = new Set(assignments.filter((assignment) => assignment.profileId === profileId).map((assignment) => assignment.videoId));
  return videos.filter((video) => allowedIds.has(video.id));
}
