import Link from 'next/link';
import { BackLink, PageHeader } from '@/components/ui/navigation';
import { EmptyState, ErrorState } from '@/components/ui/states';
import { getVideosForProfile, profiles } from '@/lib/sample-data';

export default function ViewerHomePage({ params }: { params: { profileId: string } }) {
  const profile = profiles.find((item) => item.id === params.profileId);
  const approvedVideos = getVideosForProfile(params.profileId);

  if (!profile) {
    return (
      <main className="min-h-screen bg-watchnest-background px-6 py-10 text-watchnest-foreground">
        <div className="mx-auto max-w-2xl">
          <ErrorState title="Profile not found" description="Choose an available viewer profile to open its approved library." action={{ href: '/watch', label: 'Back to profiles' }} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-watchnest-background px-6 py-8 text-watchnest-foreground">
      <div className="mx-auto max-w-6xl">
        <PageHeader
          eyebrow="Viewer Library"
          title={
            <span className="flex items-center gap-4">
              <span className="h-16 w-16 rounded-full" style={{ backgroundColor: profile.avatarColor }} />
              <span>{profile.displayName}&apos;s Videos</span>
            </span>
          }
          actions={<BackLink href="/parent/dashboard" showArrow={false}>Parent Mode</BackLink>}
        />

        <section className="mt-6 rounded-card border border-watchnest-border bg-white p-5 shadow-sm">
          <Link
            className="block rounded-2xl border border-[#c9d8f2] bg-watchnest-background px-5 py-4 font-semibold text-watchnest-primary transition hover:bg-white"
            href={`/watch/profile/${profile.id}/search`}
          >
            Search my videos
          </Link>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-bold">Approved Videos</h2>
          {approvedVideos.length > 0 ? (
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {approvedVideos.map((video) => (
                <Link key={video.id} href={`/watch/profile/${profile.id}/player/${video.id}`} className="rounded-card border border-watchnest-border bg-white p-4 shadow-sm">
                  <div className="mb-3 h-32 rounded-2xl" style={{ backgroundColor: video.thumbnailColor }} />
                  <p className="font-semibold">{video.title}</p>
                  <p className="text-sm text-watchnest-muted">{video.channelTitle}</p>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState className="mt-4" title="No approved videos yet" description="Approved videos assigned to this profile will appear here." />
          )}
        </section>
      </div>
    </main>
  );
}
