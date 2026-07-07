'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BackLink, PageHeader } from '@/components/ui/navigation';

const assignmentPlaceholders = [
  { id: 'emma', name: 'Emma' },
  { id: 'noah', name: 'Noah' },
  { id: 'ava', name: 'Ava' },
];

const placeholderVideos = {
  search: {
    id: 'sample-search-video',
    title: 'Gentle Space Facts for Curious Kids',
    channel: 'WatchNest Preview',
    sourceLabel: 'Selected from local search preview',
  },
  url: {
    id: 'sample-url-video',
    title: 'Pasted YouTube Link Preview',
    channel: 'WatchNest Preview',
    sourceLabel: 'Selected from pasted URL preview',
  },
};

type PlaceholderVideo = (typeof placeholderVideos)[keyof typeof placeholderVideos];

export default function ParentAddVideoPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [pastedUrl, setPastedUrl] = useState('');
  const [selectedProfileIds, setSelectedProfileIds] = useState<string[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<PlaceholderVideo | null>(null);

  const canSearch = searchQuery.trim().length > 0;
  const canFetchUrl = pastedUrl.trim().length > 0;
  const canConfirm = Boolean(selectedVideo) && selectedProfileIds.length > 0;

  const toggleProfile = (profileId: string) => {
    setSelectedProfileIds((currentProfileIds) =>
      currentProfileIds.includes(profileId)
        ? currentProfileIds.filter((currentProfileId) => currentProfileId !== profileId)
        : [...currentProfileIds, profileId],
    );
  };

  return (
    <main className="min-h-screen bg-watchnest-background px-6 py-8 text-watchnest-foreground">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <BackLink href="/parent/dashboard">Back to Dashboard</BackLink>
        </div>

        <PageHeader
          eyebrow="Parent-only approval"
          title="Add Video"
          description="This page is a calm setup space for parents to find or paste a YouTube video before assigning it to approved profiles. It is not viewer search, and nothing here is available to child profiles until a parent confirms an assignment."
        />

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-6">
            <div className="rounded-card border border-watchnest-border bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold">Search YouTube</h2>
              <p className="mt-2 text-watchnest-muted">
                Search will eventually help parents discover a specific video to approve. For now, this is a UI shell only.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <label className="sr-only" htmlFor="youtube-search">
                  Search YouTube
                </label>
                <input
                  className="min-h-12 flex-1 rounded-2xl border border-watchnest-border bg-watchnest-background px-4 text-watchnest-foreground placeholder:text-watchnest-muted"
                  id="youtube-search"
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search by title, channel, or topic"
                  type="search"
                  value={searchQuery}
                />
                <button
                  className={`rounded-2xl bg-watchnest-primary px-5 py-3 font-semibold text-white ${canSearch ? '' : 'opacity-50'}`}
                  disabled={!canSearch}
                  onClick={() => setSelectedVideo(placeholderVideos.search)}
                  type="button"
                >
                  Search
                </button>
              </div>
            </div>

            <div className="rounded-card border border-watchnest-border bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold">Paste YouTube URL</h2>
              <p className="mt-2 text-watchnest-muted">
                Parents will be able to paste a known YouTube link and review the video before saving it.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <label className="sr-only" htmlFor="youtube-url">
                  YouTube URL
                </label>
                <input
                  className="min-h-12 flex-1 rounded-2xl border border-watchnest-border bg-watchnest-background px-4 text-watchnest-foreground placeholder:text-watchnest-muted"
                  id="youtube-url"
                  onChange={(event) => setPastedUrl(event.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  type="url"
                  value={pastedUrl}
                />
                <button
                  className={`rounded-2xl bg-watchnest-primary px-5 py-3 font-semibold text-white ${canFetchUrl ? '' : 'opacity-50'}`}
                  disabled={!canFetchUrl}
                  onClick={() => setSelectedVideo(placeholderVideos.url)}
                  type="button"
                >
                  Fetch Video
                </button>
              </div>
            </div>

            <div className="rounded-card border border-watchnest-border bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold">Assign to Profiles</h2>
              <p className="mt-2 text-watchnest-muted">
                After previewing a video, choose which child profiles can see it in their approved library.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {assignmentPlaceholders.map((profile) => {
                  const isSelected = selectedProfileIds.includes(profile.id);

                  return (
                    <button
                      key={profile.id}
                      className={`rounded-3xl border p-4 text-left transition ${
                        isSelected
                          ? 'border-watchnest-primary bg-watchnest-softBlue ring-2 ring-watchnest-primary'
                          : 'border-dashed border-watchnest-border bg-watchnest-background'
                      } ${selectedVideo ? '' : 'opacity-70'}`}
                      disabled={!selectedVideo}
                      onClick={() => toggleProfile(profile.id)}
                      type="button"
                    >
                      <div className="mb-3 h-10 w-10 rounded-full bg-watchnest-softBlue" />
                      <p className="font-semibold">{profile.name}</p>
                      <p className="mt-1 text-sm text-watchnest-muted">{isSelected ? 'Selected for preview assignment' : 'Profile selector placeholder'}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-card border border-watchnest-border bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold">Preview</h2>
              <div className="mt-5 rounded-3xl border border-dashed border-watchnest-border bg-watchnest-background p-4">
                <div className="flex h-48 items-center justify-center rounded-2xl bg-watchnest-softBlue p-6 text-center text-watchnest-muted">
                  {selectedVideo ? (
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-watchnest-primary">Local preview</p>
                      <p className="mt-2 text-xl font-bold text-watchnest-foreground">{selectedVideo.title}</p>
                    </div>
                  ) : (
                    'Video preview will appear here'
                  )}
                </div>
                <div className="mt-4 space-y-2">
                  {selectedVideo ? (
                    <>
                      <p className="font-semibold">{selectedVideo.channel}</p>
                      <p className="text-sm text-watchnest-muted">{selectedVideo.sourceLabel}. No YouTube, Supabase, or API calls are made.</p>
                    </>
                  ) : (
                    <>
                      <div className="h-4 w-3/4 rounded-full bg-watchnest-border" />
                      <div className="h-4 w-1/2 rounded-full bg-watchnest-border" />
                    </>
                  )}
                </div>
              </div>
              <p className="mt-4 text-sm text-watchnest-muted">
                {selectedVideo
                  ? `${selectedProfileIds.length} placeholder profile${selectedProfileIds.length === 1 ? '' : 's'} selected for this local-only assignment.`
                  : 'No video has been selected. Viewer profiles cannot browse or search YouTube from this parent workflow.'}
              </p>
            </div>

            <div className="rounded-card border border-watchnest-border bg-white p-6 shadow-sm">
              <button
                className={`w-full rounded-2xl bg-watchnest-primary px-5 py-3 font-semibold text-white ${canConfirm ? '' : 'opacity-50'}`}
                disabled={!canConfirm}
                type="button"
              >
                Save / Confirm
              </button>
              <Link className="mt-3 block rounded-2xl border border-watchnest-border bg-white px-5 py-3 text-center font-semibold text-watchnest-primary" href="/parent/dashboard">
                Cancel
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
