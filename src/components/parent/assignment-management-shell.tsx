'use client';

import { useMemo, useState } from 'react';
import type { Assignment, Profile, Video } from '@/lib/sample-data';

type AssignmentManagementShellProps = {
  initialAssignments: Assignment[];
  profiles: Profile[];
  videos: Video[];
};

function assignmentKey(profileId: string, videoId: string) {
  return `${profileId}:${videoId}`;
}

export function AssignmentManagementShell({ initialAssignments, profiles, videos }: AssignmentManagementShellProps) {
  const [selectedVideoId, setSelectedVideoId] = useState(videos[0]?.id ?? '');
  const [selectedProfileIds, setSelectedProfileIds] = useState<string[]>(profiles[0] ? [profiles[0].id] : []);
  const [assignedKeys, setAssignedKeys] = useState(() => new Set(initialAssignments.map((assignment) => assignmentKey(assignment.profileId, assignment.videoId))));

  const selectedVideo = videos.find((video) => video.id === selectedVideoId);

  const assignedProfileIds = useMemo(
    () => profiles.filter((profile) => assignedKeys.has(assignmentKey(profile.id, selectedVideoId))).map((profile) => profile.id),
    [assignedKeys, profiles, selectedVideoId],
  );

  const selectedProfileNames = profiles
    .filter((profile) => selectedProfileIds.includes(profile.id))
    .map((profile) => profile.displayName)
    .join(', ');

  function toggleProfile(profileId: string) {
    setSelectedProfileIds((current) => (current.includes(profileId) ? current.filter((id) => id !== profileId) : [...current, profileId]));
  }

  function assignToProfiles(profileIds: string[]) {
    if (!selectedVideoId || profileIds.length === 0) return;

    setAssignedKeys((current) => {
      const next = new Set(current);
      profileIds.forEach((profileId) => next.add(assignmentKey(profileId, selectedVideoId)));
      return next;
    });
  }

  function removeFromProfiles(profileIds: string[]) {
    if (!selectedVideoId || profileIds.length === 0) return;

    setAssignedKeys((current) => {
      const next = new Set(current);
      profileIds.forEach((profileId) => next.delete(assignmentKey(profileId, selectedVideoId)));
      return next;
    });
  }

  return (
    <section className="mt-8 rounded-card border border-watchnest-border bg-white p-6 shadow-sm" aria-labelledby="assignment-management-title">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-watchnest-primary">Assignment management</p>
          <h2 id="assignment-management-title" className="mt-2 text-2xl font-bold">Manage approved profile access</h2>
          <p className="mt-2 max-w-3xl text-watchnest-muted">
            UI shell only: these controls use sample data and local state. WatchNest stays approved-only—viewer libraries and playback should only show videos a parent has explicitly approved for that profile.
          </p>
        </div>
        <span className="rounded-full bg-watchnest-softBlue px-4 py-2 text-sm font-semibold text-watchnest-primary">No Supabase writes</span>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-watchnest-border bg-watchnest-background p-4">
          <label className="text-sm font-semibold text-watchnest-muted" htmlFor="assignment-video">Video to manage</label>
          <select
            className="mt-2 w-full rounded-2xl border border-watchnest-border bg-white px-4 py-3 font-semibold text-watchnest-foreground"
            id="assignment-video"
            value={selectedVideoId}
            onChange={(event) => setSelectedVideoId(event.target.value)}
          >
            {videos.map((video) => (
              <option key={video.id} value={video.id}>{video.title}</option>
            ))}
          </select>

          {selectedVideo ? (
            <div className="mt-4 rounded-2xl border border-watchnest-border bg-white p-4">
              <div className="mb-3 h-24 rounded-2xl" style={{ backgroundColor: selectedVideo.thumbnailColor }} />
              <p className="font-semibold">{selectedVideo.title}</p>
              <p className="text-sm text-watchnest-muted">{selectedVideo.channelTitle}</p>
              <p className="mt-3 text-sm text-watchnest-muted">
                Assigned now to {assignedProfileIds.length} of {profiles.length} sample profiles.
              </p>
            </div>
          ) : null}
        </div>

        <div className="rounded-3xl border border-watchnest-border bg-watchnest-background p-4">
          <p className="text-sm font-semibold text-watchnest-muted">Choose one or multiple profiles</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {profiles.map((profile) => {
              const checked = selectedProfileIds.includes(profile.id);
              const assigned = assignedKeys.has(assignmentKey(profile.id, selectedVideoId));

              return (
                <label key={profile.id} className={`rounded-2xl border bg-white p-4 ${checked ? 'border-watchnest-primary' : 'border-watchnest-border'}`}>
                  <input className="sr-only" type="checkbox" checked={checked} onChange={() => toggleProfile(profile.id)} />
                  <span className="mb-3 block h-10 w-10 rounded-full" style={{ backgroundColor: profile.avatarColor }} />
                  <span className="block font-semibold">{profile.displayName}</span>
                  <span className="mt-1 block text-sm text-watchnest-muted">{assigned ? 'Currently approved' : 'Not assigned'}</span>
                </label>
              );
            })}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <button className="rounded-2xl bg-watchnest-primary px-4 py-3 text-sm font-semibold text-white" type="button" onClick={() => assignToProfiles(selectedProfileIds.slice(0, 1))}>
              Assign one
            </button>
            <button className="rounded-2xl bg-watchnest-primary px-4 py-3 text-sm font-semibold text-white" type="button" onClick={() => assignToProfiles(selectedProfileIds)}>
              Assign selected
            </button>
            <button className="rounded-2xl bg-watchnest-primary px-4 py-3 text-sm font-semibold text-white" type="button" onClick={() => assignToProfiles(profiles.map((profile) => profile.id))}>
              Assign all
            </button>
            <button className="rounded-2xl border border-watchnest-border bg-white px-4 py-3 text-sm font-semibold text-watchnest-primary" type="button" onClick={() => removeFromProfiles(selectedProfileIds.slice(0, 1))}>
              Remove one
            </button>
            <button className="rounded-2xl border border-watchnest-border bg-white px-4 py-3 text-sm font-semibold text-watchnest-primary" type="button" onClick={() => removeFromProfiles(profiles.map((profile) => profile.id))}>
              Remove all
            </button>
          </div>

          <p className="mt-4 text-sm text-watchnest-muted" aria-live="polite">
            Selected profiles: {selectedProfileNames || 'none'}. These preview actions do not change backend assignments or viewer playback authorization.
          </p>
        </div>
      </div>
    </section>
  );
}
