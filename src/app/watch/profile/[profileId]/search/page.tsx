import Link from 'next/link';
import { BackLink, PageHeader } from '@/components/ui/navigation';
import { EmptyState, ErrorState } from '@/components/ui/states';
import { getVideosForProfile, profiles } from '@/lib/sample-data';

function getSearchTerm(searchParams: { q?: string | string[] | undefined }) {
  const rawQuery = Array.isArray(searchParams.q) ? searchParams.q[0] : searchParams.q;

  return rawQuery?.trim() ?? '';
}

export default function ViewerLibrarySearchPage({
  params,
  searchParams,
}: {
  params: { profileId: string };
  searchParams: { q?: string | string[] | undefined };
}) {
  const profile = profiles.find((item) => item.id === params.profileId);
  const query = getSearchTerm(searchParams);

  if (!profile) {
    return (
      <main className="min-h-screen bg-watchnest-background px-6 py-10 text-watchnest-foreground">
        <div className="mx-auto max-w-2xl">
          <ErrorState title="Profile not found" description="Choose an available viewer profile before searching approved videos." action={{ href: '/watch', label: 'Back to profiles' }} />
        </div>
      </main>
    );
  }

  const approvedVideos = getVideosForProfile(profile.id);
  const normalizedQuery = query.toLowerCase();
  const matchingVideos = normalizedQuery
    ? approvedVideos.filter((video) => `${video.title} ${video.channelTitle}`.toLowerCase().includes(normalizedQuery))
    : approvedVideos;
  const hasQuery = query.length > 0;

  return (
    <main className="min-h-screen bg-watchnest-background px-6 py-8 text-watchnest-foreground">
      <div className="mx-auto max-w-6xl">
        <BackLink href={`/watch/profile/${profile.id}/home`}>Back to Library</BackLink>

        <PageHeader
          className="mt-6"
          eyebrow="Viewer Search"
          title={<>Search {profile.displayName}&apos;s approved videos</>}
          description="Search only looks inside this profile's approved library. Videos assigned to other profiles or not approved for this profile are never shown here."
        >
          <form className="flex flex-col gap-3 md:flex-row" action={`/watch/profile/${profile.id}/search`}>
            <label className="sr-only" htmlFor="viewer-library-search">
              Search my videos
            </label>
            <input
              className="min-h-14 flex-1 rounded-2xl border border-watchnest-border bg-watchnest-background px-5 text-lg outline-none transition focus:border-watchnest-primary focus:bg-white"
              defaultValue={query}
              id="viewer-library-search"
              name="q"
              placeholder="Search by video title or channel"
              type="search"
            />
            <button className="rounded-2xl bg-watchnest-primary px-6 py-4 font-semibold text-white" type="submit">
              Search
            </button>
          </form>
        </PageHeader>

        <section className="mt-8">
          <div className="flex flex-col justify-between gap-2 md:flex-row md:items-end">
            <div>
              <h2 className="text-2xl font-bold">Results</h2>
              <p className="mt-1 text-watchnest-muted">
                {hasQuery ? `${matchingVideos.length} approved match${matchingVideos.length === 1 ? '' : 'es'} for “${query}”` : `${matchingVideos.length} approved videos available`}
              </p>
            </div>
            {hasQuery ? (
              <Link className="font-semibold text-watchnest-primary" href={`/watch/profile/${profile.id}/search`}>
                Clear search
              </Link>
            ) : null}
          </div>

          {matchingVideos.length > 0 ? (
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {matchingVideos.map((video) => (
                <Link key={video.id} href={`/watch/profile/${profile.id}/player/${video.id}`} className="rounded-card border border-watchnest-border bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                  <div className="mb-3 h-32 rounded-2xl" style={{ backgroundColor: video.thumbnailColor }} />
                  <p className="font-semibold">{video.title}</p>
                  <p className="text-sm text-watchnest-muted">{video.channelTitle}</p>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              className="mt-4"
              eyebrow="No matches"
              title="No approved videos matched your search."
              description={<>Try another title or channel name. This page only searches videos that have already been approved for {profile.displayName}.</>}
            />
          )}
        </section>
      </div>
    </main>
  );
}
