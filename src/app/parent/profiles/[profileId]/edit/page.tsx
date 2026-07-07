import Link from 'next/link';
import { BackLink } from '@/components/ui/navigation';
import { notFound } from 'next/navigation';
import { profiles } from '@/lib/sample-data';

type EditParentProfilePageProps = {
  params: {
    profileId: string;
  };
};

const avatarOptions = ['#f8d7da', '#d8f3dc', '#ddeaf6', '#fff3b0'];

export function generateStaticParams() {
  return profiles.map((profile) => ({ profileId: profile.id }));
}

export default function EditParentProfilePage({ params }: EditParentProfilePageProps) {
  const profile = profiles.find((sampleProfile) => sampleProfile.id === params.profileId);

  if (!profile) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-watchnest-background px-6 py-8 text-watchnest-foreground">
      <div className="mx-auto max-w-3xl">
        <BackLink href="/parent/dashboard">Back to Parent Dashboard</BackLink>

        <section className="mt-4 rounded-card border border-watchnest-border bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-watchnest-primary">Edit Profile</p>
          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="h-20 w-20 rounded-full" style={{ backgroundColor: profile.avatarColor }} />
            <div>
              <h1 className="text-3xl font-bold">Update {profile.displayName}&apos;s profile.</h1>
              <p className="mt-2 text-watchnest-muted">This form is a UI shell using sample profile data only. It does not save changes yet.</p>
            </div>
          </div>

          <form className="mt-8 space-y-6">
            <label className="block">
              <span className="font-semibold">Display name</span>
              <input className="mt-2 w-full rounded-2xl border border-watchnest-border bg-watchnest-background px-4 py-3" defaultValue={profile.displayName} type="text" />
            </label>

            <fieldset>
              <legend className="font-semibold">Avatar color</legend>
              <div className="mt-3 flex flex-wrap gap-3">
                {avatarOptions.map((color) => {
                  const isSelected = color === profile.avatarColor;

                  return (
                    <button
                      key={color}
                      className={`h-14 w-14 rounded-full border-2 shadow ${isSelected ? 'border-watchnest-primary ring-2 ring-watchnest-primary' : 'border-white ring-1 ring-watchnest-border'}`}
                      style={{ backgroundColor: color }}
                      type="button"
                    >
                      <span className="sr-only">Choose avatar color {color}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="rounded-3xl border border-dashed border-watchnest-border bg-watchnest-background p-4 text-sm text-watchnest-muted">
              Save action placeholder: backend profile updates will be connected later.
            </div>

            <div className="rounded-3xl border border-watchnest-border bg-white p-4">
              <h2 className="font-semibold text-watchnest-foreground">Remove profile</h2>
              <p className="mt-1 text-sm text-watchnest-muted">Delete confirmation placeholder: a future dialog will ask a parent to confirm before removing this profile.</p>
              <button className="mt-4 rounded-2xl border border-watchnest-border bg-watchnest-background px-5 py-3 font-semibold text-watchnest-foreground" type="button">
                Remove Profile (confirm soon)
              </button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button className="rounded-2xl bg-watchnest-primary px-5 py-3 font-semibold text-white" type="button">Save Profile (preview)</button>
              <Link className="rounded-2xl border border-watchnest-border bg-white px-5 py-3 text-center font-semibold text-watchnest-primary" href="/parent/profiles">
                Cancel
              </Link>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
