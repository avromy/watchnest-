import Link from 'next/link';
import { getVideosForProfile, profiles } from '@/lib/sample-data';

export default function ViewerHomePage({ params }: { params: { profileId: string } }) {
  const profile = profiles.find((item) => item.id === params.profileId);
  const approvedVideos = getVideosForProfile(params.profileId);

  if (!profile) {
    return (
      <main className="min-h-screen bg-watchnest-background px-6 py-10 text-watchnest-foreground">
        <div className="mx-auto max-w-2xl rounded-card border border-watchnest-border bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold">Profile not found</h1>
          <Link className="mt-6 inline-block rounded-2xl bg-watchnest-primary px-5 py-3 font-semibold text-white" href="/watch">
            Back to profiles
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-watchnest-background px-6 py-8 text-watchnest-foreground">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col justify-between gap-4 rounded-card border border-watchnest-border bg-white p-6 shadow-sm md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full" style={{ backgroundColor: profile.avatarColor }} />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-watchnest-primary">Viewer Library</p>
              <h1 className="text-3xl font-bold">{profile.displayName}&apos;s Videos</h1>
            </div>
          </div>
          <Link className="rounded-2xl border border-[#c9d8f2] bg-white px-5 py-3 text-center font-semibold text-watchnest-primary" href="/parent/dashboard">
            Parent Mode
          </Link>
        </header>

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
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {approvedVideos.map((video) => (
              <Link key={video.id} href={`/watch/profile/${profile.id}/player/${video.id}`} className="rounded-card border border-watchnest-border bg-white p-4 shadow-sm">
                <div className="mb-3 h-32 rounded-2xl" style={{ backgroundColor: video.thumbnailColor }} />
                <p className="font-semibold">{video.title}</p>
                <p className="text-sm text-watchnest-muted">{video.channelTitle}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
