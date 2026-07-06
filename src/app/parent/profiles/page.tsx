import Link from 'next/link';
import { profiles } from '@/lib/sample-data';

export default function ParentProfilesPage() {
  return (
    <main className="min-h-screen bg-watchnest-background px-6 py-8 text-watchnest-foreground">
      <div className="mx-auto max-w-6xl">
        <Link className="text-sm font-semibold text-watchnest-primary" href="/parent/dashboard">
          ← Back to Parent Dashboard
        </Link>

        <header className="mt-4 flex flex-col justify-between gap-4 rounded-card border border-watchnest-border bg-white p-6 shadow-sm md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-watchnest-primary">Profiles</p>
            <h1 className="mt-2 text-3xl font-bold">Manage child profiles.</h1>
            <p className="mt-2 max-w-2xl text-watchnest-muted">
              Review the sample profiles available in WatchNest. Profile management is a UI preview and does not save changes yet.
            </p>
          </div>
          <Link className="rounded-2xl bg-watchnest-primary px-5 py-3 text-center font-semibold text-white" href="/parent/profiles/new">
            Create Profile
          </Link>
        </header>

        {profiles.length > 0 ? (
          <section className="mt-8 grid gap-4 md:grid-cols-3">
            {profiles.map((profile) => (
              <article key={profile.id} className="rounded-card border border-watchnest-border bg-white p-6 shadow-sm">
                <div className="mb-4 h-20 w-20 rounded-full" style={{ backgroundColor: profile.avatarColor }} />
                <h2 className="text-2xl font-bold">{profile.displayName}</h2>
                <p className="mt-2 text-watchnest-muted">Sample child profile ready for approved videos.</p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link className="rounded-2xl bg-watchnest-primary px-4 py-3 text-center font-semibold text-white" href={`/parent/profiles/${profile.id}/edit`}>
                    Edit Profile
                  </Link>
                  <button className="rounded-2xl border border-watchnest-border bg-watchnest-background px-4 py-3 font-semibold text-watchnest-foreground" type="button">
                    Remove (confirm soon)
                  </button>
                </div>
                <p className="mt-3 text-sm text-watchnest-muted">Delete confirmation placeholder: a future dialog will confirm removing this profile.</p>
              </article>
            ))}
          </section>
        ) : (
          <section className="mt-8 rounded-card border border-dashed border-watchnest-border bg-white p-10 text-center shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-watchnest-primary">No profiles yet</p>
            <h2 className="mt-2 text-2xl font-bold">Create a child profile to start assigning videos.</h2>
            <p className="mx-auto mt-2 max-w-xl text-watchnest-muted">This empty state appears when there are no sample profiles to display.</p>
            <Link className="mt-6 inline-block rounded-2xl bg-watchnest-primary px-5 py-3 font-semibold text-white" href="/parent/profiles/new">
              Create Profile
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}
