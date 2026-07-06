import Link from "next/link";
import {
  BackLink,
  EmptyState,
  ErrorState,
  PageHeader,
} from "@/components/ui-states";
import { getVideosForProfile, profiles } from "@/lib/sample-data";

export default function ViewerHomePage({
  params,
}: {
  params: { profileId: string };
}) {
  const profile = profiles.find((item) => item.id === params.profileId);
  const approvedVideos = getVideosForProfile(params.profileId);

  if (!profile) {
    return (
      <main className="min-h-screen bg-watchnest-background px-6 py-10 text-watchnest-foreground">
        <ErrorState
          action={
            <Link
              className="inline-block rounded-2xl bg-watchnest-primary px-5 py-3 font-semibold text-white"
              href="/watch"
            >
              Back to profiles
            </Link>
          }
          description="Choose one of the available viewer profiles to open an approved library."
          title="Profile not found"
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-watchnest-background px-6 py-8 text-watchnest-foreground">
      <div className="mx-auto max-w-6xl">
        <PageHeader
          actions={<BackLink href="/parent/dashboard">Parent Mode</BackLink>}
          title={`${profile.displayName}'s Videos`}
        >
          <div className="flex items-center gap-4 rounded-3xl bg-watchnest-background p-4">
            <div
              className="h-16 w-16 rounded-full"
              style={{ backgroundColor: profile.avatarColor }}
            />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-watchnest-primary">
                Viewer Library
              </p>
              <p className="mt-1 text-watchnest-muted">
                Only videos approved for {profile.displayName} appear here.
              </p>
            </div>
          </div>
        </PageHeader>

        <section className="mt-6 rounded-card border border-watchnest-border bg-white p-5 shadow-sm">
          <div className="rounded-2xl border border-[#c9d8f2] bg-watchnest-background px-5 py-4 text-watchnest-muted">
            Search my videos
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-bold">Approved Videos</h2>
          {approvedVideos.length > 0 ? (
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {approvedVideos.map((video) => (
                <Link
                  key={video.id}
                  href={`/watch/profile/${profile.id}/player/${video.id}`}
                  className="rounded-card border border-watchnest-border bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div
                    className="mb-3 h-32 rounded-2xl"
                    style={{ backgroundColor: video.thumbnailColor }}
                  />
                  <p className="font-semibold">{video.title}</p>
                  <p className="text-sm text-watchnest-muted">
                    {video.channelTitle}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState
                description="A parent can add approved videos for this profile from Parent Mode."
                title="No approved videos yet"
              />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
