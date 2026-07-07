'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { BackLink, PageHeader } from '@/components/ui/navigation';
import { assignments as sampleAssignments, profiles, videos } from '@/lib/sample-data';

type AssignmentDraft = Record<string, Set<string>>;

function buildInitialAssignments(): AssignmentDraft {
  return profiles.reduce<AssignmentDraft>((draft, profile) => {
    draft[profile.id] = new Set(
      sampleAssignments
        .filter((assignment) => assignment.profileId === profile.id)
        .map((assignment) => assignment.videoId),
    );

    return draft;
  }, {});
}

function cloneAssignments(assignments: AssignmentDraft) {
  return Object.fromEntries(Object.entries(assignments).map(([profileId, videoIds]) => [profileId, new Set(videoIds)])) as AssignmentDraft;
}

export default function ParentAssignmentsPage() {
  const [selectedProfileId, setSelectedProfileId] = useState(profiles[0]?.id ?? '');
  const [draftAssignments, setDraftAssignments] = useState<AssignmentDraft>(() => buildInitialAssignments());
  const selectedProfile = profiles.find((profile) => profile.id === selectedProfileId) ?? profiles[0];

  const assignedVideoIds = useMemo(() => draftAssignments[selectedProfileId] ?? new Set<string>(), [draftAssignments, selectedProfileId]);
  const assignedCount = assignedVideoIds.size;
  const totalAssignments = useMemo(
    () => Object.values(draftAssignments).reduce((total, videoIds) => total + videoIds.size, 0),
    [draftAssignments],
  );

  const toggleAssignment = (videoId: string) => {
    if (!selectedProfileId) return;

    setDraftAssignments((currentAssignments) => {
      const nextAssignments = cloneAssignments(currentAssignments);
      const nextVideoIds = nextAssignments[selectedProfileId] ?? new Set<string>();

      if (nextVideoIds.has(videoId)) {
        nextVideoIds.delete(videoId);
      } else {
        nextVideoIds.add(videoId);
      }

      nextAssignments[selectedProfileId] = nextVideoIds;
      return nextAssignments;
    });
  };

  const resetAssignments = () => {
    setDraftAssignments(buildInitialAssignments());
  };

  return (
    <main className="min-h-screen bg-watchnest-background px-6 py-8 text-watchnest-foreground">
      <div className="mx-auto max-w-6xl">
        <BackLink href="/parent/dashboard">Back to Parent Dashboard</BackLink>

        <PageHeader
          className="mt-4"
          eyebrow="Assignment Management"
          title="Review and adjust approved video access."
          description="This local-only UI shell previews how parents will manage which sample videos are available to each child profile. Changes stay in browser state and are not saved to Supabase."
          actions={
            <Link className="rounded-2xl bg-watchnest-primary px-5 py-3 text-center font-semibold text-white" href="/parent/add-video">
              Add Video
            </Link>
          }
        >
          <div className="grid gap-3 text-sm text-watchnest-muted sm:grid-cols-3">
            <div className="rounded-2xl bg-watchnest-background p-4">
              <p className="font-semibold text-watchnest-foreground">{profiles.length} profiles</p>
              <p>Sample child profiles</p>
            </div>
            <div className="rounded-2xl bg-watchnest-background p-4">
              <p className="font-semibold text-watchnest-foreground">{videos.length} videos</p>
              <p>Local approved catalog</p>
            </div>
            <div className="rounded-2xl bg-watchnest-background p-4">
              <p className="font-semibold text-watchnest-foreground">{totalAssignments} assignments</p>
              <p>Unsaved preview state</p>
            </div>
          </div>
        </PageHeader>

        <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-card border border-watchnest-border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-watchnest-primary">Profiles</p>
                <h2 className="mt-1 text-2xl font-bold">Choose a child</h2>
              </div>
              <button className="rounded-2xl border border-watchnest-border px-3 py-2 text-sm font-semibold text-watchnest-primary" onClick={resetAssignments} type="button">
                Reset
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {profiles.map((profile) => {
                const profileAssignmentCount = draftAssignments[profile.id]?.size ?? 0;
                const isSelected = profile.id === selectedProfileId;

                return (
                  <button
                    key={profile.id}
                    className={`w-full rounded-3xl border p-4 text-left transition ${
                      isSelected ? 'border-watchnest-primary bg-watchnest-softBlue ring-2 ring-watchnest-primary' : 'border-watchnest-border bg-watchnest-background'
                    }`}
                    onClick={() => setSelectedProfileId(profile.id)}
                    type="button"
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-12 w-12 rounded-full" style={{ backgroundColor: profile.avatarColor }} />
                      <span>
                        <span className="block font-semibold">{profile.displayName}</span>
                        <span className="text-sm text-watchnest-muted">
                          {profileAssignmentCount} assigned video{profileAssignmentCount === 1 ? '' : 's'}
                        </span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="rounded-card border border-watchnest-border bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-watchnest-primary">Video access</p>
                <h2 className="mt-1 text-2xl font-bold">{selectedProfile?.displayName ?? 'Profile'} library</h2>
                <p className="mt-2 text-watchnest-muted">
                  Toggle sample assignments to preview the management flow. The save action is intentionally disabled until backend persistence is added.
                </p>
              </div>
              <div className="rounded-2xl bg-watchnest-background px-4 py-3 text-sm text-watchnest-muted">
                <span className="font-semibold text-watchnest-foreground">{assignedCount}</span> of {videos.length} videos selected
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {videos.map((video) => {
                const isAssigned = assignedVideoIds.has(video.id);

                return (
                  <article key={video.id} className="rounded-3xl border border-watchnest-border bg-watchnest-background p-4">
                    <div className="mb-4 h-32 rounded-2xl" style={{ backgroundColor: video.thumbnailColor }} />
                    <div className="flex min-h-28 flex-col justify-between gap-4">
                      <div>
                        <h3 className="font-semibold">{video.title}</h3>
                        <p className="mt-1 text-sm text-watchnest-muted">{video.channelTitle}</p>
                      </div>
                      <button
                        className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                          isAssigned
                            ? 'bg-watchnest-primary text-white'
                            : 'border border-watchnest-border bg-white text-watchnest-primary'
                        }`}
                        onClick={() => toggleAssignment(video.id)}
                        type="button"
                      >
                        {isAssigned ? 'Assigned locally' : 'Assign locally'}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-6 rounded-3xl border border-dashed border-watchnest-border bg-watchnest-background p-5">
              <h3 className="font-semibold">Local shell only</h3>
              <p className="mt-2 text-sm text-watchnest-muted">
                These controls use sample data and React state only. There are no backend calls, Supabase writes, API requests, or authorization changes on this page.
              </p>
              <button className="mt-4 w-full rounded-2xl bg-watchnest-primary px-5 py-3 font-semibold text-white opacity-50 sm:w-auto" disabled type="button">
                Save assignments (coming soon)
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
