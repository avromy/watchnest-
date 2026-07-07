import Link from 'next/link';
import { PageHeader } from '@/components/ui/navigation';
import { EmptyState } from '@/components/ui/states';
import { profiles, videos } from '@/lib/sample-data';

export default function ParentDashboardPage() {
  return (
    <main className="min-h-screen bg-watchnest-background px-6 py-8 text-watchnest-foreground">
      <div className="mx-auto max-w-6xl">
        <PageHeader
          eyebrow="Parent Dashboard"
          title="Build each profile's approved library."
          description="Search or paste a video, preview it, then assign it to one or more profiles. Viewer screens only use profile-specific approved assignments."
          actions={
            <Link className="rounded-2xl bg-watchnest-primary px-5 py-3 text-center font-semibold text-white" href="/parent/add-video">
              Add Video
            </Link>
          }
        />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {profiles.map((profile) => (
            <div key={profile.id} className="rounded-card border border-watchnest-border bg-white p-6 shadow-sm">
              <div className="mb-4 h-16 w-16 rounded-full" style={{ backgroundColor: profile.avatarColor }} />
              <h2 className="text-2xl font-bold">{profile.displayName}</h2>
              <p className="mt-2 text-watchnest-muted">Profile-specific library enabled.</p>
            </div>
          ))}
        </section>

        <section className="mt-8 rounded-card border border-watchnest-border bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold">Known videos</h2>
          {videos.length > 0 ? (
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {videos.map((video) => (
                <div key={video.id} className="rounded-3xl border border-watchnest-border bg-watchnest-background p-4">
                  <div className="mb-3 h-28 rounded-2xl" style={{ backgroundColor: video.thumbnailColor }} />
                  <p className="font-semibold">{video.title}</p>
                  <p className="text-sm text-watchnest-muted">{video.channelTitle}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState className="mt-4" title="No known videos yet" description="Approved videos will appear here after parents add them." />
          )}
        </section>
      </div>
    </main>
  );
}
