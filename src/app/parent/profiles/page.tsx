import Link from 'next/link';
import { BackLink, PageHeader } from '@/components/ui/navigation';
import { EmptyState } from '@/components/ui/states';
import { profiles } from '@/lib/sample-data';

export default function ParentProfilesPage() {
  return (
    <main className="min-h-screen bg-watchnest-background px-6 py-8 text-watchnest-foreground">
      <div className="mx-auto max-w-6xl">
        <BackLink href="/parent/dashboard">Back to Parent Dashboard</BackLink>

        <PageHeader
          className="mt-4"
          eyebrow="Profiles"
          title="Manage child profiles."
          description="Review the sample profiles available in WatchNest. Profile management is a UI preview and does not save changes yet."
          actions={
            <Link className="rounded-2xl bg-watchnest-primary px-5 py-3 text-center font-semibold text-white" href="/parent/profiles/new">
              Create Profile
            </Link>
          }
        />

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
          <EmptyState
            className="mt-8"
            eyebrow="No profiles yet"
            title="Create a child profile to start assigning videos."
            description="This empty state appears when there are no sample profiles to display."
            action={{ href: '/parent/profiles/new', label: 'Create Profile' }}
          />
        )}
      </div>
    </main>
  );
}
