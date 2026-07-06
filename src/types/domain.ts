export type IsoDateTime = string;
export type Uuid = string;

export type Parent = {
  id: Uuid;
  email: string;
  createdAt: IsoDateTime;
};

export type Profile = {
  id: Uuid;
  parentId: Uuid;
  displayName: string;
  avatarKey: string;
  colorKey: string;
  pinEnabled: boolean;
  pinHash: string | null;
  createdAt: IsoDateTime;
  archivedAt: IsoDateTime | null;
};

export type VideoAvailabilityStatus = 'available' | 'unavailable' | 'needs_review';
export type VideoEmbeddableStatus = 'embeddable' | 'not_embeddable' | 'unknown';

export type Video = {
  id: Uuid;
  youtubeVideoId: string;
  title: string;
  channelId: string | null;
  channelTitle: string | null;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  availabilityStatus: VideoAvailabilityStatus;
  embeddableStatus: VideoEmbeddableStatus;
  metadataLastCheckedAt: IsoDateTime | null;
  createdAt: IsoDateTime;
};

export type ProfileVideoAssignment = {
  id: Uuid;
  parentId: Uuid;
  profileId: Uuid;
  videoId: Uuid;
  approvedByParentId: Uuid;
  approvedAt: IsoDateTime;
  removedAt: IsoDateTime | null;
  removalReason: string | null;
};

export type WatchProgress = {
  id: Uuid;
  profileId: Uuid;
  videoId: Uuid;
  currentTimeSeconds: number;
  durationSeconds: number | null;
  completedAt: IsoDateTime | null;
  updatedAt: IsoDateTime;
};
