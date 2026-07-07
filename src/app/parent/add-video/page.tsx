import Link from 'next/link';
import { BackLink, PageHeader } from '@/components/ui/navigation';

const assignmentPlaceholders = ['Emma', 'Noah', 'Ava'];

export default function ParentAddVideoPage() {
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
                  disabled
                  id="youtube-search"
                  placeholder="Search by title, channel, or topic"
                  type="search"
                />
                <button className="rounded-2xl bg-watchnest-primary px-5 py-3 font-semibold text-white opacity-50" disabled type="button">
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
                  disabled
                  id="youtube-url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  type="url"
                />
                <button className="rounded-2xl bg-watchnest-primary px-5 py-3 font-semibold text-white opacity-50" disabled type="button">
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
                {assignmentPlaceholders.map((profile) => (
                  <div key={profile} className="rounded-3xl border border-dashed border-watchnest-border bg-watchnest-background p-4 opacity-70">
                    <div className="mb-3 h-10 w-10 rounded-full bg-watchnest-softBlue" />
                    <p className="font-semibold">{profile}</p>
                    <p className="mt-1 text-sm text-watchnest-muted">Profile selector placeholder</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-card border border-watchnest-border bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold">Preview</h2>
              <div className="mt-5 rounded-3xl border border-dashed border-watchnest-border bg-watchnest-background p-4">
                <div className="flex h-48 items-center justify-center rounded-2xl bg-watchnest-softBlue text-center text-watchnest-muted">
                  Video preview will appear here
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-4 w-3/4 rounded-full bg-watchnest-border" />
                  <div className="h-4 w-1/2 rounded-full bg-watchnest-border" />
                </div>
              </div>
              <p className="mt-4 text-sm text-watchnest-muted">
                No video has been selected. Viewer profiles cannot browse or search YouTube from this parent workflow.
              </p>
            </div>

            <div className="rounded-card border border-watchnest-border bg-white p-6 shadow-sm">
              <button className="w-full rounded-2xl bg-watchnest-primary px-5 py-3 font-semibold text-white opacity-50" disabled type="button">
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
