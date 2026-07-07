import { BackLink, PageHeader } from '@/components/ui/navigation';
import { ErrorState } from '@/components/ui/states';
import { getApprovedVideosForProfile, isProfileAuthorizedToPlayVideo } from '@/lib/server/watchnest-data';

function PlaybackUnavailable({ backToLibraryHref }: { backToLibraryHref: string }) {
  return (
    <main className="min-h-screen bg-watchnest-background px-6 py-10 text-watchnest-foreground">
      <div className="mx-auto max-w-3xl">
        <ErrorState
          eyebrow="Playback unavailable"
          title="This video is not available in this library."
          description="WatchNest only plays videos that have been approved for this profile and are currently available to embed."
          action={{ href: backToLibraryHref, label: 'Back to Library' }}
        />
      </div>
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
        <BackLink href={backToLibraryHref}>Back to Library</BackLink>

        <PageHeader className="mt-6" eyebrow="Approved video" title={video.title}>
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
        </PageHeader>
      </div>
    </main>
  );
}
