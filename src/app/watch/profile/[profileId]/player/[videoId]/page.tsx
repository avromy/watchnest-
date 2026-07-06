import Link from 'next/link';
import { getApprovedVideosForProfile, isProfileAuthorizedToPlayVideo } from '@/lib/server/watchnest-data';

function PlaybackUnavailable({ backToLibraryHref }: { backToLibraryHref: string }) {
  return (
    <main className="min-h-screen bg-watchnest-background px-6 py-10 text-watchnest-foreground">
      <section className="mx-auto max-w-3xl rounded-card border border-watchnest-border bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-watchnest-primary">Playback unavailable</p>
        <h1 className="mt-3 text-3xl font-bold">This video is not available in this library.</h1>
        <p className="mt-4 text-watchnest-muted">
          WatchNest only plays videos that have been approved for this profile and are currently available to embed.
        </p>
        <Link className="mt-8 inline-block rounded-2xl bg-watchnest-primary px-5 py-3 font-semibold text-white" href={backToLibraryHref}>
          Back to Library
        </Link>
      </section>
    </main>
  );
}

export default async function ViewerPlayerPage({ params }: { params: { profileId: string; videoId: string } }) {
  const backToLibraryHref = `/watch/profile/${params.profileId}/home`;
  const isAuthorized = await isProfileAuthorizedToPlayVideo(params.profileId, params.videoId);

  if (!isAuthorized) {
    return <PlaybackUnavailable backToLibraryHref={backToLibraryHref} />;
  }

  const approvedVideos = await getApprovedVideosForProfile(params.profileId);
  const video = approvedVideos.find((item) => item.id === params.videoId);

  if (!video?.youtube_video_id) {
    return <PlaybackUnavailable backToLibraryHref={backToLibraryHref} />;
  }

  const youtubeEmbedSrc = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(video.youtube_video_id)}`;

  return (
    <main className="min-h-screen bg-watchnest-background px-6 py-8 text-watchnest-foreground">
      <div className="mx-auto max-w-5xl">
        <Link className="inline-block rounded-2xl border border-[#c9d8f2] bg-white px-5 py-3 font-semibold text-watchnest-primary" href={backToLibraryHref}>
          Back to Library
        </Link>

        <section className="mt-6 rounded-card border border-watchnest-border bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-watchnest-primary">Approved video</p>
          <h1 className="mt-3 text-3xl font-bold">{video.title}</h1>
          <div className="mt-6 aspect-video overflow-hidden rounded-card border border-watchnest-border bg-black">
            <iframe
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="h-full w-full"
              referrerPolicy="strict-origin-when-cross-origin"
              src={youtubeEmbedSrc}
              title={`YouTube player for ${video.title}`}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
