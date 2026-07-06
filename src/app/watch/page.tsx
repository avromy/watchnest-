import Link from "next/link";
import { EmptyState } from "@/components/ui-states";
import { profiles } from "@/lib/sample-data";

export default function WatchEntryPage() {
  return (
    <main className="min-h-screen bg-watchnest-background px-6 py-10 text-watchnest-foreground">
      <div className="mx-auto max-w-5xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-watchnest-primary">
          Viewer Mode
        </p>
        <h1 className="mt-3 text-4xl font-bold">Who is watching?</h1>
        <p className="mx-auto mt-3 max-w-xl text-watchnest-muted">
          Each profile opens its own approved library. No profile sees videos
          that were not assigned to it.
        </p>

        {profiles.length > 0 ? (
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {profiles.map((profile) => (
              <Link
                key={profile.id}
                href={`/watch/profile/${profile.id}/home`}
                className="rounded-[2rem] border border-watchnest-border bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div
                  className="mx-auto mb-5 h-28 w-28 rounded-full"
                  style={{ backgroundColor: profile.avatarColor }}
                />
                <h2 className="text-3xl font-bold">{profile.displayName}</h2>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-10">
            <EmptyState
              description="Ask a parent to create a viewer profile before opening a library."
              title="No viewer profiles yet"
            />
          </div>
        )}

        <Link
          className="mt-10 inline-block rounded-2xl border border-[#c9d8f2] bg-white px-5 py-3 font-semibold text-watchnest-primary"
          href="/parent/dashboard"
        >
          Parent Mode
        </Link>
      </div>
    </main>
  );
}
